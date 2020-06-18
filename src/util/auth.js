const jwt = require("jsonwebtoken");
const mongoose = require("mongoose")
const userModel = require("../model/userModel");

const checkAuth = async (token) => {
    try{
        const {userID, userType, tokenType} = await jwt.verify(token,process.env.TOKENSECRET)
        if(userID && userType && tokenType){
            return {userID, userType, tokenType}
        }
        return null
    }catch(error){
        return null
    }
}

const generateTokens = async(userID) => {
    try{
        const user = await userModel.findOne({_id: mongoose.Types.ObjectId(userID)})

        const refreshToken = await jwt.sign({userID: user._id, userType: user.userType, tokenType: "REFRESH"},process.env.TOKENSECRET,{
            expiresIn: '10m'
        })

        const accessToken = await jwt.sign({userID: user._id, userType: user.userType, tokenType: "ACCESS"},process.env.TOKENSECRET,{
            expiresIn: '30m'
        })

        return {refreshToken, accessToken}

    }catch(error){
        
    }
}

module.exports = {
    checkAuth,
    generateTokens
};