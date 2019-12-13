import puppet from 'puppeteer';
import roomiScraper from './roomi_scraper';

const browserOptions =  {
    args: [ '--no-sandbox', '--disable-web-security', '--disable-notifications', '--window-size=1600,1000'],
    headless: false,
    ignoreHTTPSErrors: true
};

const goToOptions = {
    waitUntil: 'networkidle0',
    timeout: 300000
};


/**
 *
 */
(async () => {

    const browser = await puppet.launch( browserOptions );

    await roomiScraper( browser, goToOptions );

    await browser.close();

})();