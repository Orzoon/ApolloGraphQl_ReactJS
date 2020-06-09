import React, {useContext, useState} from "react";



import {AppContext} from "../App";
import {useLogin, useRegister} from "../utils/hooks";


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
    const {state:{loggedIn}} = useContext(AppContext)
    const [register, setRegister] = useState(false)
    if(loggedIn){
        return(
            <div className = "Form">
                <p>You are alrady loggedIn</p>
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
    const {values, changeHandler, submitHandler, errors, loggedIn, token} = useLogin(initialLoginValues)
    if(loggedIn){
        setTimeout(() => {
            loginHandler(true,token)
        },300)
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
    const {values, changeHandler, errors, registerHandler, registered} = useRegister(initialRegisterValues)
    if(registered){
        setRegister(false)
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
