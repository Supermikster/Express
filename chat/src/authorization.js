
document.getElementById('signIn').addEventListener("click", function(e){
    e.preventDefault();
    let autoriz = document.forms["loginform"];
    let login = document.getElementById('login');
    let password = document.getElementById('password');
    //login = JSON.stringify({login: login});
    //password = JSON.stringify({password: password});
    let user = JSON.stringify({login: login.value, password: password.value});
    let request = new XMLHttpRequest();
    request.open("POST","http://localhost:3000/authorization", true);
    request.setRequestHeader("Content-Type", "application/json");
    request.addEventListener("load", function (e) { 
        var url = request && request.getResponseHeader('X-Redirect');
        if(url){
            window.location.assign(url);
        }
    });

    request.send(JSON.stringify({login: login.value, password: password.value}));
    });
//});
    document.getElementById('registration').addEventListener("click", function(e){
    e.preventDefault();
    window.location.href='registration.html';
    });

    //let request = new XMLHttpRequest();
   //request.open("GET","http://localhost:3000/authorization", true);
    //request.onload = () => {}
    //request.send();
