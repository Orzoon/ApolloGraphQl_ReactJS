import React, {useContext, useState, useEffect, useMemo} from "react";
import {AppContext} from "../App";
import {useDeletePost, useUpdatePost} from "../utils/hooks"
import { MdPermMedia } from "react-icons/md";
import {LoadingLineComponent} from "../utils/globals"


export default function PostCard(){
    const [loading, setLoading] = useState(true)
    const [twoRow, setTwoRow] = useState(false);
    const   {
                state:{postsData:postsData},
                state:{initialLoading},
                state:{postsLoading},
                state:{radioAll},
                deletePostHandler,
                loadPostCounts
            } = useContext(AppContext)
    const dummyArray = [1,2,3,4,5,6,7,8]
    useEffect(() => {
         // adding eventListener to detectScreenWIdth
        window.addEventListener("resize", checkScreenWidth);
        // running for the first time
        checkScreenWidth()
        setTimeout(() => {
            setLoading(false)
        }, 1000)

        return (() => {
            window.removeEventListener("resize", checkScreenWidth)
        })
    }, [])

    function checkScreenWidth(){
        const width = window.innerWidth;
        if(width > 768) setTwoRow(true)
        else setTwoRow(false)
    }

    
    if(initialLoading || postsLoading || loading){
        return (
            <ul className = "Loader_PostCard">
              {dummyArray.map((neglectNumber) => {
                  return <LoaderList key = {neglectNumber}/>
              })}
            </ul>
        )
    }

    return(
        <div className = "PostCard">
            {!radioAll && postsData.length === 0 &&
                <p className = "message">You have no cards, create one!</p>
            }
            {/* Normal for devices below 750px */}
            {!twoRow && postsData &&
                <ul className = "PostCard_firstColumn">
                    {
                        postsData.map((post) => {
                            return <PostList key = {post._id} post = {post} deletePostHandler = {deletePostHandler} radioAll = {radioAll} loadPostCounts ={loadPostCounts}/>
                        })  
                    }
                </ul>
            }

            {/* Normal for devices above 750px */}

            {twoRow && postsData &&
                <ul className = "PostCard_firstColumn">
                    {
                        postsData.map((post, index) => {
                            if((index+1)%2 !== 0){
                                    return <PostList key = {post._id} post = {post} deletePostHandler = {deletePostHandler} radioAll = {radioAll} loadPostCounts ={loadPostCounts}/>
                                }
                            else return null
                        })  
                    }
                </ul>
            }

            {twoRow && postsData &&
                <ul className = "PostCard_secondColumn">
                    {
                        postsData.map((post, index) => {
                            if((index+1)%2 === 0){
                                    return <PostList key = {post._id} post = {post} deletePostHandler = {deletePostHandler} radioAll = {radioAll} loadPostCounts ={loadPostCounts}/>
                                }
                            else return null
                        })  
                    }
                </ul>
            }
        </div>
    )
}


function PostList({post, deletePostHandler, radioAll, loadPostCounts}){
    const  {imageURL,title, description, createdBy, _id} = post;
    const {deleteErrorMessage, deletePostMethod, postDeleted, deleteLoading, deletedPostId} = useDeletePost()
    const {updateErrorMessage, updatePostMethod, postUpdated, updateLoading} = useUpdatePost()
    const [showUpdateFields, setShowUpdateFields] = useState(false);

    // updateValues
    const [valuesToUpdate, setValuesToUpdate] = useState({})

    useEffect(() => {
        const Obj = {
            updateTitle: title,
            updateDescription: description
        }
        setValuesToUpdate(Obj)
    }, [])
    
    function updateClickHandler(action){
        if(action === "EDIT") setShowUpdateFields(true)
        else if(action === "UPDATE") {
            setShowUpdateFields(false);
            updatePostMethod(_id,valuesToUpdate.updateDescription)
        }
    }

    function updateChangeHandler(e){
        e.preventDefault();
        const {name, value} = e.target;
        const newObj = {
            ...valuesToUpdate, 
            [name]:value
        }
        setValuesToUpdate(newObj)
    }

    if(postDeleted){
        deletePostHandler(null,deletedPostId)
        loadPostCounts(radioAll)
    }

    return(
        <li className = "PostCard_PostList">
           
            {(updateLoading || deleteLoading) &&  <LoadingLineComponent/>}
            {
                <>
                    <Picture imageURL = {imageURL}/>
                    <Description 
                        description = {description} 
                        createdBy = {createdBy} 
                        title ={title}
                        showUpdateFields = {showUpdateFields}
                        valuesToUpdate = {valuesToUpdate}
                        updateChangeHandler = {updateChangeHandler}
                        postUpdated = {postUpdated}
                        deleteErrorMessage = {deleteErrorMessage}
                        updateErrorMessage = {updateErrorMessage}
                        
                       
                    />
                    <PostButtons 
                        _id = {_id}
                        imageURL = {imageURL}
                        createdBy = {createdBy} 
                        // listInitialLoadingHandler = {listInitialLoadingHandler} 
                        deletePostMethod = {deletePostMethod}
                        updatePostMethod = {updatePostMethod}
                        updateClickHandler = {updateClickHandler}
                        showUpdateFields= {showUpdateFields}
                        />
                </>
            }
        </li>
    )
}


function Description({
    deleteErrorMessage,
    updateErrorMessage,
    postUpdated,
    updateChangeHandler,
    valuesToUpdate,
    showUpdateFields,
    description, 
    createdBy, 
    title}) {
    const {state:{userID:userID}, state:{loggedIn:loggedIn}} = useContext(AppContext)

    return (
        <div className = "Description">
            <h1>{title && title.replace(title.charAt(0), title.charAt(0).toUpperCase())}</h1>
            <h3>Post By : 
                {   
                    !loggedIn ? " " + createdBy.name.replace(createdBy.name.charAt(0), createdBy.name.charAt(0).toUpperCase()):
                    userID && userID.toString() === createdBy._id.toString() ? " You": " " + createdBy.name.replace(createdBy.name.charAt(0), createdBy.name.charAt(0).toUpperCase())
                } 
            </h3>
            {updateErrorMessage && <p className = "errorMessage">{updateErrorMessage}</p>}
            {deleteErrorMessage && <p className = "errorMessage">{deleteErrorMessage}</p>}
            {showUpdateFields ? 
                <textarea 
                    name = "updateDescription"
                    onChange = {e => {updateChangeHandler(e)}}
                    value = {valuesToUpdate.updateDescription}
                ></textarea>
                : 
                <p> 
                    {description && description.replace(description.charAt(0),description.charAt(0).toUpperCase())} 
                </p>
            }
        </div>
    )
}




function Picture({imageURL}){
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
        <div className = "Picture">
            {
                !imageLoaded && 
                <div className = "lazyLoading">
                    <MdPermMedia/>
                </div>
            }
            <img 
                style = {imageLoaded ? {} : {display: "none"}}
                src = {imageURL}
                onLoad = {e =>setImageLoaded(true)}
            />
        </div>
    )

}

function PostButtons({showUpdateFields,updateClickHandler, _id, imageURL,createdBy, deletePostMethod}){
    // console.log("imageUrl", imageURL)
    const {state:{userID:userID}, state:{loggedIn:loggedIn}} = useContext(AppContext)
    // console.log("userID", userID)
    // console.log("createdByID",createdBy._id)
    if(!loggedIn || (userID && createdBy._id.toString() !== userID.toString())){
        return null
    }
    return (
        <div className = "PostButtons">
            {
                showUpdateFields ? 
                <button
                    className = "PostButtons_button"
                    onClick = {e => updateClickHandler("UPDATE")}
                >
                    Update
                </button> 
                :
                <button
                    className = "PostButtons_button"
                    onClick = {e => updateClickHandler("EDIT")}
                >
                    Edit
                </button> 
            }

            <button 
                className = "PostButtons_button deleteBtn"
                onClick = {(e) => deletePostMethod(_id, imageURL)}
                >
                Delete
            </button>
        </div>
    )

}

/*-------------*/
function LoaderList(){
    return (
        <li>
            <div>
                <MdPermMedia/>
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div>
                <div></div>
                <div></div>
            </div>
        </li>
    )
}