import React, {useState, useEffect} from "react";


function Navbar(){
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }, [])

    if(loading){
        return(
            <div className = "NavBar">
                <div className = "LogoText LogoTextLoading">
                </div>
            </div>
        )
    }
    return(
        <div className = "NavBar">
            <div className = "LogoText">
                <h1>
                    <span className = "LogoFirstHalf">Demo</span>
                    <span className = "LogoSecondHalf">Card</span>
                </h1>
            </div>
        </div>
    )
}

export default Navbar;
