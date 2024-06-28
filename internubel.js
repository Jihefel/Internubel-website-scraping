require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");
const puppeteer = require("puppeteer");
const extractValueAndUnit = require("./utils/extractValueAndUnit");
const getHrefAndName = require("./utils/getHrefAndName");
const { initializeFile, writeProductToFile } = require("./utils/handleFiles");
const sanitizeName = require("./utils/sanitizeName");

// Internubel locales IDs for their data
const internubelLocaleIDs = { nederlands: "1", francais: "2", english: "3", deutsch: "4" };

// REVIEW -  Locale used for scraping. Change it if needed.
const langID = internubelLocaleIDs.francais;

// REVIEW - Login credentials. Use environment variables in a .env file.
const credentials = {
  email: process.env.LOGIN_EMAIL,
  password: process.env.LOGIN_PASSWORD,
};

//ANCHOR - Scraping function to get products data in the language used
async function scrapeInternubel() {
  try {
    // Launch browser and open new blank page
    let browser = await puppeteer.launch();
    let page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1366, height: 768 });

    // Change navigation timeout
    page.setDefaultNavigationTimeout(2 * 60 * 1000);

    // Navigate to url
    await page.goto(`https://www.internubel.be/Login.aspx?lId=${langID}`);

    // Wait for email field to be visible
    await page.waitForSelector("#tbEmail");
    // Fill email field
    await page.$eval("#tbEmail", (el, email) => (el.value = email), credentials.email);
    // Fill password field
    await page.$eval("#tbPassword", (el, password) => (el.value = password), credentials.password);
    // Click login button
    await page.click("#btnSubmit");

    const goToProductGroupsAnchorTag = `a[href="Groups.aspx?lId=${langID}"]`;

    // Wait for left column to load
    await page.waitForSelector(goToProductGroupsAnchorTag);
    // Click on ProductGroups
    await page.click(goToProductGroupsAnchorTag);

    // Wait for all product groups to load
    await page.waitForSelector("div.menu > ul.groups > li.maingroup ul > li > a");

    // Get all product groups (1.)
    const mainProductGroupsLinksSelector = await page.$$("div.menu > ul.groups > li.maingroup a[href='#']");
    const mainProductGroups = await getHrefAndName(mainProductGroupsLinksSelector);

    // Get all sub product groups (1.1.)
    const subProductGroupsLinksSelector = await page.$$(".menu > .groups > li.maingroup > ul > li > a");
    const subProductGroups = await getHrefAndName(subProductGroupsLinksSelector);

    // Get all sub sub product groups (1.1.1.)
    const subSubProductGroupsLinksSelector = await page.$$(".menu > .groups > li.maingroup ul > li ul > li > a");
    const subSubProductGroups = await getHrefAndName(subSubProductGroupsLinksSelector);

    /**
     * @param {puppeteer.ElementHandle<HTMLTableRowElement>[]} rows
     * @param {Array<{name: string, value: string}} array
     */
    const getNameAndValueOfRow = async (rows, array) => {
      await Promise.all(
        rows?.map(async (row) => {
          const name = await row.evaluate((el) => el?.firstElementChild?.textContent?.trim(), row);
          const valueStr = await row.evaluate((el) => el?.lastElementChild?.textContent?.trim(), row);
          if (name && valueStr) {
            const { sign, amount, unit } = extractValueAndUnit(valueStr);
            array.push({ name, value: { sign, amount, unit } });
          }
        })
      );
    };

    /**
     * @param {string} path
     */
    const fetchProducts = async (filePath) => {
      const productsLinkSelector = await page.$$(".text > li > a");
      const productsLinks = await getHrefAndName(productsLinkSelector);

      for (const product of productsLinks) {
        if (product.name) await page.goto(product.href);
        await page.waitForSelector("#innnerContentRight");

        // Header
        const title = await page.evaluate(() => document.querySelector("#lblTitle").textContent?.trim());
        const img = await page.evaluate(() => document.querySelector("#imgProduct")?.src);
        const nutriScore = await page.evaluate(() => document.querySelector("#imgNutriScore")?.src);

        // Units
        const tableRowsUnits = await page.$$("#units table > tbody > tr");
        let dataUnits = [];
        await getNameAndValueOfRow(tableRowsUnits, dataUnits);

        // Macronutriements
        const tableRowsMacro = await page.$$("#macro table > tbody > tr");
        let dataMacro = [];
        await getNameAndValueOfRow(tableRowsMacro, dataMacro);

        // Micronutriements
        const tableRowsMicro = await page.$$("#micro table > tbody > tr");
        let dataMicro = [];
        await getNameAndValueOfRow(tableRowsMicro, dataMicro);

        // Go back to products list page
        await page.click("a[href='javascript:history.back();']");

        const productData = {
          title,
          img,
          nutriScore,
          units: dataUnits,
          macros: dataMacro,
          micros: dataMicro,
          generic: !title.includes(" - "), // Check if product is branded or generic
        };

        // Write product to file
        await writeProductToFile(filePath, productData);

        // Reset table data
        dataUnits.splice(0, dataUnits.length);
        dataMacro.splice(0, dataMacro.length);
        dataMicro.splice(0, dataMicro.length);
      }
    };

    const hasProductInList = async () => (await page.$(".text > li")) !== null;

    // Loop through main products groups
    for (const mainGroup of mainProductGroups) {
      // Create directory for main groups
      const mainGroupDir = path.join(__dirname, "data", sanitizeName(mainGroup.name));
      await fs.mkdir(mainGroupDir, { recursive: true });
    }

    // Loop through sub products groups
    for (const subGroup of subProductGroups) {
      // Go to sub group
      await page.goto(subGroup.href);
      // Wait for sub group to load
      await page.waitForSelector(".text");
      // Check if sub group has products
      const hasTextLi = await hasProductInList();
      // If no products in sub group, continue to next sub group
      if (!hasTextLi) continue;
      // Find main groups which contain first 2 letters of the sub-group (1. or 10)
      const mainGroupDirRelevantName = mainProductGroups.find(({ name }) => name.startsWith(subGroup.name.substring(0, 2)))?.name;
      // Create file path
      const subGroupFilePath = path.join(__dirname, "data", sanitizeName(mainGroupDirRelevantName), `${sanitizeName(subGroup.name)}.json`);
      await initializeFile(subGroupFilePath);

      await fetchProducts(subGroupFilePath);
    }

    // Loop through sub-sub-groups
    for (const subSubGroup of subSubProductGroups) {
      // Find main group which contain first 2 letters of the sub-sub-group (1. or 10)
      const mainGroupDirRelevantName = mainProductGroups.find(({ name }) => name.startsWith(subSubGroup.name.substring(0, 2)))?.name;
      // Filter sub-group which contain first 4 letters of the sub-sub-group (1.1. or 10.1)
      const subGroupName = subProductGroups.find(({ name }) => name.startsWith(subSubGroup.name.substring(0, 4)))?.name;
      // Create sub-group directory
      const subGroupDir = path.join(__dirname, "data", sanitizeName(mainGroupDirRelevantName), sanitizeName(subGroupName));
      await fs.mkdir(subGroupDir, { recursive: true });
      // Create file path
      const subSubGroupFilePath = path.join(subGroupDir, `${sanitizeName(subSubGroup.name)}.json`);
      await initializeFile(subSubGroupFilePath);
      // Go to sub-sub-group products page
      await page.goto(subSubGroup.href);
      await page.waitForSelector(".text");
      // Check if sub-sub-group has products
      const hasTextLiSubSub = await hasProductInList();
      if (!hasTextLiSubSub) continue;

      await fetchProducts(subSubGroupFilePath);
    }

    // Close browser
    await browser.close();
  } catch (error) {
    console.log(error);
  }
}

scrapeInternubel();
