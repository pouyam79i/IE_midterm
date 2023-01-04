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
            return false;
        }
        if(xmlHttp.status == 404){
            console.log("Page not found - 404");
        }
        return res
    }catch(e){
        console.log("Failed to recieve data from github api - functional error");
        return false
    }
}

function updateInfoUI(jsonObj){

}

function updateEmptyUsername(){

}

function updateWrongUsername(username){
    
}

function updateNetworkError(){

}

/**
 * checks the given username for information.
 * updates the UI of our web page if there is new information about givern username.
 */
function submitBtn(){
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
        // console.log(res);
        if (res == false){
            updateNetworkError();
        }else{
            current_info = JSON.parse(JSON.stringify(res));
            current_info = JSON.parse(current_info);
            try{
                if(current_info.message == "Not Found"){
                    console.log("No information on username!");
                    updateWrongUsername(username);
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