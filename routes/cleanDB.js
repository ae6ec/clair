const express = require('express')
const router = express.Router()

const fs = require('firebase-admin')
const db = fs.firestore();

router.get('/', async (request,response) => {
    console.log(`Initiating DB cleanup ${code}`);

    const MS_PER_HOUR = 1000 * 60 * 60 ;
    let error = "";
    try {
        const postalRef = await db.collection('postal');
        var allfiles = postalRef.get()
            .then(snapshot => {
                snapshot.forEach(file => {
        
                    const hoursdiff = Math.floor((now - file.data().createdAt.toDate())/MS_PER_HOUR);
                    console.log(`${file.id} => `,file.data() ,hoursdiff, 'Created before (in Hours)');
                    
                    if (hoursdiff >= 24){
                        console.log(`${file.id} => ${hoursdiff} getting deleted`);
                        (async function(){
                            const k = await db.collection('postal').doc(file.id).delete().catch(err => {
                                `Error while Deleting Document: ${err}`
                            })
                        })()
                    }
        
                })
            })

        } catch(err){
            console.log('Error retrieving/Deleting documents: ', err);
            error = err;
        }
    

    response.json({ 
        status : "successfully Triggered",      
    })
       
})

module.exports = router