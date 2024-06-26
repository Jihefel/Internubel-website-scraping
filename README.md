                                  
# Internubel product data scraping script

This repository contains a Puppeteer-based script for scraping product data from Internubel's website (https://www.internubel.be). 

The script logs into the site, navigates through product groups, and extracts product details including title, image, nutrition score, and nutritional information. 

Data is structured and saved into JSON files categorized by product groups, sub-groups, and sub-sub-groups.
 
## Prerequisites

Requirements for the script:
- Node.js
- npm
- Create an account on the Internubel website if you do not already have one.  (https://www.internubel.be/Register.aspx?lId=3)

## Installation

1. Clone the repository
   ```sh
   git clone https://github.com/Jihefel/Internubel-website-scraping.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
 
### Config .env variables

Create your configuration file `.env` in the root directory as the following to store your credentials.

```yaml
LOGIN_EMAIL=your_email
LOGIN_PASSWORD=your_password
```

Replace ```your_email``` and ```your_password``` with your Internubel login credentials.
 
## Usage

Run the scraping script using Node.js in your terminal:
```bash
node internubel.js
```

And wait for a moment...

The script will launch a Puppeteer-controlled browser, log into Internubel using provided credentials, and scrape product data into structured JSON files stored in the data directory.

## Dependencies

- Puppeteer (https://www.npmjs.com/package/puppeteer)
- dotenv (https://www.npmjs.com/package/dotenv)

## License

Distributed under the MIT License. See [MIT License](https://opensource.org/licenses/MIT) for more information.
