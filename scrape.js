import puppet from 'puppeteer';
import roomi from './roomi';

const browserOptions =  {
    args: [ '--no-sandbox', '--disable-web-security', '--disable-notifications', '--window-size=1600,1000'],
    headless: true,
    ignoreHTTPSErrors: true
};

const goToOptions = {
    waitUntil: 'networkidle0',
    timeout: 300000 // 5 minutes
};

(async () => {

    const browser = await puppet.launch( browserOptions );

    await roomi(browser, goToOptions);

    await browser.close();

})();