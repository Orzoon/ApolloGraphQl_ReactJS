import React, {useState, useEffect, useContext} from "react";
import {AppContext} from "../App"
import {SERVERURI} from "./globals";

export const useLogin = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({})
    const [loggedIn, setLoggedIn] = useState(false);
    const [token, setToken] = useState(null);
    const [loading, setLoading]= useState(false);

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
            setLoading(true)
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
                setLoading(false)
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
                setLoading(false)
                // erros defined by me at backend--TODO
            }
    }

    // returning all the values and ...rest variables
    return {values, changeHandler, submitHandler, errors, loggedIn, token, loading}
}


export const useRegister = (initialValues) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({})
    const [registered, setRegistered] = useState(null);
    const [loading, setLoading] = useState(null)


    function changeHandler(e){
        e.preventDefault();
        const name = e.target.name;
        const value = e.target.value;   
        setValues(prevValues => ({...prevValues, [name]: value}))
    }


    async function registerHandler(e, values){
        setLoading(true)
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
                setLoading(false)
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
            setLoading(false)
        }
    }

    return {values, changeHandler, errors, registerHandler, registered, loading}
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
            if(characterCount > 300){
                errorObj.descriptionError = "Max limit is 300 characters"
            }
            if(characterCount < 50){
                errorObj.descriptionError = "Min limit is 50 characters"
            }
            let match = /\r|\n/.exec(description);
            if (match) {
                errorObj.descriptionError = "No line breaks allowed"
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
                setLoading(false)
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
                postPost(title: "${values.title.toString()}", description:"${values.description.toString()}", imageURL:"${fileUrl.toString()}"){
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
            delete responseData.__typename;
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

export const useDeletePost = () => {
    const {state:{token}} = useContext(AppContext)
    const [deleteErrorMessage, setDeleteErrorMessage] = useState(null)
    const [postDeleted, setPostDeleted] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletedPostId, setDeletedPostId] = useState(null);

    async function deletePostMethod(_id, fileName){
        setPostDeleted(false)
        setDeleteErrorMessage(null)
        setDeleteLoading(true)
        try{      
            const DELETEMUTATION = `mutation{
                deletePost(_id: "${_id}", fileName: "${fileName}")
            }`  

            const deleteRequest = await fetch(SERVERURI, {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({query: DELETEMUTATION})
            })


            if(!deleteRequest.ok){
                throw new Error("to catch block")
            }

            const {data} = await deleteRequest.json();
            if(!data && !data.deletePost){
                throw new Error("to catch block")
            }
            // successfully deleted
            setDeletedPostId(_id)
            setPostDeleted(true)
            setDeleteLoading(false)
        }catch(error){
            setDeleteErrorMessage("Something went wrong, Try again Later!")
            // upon some error
            setDeletedPostId(null)
            setPostDeleted(false)
            setDeleteLoading(false);
        }
    }

    return {deletePostMethod, postDeleted, deleteErrorMessage, deleteLoading,deletedPostId }
}

export const useUpdatePost = () => {
    const {state:{token}, updatingDescriptionHandler} = useContext(AppContext)
    const [updateErrorMessage, setUpdateErrorMessage] = useState(null)
    const [postUpdated, setPostUpdated] = useState(false)
    const [updateLoading, setUpdateLoading] = useState(false);


    async function updatePostMethod(_id,currentDescription){
        console.log("currentDescription", currentDescription)
        setUpdateErrorMessage(null)
        setPostUpdated(false)
        // smae value return 
        setUpdateErrorMessage(null)
        // setting loading to true
        setUpdateLoading(true)
        // checking the previous and the current values--> no need to change if they are equal
        // if(prevDescription.trim() === currentDescription.trim()){
        //     setPostUpdated(true)
        //     setUpdateLoading(false)
        //     setPostUpdated(true)
        //     return
        // }
        try{            
            // checking for the fields
            let characterCount = 0;
            if(currentDescription.toString().trim().length === 0){
                throw({errorMessage: "description cannot be empty"})
            }


            // not empty
            currentDescription.toString().trim().split(" ").forEach((word) => {
                const wordLength = word.length
                characterCount+=wordLength
            })
            if(characterCount > 300){
                throw({errorMessage: "Max limit is 300 characters"})
            }
            if(characterCount < 50){
                 throw({errorMessage: "Min limit is 50 characters"})
            }

            let match = /\r|\n/.exec(currentDescription);
            if (match) {
                throw({errorMessage: "No line breaks allowed"})
            }

            console.log("hre")
            const UPDATEMUTATION = `mutation{
                updatePost(_id: "${_id}", description: "${currentDescription.trim()}")
            }`  
            const updateRequest = await fetch(SERVERURI, {
                method: "POST",
                headers: {
                    "authorization": `Bearer ${token}`,
                    "content-type": "application/json"
                },
                body: JSON.stringify({query: UPDATEMUTATION})
            })


            if(!updateRequest.ok){
                throw new Error("to catch block")
            }

            const {data} = await updateRequest.json();
            if(!data && !data.updatePost){
                throw new Error("to catch block")
            }
            // successfully deleted
            setPostUpdated(true)
            setUpdateLoading(false)
            updatingDescriptionHandler(_id,currentDescription)
        }catch(error){
            if(error.errorMessage){
                setUpdateErrorMessage(error.errorMessage)
            }
            else{
                setUpdateErrorMessage("Something went wrong, Try again Later!")
            }
            // upon some error
            setPostUpdated(false)
            setUpdateLoading(false)
        }
    }
    return {updateErrorMessage, updatePostMethod, postUpdated, updateLoading}
}