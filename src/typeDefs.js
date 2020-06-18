const {gql} = require("apollo-server-express");

const typeDefs = gql`
    type User {
        _id: ID!,
        username: String!,
        email: String!,
        createdAt: String!,
        updatedAt: String!, 
        verified: Boolean!
    }
    type PostOwner{
        _id: ID!,
        name: String!
    }
    type Post{
        _id: ID!
        title: String!
        description: String!
        createdAt: String!
        updatedAt: String!
        imageURL: String!
        createdBy: PostOwner
    }
    ## Responses ##
    type accessResponse{
        accessToken: String!,
        refreshToken: String!
    }
    type TotalPost{
        count: Int!
    }
    ##  ERRORS  ##
    type Error {
        errorMessage: String!
    }
    type signedUrl {
        signedUrlS3: String!
        fileName: String!
        fileUrl: String!
    }
    type trueORfalse{
        ok: Boolean!
    }
    ## UNIONS ##
    union PostsBox =  Post | Error 
    union UsersorError = User | Error
    union AccessResponseorError = accessResponse | Error
    union RegisterorError = trueORfalse | Error
    union totalPostsorError = TotalPost | Error
    union signedUrlorError = signedUrl | Error
    ## UNIONS ##
    type Query {
       users: [UsersorError]!
       posts(limit: Int!, skip: Int!, asc: Int!, userID: String!): [PostsBox!]
       user(_id: ID!): User!
       totalPosts(userID: String!): totalPostsorError!
    }
    ## MUTATIONS  ##
    type Mutation {
        signUpUser(username: String!, password: String!, email: String!): RegisterorError
        signInUser(email: String!, password: String!): [AccessResponseorError]!
        postPost(title: String!, description: String!, imageURL: String!): PostsBox!
        signUrl(fileType: String!):signedUrlorError 
        deletePost(_id: String!, fileName: String!): Boolean!
        updatePost(_id:String!, title:String, description:String!): Boolean
    }
`;

module.exports = typeDefs;