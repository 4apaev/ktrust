import express from 'express'

import { hash, compare } from 'bcrypt'
import * as JWT from 'jsonwebtoken'

import User from './User.js'
const router = express.Router()

export default router

const {
    SECRET = 'SECRET',
} = process.env

express.json()
router.use(express.json())

router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({}, '-password')
        res.json(users)
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

router.post('/', auth, async (req, res) => {

    try {
        // username, password, role
        const user = new User(req.body)
        await user.save()
        res.json({
            message: 'User created successfully',
        })
    }
    catch (error) {
        res.status(500).json({ error })
    }
})

router.put('/:userId', auth, async (req, res) => {
    try {
        const { userId } = req.params
        // username, password, role
        await User.findByIdAndUpdate(userId, req.body)
        res.json({
            message: 'User updated successfully',
        })
    }
    catch (error) {
        res.status(500).json({
            error: 'An error occurred',
        })
    }
})

router.delete('/:userId', auth, async (req, res) => {
    if (req?.user?.role != 'admin') {
        return res.status(403).json({
            error: 'Invalid role',
        })
    }
    try {
        await User.findByIdAndDelete(req.params.userId)
        res.json({
            message: 'User deleted successfully',
        })
    }
    catch (error) {
        res.status(500).json({ error })
    }
})

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body
        const hashedPassword = await hash(password, 10)
        const user = new User({ username, password: hashedPassword })
        await user.save()
        res.json({ message: 'Registration successful' })
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
            })
        }
        const isMatch = await compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials',
            })
        }

        const token = JWT.sign({ userId: user._id }, SECRET)
        res.json({ token })
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

export async function auth(req, res, next) {
    const token = req.headers.authorization
    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
        })
    }
    try {
        const decoded = JWT.verify(token, SECRET)
        req.user = await User.findById(decoded.userId)
        next()
    }
    catch (error) {
        res.status(401).json({
            error: 'Unauthorized',
        })
    }
}
