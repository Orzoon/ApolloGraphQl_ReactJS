import React, {useState, useEffect} from "react";

import {MdNavigateNext} from "react-icons/md"
export default function GraphiqlButton({graphiqlLink}){
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 1500)
    }, [])

    if(loading){
        return  <div className= "graphiqlButton">
                    <div className = "GraphQLBtnLoader">
                    </div>
                </div>
    }
    return(
        <div className= "graphiqlButton">
            <button onClick = {
                (e) => {
                    e.preventDefault();
                    window.open(graphiqlLink, "_blank")
                }
            }>
                <span>Graphiql Playground</span><MdNavigateNext/>
            </button>
        </div>
    )
}