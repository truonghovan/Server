//const Users = require('../models/User');
//const { mongooseToObject } = require('../../util/mongoose');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const shortid=require('shortid')

class AuthController {
    //[POST] /buyer/signup
    signup(req, res, next) {
        User.findOne({ email: req.body.email })
            .exec(async (error, user) => {
                if (user) return res.status(400).json({
                    message: 'Admin already registered'
                })
                const { firstName, lastName, email, password } = req.body;
                const hash_password = await bcrypt.hash(password, 10)
                const _user = new User({ firstName, lastName, email, hash_password, userName: shortid.generate(), role: 'admin' })
                _user.save((error, data) => {
                    if (error) {
                        return res.status(400).json({ message: 'Something went wrong' })
                    }

                    if (data) {
                        return res.status(201).json({
                            message: 'Admin created Successfully...!'
                        })
                    }
                })
            })
    }
    //[POST] /admin/signin
    signin(req, res, next) {
        User.findOne({ email: req.body.email })
            .exec( async (error, user) => {
                if (error) return res.status(400).json({ error })
                if (user) {
                    const isPassword =  user.authenticate(req.body.password)
                    console.log({isPassword})
                    if (isPassword && user.role === "admin") {
                        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' })
                        const { firstName, lastName, email, role, fullName } = user;
                        res.cookie('token', token, { expiresIn: '1y' })
                        res.status(200).json({
                            token,
                            user: {
                                firstName, lastName, email, role, fullName
                            }
                        })
                    }
                    else {
                        return res.status(400).json({
                            message: 'Invalid Password'
                        })
                    }
                }
                else {
                    return res.status(400).json({ message: 'Something went wrong' })
                }

            })

    }
    signout(req, res, next) {
        res.clearCookie('token')
        res.status(200).json({
            message: 'Signout successfully...!'
        })
    }
}

module.exports = new AuthController();