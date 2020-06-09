import React from "react";


export default function PostCard(){
    return(

        <ul className = "PostCard">
            <PostList key = "1" />
        </ul>

    )
}


function PostList(){
    return(
        <li className = "PostCard_PostList">
            <Picture />
            <PostButtons/>
            <Description/>
        </li>
    )
}

function Picture(){

    return (
        <div className = "Picture">
            {/* if image show else upload option */}
        </div>
    )

}


function PostButtons(){
    return (
        <div className = "PostButtons">
            <button className = "PostButtons_button">Delete</button>
            <button className = "PostButtons_button">Edit</button>
        </div>
    )

}

function Description() {
    return (
        <div className = "Description">
            <p> description </p>
        </div>
    )
}