# Roomi Scraper

This heroku application scrapes the room listings data from Roomiapp.com at an interval of 10 minutes, checks for recent updates, and WhatsApps me links for any recent additions.

### Installing

```
npm install
```

### Getting started

Scrape Roomi listings

```
npm run scrape
```

Evaluate listings and send WhatsApp message

```
npm run evaluate
```

## Deployment

Live on Heroku

## Built With

* [node](https://github.com/nodejs/node)
* [puppeteer](https://github.com/puppeteer/puppeteer)
* [cheerio](https://github.com/cheeriojs/cheerio)

## Authors

* **Alan Johnson** - ajosephjohnson@gmail.com

## Acknowledgments

* Roomiapp.com for not policing bots