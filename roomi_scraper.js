import cheerio from 'cheerio';
import fs from 'fs';

/**
 *
 * @param str
 * @returns {string}
 */
const formatStr = (str) => str.replace('$','').replace(',','').trim();

/**
 *
 */
class Scraper {

    /**
     *
     * @param browser
     * @param goToOptions
     */
    constructor(browser, goToOptions) {
        
        this.browser = browser;
        this.goToOptions = goToOptions;
        this.domain = 'https://roomiapp.com';
        
        this.SRP = {
            basePath: '/s?duration=Any&gender=Either&maxPrice=1500&minPrice=0&neighborhoods=57115d70c68ca35336da6cde&neighborhoods=5cabcf47178c3d09343122d6&neighborhoods=57110b87a29b771f316cc424&neighborhoods=57115d7bc68ca35336da6ce5&neighborhoods=57115d6dc68ca35336da6cd7&region=571047f2dad86e202084d730&page=',
            index: 0,
            total: null
        };
        
        this.results = [];
    }

    /**
     *
     * @param pageType
     * @param pagePath
     * @returns {Promise<initialize|undefined|number|*|boolean|void>}
     */
    async fetchHtml(pageType, pagePath) {
        
        let URL;
        switch (pageType) {
            case 'SRP':
                URL = this.domain + this.SRP.basePath + this.SRP.index;
                break;
            case 'VDP':
            case 'BIO':
                URL = this.domain + pagePath;
                break;
            default:
                throw new Error('Invalid page type: ' + pageType);
        }
        
        let page = await this.browser.newPage();
        await page.goto( URL, this.goToOptions );
        let html = await page.evaluate(() => {
            return document.documentElement.innerHTML;
        });
        await page.close();

        return cheerio.load(html);
    }

    /**
     *
     */
    saveResultsToDisk() {

        const staticResults = {
            scraped: new Date().toLocaleString(),
            rooms: this.results
        };

        console.log(staticResults);

        // save static scraped data to filesystem
        fs.writeFileSync('./roomi_scraped_results.json', JSON.stringify(staticResults));

        console.log('Saved results to disk. Found ' + this.results.length + ' rooms.');
    }
}

/**
 *
 * @param browser
 * @param goToOptions
 * @returns {Promise<void>}
 */
const roomiScraper = async (browser, goToOptions) => {

    const scraper = new Scraper( browser, goToOptions );

    // begin while
    while (scraper.SRP.total === null || scraper.SRP.index <= scraper.SRP.total) {
        scraper.SRP.index++;
        
        let $ = await scraper.fetchHtml('SRP');

        // Obtain the total quantity of SRP pages on the first go around
        if (scraper.SRP.index === 1) {
            
            if ($('.jss416 li:nth-child(7) a').length > 0) {
                scraper.SRP.total = parseInt($('.jss416 li:nth-child(7) a').text());
            }
            else {
                scraper.SRP.total = 1;
            }

            console.log('Total SRP pages: ', scraper.SRP.total);
        }

        const rooms = $('a[class=""][href*="rooms-for-rent"]');

        if (rooms.length > 0) {

            for (let i=0; i < rooms.length; i++) {

                let $ = await scraper.fetchHtml('VDP', $(rooms[i]).attr('href'));

                // 404 banner
                if ($('.banner-text:contains("Bummer")').length === 0) {

                    // dedupe images of room
                    const roomImages = [ ...new Set($('.carousel-image-container img').map((_, el) => $(el).attr('src')).get()) ];

                    let roomDetails = {
                        link: scraper.domain+$(rooms[i]).attr('href'),
                        price: parseInt(formatStr($('.ListingDetailBasic span span').text())),
                        neighborhood: $('meta[name="keywords"]').attr('content'),
                        deposit: parseInt(formatStr($('div:contains("Deposit") + div span').text())),
                        duration: $('div:contains("Duration") + div').first().text(),
                        moveIn: $('div:contains("Move In") + div').first().text(),
                        numRooms: $('.ListingDetailBasic p span:first-child').text(),
                        sharedPrivate: $('.ListingDetailBasic div div').first().text(),
                        roomDescription: $('.description p').text(),
                        userImage: $('img[src*="roomiprofile.imgix.net"]').attr('src'),
                        roomImages: roomImages
                    };

                    // if there's a long bio
                    // go also to their profile to scrape all available data
                    if ($('.read-more').length > 0) {

                        roomDetails.userBio = await (async () => {

                            let $ = await scraper.fetchHtml('BIO', $('.read-more').attr('href'));
                            return $('.jss269').text();

                        })();
                    }
                    else {
                        roomDetails.userBio = $('.userBio').text();
                    }

                    console.log(roomDetails);
                    
                    scraper.results.push(roomDetails);

                }
            }
        }
        
        // VDP selector is broken, exit
        else {
            throw new Error('no srp rooms found');
        }
    }

    scraper.saveResultsToDisk();
};

export default roomiScraper;