const mongoose = require("mongoose")

const UrlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    longUrl: {
        type: String,
        required: true,
        valid_url : true
    },
    shortUrl: {
        required: true,
        unique: true
    }
}, { timestamps: true })

module.exports = mogoose.model('Url', UrlSchema)