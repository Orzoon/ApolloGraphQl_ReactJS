const mongoose = require("mongoose");


const postSchema = new mongoose.Schema({
    _id: mongoose.Types.ObjectId,
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    imageURL: {
        type: String, 
        trim: true,
        default: "null"
    },
    createdBy: {
        _id: mongoose.Types.ObjectId,
        name: {
            type: String,
            trim: true
        }
    }

}, {
    timestamps: true
})


const postModel = new mongoose.model("Post", postSchema)

module.exports = postModel;