import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const twilio = require('twilio')(
    process.env.ACCOUNT_SID,
    process.env.AUTH_TOKEN
);

const scrapedResultsPath = './static_data/roomi_scraped_results.json';
const evaluatedResultsPath = './static_data/evaluated_listings.json';

/**
 *
 * @param listingsArray
 */
const sendWhatsAppMessage = async (listingsArray) => {

    for (let i=0; i<listingsArray.length; i++) {

        try {

            let res = await twilio.messages.create({
                from: 'whatsapp:+14155238886',
                // Following this message template because of sandbox restrictions with WhatsApp API
                body: 'Your appointment is coming up on '+listingsArray[i]+' at '+listingsArray[i],
                to: 'whatsapp:+15042326584'
            });

            console.log('Sent message to WhatsApp: ', res);

            // sleep 3 seconds after each request to work around WhatsApp API rate limit
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        catch (e) {
            console.error(e);
        }
    }

};


(async () => {

    const results = JSON.parse(fs.readFileSync(scrapedResultsPath, 'utf8'));
    const resultLinksArray = results.rooms.map(r => r.link);

    if (fs.existsSync(evaluatedResultsPath)) {

        const evalResults = JSON.parse(fs.readFileSync(evaluatedResultsPath, 'utf8'));
        const evalLinksArray = evalResults.rooms.map(r => r.link);

        // Check to see if any new listings have been posted since the last time script has ran
        const newLinksDiff = resultLinksArray.filter(x => !evalLinksArray.includes(x));

        if (newLinksDiff.length > 0) {

            // send a WhatsApp message to my phone with links to new listings
            await sendWhatsAppMessage(newLinksDiff);
        }
    }
    else {
        await sendWhatsAppMessage(resultLinksArray);
    }

    fs.writeFileSync(evaluatedResultsPath, JSON.stringify(results));

    console.log('Evaluation script complete.');

})();