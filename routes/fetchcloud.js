const express = require('express')
const router = express.Router()
const crypto = require("crypto");

const { scrapeQueue } = require('../microservice/scrapper')

//TODO: add multiple css select feature 
router.post('/', async (request,response) => {
    const randfilecode = crypto.randomBytes(3).toString('hex');
    const data = {
        url: request.body.url,
        selector: 'div.col-sm-6.text-center.text-sm-left > a' ,
        fileCode: randfilecode
      };
    const options = {
        // delay: 10000, // 1 min in ms
        attempts: 2
        };

    scrapeQueue.add(data, options)
    
    response.json({ 
        status : "success",
        fileCode: randfilecode        
    })
})


module.exports = router
