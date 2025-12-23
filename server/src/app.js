const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const app = express()

//middlewares
app.use(cors()) //for cross origin access
app.use(express.json()) //for allowing the json type
app.use(morgan('dev')) //for monitoring the routes and their time elapsed 


app.get("/api/health", (req, res) => {
    res.json({ status: 'ok', message: 'Server is running......' })
})

module.exports = app