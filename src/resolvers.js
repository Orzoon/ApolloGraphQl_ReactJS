const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid')
const utils = require("../src/util/auth");


module.exports = {
  // --------------------UNION--------------------- //
  PostsBox:{
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return 'Error'
      }
      else {
        return 'Post'
      }
    }
  },
  UsersorError: {
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return "Error"
      }
      return "User"
    }
  },
  AccessResponseorError: {
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return "Error"
      }
      else{
        return "accessResponse"
      }
    }
  },
  RegisterorError: {
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return "Error"
      }
      else {
        return "trueORfalse"
      }
    }
  },
  totalPostsorError: {
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return "Error"
      }
      else {
        return "TotalPost"
      }
    }
  },
  signedUrlorError: {
    __resolveType: (obj) => {
      if(obj.errorMessage){
        return "Error"
      }
      else {
        return "signedUrl"
      }
    }
  },
  // --------------------QUERY--------------------- //
  Query: {
      users: async(_,__,{user, models}) => {
        try {
          if(!user){ 
            return [{
              errorMessage: "login to acccess"
            }]
          }
          const dbUser = await models.userModel.findOne({_id: mongoose.Types.ObjectId(user.userID)})
          return dbUser;
        }catch(error){
          console.log("usersError",error)
        }
      },
      posts: async(parent, {limit, skip, asc, userID}, { models: {postModel: postModel},
                                    models: {userModel: userModel},
                                    user,
                                    pubsub
              })=>{
                try{

                  let matchParam = {}

                  if(userID && userID !== "null"){
                    matchParam = {"createdBy._id": mongoose.Types.ObjectId(userID)}
                  }
                  
                  const posts = await postModel.aggregate([
                    {$match: matchParam},
                    {$limit: limit},
                    {$skip: skip},
                    {$sort: {"createdAt": asc}}
                  ])             
                  if(!posts){
                    throw({errorMessage: "there are no posts at the moment"})
                  }
                  return (posts)

                }catch(error){
                  return [error]
                }
      },
      totalPosts: async(parent, {userID},  {models: {postModel: postModel}}) => {
                  try{
                    let count;
                    if(userID && userID !== "null"){
                      count = await postModel.find({"createdBy._id": mongoose.Types.ObjectId(userID)}).countDocuments();
                    }
                    else {
                      count = await postModel.countDocuments();
                    }
                    return {count: count}
                  }catch(error){
                    return error
                  }
      }
  },

 // --------------------MUTATION--------------------- //
  Mutation:  {
    /* SIGN_UP_USER */
    signUpUser: async(_, {username, email, password}, {models}) => {
            try {
              // just simple validation ----> email validation done at front-end
              if(email.trim().length === 0 || password.trim().length === 0 || username.trim().length ===0){
                throw ({errorMessage: "Please fill in all the fields"})
              }
              if(username.trim().length <3){
                throw ({errorMessage: "Username must be at least 3 characters long"})
              }
              if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
                throw ({errorMessage: "Invalid email"})
              }
              if(password.trim().length <=5){
                throw ({errorMessage: "Password must be at least 6 characters long"})
              }
              // checking for existing user
              const userExists = await models.userModel.findOne({email: email})
              if(userExists){
                throw ({errorMessage: "User already exists"})
              }
              const hashedPassword = await bcrypt.hash(password, 10);
              const user = await models.userModel.create({_id: mongoose.Types.ObjectId(), username, password: hashedPassword, email, userType: "GENERAL"});
              await user.save();
              return {ok: true}
            }
            catch(error){
              if(error && error.hasOwnProperty("errorMessage")){
                return error
              }
              return error
            } 
            // generating the token
    },
    /* SIGN_IN_USER */
    signInUser: async(_,{email, password},{models, TOKENSECRET, res}) => {
        try {
            //check
            if(email.trim().length === 0 || password.trim().length === 0){
              throw ({errorMessage: "Please fill in all the fields"})
            }
            if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
              throw ({errorMessage: "Invalid email"})
            }
            // later on store errors in an array --TODO
            const user = await models.userModel.findOne({email})
            // check user
            if(!user){
              throw ({errorMessage: "user does not exist"})
            }
            const passwordCheck = await bcrypt.compare(password, user.password)
            if(!passwordCheck){
              throw ({errorMessage: "invalid password"})
            }
            const {accessToken, refreshToken} = await utils.generateTokens(user._id)
            // generate token
            return [{accessToken, refreshToken}]
        }catch(error){
          return [error]
        }
    },
    /* PostPOST */
    postPost: async (_,{title,description, imageURL}, {user,models}) => {
      // check later on for userTypes
      try { 
        if(!user){
          return {
              errorMessage: "Login to post"
            }
        }
        // validation handled from client side for now
        
        const userInform = await models.userModel.findById(user.userID);
        const createdBy = {
          _id: mongoose.Types.ObjectId(userInform._id),
          name: userInform.username
        }
        const newPost = await models.postModel.create({_id: mongoose.Types.ObjectId(), userID: user.userID, title, description, imageURL, createdBy})
        return newPost.toObject()
      }catch(error){
        return error
      }
    },

    signUrl: async(_,{fileType},{user,MYS3, models}) => {
        try{
          if(!user){
            return {
                errorMessage: "Login to post"
              }
          }
          const key = uuidv4();
          const fileName = key + "." + fileType
          // check for file name --> right now done at front-end
          const s3params = {
            Bucket: process.env.AMAZON_BUCKETNAME,
            Expires: 60,
            ContentType: fileType,
            Key: fileName,
            ACL: 'public-read'
          }
          
          // get signed url
          const signedUrl = MYS3.getSignedUrl('putObject', s3params);
          const url = `https://${process.env.AMAZON_BUCKETNAME}.s3.amazonaws.com/${fileName}`
          return({
            signedUrlS3: signedUrl,
            fileUrl: url,
            fileName: fileName
          })
        }catch(error){
          return error
        }
    },

    deletePost: async(_,{_id,fileName}, {user,MYS3, models}) => {
      try{
        if(!user){
          console.log("no user")
          return false
        }
        const fileSplit = fileName.split("/")
        const actualFileName = fileSplit[fileSplit.length-1]
        // first delete the image from the s3 bucket
        const s3params = {
          Bucket: process.env.AMAZON_BUCKETNAME,
          Key: actualFileName
        }
        await MYS3.deleteObject(s3params,function(err,data){
          if (err)    {throw new Error("returning false from catch")}
          // successfull
      }).promise();
        // deleting the post from the model
        await models.postModel.findOneAndDelete({_id: mongoose.Types.ObjectId(_id)})
        return true
      }catch(error){
        console.log("deletePost", error)
        return false
      }
    },

    updatePost: async(_,{_id,title, description}, {user,models}) =>{
      try{
          if(!user){
            throw new Error("return false")
          }
          // not checking wether the post is of user or not just updating for now :)
          const post = await models.postModel.findOneAndUpdate({_id: mongoose.Types.ObjectId(_id)}, {description}, {useFindAndModify:false})
          return true
      }catch(error){
        // for any error return false
        return false
      }
    }
  }
}