const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Types.ObjectId
    },
    username: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: String,
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true
    },
    verified: {
        type: Boolean,
        default: false
    },
    userType: {
        type: String,
        enum: ["GENERAL", "ADMIN"],
        default: "GENERAL"
    }
}, 
{
    timestamps: true
});

const userModel = new mongoose.model("user", userSchema)


module.exports = userModel;