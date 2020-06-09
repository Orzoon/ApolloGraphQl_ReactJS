import React, {useContext, useState, useEffect} from "react";
import ImageUploader from 'react-images-upload';
// appContext
import {AppContext} from "../App"
import {usePostForm} from "../utils/hooks";

// icons
import {MdFilterList, MdArrowUpward, MdArrowDownward, MdPerson} from "react-icons/md"
export default function TopRow(){
    const {state:{userID},state:{loggedIn}} =  useContext(AppContext)
    const [filter, setFilter] = useState(false)
    const [postForm, setPostForm] = useState(false);

    function showHideFilterHandler(e, value){
        if(e){
            e.preventDefault();
        }
        setFilter(value)
    }

    function postFormHandler(e, value){
        if(e){
            e.preventDefault();
        }
        setPostForm(value)
    }
    return (
        <div className = "TopRow">
            {
                loggedIn &&
                <button onClick = {(e) =>postFormHandler(e,true)}>Create New Post</button>
            }

            <div className = "T_filter_button">
                <button onClick = {
                        (e) => {
                            showHideFilterHandler(e, true);
                        }
                    }>
                <MdFilterList/>
                </button>
            </div>

            {/* Filter */}
            {filter && 
                <FilterComponent  
                    showHideFilterHandler={showHideFilterHandler}
                    loggedIn = {loggedIn}
                    />
            }


            {
                postForm && 
                <PostForm
                    postFormHandler = {postFormHandler}
                />
            
            }
            
        </div>
    )
} 

function FilterComponent({showHideFilterHandler, loggedIn}){
    const filterRef = React.useRef(null)
    useEffect(() => {
        window.addEventListener("click",outsideClickHandler)
        return () => {
            window.removeEventListener("click",outsideClickHandler)
        }
    },[])

    function outsideClickHandler(e){
        e.preventDefault();
        if(filterRef.current && !filterRef.current.contains(e.target)){
            showHideFilterHandler(null, false)
        }
        return 
    }

    return(
        <ul className =  "T_filter_container" ref = {filterRef}>
            <li>
                <p>Created At</p> <MdArrowUpward/>
            </li>
            <li>
                <p>Created At</p> <MdArrowDownward/>
            </li>
            {loggedIn &&
                <li>
                    <p>Your posts</p><MdPerson/>
                </li>
            }
        </ul>
    )
}




//---------------------------------------------//
const postFormInitialValues = {
    title: "", 
    description: "",
    file: null,
    titlePlaceholder: "Title of the post",
    descriptionPlaceholder: "Write something you want me to read, here! :)"
}
function PostForm({postFormHandler}){
    const formRef = React.useRef(null)
    const {
        values, 
        changeHandler, 
        submitHandler, 
        loading,
        errors,
        postData
    } = usePostForm(postFormInitialValues)

    useEffect(() => {
        window.addEventListener("click", outsideClickHandler)
        return () => {
            window.removeEventListener("click", outsideClickHandler)
        }
    }, [])

    
    function outsideClickHandler(e){
        if(formRef.current && !formRef.current.contains(e.target)){
            postFormHandler(null, false)
        }
    }

    return(
        <div className = "PostFormContainer">    
            <form ref = {formRef}>
                <input
                    onChange = {changeHandler}
                    name = "title"
                    type = "text"
                    value = {values.title}
                    placeholder = {values.titlePlaceholder}
                />  
                {errors && errors.titleError && <p>{errors.titleError}</p>}
                <textarea 
                    onChange = {changeHandler}
                    value = {values.description}
                    placeholder = {values.descriptionPlaceholder} 
                    name = "description">
                </textarea>
                {errors && errors.descriptionError && <p>{errors.descriptionError}</p>}
                <input 
                    onChange = {changeHandler}
                    className = "fileInput" 
                    type = "file" 
                    name = "file"
                />
                 {errors && errors.fileError && <p>{errors.fileError}</p>}
                 {errors && errors.errorMessage && <p>{errors.errorMessage}</p>}
                <div className = "PF_buttonCon">
                    <button onClick = {(e) => {e.preventDefault();submitHandler(values)}}>submit</button>
                    <button onClick = {(e) => {
                        e.preventDefault()
                        postFormHandler(null, false)
                    }}>close</button>
                </div>
            </form>
        </div>
    )
}