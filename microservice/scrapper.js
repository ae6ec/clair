// require('dotenv').config('../.env')

const axios = require('axios');
const puppeteer = require('puppeteer');
const { scrapeQueue } = require('../messageQ/bull')


function baseScrape (url,selector) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: [

                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
                headless: false
            });

            console.log("Browser launch success")

            const page = await browser.newPage();
            page.setCacheEnabled(true);

            await page.setRequestInterception(true);
            page.on('request', (request) => {
                if (request.resourceType() === 'image') {
                    request.abort();
                } else if (request.resourceType() === 'font'){
                    request.abort();
                } else if (request.resourceType() === 'media'){
                    request.abort();
                } else if (request.resourceType() === 'imageset'){
                    request.abort();
                } else {
                    request.continue();
                }
            });

            await page.goto(url);
            console.log(`${url} opened`)

            console.log(`Waiting for Selector ${selector} to load`)
            // await page.waitForSelector(selector);
            // console.log(`Selector ${selector} loaded`);
            await page.setDefaultTimeout(3000000)         
            // await page.waitForNavigation({waitUntil: 'networkidle2'});

            let scrappedData = await page.evaluate(selector => {
                let results=[]
                document.querySelectorAll(selector).forEach((item) => {
                    results.push({
                        url:  item.getAttribute('href'),
                        text: item.innerText,
                    });
                }, selector);
                return results;
            });

            console.log(`Scrapping Successful. Scrapped Data `)
            console.log(scrappedData)

            browser.close();
            console.log("Browser Closed successfully")
            return resolve(scrappedData);
        } catch (e) {
            console.log(`Error occured: ${e}`)
            return reject(e);
        }
    })
}

// TODO: Error handling


async function CallScrap( url, selector, code ){
    //TODO: workaround fix later
    //Skipping Scrapping and sending normal Download link instead
    // const Data = await baseScrape(url,selector).catch(err => {
    //     console.log(`Error Occured retrieving DDL data: ${err}`)
    // });

    // console.log(`Data scrapped: ${JSON.stringify(Data)}`)
    console.log(code)
    // const response = await axios.post(`https://getpantry.cloud/apiv1/pantry/${process.env.PANTRY_ID}/basket/${code}`, {
    //     filecode: code,
    //     fileName: Data[0].url.split('/').pop(),
    //     fileDownload: Data[0].url,
    //     status: 'Success',
    //     statusInfo: "Direct Download Link successfully Fetched"
    //   }).catch( err => {
    //       console.log(`Error Occured posting data to DB: ${err}`)
    //   });
    const response = await axios.post(`https://getpantry.cloud/apiv1/pantry/${process.env.PANTRY_ID}/basket/${code}`, {
        filecode: code,
        fileName: code,
        fileDownload: url,
        status: 'Success',
        statusInfo: "Direct Download Link successfully Fetched"
      }).catch( err => {
          console.log(`Error Occured posting data to DB: ${err}`)
      });

    console.log(`Data uploaded data to DB`)
      console.log(response.config)
}

scrapeQueue.process(async job => { 
    return await CallScrap(job.data.url, job.data.selector, job.data.fileCode); 
  });


async function testScraping (code){
    // console.log(`${process.env.PANTRY_ID}/basket/${code}`)
    const Data = await baseScrape("https://gofile.io/d/JL4Uqc","div.col-sm-6.text-center.text-sm-left > a").catch(err => {
        console.log(`Error Occured retrieving DDL data: ${err}`)
    });
    console.log(`Data; ${JSON.stringify(Data)}`)
}
// kk("1")

exports.scrapeQueue = scrapeQueue;
