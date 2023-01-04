var current_info = null;

/**
 * sends a get requst to the url.
 * @param {*} url will be used to send a get request
 * @returns response of github api, else return false as failure
 */
function getURL(url){
    try{
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", url, false); // false for synchronous request
        xmlHttp.send(null);
        let res = xmlHttp.responseText;
        if((xmlHttp.status >= 400 && xmlHttp.status != 404) || res == null){
            console.log("Failed to recieve data from github api - network error");
            return [false, xmlHttp.status];
        }
        if(xmlHttp.status == 404){
            console.log("Page not found - 404");
        }
        return [true, res];
    }catch(e){
        console.log("Failed to recieve data from github api - internet connection error");
        return [false, -1];
    }
}

/**
 * This function updates UI of our program!
 * @param {*} jsonObj contains all of userinformation!
 */
function updateInfoUI(jsonObj){

    // set no error status
    document.getElementById("errorStatus").innerHTML = "";

    // updating img src
    if(jsonObj.avatar_url != null && jsonObj.avatar_url != ""){
        document.getElementById("userImg").src = jsonObj.avatar_url;
    }else{
        document.getElementById("userImg").src = "/assets/no-image.jpg";
    }

    // update name
    let name = jsonObj.login;
    if(jsonObj.name != null){
        name = jsonObj.name;    
    }
    document.getElementById("userFullName").innerHTML = "" + name;
    
    // update user info
    let userInfo = "";
    if(jsonObj.location != null){
        userInfo += "<b>Location:</b>" + " " + jsonObj.location + "<br>";
    }
    if(jsonObj.company != null){
        userInfo += "<b>Companies:</b>" + " " + jsonObj.company + "<br>";
    }
    if(jsonObj.public_repos != null){
        userInfo += "<b>Public Repos:</b>" + " " + jsonObj.public_repos + "<br>";
    }
    if(jsonObj.created_at != null){
        userInfo += "<b>Created at:</b>" + " " + jsonObj.created_at + "<br>";
    }
    if(jsonObj.bio != null){
        userInfo += "<b>Location:</b>" + " " + jsonObj.bio + "<br>";
    }
    userInfo += "<br>";
    let infoExists = false;
    if(jsonObj.blog != null && jsonObj.blog != ""){
        userInfo += "<a href=\"" + jsonObj.blog + "\">User blog</a>"
        infoExists = true;
    }
    if(jsonObj.email != null && jsonObj.email != ""){
        if(infoExists){
            userInfo += " - ";
        }
        userInfo += "<a>" + jsonObj.email + "</a>";
    }
    if(jsonObj.type == "Organization"){
        if(infoExists){
            userInfo += " - ";
        }
        userInfo += "<a>" + "This is an organization account!" + "</a>";
    }
    document.getElementById("userInfo").innerHTML = userInfo;

}

/**
 * when refreshing or sumbiting empty usernames this error appears.
 * It does not change any other content of our web page!
 */
function updateEmptyUsername(){
    document.getElementById("errorStatus").innerHTML = "please enter a username!";
}

/**
 * This function updates UI of web page when we search a wrong username
 * or a username that does not exists!
 */
function updateWrongUsername(){
    document.getElementById("errorStatus").innerHTML = "does not exists!";
    document.getElementById("userImg").src = "/assets/no-image.jpg";
    document.getElementById("userFullName").innerHTML = "No Username!";
    document.getElementById("userInfo").innerHTML = "This username that you have searched does not exists!";
}

/**
 * updates UI of web page with the related network error message!
 * @param {*} networkStatus contains status of failure here.
 */
function updateNetworkError(networkStatus){
    if(networkStatus < 0){
        document.getElementById("errorStatus").innerHTML = "connection failure";
        document.getElementById("userInfo").innerHTML = "Please check your internet connection!";
    }
    else{
        document.getElementById("errorStatus").innerHTML = "network error";
        document.getElementById("userInfo").innerHTML = "Error code is " + networkStatus;
    }
    document.getElementById("userImg").src = "/assets/networkerror.png";
    document.getElementById("userFullName").innerHTML = "Error!";
}

/**
 * checks the given username for information.
 * updates the UI of our web page if there is new information about givern username.
 */
function submitBtn(){
    document.getElementById("errorStatus").innerHTML = "";
    let username = document.getElementById("username").value;
    if(username == null || username == ""){
        console.log("Empty  Username");
        updateEmptyUsername();
    }else{
        res = localStorage.getItem('mygithubinfo-' + username);
        if (res != null){
            current_info = JSON.parse(res);
            console.log("Found information about this username: " + username);
            console.log(current_info);
            updateInfoUI(current_info);
            return;
        }else{
            console.log("Local storage does not contain this username: " + username);
        }
        let url = "https://api.github.com/users/" + username;
        res = getURL(url);
        stat = res[0];
        res = res[1];
        // console.log(res);
        if (stat == false){
            updateNetworkError(res);
        }else{
            current_info = JSON.parse(JSON.stringify(res));
            current_info = JSON.parse(current_info);
            try{
                if(current_info.message == "Not Found"){
                    console.log("No information on this username: " + username);
                    updateWrongUsername();
                    return;
                }
            }catch(e){
                console.log(current_info);
            }
            try{
                updateInfoUI(current_info);
                localStorage.setItem('mygithubinfo-' + username, JSON.stringify(current_info));
                console.log("This username is saved: " + username);
            }catch(e){
                console.log(e);
            }
        }
    }
}

/**
 * This function does not update UI of web page!
 * It just update a username info if it exits in local storage of your browser.
 * So if you search your username next time its information will be updated
 */
function refresh(){
    document.getElementById("errorStatus").innerHTML = "";
    let username = document.getElementById("username").value;
    if(username == null || username == ""){
        console.log("Empty  Username");
        updateEmptyUsername();
    }else{
        res = localStorage.getItem('mygithubinfo-' + username);
        if (res != null){
            let url = "https://api.github.com/users/" + username;
            res = getURL(url);
            stat = res[0];
            res = res[1];
            if (stat == false){
                console.log("cannot update username info becuase of nework error!");
                document.getElementById("errorStatus").innerHTML = "update failure!";
                return;
            }else{
                current_info = JSON.parse(JSON.stringify(res));
                current_info = JSON.parse(current_info);
                try{
                    if(current_info.message == "Not Found"){
                        console.log("No information on username!");
                        document.getElementById("errorStatus").innerHTML = "username deleted!";
                        localStorage.removeItem('mygithubinfo-' + username);
                        return;
                    }
                }catch(e){
                    console.log(current_info);
                }
                try{
                    localStorage.removeItem('mygithubinfo-' + username);
                    localStorage.setItem('mygithubinfo-' + username, JSON.stringify(current_info));
                    document.getElementById("errorStatus").innerHTML = "username updated!";
                    console.log("This username is updated: " + username);
                }catch(e){
                    console.log(e);
                }
            }
        }else{
            console.log("Local storage does not contain this username: " + username);
        }  
    }
}
