// require('dotenv').config('../.env')

const express = require('express')
const router = express.Router()

const fs = require('firebase-admin')
const db = fs.firestore();

// will recieve fileCode
router.post('/', async (request,response) => {
    const code = request.body.filecode;
    let fileData = null;
    console.log(`Initiating file fetch for ${code}`)

    try{
        const file = await db.collection('postal').doc(code).get();
        if (!file.exists) {
            console.log('No such document present!');
        } else {
            console.log('Document data:', file.data());
            fileData = file.data();
        }
    } catch(err) {
        console.trace(`trace : ${err}`);
    }

    response.json({ 
        status : (fileData === null) ? "failure" : "success",
        file: fileData        
    })
   
    
})

module.exports = router
