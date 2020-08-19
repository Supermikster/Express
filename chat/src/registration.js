var log = document.getElementById('log');
var pass = document.getElementById('pass');
var nam = document.getElementById('nam');
document.getElementById('registration').addEventListener("click", function(e){
e.preventDefault();
let autoriz = document.forms["loginform"];
let login = document.getElementById('login');
let name = document.getElementById('name')
let password = document.getElementById('password');
let user = JSON.stringify({login: login.value, name: name.value ,password: password.value});
let request = new XMLHttpRequest();
request.open("POST","http://localhost:3000/registration", true);
request.setRequestHeader("Content-Type", "application/json");
request.addEventListener("load", function (e) {
    var url = request && request.getResponseHeader('X-Redirect');
        if(url){
            window.location.assign(url);
        }if(request.response === 'Password is too short'){
            pass.innerHTML = request.response;
            log.innerHTML = '';
            nam.innerHTML = '';
            return;
        }if(request.response === 'Name is too short'){
            nam.innerHTML = request.response;
            pass.innerHTML = '';
            log.innerHTML = '';
            return;
        }else{
            log.innerHTML = request.response;
            pass.innerHTML = '';
            nam.innerHTML = '';
            return;
        }
        
       
        
});
request.send(JSON.stringify({login: login.value, name: name.value ,password: password.value}));
});

document.getElementById('signIn').addEventListener("click", function(e){
e.preventDefault();
window.location.href='authorization.html';
});
