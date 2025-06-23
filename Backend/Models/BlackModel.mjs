import { create } from 'domain';
import express from 'express';
import mongoose from 'mongoose';

const BlackSchema = new mongoose.Schema({
    token:{
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1d' // Automatically remove the document after 1 day
    }
})
const BlackModel = mongoose.model('Black', BlackSchema);
export default BlackModel;