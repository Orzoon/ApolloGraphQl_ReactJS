import React, {useState, useEffect} from "react";


export default function Toggle({toggleToAccount,accountToggleHandler}){
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 2500)
    }, [])

    if(loading){
        return(
            <div className ="Loader_Toggle">
                <div></div>
                <div></div>
            </div>
        )
    }
    return(
        <div className ="Toggle">
            <button 
                className = {!toggleToAccount ? "Toggle_Button ToggleActiveButton":"Toggle_Button"} 
                onClick = {() => {
                    if(!toggleToAccount){
                        return null
                    }
                    accountToggleHandler(false)
                    
                }}
            >
                Posts
            </button>
            <button 
                className = {!toggleToAccount ? "Toggle_Button":"Toggle_Button ToggleActiveButton"}
                onClick = {() => {  
                    if(toggleToAccount){
                        return null
                    }    
                    accountToggleHandler(true)  
                }}
            >    
               Account
            </button>
        </div>
    )
}