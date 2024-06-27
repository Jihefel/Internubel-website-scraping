/**
 * @param {puppeteer.ElementHandle<HTMLAnchorElement>[]} selectors
 * @returns {Promise<{href: string, name: string}[]>}
 */
const getHrefAndName = async (selectors) => {
  return await Promise.all(
    selectors.map(async (link) => {
      const href = await link.evaluate((el) => el.href, link);
      const name = await link.evaluate((el) => el.textContent, link);
      return { href, name };
    })
  );
};

module.exports = getHrefAndName;