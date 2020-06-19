import React, {useState,useEffect,useReducer, createContext, useMemo} from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

// components
import Navbar from "./components/Navbar";
import Information from "./components/Information";
import Toggle from "./components/Toggle";
import TopRow from "./components/TopRow";
import PostCard from "./components/PostCard";
import Account from "./components/Account";
import GraphiqlButton from "./components/GraphiqlButton"
import {checkUserStatus} from "./utils/authCheck";
import {SERVERURI} from "./utils/globals"
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
    case "postsData":
      return {...state, postsData: action.payload}
    case "totalposts":
      return {...state, totalposts: action.payload}
    case "deletePosts":
      return {...state}
    case "addPost":
      // place based on ascending or descending order
      // for now ascending order
      return {...state, postsData:action.payload }
    case "postsLoading":
      return {...state, postsLoading:action.payload}
    case "initialLoading":
      return {...state, initialLoading:action.payload}
    case "radioAll":
      return {...state, radioAll:action.payload}
    default: 
      return state
  }
}

const initialValues = {
  toggleToAccount: false,
  loggedIn: false,
  userID: null, 
  token: null,
  totalposts: null,
  postsData: null,
  postsLoading: false,
  initialLoading: true,
  radioAll: true,
  graphiqlLink: "/graphql"
}

function App() {
  const [state, dispatch] = useReducer(appReducer, initialValues)
  const [loading, setLoading] = useState(true);
  const [firstLoaded, setFirstLoaded] = useState(false);
  const [errors, setErrors] = useState(null);
  const [toggleAuth, setToggleAuth] = useState(false)


  useEffect(() => {
      /*----AUTH_STATUS------*/
      /* I have not impleneted Route here[No routes/ protected Routes] for this little project--so this function is called every 10seconds to check auth status*/
      //-->Additionally NO Optimization with useCallback and useMemo
      // for the second, this value is true
      let timerID;
      if(firstLoaded){
        timerID = setInterval(() => {
          loadAuthStatus();
        }, 3000);
        setTimeout(() => {
          removeTimer(timerID)
          setToggleAuth(!toggleAuth)
        }, 5000)
      }

      // it runs anyway
      if(!firstLoaded){
        loadAuthStatus();
        LoadPostsData(null)
        setFirstLoaded(true);
        setTimeout(() => {
          setToggleAuth(!toggleAuth)
        }, 3000)
      }

      return (() => {
        window.clearInterval(timerID)
      })
  },[toggleAuth])


function removeTimer(id){
  window.clearInterval(id)
}
/*----------------AUTHSTATUS-----------------*/
  async function loadAuthStatus(){
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
      // errors for you :))))
    }
}


/*----------------LoadPostsData-----------------*/
  async function LoadPostsData(userIDParam){
      // setPostsLoadin
      dispatch({type: "postsLoading", payload: true})
      const parameters = {
        limit: 100,
        skip: 0,
        asc: -1,
        userID: null
      }
      if(userIDParam){
        parameters.userID = userIDParam
      }
    try{
      const {limit, skip, asc, userID} = parameters;
      const POSTS_QUERY = `query {
          posts(limit:${limit}, skip: ${skip}, asc: ${asc}, userID: "${userID}"){
                __typename
                ... on Error{
                  errorMessage
                }
                ... on Post{
                  _id
                  title
                  description
                  createdAt
                  updatedAt
                  imageURL
                  createdBy{
                    _id
                    name
                  }
                }
          }
      }
        `

      const COUNT_QUERY = `query {
            totalPosts(userID: "${userID}"){
            __typename
            ... on TotalPost{
              count
            }
         }
       }
       `

      const getPosts = () => fetch(SERVERURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          query: POSTS_QUERY, 
          variables: {}
          })
      })
      const getCounts = () => fetch(SERVERURI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body:JSON.stringify({
          query: COUNT_QUERY
          })
      })
      const [getPostsResponse, getCountsResponse] = await Promise.all([getPosts(), getCounts()])
      if(!getPostsResponse.ok || !getCountsResponse.ok){
        throw new Error("oops")
      }

      // avoiding same name desctructuring
      const [getPostsResponseData, getCountsResponseData] = [await getPostsResponse.json(), await getCountsResponse.json()]
      if(!getPostsResponseData.data.posts || !getCountsResponseData.data.totalPosts ){
        throw new Error("oops, handled by cath//")
      }


      const {posts} = getPostsResponseData.data;
      const {totalPosts:{count:count}} = getCountsResponseData.data;
      // dispatching datas
      dispatch({type: "postsData", payload: posts})
      dispatch({type: "totalposts", payload: count})
      setTimeout(() => {
        dispatch({type: "postsLoading", payload: false})
      }, 1000)

    }
    catch(error){
      console.log("error", error)
      setErrors({oopsError: "something definately went wrong okay :) "})
      setTimeout(() => {
        dispatch({type: "postsLoading", payload: false})
      }, 1000)
    }
  }


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


  function deletePostHandler(e,_id){
    // this is going to run upon success only
    console.log("_id", _id)
    if(e){
      e.preventDefault()
    }

    const posts = [...state.postsData]
    const filteredPosts = posts.filter(post => post._id.toString() !== _id.toString())

    dispatch({type: "postsData", payload: filteredPosts})
    // total posts value changes too but through subscription
  }


  function addPostHandler(post){
    const newPostsData = [post,...state.postsData]
    dispatch({type:"addPost", payload:newPostsData})
  }



  function logoutHandler(){
      //document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      dispatch({type:"loggedIn", payload: false})
  }

  function initialLoadingHandler(booleanValue){
    dispatch({type:"initialLoading", action:booleanValue})
  }

  async function loadPostCounts(radioAllBooleanValue){
    let userID;
    if(radioAllBooleanValue){
      userID = state.userID
    }else {
      userID = null
    }
    try{
        const COUNT_QUERY = `query {
          totalPosts(userID: "${userID}"){
          __typename
          ... on TotalPost{
            count
              }
            }
          }`

        const getCounts = () => fetch(SERVERURI, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body:JSON.stringify({
            query: COUNT_QUERY
            })
        })


        const getCountsResponse= await getCounts()
        if(!getCountsResponse.ok){
          throw new Error("oops")
        }
  
        // avoiding same name desctructuring
        const getCountsResponseData = await getCountsResponse.json();
        if(!getCountsResponseData.data.totalPosts){
          throw new Error("oops, handled by cath//")
        }

        const {totalPosts:{count:count}} = getCountsResponseData.data;

        // dispatching datas
        dispatch({type: "totalposts", payload: count})
    }
    catch(error){
      console.log("oops, couldnot get the count right now try later :)")
    }
  }

  function radioAllHandler(value){
    dispatch({type:"radioAll", payload:value})
  }

  function updatingDescriptionHandler(_id,updatedDescription){
    const postsDataCopy = [...state.postsData]
    const postIndex = postsDataCopy.findIndex((item) => item._id.toString() === _id.toString())
    postsDataCopy[postIndex].description = updatedDescription;
    // updating the state with the latest data
    dispatch({type: "postsData", payload: postsDataCopy})
  }


  return (
    <div className="App">
      {/* Navbar */}
      <Navbar />
      <AppContext.Provider value = {
          {
            state, 
            loginHandler,
            logoutHandler,
            deletePostHandler,
            addPostHandler,
            LoadPostsData,
            initialLoadingHandler,
            loadPostCounts,
            radioAllHandler,
            updatingDescriptionHandler
           }
        } 
        >

        
        {/* GrpahiqlButton */}

        <GraphiqlButton graphiqlLink = {state.graphiqlLink}/>
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




