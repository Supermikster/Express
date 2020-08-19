var session =  getCookie('session');
var ws = new WebSocket('ws://localhost:3000/echo?session='+session);
var log = document.getElementById('log');
var emoji_code = [];
var index = null;
var i = null;
var div;
var my_emoji;
var emoji_clicked;
var emoji;

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : false;
}

ws.onopen = function(event) {
    console.log('connected to the ws server');
        if(ws.onopen) { 
            log.innerHTML += "You: have been connected to the chat!" + "<br>";
        } 
    checkStatus();
}

ws.onmessage = function(event) {
    var data =  JSON.parse(event.data);
    var type = data.type; 
        switch (type) {
            case 'userInfo':
                window.name = data.name;
                break; 
            case 'history':
                console.log(data.history);     
                if(data.history && data.history.length  > 0) {
                    data.history.forEach(message => {
                    log.innerHTML += message.name + ": " + message.message + "<br>";
                    });
                }
                break; 
            case 'emoji':
                console.log(data);
                break;
            default:
                log.innerHTML += data.name + ": " + data.message + "<br>";
        }                              
}

checkStatus = function() {
    var status = ws.readyState;
    if (status === 3) {
        ws.close();
        console.log('smth goes wrong');
    } else {
        console.log('everythig OK');
    }
}

ws.onclose = function(event) {
    console.log('websocket is closing', event);
}

document.getElementById('sendMsg').addEventListener("click", function(e) {
    e.preventDefault();
    var text = document.getElementById('text').value;
        ws.send(JSON.stringify({
            type: "message",
            data: text,
            emoji: emoji_clicked
        }));
        if (document.getElementById('text').value == '') { 
            alert("Enter your message");
        } else { 
            log.innerHTML +="You: " + text + "<br>";
            document.getElementById('text').value ="";
        }
    checkStatus();
});

document.addEventListener("keydown", check, false);
function check (Key) {
    if (event.keyCode == "13") {
        var text = document.getElementById('text').value;
            ws.send(JSON.stringify({
                type: "message",
                data: text,

            }));
        if (document.getElementById('text').value == '') { 
            alert("Enter your message");
        } else { 
            log.innerHTML +="You: " + text + "<br>";
            document.getElementById('text').value ="";
        }
        checkStatus();
    }            
}

document.getElementById('logOut').addEventListener("click", function(e) {
    e.preventDefault();
    window.location.href='http://localhost:3000/logout';
});

div = document.getElementById('emoji');

emoji_code = [
    9786,
    9787,
    128053,
    127867,
]

for(index = 0; index <= emoji_code.length -1; index++) {
    div.innerHTML += "<span class = 'my_emoji'>" + "&#" + emoji_code[index] + "</span>";
    emoji = "&#" + emoji_code[index];
    console.log(emoji);
}

my_emoji = document.querySelectorAll('.my_emoji');

for(i = 0; i <= my_emoji.length -1; i++) {
    console.log(my_emoji[i]);
    my_emoji[i].addEventListener('click', (event) => {
        emoji_clicked = event.target.textContent;
        ws.send(JSON.stringify({ 
            type: 'emoji',
            data: emoji_clicked
        }));
    });
}


   
