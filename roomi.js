import cheerio from 'cheerio';
import fs from 'fs';

let page;

export default async (browser, goToOptions) => {

    const url = 'https://roomiapp.com/s?duration=Any&gender=Either&maxPrice=1500&minPrice=0&neighborhoods=57115d70c68ca35336da6cde&neighborhoods=5cabcf47178c3d09343122d6&neighborhoods=57110b87a29b771f316cc424&neighborhoods=57115d7bc68ca35336da6ce5&neighborhoods=57115d6dc68ca35336da6cd7&region=571047f2dad86e202084d730&page=';

    let results = [];
    let i = 0;
    let lastPage = null;

    while (i === 0 || i < lastPage) {
        i++;

        page = await browser.newPage();

        await page.goto( url+i, goToOptions );

        let html = await page.evaluate(() => {
            return document.documentElement.innerHTML;
        });

        await page.close();

        let $ = cheerio.load(html);

        if (i === 1) {

            if ($('.jss416 li:nth-child(7) a').length > 0) {
                lastPage = parseInt($('.jss416 li:nth-child(7) a').text());
            }
            else {
                lastPage = 1;
            }

            console.log('Number of pages: ', lastPage);
        }

        const items = $('a[class=""][href*="rooms-for-rent"]');

        if (items.length === 0) {
            throw new Error('no srp items found');
        }

        for (let i=0; i < items.length; i++) {

            page = await browser.newPage();

            await page.goto( 'https://roomiapp.com'+$(items[i]).attr('href'), goToOptions );

            html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });

            await page.close();

            $ = cheerio.load(html);

            if ($('.banner-text:contains("Bummer")').length === 0) {

                const deposit = $('div:contains("Deposit") + div span').text().replace('$','').replace(',','');

                let result = {
                    link: 'https://roomiapp.com'+$(items[i]).attr('href'),
                    price: parseInt($('.ListingDetailBasic span span').text().replace('$','').replace(',','')),
                    neighborhood: $('meta[name="keywords"]').attr('content'),
                    deposit: parseInt(deposit),
                    duration: $('div:contains("Duration") + div').first().text(),
                    moveIn: $('div:contains("Move In") + div').first().text(),
                    numRooms: $('.ListingDetailBasic p span:first-child').text(),
                    sharedPrivate: $('.ListingDetailBasic div div').first().text(),
                    roomDescription: $('.description p').text(),
                    userImage: $('img[src*="roomiprofile.imgix.net"]').attr('src'),
                    roomImages: [ ...new Set($('.carousel-image-container img').map((_, el) => $(el).attr('src')).get()) ]
                };

                if ($('.read-more').length > 0) {

                    result.userBio = await (async () => {

                        page = await browser.newPage();

                        await page.goto( 'https://roomiapp.com'+$('.read-more').attr('href'), goToOptions );

                        html = await page.evaluate(() => {
                            return document.documentElement.innerHTML;
                        });

                        await page.close();

                        $ = cheerio.load(html);

                        return $('.jss269').text();

                    })();
                }
                else {
                    result.userBio = $('.userBio').text();
                }

                console.log(result);
                results.push(result);

            }
        }
    }
    
    const payload = {
        scraped: new Date().toLocaleString(),
        data: results
    };

    console.log(payload);

    fs.writeFileSync('./roomi.json', JSON.stringify(payload));
};