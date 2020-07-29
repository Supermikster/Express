const express = require('express');
const cors = require('cors');
const { ConnectionStates } = require('mongoose');
const app = express();
const expressWs = require('express-ws')(app);
const portNumber = 3000;
const mongo = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const boduParser = require('body-parser');
let connects = [];


app.use(cors());
app.use(boduParser.json());
app.use(boduParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(session({secret: "My secret"}));


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

app.get('/authorization', function(req, res){
    console.log('Client has been connected to the server and waiting authorizzation');
    res.send('hello from the server');
    
});

app.post('/authorization', function(req, res){
    console.log(req.body);
    const collection = req.app.locals.collection;
    collection.findOne((req.body), function(err, result){
        if(err){ 
             return(console.log(err));
        }if(result == null){
            console.log('crete one');
            res.sendStatus(400);
        }else{
            console.log(result);
            res.sendStatus(200);
        }
    });
});

app.post('/registration', function(req, res){
    res.cookie(req.body);
    console.log(req.body);
    const collection = req.app.locals.collection;
    collection.findOne((req.body), function(err, result){
        if(err){ 
             return(console.log(err));
        }if(result == null){
            console.log('crete one');
            collection.insert(req.body, function(err, result){
                if (err)
                    return(console.log(err));
            });
            res.sendStatus(200);
            //res.redirect('/authorization');
        }else{
            console.log(result);
            res.sendStatus(400);
        }
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
                collection.findOne(({name: name}), function(err, result){
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
                        client.send(JSON.stringify({
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




app.listen(portNumber, ()=> {console.log('Server is running on port:3000')});

/*app.ws('/authorization', function(websocket, req){
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
});*/

/*app.ws('/registration', function(websocket, req){
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
    });*/