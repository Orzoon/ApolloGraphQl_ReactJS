import React, {useContext, useState, useEffect} from "react";
import ImageUploader from 'react-images-upload';
// appContext
import {AppContext} from "../App"
import {usePostForm} from "../utils/hooks";
import {LoadingLineComponent} from "../utils/globals";

import AnimateHeight from 'react-animate-height';


// icons
import {MdFilterList, MdError} from "react-icons/md"
import { PossibleFragmentSpreadsRule } from "graphql";
export default function TopRow(){
    const [loading, setLoading] = useState(true)
    const { state:{userID},
            state:{loggedIn},
            state:{totalposts},
            state:{initialLoading},
            LoadPostsData,
            initialLoadingHandler,
            radioAllHandler
        } =  useContext(AppContext)
    const [postForm, setPostForm] = useState(false);
    const [showToolTip, setShowToolTip] = useState(false);
    const [radioAll, setRadioAll] = useState(true)
    
    useEffect(() => {
        if(initialLoading){
            setTimeout(() => {
                initialLoadingHandler(false)
                setLoading(false)
            }, 3000)
            return 
        }
        setTimeout(() => {
            setLoading(false)
        }, 500)
    }, [])

    function postFormHandler(e, value){
        if(!loggedIn){
            setShowToolTip(true)
            setTimeout(() => {
                setShowToolTip(false)
            }, 2000)
            return
        }
        if(e){
            e.preventDefault();
        }
        setPostForm(value)
    }
    function radioHandler(e){
        e.preventDefault();
        if(!loggedIn){
            postFormHandler()
            return 
        }
        if(e.target.value === "ALL" && radioAll){
            return
        }
        if(e.target.value === "ME" && !radioAll){
            return
        }
        setRadioAll(!radioAll)

        if(e.target.value === "ME"){
            radioAllHandler(false)
            LoadPostsData(userID)
        }
        else {
            radioAllHandler(true)
            LoadPostsData(null)
        }
        // calling posts function at main app based on user Selection
    }

    if(loading){
        return(
            <div className = "Loader_TopRow">
                <div className = "LT_First">
                    <div>
                    </div>
                    <div className = "LTF_Second">
                    </div>
                </div>
                <div className = "LT_Second">
                    <div className = "LTS_PostFirst"></div>
                    <div className = "LTS_PostSecond LTS_PostCommon"></div>
                    <div className = "LTS_PostThird LTS_PostCommon"></div>
                </div>
                 <div className = "LT_Third"></div>
            </div>

        )
    }
    return (
            <div className ="TopRow">
            <div className = "TopRow_first">
                <div className = "T_first_div">
                    <MdError />
                </div>
                {!loggedIn && <p>Login to add and edit cards</p>}
                {loggedIn && <p>You can now edit and delete your cards</p>}
            </div>
            <div className = "TopRow_second">
                <p>Total Posts: <span>({totalposts})</span></p>
                <div className = "T_RadioFilterDiv">
                    <input  type= "radio"
                            name = "filterRadio"
                            id="T_RF"
                            value = "ME"
                            checked = {radioAll ? false : true}
                            onChange = {e => radioHandler(e)}
                    />
                    <label htmlFor = "T_RF" > Mine Posts</label>
                    <input  type= "radio"
                            name = "filterRadio"
                            id="T_RS"
                            value = "ALL"
                            checked = {radioAll}
                            onChange = {e => radioHandler(e)}
                    /> 
                    <label htmlFor = "T_RS" > All Posts</label>
                </div>
            </div>

            {
                <div className = "T_CPBDIV">
                    {showToolTip &&
                        <p className = "btnToolTip toolTipOpactiy">
                            Login to add/filter card
                        </p>
                    }
                    <button onClick = {(e) =>postFormHandler(e,true)}>Create New Card</button>
                </div>
            }

            {/* POST FORM */}
            {
                postForm && 
                <PostForm
                    postFormHandler = {postFormHandler}
                />
            
            }
        </div>
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
    const {
        loadPostCounts,
        radioAll
} =  useContext(AppContext)
    const [inProp, setInProp] = useState(true);
    const {addPostHandler} = useContext(AppContext)
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
    }, []);
    function outsideClickHandler(e){
        if(formRef.current && !formRef.current.contains(e.target)){
            postFormHandler(null, false)
        }
    }
    if(postData){
        // closing the component
        postFormHandler(null, false)
        // updating postData
        addPostHandler(postData);
        loadPostCounts(radioAll);
        return null
    }
    return(
        <div className = "PostFormContainer PostFormHeight">  
                {loading && <LoadingLineComponent/>}
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
                        <button className = "closeLineBtn" onClick = {(e) => {
                            e.preventDefault()
                            postFormHandler(null, false)
                        }}>close</button>
                    </div>
                </form>
        </div>
    )
}