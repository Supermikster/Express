const express = require('express');
const cors = require('cors');
const {ConnectionStates} = require('mongoose');
const app = express();
const expressWs = require('express-ws')(app);
const portNumber = 3000;
const mongo = require('mongodb').MongoClient;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const boduParser = require('body-parser');
const {MongoClient, ObjectID} = require('mongodb');
const md5 = require('md5');
const crypto = require('crypto');
let connects = [];

app.use(cors());
app.use(boduParser.json());
app.use(boduParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(__dirname + '/chat'));

var genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0, length);   /** return required number of characters */
};

var sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};



mongo.connect('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    const db = client.db('usersdb');
    const users = db.createCollection('users');
    const messages = db.createCollection('messages');
    app.locals.users = client.db('usersdb').collection('users');
    app.locals.messages = client.db('usersdb').collection('messages');
    if(err) {
        console.log('Connection error: ', err);
        throw err;
    }
    console.log('Connected');
});


app.get('/', function(req, res) {
    console.log('Client has been connected to the server and waiting authorizzation');
    const session = req.cookies['session'] || false;
    const users = app.locals.users
    if(session) {
        users.findOne({session: session}, function(err,result) {
            if(result) {
                res.sendFile('aplication.html', {root: __dirname + '/chat'});
            } else {
                res.redirect('authorization.html');
            }
        });  
    } else {
        res.redirect('authorization.html');
    }
});

app.post('/authorization', function(req, res) {
    console.log(req.body);
    const users = req.app.locals.users;
    var salt;
    var passwordData;
    users.findOne({login: req.body.login}, function(err, result) {
        if(result == null) {
            res.send('Wrong login');
            return;
        } else if(result.password === req.body.password) {
            function saltHashPassword(userpassword) {
                salt = genRandomString(16); /** Gives us salt of length 16 */
                passwordData = sha512(userpassword, salt);
                console.log('UserPassword = ' + userpassword);
                console.log('Passwordhash = ' + passwordData.passwordHash);
                console.log('nSalt = ' + passwordData.salt);
            };            
            saltHashPassword(JSON.stringify(result.password));
            const session = passwordData.passwordHash;
            res.cookie('session', session);
            users.updateOne({"_id": ObjectID(result._id)}, {$set: {session: session}});
            res.append('X-Redirect', 'aplication.html');
            res.send('');
        } else {
            res.send('Wrong login or password');
            return;
        }
    });
});

app.post('/registration', function(req, res) {
    console.log(req.body);
    const users = req.app.locals.users;
    users.findOne({login: req.body.login}, function(err, result) {
        if(err) { 
             return(console.log(err));
        } if(result != null) {
            res.send('Try another login');
            return;
        } if(req.body.login.length < 8) {
            res.send('Login is too short');
            return;
        } else {
            users.findOne({login: req.body.name}, function(err, result) {
                if(err) { 
                    return(console.log(err));
               } if(result != null) {
                res.send('Try another name');
                return;
               } if(req.body.name.length < 4) {
                    res.send('Name is too short');
                    return;
               } if(req.body.password.length < 10) {
                    res.send('Password is too short');
                    return;
               } else {
                users.insertOne({login: req.body.login, name: req.body.name, password: req.body.password}, function(err, result) {
                    if (err) return(console.log(err));
                        res.append('X-Redirect', 'authorization.html');
                        res.send('');
                });
               }
            });
        }
    });
});

app.ws('/echo', function(websocket,req) {
    const session = req.cookies['session'] || false;
    const users = app.locals.users
    const messages = req.app.locals.messages;
    if(session) {
        messages.find().sort({$natural: -1}).limit(10).toArray(function(err,result) {
            var history = result.reverse();
            websocket.send(JSON.stringify({type:'history', history: result}));
            console.log(history);
        });
        users.findOne({session: session}, function(err,result) {
            if(result) {
                websocket.send(JSON.stringify({name: result.name, type: 'userInfo'}));
                console.log('A new client con!');
                websocket.name = result.name;
                connects.push(websocket);
                websocket.on('message', function(msg) {
                    msg = JSON.parse(msg);
                    let message = msg.data;
                    console.log(websocket.name + ': ' + message);
                    connects.forEach(function e(client) {
                        if(client.readyState === websocket.OPEN) {
                            if(client != websocket) { 
                                if(msg.type === 'message') {
                                client.send(JSON.stringify({
                                    name: websocket.name,
                                    message: message,
                                 }));
                                } else {client.send(JSON.stringify(msg))}
                            } 
                        }
                    });
                    messages.insertOne({name: websocket.name, message: message}, function(err, result) {
                        if(err) {
                            return(console.log(err));
                        }
                    });
    
                });
            } else {
                websocket.terminate();
            }
        });  
    } else {
        websocket.terminate();
    }
    websocket.on('error', function(err) {
        console.log(err);
    });
    websocket.on('close', function(err) {
        console.log('ups i lost a client');
    });
});

app.get('/logout', function(req, res) {
    const session = req.cookies['session'] || false;
    res.clearCookie('session');
    res.redirect('authorization.html');
});

app.listen(portNumber, () => {console.log('Server is running on port:3000')});

