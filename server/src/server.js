const app = require('./app.js')
const dotenv = require('dotenv')
dotenv.config()

const connectDB = require('./config/db.js')


//connect db
connectDB()

const PORT = 3000 || process.env.PORT


app.listen(PORT, () => {
    console.log("Hi from server..")
})