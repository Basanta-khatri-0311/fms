const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const userRouter = require('./routes/routes.js')
const authRoutes = require('./modules/auth/auth.routes');

const app = express()

//middlewares
app.use(cors()) //for cross origin access
app.use(express.json()) //for allowing the json type
app.use(morgan('dev')) //for monitoring the routes and their time elapsed 


app.use( '/api',userRouter)

app.use('/api/auth', authRoutes);


module.exports = app