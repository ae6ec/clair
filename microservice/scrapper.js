// require('dotenv').config()

const puppeteer = require('puppeteer');
const { scrapeQueue } = require('../messageQ/bull')

const fs = require('firebase-admin')
const serviceAccount = process.env.FIREBASE_AUTH_CONFIG_BASE64

fs.initializeApp({
    credential: fs.credential.cert(JSON.parse(Buffer.from(serviceAccount, 'base64').toString('ascii'))),
    databaseURL: process.env.FIREBASE_DATABASEURL
});

const db = fs.firestore();

function baseScrape (url,selector) {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({
                args: [

                    '--no-sandbox',
                    '--disable-setuid-sandbox'
                ],
                headless: true
            })

            console.log("Browser launched")
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
            await page.waitForSelector(selector);
            console.log(`Selector ${selector} loaded`);

            let scrappedData = await page.evaluate(selector => {
                let results=[]
                document.querySelectorAll(selector).forEach((item) => {
                    results.push({
                        url:  item.getAttribute('href'),
                        fileName: item.innerText,
                    });
                })
                return results;
            }, selector);

            console.log(`Scrapping Successful. Scrapped Data `)
            console.log(scrappedData)

            browser.close();
            console.log("Browser Closed successfully")
            return resolve(scrappedData);
        } catch (e) {
            console.log(`Error occured at baseScraping: ${e}`)
            return reject(e);
        }
    })
}

// TODO: add error ticket with all info
async function CallScrap( url, selector, code, fileName ){  
      
    //add for multiple files
    const [{url: DDL,fileName: name}] = await baseScrape(url,selector).catch(err => {
        console.log(`Error Occured retrieving DDL data: ${err}`)
    });

    console.log(`Scrapped Data ${fileName}:${DDL} `)

    try{
        const postalDB = db.collection('postal').doc(code);
        await postalDB.set({
            filecode: code,
            fileName: name,
            fileDownload: DDL,
            createdAt: fs.firestore.FieldValue.serverTimestamp(),
            status: 'Success',
            statusInfo: "DDL added Success"
        })
    } catch(err) {
        console.trace(`Error stack trace : ${err}`);
    }
    console.log("Data Posted in DB successfully");
}

scrapeQueue.process(async job => { 
    return await CallScrap(job.data.url, job.data.selector, job.data.fileCode, job.data.fileName).catch( (err) => {
        console.log(`Error occured at scrapeQueue Process: ${err}`);
    }); 
  });

// async function testScraping (code){
//     // console.log(`${process.env.PANTRY_ID}/basket/${code}`)
//     const Data = await baseScrape("https://gofile.io/d/JL4Uqc","div.col-sm-6.text-center.text-sm-left > a").catch(err => {
//         console.log(`Error Occured at retrieving test DDL: ${err}`)
//     });
//     console.log(`Data: ${JSON.stringify(Data)}`)
// }
// testScraping("1")

exports.scrapeQueue = scrapeQueue;
