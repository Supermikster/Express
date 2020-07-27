const express = require('express');
const { ConnectionStates } = require('mongoose');
const app = express();
const expressWs = require('express-ws')(app);
const portNumber = 3000;
const mongo = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const session = require('express-session');
let connects = [];

mongo.connect('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) =>{

    const db = client.db('usersdb');
    const collection = db.createCollection('users');
    app.locals.collection = client.db('usersdb').collection('users');

    if(err){
        console.log('Connection error: ' , err);
        throw err;
    }
    console.log('Connected');

});

app.ws('/authorization', function(websocket, req){
    console.log('Client has been connected to the server and waiting authorizzation');
        websocket.on('message', function(data){
            data = JSON.parse(data);
            let login = data.login;
            let password = data.password;
            console.log('user login is: ' +login);
            console.log('user password is: '+ password);
            const collection = req.app.locals.collection;
            collection.findOne(({login: login, password: password}), function(err, result){
                if(err){ 
                     return(console.log(err));
                }if(result == null){
                    websocket.send(JSON.stringify(0));
                }else{
                    console.log(result);
                    websocket.send(JSON.stringify(1));
                }
 
            });
        }); 
});

/*app.ws('/echo', function(websocket,req){
    console.log('A new client con!');
    connects.push(websocket);
            websocket.on('message',function(msg){
                msg = JSON.parse(msg);
                message = msg.data;
                let name = data.name;
                console.log(message);
                const collection = req.app.locals.collection;
                /*collection.findOne(({name: name}), function(err, result){
                    if(err){
                        return(console.log(err));
                    }else{
                        console.log(result);
                    }
                });
                
                //var clients = req;
                connects.forEach(function e(client){
                    if(client != websocket){ 
                        client.send(message, name);
                        /*client.send(JSON.stringify({
                           // name: ws.personName,
                            message: message
                         }));
                        }
                        
            });
            collection.insert({name: name, message: message}, function(err, result){
                if(err){
                    return(console.log(err));
                }
            });
    
    });
});*/


app.ws('/registration', function(websocket, req){
    console.log('Client has been connected to the server and waiting registration');
        websocket.on('message', function(data){
                data = JSON.parse(data);
                let login = data.login;
                let password = data.password;
               // let name =data.name;
                console.log('user login is: ' +login);
                console.log('user password is: '+ password);
                //console.log('user name is: '+ name);
                const collection = req.app.locals.collection;
                const user = [{login: login, password: password}];
                collection.findOne(({login: login, password: password}), function(err, result){
                    if(err){ 
                         return(console.log(err));
                    }if(result == null){
                        collection.insert(user, function(err, result){
                            if (err)
                                return(console.log(err));
                                websocket.send(user);
                            
                        });
                        websocket.send(1);
                        

                    }else{
                        console.log(result);
                        websocket.send('try another login')
                    }
     
                });

            }); 
    });

app.listen(portNumber, ()=> {console.log('Server is running on port:3000')});