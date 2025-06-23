import express from 'express';
import bcrypt from 'bcrypt';
import User from '../Models/UserModel.mjs';
import jwt from 'jsonwebtoken';

export const router = express.Router();

router.post('/register',async(req,res)=>{
    const { username, email, password } = req.body;
    if(!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();
        const token = jwt.sign({ userId: newUser._id },process.env.JWT_SECRET,{ expiresIn:'24h' }
        );
        res.status(201).json({ message: 'User registered successfully' });
}   
    catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }

})