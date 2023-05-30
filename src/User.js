import { Schema, model } from 'mongoose'

const userSchema = new Schema({
    password: String,
    role: {
        type: String,
        default: 'user',
        enum: [ 'admin', 'user' ],
    },
    username: {
        type: String,
        unique: true,
    },
})

export default model('User', userSchema)
