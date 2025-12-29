const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const userRoutes = require('./modules/users/user.routes')
const authRoutes = require('./modules/auth/auth.routes');

const app = express()

//middlewares
app.use(cors()) //for cross origin access
app.use(express.json()) //for allowing the json type
app.use(morgan('dev')) //for monitoring the routes and their time elapsed 


app.use( '/api/users',userRoutes)

app.use('/api/auth', authRoutes);


module.exports = app