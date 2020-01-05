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

Live on my Heroku

## Built With

* [node](http://www.dropwizard.io/1.0.2/docs/)
* [puppeteer](https://rometools.github.io/rome/)
* [cheerio](https://rometools.github.io/rome/)

## Authors

* **Alan Johnson** - ajosephjohnson@gmail.com

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Roomiapp.com for not policing bots