import decode from "jwt-decode"

export const checkUserStatus = async () => {
    try{
        const accessToken = getCookie("accessToken");
        const refreshToken = getCookie("refreshToken");
        console.log("a",accessToken, "r",refreshToken)
        if(!accessToken || !refreshToken){
            throw new Error("no access")
        }
        const {userID,userType, tokenType, exp} = decode(accessToken)
        if(!exp){
            throw new Error("no access")
        }
        const expiredToken = expired(exp);
        if(!expiredToken){
           return {token: accessToken, loggedIn: true, userID: userID}
        }

        // RefreshToken
        if(expiredToken){
            const {userID,userType, tokenType, exp} = decode(refreshToken)
            if(!exp){
                throw new Error("no access")
            }
            const expiredToken = expired(exp);
            if(!expiredToken){
               return {token: refreshToken, loggedIn: true, userID: userID}
            }
            throw new Error("no access")
        }

    }catch(error){
        const accessToken = getCookie("accessToken");
        const refreshToken = getCookie("refreshToken");
        delete_cookie(accessToken)
        delete_cookie(refreshToken)
        return {token: null, loggedIn: false, userID: null}
    }
}


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
}

function expired(exp){
    const date = new Date();
    if(date.getTime() > exp * 1000){
        return true
    }
    return false
}

function delete_cookie( name ) {
    //document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }