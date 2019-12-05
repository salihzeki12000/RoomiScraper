import cheerio from 'cheerio';
import fs from 'fs';

export default async (page, goToOptions) => {

    const url = 'https://roomiapp.com/s?duration=Any&gender=Either&maxPrice=1500&minPrice=0&neighborhoods=57115d70c68ca35336da6cde&neighborhoods=5cabcf47178c3d09343122d6&neighborhoods=57110b87a29b771f316cc424&neighborhoods=57115d7bc68ca35336da6ce5&neighborhoods=57115d6dc68ca35336da6cd7&region=571047f2dad86e202084d730&page=';

    let results = [];
    let i = 0;
    let lastPage = null;

    while (i === 0 || i < lastPage) {
        i++;

        await page.goto( url+i, goToOptions );

        let html = await page.evaluate(() => {
            return document.documentElement.innerHTML;
        });

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

        const items = $('a.jss406[href*="rooms-for-rent"], a.jss399[href*="rooms-for-rent"]');

        if (items.length === 0) {
            throw new Error('no srp items found');
        }

        for (let i=0; i < items.length; i++) {

            await page.goto( 'https://roomiapp.com'+$(items[i]).attr('href'), goToOptions );

            html = await page.evaluate(() => {
                return document.documentElement.innerHTML;
            });

            $ = cheerio.load(html);

            if ($('.banner-text:contains("Bummer")').length === 0) {

                const deposit = $('.jss116:contains("Deposit") + .jss117 span, .jss124:contains("Deposit") + .jss125 span, .jss117:contains("Deposit") + .jss118 span').text().replace('$','').replace(',','');

                let result = {
                    link: 'https://roomiapp.com'+$(items[i]).attr('href'),
                    price: parseInt($('.jss83 span span').text().replace('$','').replace(',','')),
                    neighborhood: $('meta[name="keywords"]').attr('content'),
                    deposit: parseInt(deposit),
                    duration: $('.jss124:contains("Duration") + .jss125, .jss117:contains("Duration") + .jss118').text(),
                    moveIn: $('.jss124:contains("Move In") + .jss125, .jss117:contains("Move In") + .jss118').text(),
                    numRooms: $('.jss88 span:first-child').text(),
                    sharedPrivate: $('.jss86').text(),
                    roomDescription: $('.description p').text(),
                    userImage: $('img[src*="roomiprofile.imgix.net"]').attr('src'),
                    roomImages: [ ...new Set($('.carousel-image-container img').map((_, el) => $(el).attr('src')).get()) ]
                };

                if ($('.read-more').length > 0) {

                    result.userBio = await (async () => {

                        await page.goto( 'https://roomiapp.com'+$('.read-more').attr('href'), goToOptions );

                        html = await page.evaluate(() => {
                            return document.documentElement.innerHTML;
                        });

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

    fs.writeFileSync('./roomi.json', JSON.stringify({
        scraped: new Date().toLocaleString(),
        data: results
    }));
};