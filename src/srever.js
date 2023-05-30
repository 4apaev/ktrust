import express from 'express'
import mongoose from 'mongoose'
import router from './router.js'

const {
    PORT,
    MONGO_URI,
} = process.env

const app = express()

app.use(router)

const options = {
    useNewUrlParser: true,
    // useUnifiedTopology: true,
    autoIndex: false,
    maxPoolSize: 10,
}

mongoose.connect(MONGO_URI, options)
    .then(() => {
        console.log('Connected to MongoDB')

        app.listen(PORT, () => {
            console.log('Server started on port', PORT)
        })
    })
    .catch(e => {
        console.error('Error connecting to MongoDB:', e)
    })
