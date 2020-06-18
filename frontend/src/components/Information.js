import React, {useState, useEffect} from "react";

export default function Information(){
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 2000)
    }, [])

    if(loading){
        return(
            <div className = "Loader_Information">
                <div className = "LI_Header"></div>
                <div className = "LI_Para"></div>
                <div className = "LI_Header"></div>
                <div className = "LI_Para"></div>
            </div>
        )
    }
    return (
        <div className = "Information">
            <h1>About this little project</h1>
            <p>This is a demo app created by me for the purpose of learning Basics of <strong>GraphQl</strong></p>
            <h1 className = "I_h1_2">Technology Used</h1>
            <p>React(hooks), <strong>GraphQl(Apollo)</strong>, Nodejs, MongoDB</p>
        </div>
    )
}