import React, {useContext, useState} from "react";



import {AppContext} from "../App";
import {useLogin, useRegister} from "../utils/hooks";
import {LoadingLineComponent} from "../utils/globals";


const initialLoginValues = {
    email: "",
    password:"",
    emailPlaceholder: "youremail@gmail.com",
    passwordPlaceholder: "**********"
}

const initialRegisterValues = {
    email: "",
    password:"",
    username: "",
    usernamePlaceholder: "Username",
    emailPlaceholder: "youremail@gmail.com",
    passwordPlaceholder: "**********"
}

export default function Account(){
    const {state:{loggedIn}, logoutHandler} = useContext(AppContext)
    const [register, setRegister] = useState(false);

    if(loggedIn){
        return(
            <div className = "alreadyIn">
                <p>You are already loggedIn!!</p>
                <button className = "logoutButton"
                        onClick = {(e) => {
                            e.preventDefault();
                            logoutHandler()
                        }}
                >Logout</button>
            </div>
        )   
    }
    return (
        <div className = "Form">
            {
                !register 
                && 
                <LoginForm
                    setRegister = {setRegister}
                />
            }
            {
                register 
                && 
                <RegisterForm
                    setRegister={setRegister}
                />
            }
        </div>
    )
}

function LoginForm({setRegister}){
    const {loginHandler} = useContext(AppContext)
    const {values, changeHandler, submitHandler, errors, loggedIn, token, loading} = useLogin(initialLoginValues)
    if(loggedIn){
        setTimeout(() => {
            loginHandler(true,token)
        },300)
    }
    if(loading){
        return <LoadingLineComponent/>
    }
    return (
     <form className = "LoginForm" onSubmit = {(e) => {
            e.preventDefault();
            setRegister(true)
        }}>
            {
                errors && errors.errorMessage &&
                <p className = "errorMessageP">{errors.errorMessage}</p>
            }
            <input
                onChange = {(e) => changeHandler(e)}
                type = "email"
                name = "email"
                placeholder = {values && values.emailPlaceholder}
                values = {values.email}
            />
            <input
                onChange = {(e) => changeHandler(e)}
                type = "password"
                name = "password"
                placeholder = {values && values.passwordPlaceholder}
                values = {values.password}
            />
            <div>
                <button 
                    className = "Login_button"
                    onClick = {(e) => {submitHandler(e,values)}}
                >
                        Login</button>
                <button 
                    className = "Register_link" 
                    type = "submit"
                
                >Signup</button>
            </div>
        </form>
    )
}

function RegisterForm({setRegister}){
    const {values, changeHandler, errors, registerHandler, registered, loading} = useRegister(initialRegisterValues)
    if(registered){
        setRegister(false)
    }
    if(loading){
        return <LoadingLineComponent/>
    }
    return (
        <form className = "RegisterForm" onSubmit= {(e) => {
            e.preventDefault();
            setRegister(false)
        }}>

            {
                errors && errors.errorMessage &&
                <p className = "errorMessageP">{errors.errorMessage}</p>
            }
            <input
                onChange = {(e) => changeHandler(e)}
                type = "string"
                name = "username"
                value = {values.username}
                placeholder = {values.usernamePlaceholder}
            />
            <input
                onChange = {(e) => changeHandler(e)}
                name = "email"
                type = "email"
                value = {values.email}
                placeholder = {values.emailPlaceholder}
            />
            <input
                onChange = {(e) => changeHandler(e)}
                name = "password"
                type = "password"
                value = {values.password}
                placeholder = {values.passwordPlaceholder}           
            />
            <div>
                <button 
                    className = "Register_button"
                    onClick = {(e) => registerHandler(e, values)}
                    > SignUp
                </button>
                <button 
                 className = "Login_link"
                 type = "submit"
                >
                    Login
                </button>
            </div>
        </form>
    )
}
