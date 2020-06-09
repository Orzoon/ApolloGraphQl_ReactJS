import React, {useState, useEffect, useContext} from "react";
import {AppContext} from "../App"
import {SERVERURI} from "./globals";

export const useLogin = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);
    const [token, setToken] = useState(null)

    function changeHandler(e){
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;   
        setValues(prevValues => ({...prevValues, [name]: value}))
    }

    function validationCheck(){
        // serverSideValidation
    }

    async function submitHandler(e, values){
            e.preventDefault()
            // clearing out the initial Errors
            setErrors({})
            const signInUserMutation = `mutation {
                             signInUser(email: "${values.email}", password: "${values.password}") 
                                {   
                                    __typename
                                    ... on Error{
                                    errorMessage
                                  }
                                  
                                  ... on accessResponse{
                                    refreshToken
                                    accessToken
                                  }
                                }
                            }`
            try{
                const loginResponse = await fetch(SERVERURI,{
                    method: "POST", 
                    headers: {
                        'Content-Type': `application/json`,
                        'Accept'      : `application/json`
                    },
                    body: JSON.stringify({query: signInUserMutation})
                })

                // no response
                if(!loginResponse.ok){
                    let errorObj = {};
                    errorObj.errorMessage = "Something went wrong"
                    throw(errorObj)
                }

                const {data} = await loginResponse.json()
                
                // no data so errors 
                if(!data){
                    throw({errorMessage: "Something went wrong"})
                }
    
                // checking for __typeName for errors
                // checking for __typeName and error
                if(data.signInUser[0].__typename === "Error"){
                    throw(data.signInUser[0])
                }

                // setting cookies    
                document.cookie = "refreshToken" + "=" +data.signInUser[0].refreshToken           
                document.cookie = "accessToken" + "=" +data.signInUser[0].accessToken

                // set logged In true
                setLoggedIn(true)
                setToken(data.signInUser[0].accessToken)
                
            }
            catch(error){
                // no response or if graphql default errorObj
                if(error && error.hasOwnProperty("errorMessage")){
                    setErrors(error)
                }else {
                    setErrors({errorMessage: "something went wrong try again later"})
                }
                // erros defined by me at backend--TODO
            }
    }

    // returning all the values and ...rest variables
    return {values, changeHandler, submitHandler, errors, loggedIn, token}
}


export const useRegister = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({})
    const [registered, setRegistered] = useState(false);


    function changeHandler(e){
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;   
        setValues(prevValues => ({...prevValues, [name]: value}))
    }


    async function registerHandler(e, values){
        e.preventDefault()
        // clearing out the initial Errors
        setErrors({})
        const signUpUserMutation = `mutation {
                        signUpUser(email:"${values.email}", username:"${values.username}", password: "${values.password}"){
                            __typename
                            ... on Error{
                            errorMessage
                            }
                            ... on trueORfalse{
                            ok
                            }
                        }                
                    }`
        try{
            const registerResponse = await fetch(SERVERURI,{
                method: "POST", 
                headers: {
                    'Content-Type': `application/json`,
                    'Accept'      : `application/json`
                },
                body: JSON.stringify({query: signUpUserMutation})
            })

            // no response
            if(!registerResponse.ok){
                let errorObj = {};
                errorObj.errorMessage = "Something went wrong"
                throw(errorObj)
            }

            const {data} = await registerResponse.json()
            
            // no data so errors 
            if(!data){
                throw({errorMessage: "Something went wrong"})
            }

            // checking for __typeName for errors
            // checking for __typeName and error
            if(data.signUpUser.__typename === "Error"){
                throw({errorMessage: data.signUpUser.errorMessage})
            }

            if(data.signUpUser.ok)
            {
                setRegistered(true)
            }

            // setting registeresd to true and redirecting to login
        }
        catch(error){
            // no response or if graphql default errorObj
            if(error && error.hasOwnProperty("errorMessage")){
                setErrors(error)
            }else {
                setErrors({errorMessage: "something went wrong try again later"})
            }
            // erros defined by me at backend--TODO
        }
    }

    return {values, changeHandler, errors, registerHandler, registered}
}


export const usePostForm = (initialValues) => {
    const {state:{token}} = useContext(AppContext)
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState(null);
    const [loading, setLoading] = useState(false);
    const [postData,setPostData] = useState(null)
    function changeHandler(e){
        e.preventDefault();
        const {name, value} = e.target;

        // for file
        if(name === "file"){
            setValues({...values, [name]: e.target.files[0]})
            return 
        }

        // for values
        setValues({...values, [name]: value})
    }

    async function validationCheck(values){
        // clearing out previous erros---/ just in case
        setErrors(null)
        try{    
            const {title, description, file} = values;
            // checking for empty values
            let errorObj = {}
            if(title.toString().trim().length === 0){
                errorObj.titleError = "title cannot be empty"
            }else if(title.toString().trim().length <= 2){
                errorObj.titleError = "title must le at least 3 characters long"
            }

            let characterCount = 0;
            if(description.toString().trim().length === 0){
                errorObj.descriptionError = "description cannot be empty"
            }


            // not empty
            description.toString().trim().split(" ").forEach((word) => {
                const wordLength = word.length
                characterCount+=wordLength
            })
            if(characterCount > 150){
                errorObj.descriptionError = "Max limit is 150 characters"
            }
            if(characterCount < 10){
                errorObj.descriptionError = "Min character count should be 10"
            }

            // check for file
            if(!file){
                errorObj.fileError = "Select a file"
            }else if(file){
                // file type
                const allowedFileTypes = ['image/png', 'image/jpeg', 'image/gif']
                if(!allowedFileTypes.includes(file.type)){
                    errorObj.fileError = "Only image files are allowed"
                }
            }
            return errorObj
        }catch(error){
            let errorObj = {}
            errorObj.errorMessage = "Something went wrong"
            return errorObj;
        }
    }

    async function submitHandler(values){
        // settng postData to null
        setPostData(null)
        setLoading(true)
        // clearing out previous erros---/ just in case
        try{
            const errors = await validationCheck(values)
            if(Object.keys(errors).length > 0){
                // we have errors 
                setErrors(errors)
                return
            }
            // no Errors

            var formData = new FormData();
            Object.keys(values).forEach(value => {
                formData.append(value, values[value])
            })
        
            const fileType = values.file.type.split("/").join(".")

            // getting signedURL
            const getUrlMutation = `mutation{
                signUrl(fileType:"${fileType}"){       
                  ... on signedUrl{
                    __typename
                    signedUrlS3
                    fileName
                    fileUrl
                  }
                }
              }
            `

            const getUrlResponse = await fetch(SERVERURI,{
                method: "POST",
                headers: {
                    "authorization": `Bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    query: getUrlMutation
                })
            })

            
            if(!getUrlResponse.ok){
                let errorObj = {};
                errorObj.errorMessage = "Something went wrong"
                throw(errorObj)
            }

            const {data} = await getUrlResponse.json();
            if(!data){
                throw({errorMessage: "something went wrong"})
            }

            if(data.signUrl && !data.signUrl.hasOwnProperty("__typename") && !data.signUrl.__typename === "singedUrl"){
                throw ({errorMessage: "something went wrong"})
            }
            const {signedUrlS3, fileName, fileUrl} = data.signUrl;
            // uploading to S3 with signed key
            const filetoS3Response = await fetch(signedUrlS3, {
                method: "PUT", 
                headers: {
                    'Content-Type': fileType,
                    'x-amz-acl': 'public-read' 
                },
                body: values.file
            })

            if(!filetoS3Response.ok){
                throw new Error("something went wrong")
            }
        
            // upload file to aws with signedURL and getback file url
           // const fileName = // getUUIdFrom after signed;;;


            const postPostMutation = `mutation {
                postPost(title: "${values.title}", description:"${values.description}", imageURL:"${fileUrl}"){
                  ... on Error{
                    errorMessage
                  }
                  
                  ... on Post{
                    __typename
                    _id
                    description
                    title
                    imageURL
                    createdBy{
                        _id
                        name
                    }
                  }
                }
              }`

            const postPostMutationRequest = await fetch(SERVERURI, {
                                    method: 'POST',
                                    headers: {
                                        "authorization": `Bearer ${token}`,
                                        "content-type": "application/json"
                                    },
                                    body: JSON.stringify({query: postPostMutation})
                                })
                                
            if(!postPostMutationRequest.ok){
                throw new Error("some error")
            }
            const {data:{postPost: responseData}} = await postPostMutationRequest.json();
            if(!responseData){
                // we get graphql error defined by us so :)))))
                throw new Error("something surely went wrong")
            }

            //else setting
            setPostData(responseData)
            setLoading(false)
            


        }catch(error){
            if(error && error.hasOwnProperty("errorMessage")){
                setErrors(error)
            }else {
                setErrors({errorMessage: "something went wrong try again later"})
            }
            setPostData(null)
            setLoading(false);
        }
    }
    return {values, changeHandler, submitHandler, errors, loading, postData}
}