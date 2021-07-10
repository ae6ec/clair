// require('dotenv').config
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

const fetchCloudRouter = require('./routes/fetchcloud')
const fetchFileRouter = require('./routes/fetchfile')
const cleanDBRouter = require('./routes/cleanDB')


app.get("/api/health", async (req,res) => {
    res.json({ message: "API working" })
})

app.use('/fetchcloud', fetchCloudRouter)
app.use('/fetchfile', fetchFileRouter)
app.use('/cleanDB', cleanDBRouter)

app.listen(process.env.PORT || 3000, () => console.log("Clair Service Started"))

process.on('uncaughtException', function(err) {
    console.log("uncaughtException application Closed " + err);
});

process.on('uncaughtRejection', function(err) {
    console.log("uncaughtException application Closed " + err);
    console.trace("stack trace");
});