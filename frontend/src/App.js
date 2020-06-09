import React, {useState,useEffect,useReducer, createContext} from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';


// components
import Navbar from "./components/Navbar";
import Information from "./components/Information";
import Toggle from "./components/Toggle";
import TopRow from "./components/TopRow";
import PostCard from "./components/PostCard";
import Account from "./components/Account"
import {checkUserStatus} from "./utils/authCheck"
import "./scss/app.scss";


// CONTEXTS
export const AppContext = createContext();

function appReducer(state, action){
  switch(action.type){
    case "toggleToAccount":
      return {...state, toggleToAccount: action.payload}
    case "loggedIn":
      return {...state, loggedIn: action.payload}
    case "userID":
      return {...state, userID: action.payload}
    case "token":
      return {...state, token: action.payload}
    default: 
      return state
  }
}

const initialValues = {
  toggleToAccount: false,
  loggedIn: false,
  userID: null, 
  token: null
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialValues)
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      async function load(){
          try{
            const {token, loggedIn, userID} = await checkUserStatus();
            if(loggedIn){
              dispatch({type: "loggedIn", payload: loggedIn})
              dispatch({type: "token", payload: token})
              dispatch({type: "userID", payload: userID})
            }
            else {
              dispatch({type: "token", payload: null})
              dispatch({type: "loggedIn", payload: false})
              dispatch({type: "userID", payload: null})
            }
          }catch(error){
            
          }
      }

      load();
  },[])

  /* HANDLERS */
  function accountToggleHandler(booleanValue){
    dispatch({type: "toggleToAccount", payload: booleanValue})
  }

  function loginHandler(booleanValue, token){
    dispatch({type:"loggedIn", payload: booleanValue})
    // toggle account handler
    accountToggleHandler(false)
    baseTokenHandler(token)
  }

  function baseTokenHandler(value){
    dispatch({type:"token", payload: value})
  }
  return (
    <div className="App">
      {/* Navbar */}
      <Navbar />
      <AppContext.Provider value = {
          {
            state, 
            loginHandler
           }
        } 
        >
        {/* Imformation */}
        <Information />
        {/* Toggle */}
        <Toggle 
          accountToggleHandler = {accountToggleHandler}
          toggleToAccount = {state.toggleToAccount}

        />

        {/* TopRow */}
        {state && !state.toggleToAccount && <TopRow/>}
        {/* PostCard */}
        {state && !state.toggleToAccount && <PostCard/>}
        {state && state.toggleToAccount && <Account/>}
      </AppContext.Provider>
    </div>
  );
}

export default App;
