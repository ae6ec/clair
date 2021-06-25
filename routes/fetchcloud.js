// require('dotenv').config('../.env')
const express = require('express')
const router = express.Router()
const crypto = require("crypto");
const axios = require('axios');

// const { scrapeQueue } = require('../microservice/scrapper')

//TODO: add multiple css select feature 

// TODO: current workaround since redis is not run on heroku
// could be docker redis   

// router.post('/', async (request,response) => {
//     const randfilecode = crypto.randomBytes(3).toString('hex');
//     const data = {
//         url: request.body.url,
//         selector: 'div.col-sm-6.text-center.text-sm-left > a' ,
//         fileCode: randfilecode
//       };
//     const options = {
//         // delay: 10000, // 1 min in ms
//         attempts: 2
//         };

//     scrapeQueue.add(data, options)
    
//     response.json({ 
//         status : "success",
//         fileCode: randfilecode        
//     })
// })

router.post('/', async (request,response) => {
    const randfilecode = crypto.randomBytes(3).toString('hex');
    const url = request.body.url
    const fileCode = randfilecode
    
    response.json({ 
        status : "success",
        fileCode: randfilecode        
    })

    const res = await axios.post(`https://getpantry.cloud/apiv1/pantry/${process.env.PANTRY_ID}/basket/${fileCode}`, {
        filecode: fileCode,
        fileName: request.body.fileName,
        fileDownload: url,
        status: 'Success',
        statusInfo: "Direct Download Link successfully Fetched"
      }).catch( err => {
          console.log(`Error Occured posting data to DB: ${err}`)
      });

    console.log(`Data uploaded data to DB`)
    console.log(res.data)
})




module.exports = router
