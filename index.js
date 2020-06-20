//require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const AWS = require('aws-sdk');
const path = require("path");
const AWSconfig = {
    accessKeyId: process.env.AMAZON_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_SECRET_KEY,
    region: process.env.AMAZON_REGION,
};
// global AWS configutaion
AWS.config.update(AWSconfig);
const MYS3 = new AWS.S3();


//const {ApolloServer} = require("apollo-server");
const {ApolloServer, ApolloError} = require("apollo-server-express");
const {GraphQLError} = require("graphql");

const typeDefs = require("./src/typeDefs");
const resolvers = require("./src/resolvers");

const userModel = require("./src/model/userModel");
const postModel = require("./src/model/postModel");
const models = {
    userModel,
    postModel
}

// UTILS //
const utils = require("./src/util/auth")
const PORT = process.env.PORT || 5000;


const app = express();
app.use((req,res,next) => {
    res.setHeader("Access-Control-Allow-origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
})

app.use(express.json());

app.use(express.static(path.join(__dirname, "public", "build")))

app.get("/", function(req,res){
    res.sendFile(path.join(__dirname, "public", "build", "index.html"))
})


const { ObjectId } = mongoose.Types;
ObjectId.prototype.valueOf = function () {
  return this.toString();
};

const server = new ApolloServer({
    typeDefs, 
    resolvers, 
    introspection: true,
    playground: true,
    context: async ({ req, res }) => {
            const header = req.headers.authorization || "";
            const token = header.split(" ")[1];
            const user = await utils.checkAuth(token)
    
            if(user && user.tokenType === "REFRESH"){
                const {accessToken, refreshToken} = await utils.generateTokens(user.userID);
                res.cookie("accessToken", accessToken);
                res.cookie("refreshToken", refreshToken);
            }
        
            return {
                TOKENSECRET: process.env.TOKENSECRET,
                user,
                models,
                res, 
                MYS3
            }
      },
    formatError: (error) => {
        console.log("errorIndexjs", error)
        if(error.originalError instanceof ApolloError){
            return error
        }
        console.log("errorIndexjs", error)
        return new GraphQLError(`Something went wrong`)
    }
});

//app.use(express.json())
server.applyMiddleware({ app, path: '/graphql' })
// app.get("/*", function(req,res){
//     res.sendFile(path.join(__dirname, "public", "build", "index.html"))
// })

mongoose.connect(process.env.mongooseURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}, (error) => {
    if(error){
        console.log("something went wrong")
    }
    app.listen({port: PORT}, () => {
        console.log("server is running at port ", "http://localhost:"+PORT+ server.graphqlPath) 
    })
})



