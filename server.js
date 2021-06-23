require('dotenv').config
const express = require('express')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

const fetchCloudRouter = require('./routes/fetchcloud')

app.get("/api/test", async (req,res) => {
    res.json({ message: "API working" })
})

app.use('/fetchcloud', fetchCloudRouter)

app.listen(process.env.PORT || 3000, () => console.log("Clair Service Started"))
