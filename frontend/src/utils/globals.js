import React from "react";



//export const  SERVERURI = "http://localhost:5000/graphql";
export const  SERVERURI = "/graphql";

export function LoadingLineComponent(){
    return  <>
                <div className= "loadingLineComponent">
                        <div className = "loadingLineComponentOuter">
                            <div className = "loadingLineComponentInner">
                            </div>
                        </div>
                </div>
            </>
}
