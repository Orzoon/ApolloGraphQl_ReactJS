import React from "react";


export default function Toggle({toggleToAccount,accountToggleHandler}){
    return(
        <div className ="Toggle">
            <button 
                className = "Toggle_Button" 
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
                className = "Toggle_Button" 
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