const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, 'public');
const PORT = process.env.PORT || 5000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

//Set static folder
app.use(express.static(publicPath));

let Player = require('./server/Player');

let players = [];

let roomList = [];
let capacity = 50;

//Run when client connects
io.on('connection', socket => {
    // console.log('New Squid Game Connection: ' + socket.id);
    
    // io.emit('list rooms', roomList);

    // console.log(socket.rooms);

    //Welcome current user
    socket.emit('message', 'Welcome to Squid Game: ' + socket.id);


    socket.on('quick play', data => {
        roomCount = roomList.length;
        if (roomCount < 1) {
            var room = readableRandomStringMaker(12);
            try {
                socket.join(room, function() {
                    // console.log("Socket now in rooms", socket.rooms);
                    // io.to(room).emit('user joined', socket.id);
                    var newPlayer = new Player(data.x, data.y, data.alive, data.id)
                    newPlayer.setIsHost(true);

                    //Make this socket host
                    socket.emit('new host')

                    // Broadcast this socket client to other connected socket clients
                    socket.to(room).emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), alive: newPlayer.getAlive() })

                    // Send existing players to the this socket client
                    // var i, existingPlayer;
                    // if (players.length > 0) {
                    //     for (i = 0; i < players.length; i++) {
                    //         existingPlayer = players[i];
                    //         socket.emit('new player', { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), alive: existingPlayer.getAlive() })
                    //     }
                    // }

                    var clients = io.sockets.adapter.rooms[room].sockets;
                    var numClients = clients ? Object.keys(clients).length : 0;
                    
                    newPlayer.setRoom(room);
                    newPlayer.setName(numClients);

                    // Add new player to the players array
                    players.push(newPlayer)

                    var locked;
                    if (numClients == capacity) {
                        locked = true;
                    } else {
                        locked = false;
                    }

                    //THESE NEED TO BE TIED TO THE ROOM
                    let started = false
                    let go = false;
                    //THESE NEED TO BE TIED TO THE ROOM
    
                    var r = { roomName: room, locked: locked, numClients: numClients, capacity: capacity, started: started, go: go, invervalReference: '' }
                    roomList.push(r);
                    io.to(room).emit('player count', { numClients: numClients })
                    socket.emit('join room', { room: room, name: newPlayer.getName() });
                });
            }catch(e){
                console.log('[error]','join room :',e);
                socket.emit('error','couldnt perform requested action');
            }
            
        } else {
            roomList.every(element => {
                if (!element.locked) {
                    try {
                        socket.join(element.roomName, function() {
                            // console.log("Socket now in rooms", socket.rooms);
                            // io.to(room).emit('user joined', socket.id);
                            var newPlayer = new Player(data.x, data.y, data.alive, data.id)

                            // Broadcast this socket client to other connected socket clients
                            socket.to(element.roomName).emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), alive: newPlayer.getAlive() })

                            // Send existing players to the this socket client
                            var i, existingPlayer;
                            if (players.length > 0) {
                                for (i = 0; i < players.length; i++) {
                                    existingPlayer = players[i];
                                    if (existingPlayer.getRoom() === element.roomName) {
                                        socket.emit('new player', { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), alive: existingPlayer.getAlive() })
                                    }
                                }
                            }

                            var clients = io.sockets.adapter.rooms[element.roomName].sockets;
                            var numClients = clients ? Object.keys(clients).length : 0;
                            
                            newPlayer.setRoom(element.roomName);
                            newPlayer.setName(numClients);

                            // Add new player to the players array
                            players.push(newPlayer)
            
                            //TODO CHECK IF THIS IS WORKING - WE MAY BE ABLE TO JOIN INTO FULL ROOMS
                            //EDIT ROOM IN ROOM LIST
                            roomList.find( function (r) {
                                if (r.roomName !== element.roomName) return false;
                                if (numClients == capacity) r.locked = true
                                r.numClients = numClients;
                                return true;
                            } );

                            io.to(element.roomName).emit('player count', { numClients: numClients })
                            socket.emit('join room', { room: element.roomName, name: newPlayer.getName() });
                        });
                    }catch(e){
                        console.log('[error]','join room :',e);
                        socket.emit('error','couldnt perform requested action');
                    }
                    return false;
                }
                var room = readableRandomStringMaker(12);
                try {
                    socket.join(room, function() {
                        var newPlayer = new Player(data.x, data.y, data.alive, data.id)
                        newPlayer.setIsHost(true);

                        //Make this socket host
                        socket.emit('new host')

                        // Broadcast this socket client to other connected socket clients
                        socket.to(room).emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), alive: newPlayer.getAlive() })

                        var clients = io.sockets.adapter.rooms[room].sockets;
                        var numClients = clients ? Object.keys(clients).length : 0;
                        
                        newPlayer.setRoom(room);
                        newPlayer.setName(numClients);

                        // Add new player to the players array
                        players.push(newPlayer)

                        var locked;
                        if (numClients == capacity) {
                            locked = true;
                        } else {
                            locked = false;
                        }

                        //THESE NEED TO BE TIED TO THE ROOM
                        let started = false
                        let go = false;
                        //THESE NEED TO BE TIED TO THE ROOM
        
                        var r = { roomName: room, locked: locked, numClients: numClients, capacity: capacity, started: started, go: go, invervalReference: '' }
                        roomList.push(r);
                        io.to(room).emit('player count', { numClients: numClients })
                        socket.emit('join room', { room: room, name: newPlayer.getName() });
                    });
                }catch(e){
                    console.log('[error]','join room :',e);
                    socket.emit('error','couldnt perform requested action');
                }
                return true;
            });
            
        }
    })




    //----------------------- NOT USED START ----------------------//

    // socket.on('create room', function (data) {
    //     try {
    //         socket.join(data.room, function() {
    //             // console.log("Socket now in rooms", socket.rooms);
    //             // io.to(room).emit('user joined', socket.id);

    //             var currentPlayer = playerById(socket.id);

    //             // Player not found
    //             if (!currentPlayer) {
    //                 console.log('Player not found: ' + socket.id)
    //                 return
    //             }
                
    //             var clients = io.sockets.adapter.rooms[data.room].sockets;
    //             var numClients = clients ? Object.keys(clients).length : 0;

    //             currentPlayer.setRoom(data.room);
    //             currentPlayer.setName(numClients);

    //             var r = { roomName: data.room, locked: false, numClients: numClients, capacity: data.capacity }
    //             roomList.push(r);
    //             io.emit('list rooms', roomList);
    //             io.to(data.room).emit('player count', { numClients: numClients })
    //             socket.emit('join room', { room: data.room, name: currentPlayer.getName() });
    //         });
    //     }catch(e){
    //         console.log('[error]','join room :',e);
    //         socket.emit('error','couldnt perform requested action');
    //     }
    // });


    // socket.on('join room', function (room) {
    //     try {
    //         socket.join(room, function() {
    //             // console.log("Socket now in rooms", socket.rooms);
    //             // io.to(room).emit('user joined', socket.id);

    //             var currentPlayer = playerById(socket.id);

    //             // Player not found
    //             if (!currentPlayer) {
    //                 console.log('Player not found: ' + socket.id)
    //                 return
    //             }

    //             var clients = io.sockets.adapter.rooms[room].sockets;
    //             var numClients = clients ? Object.keys(clients).length : 0;

    //             currentPlayer.setRoom(room);
    //             currentPlayer.setName(numClients);

    //             //EDIT ROOM IN ROOM LIST
    //             roomList.find( function (r) {
    //                 if (r.roomName !== room) return false;
    //                 r.locked = true;
    //                 r.numClients = numClients;
    //                 return true;
    //             } );

    //             io.emit('list rooms', roomList);
    //             io.to(room).emit('player count', { numClients: numClients })
    //             socket.emit('join room', { room: room, name: currentPlayer.getName() });
    //         });
    //     }catch(e){
    //         console.log('[error]','join room :',e);
    //         socket.emit('error','couldnt perform requested action');
    //     }
    // });


    // socket.once('new player', data => {
    //     var newPlayer = new Player(data.x, data.y, data.alive, data.id, data.room)
    //     // console.log('New player ' + newPlayer.id)

    //     // Broadcast new player to connected socket clients
    //     socket.to(data.room).emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), alive: newPlayer.getAlive() })

    //     // Send existing players to the new player
    //     var i, existingPlayer;
    //     if (players.length > 0) {
    //         for (i = 0; i < players.length; i++) {
    //             existingPlayer = players[i];
    //             socket.emit('new player', { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), alive: existingPlayer.getAlive() })
    //             // console.log('Existing player ' + existingPlayer.id)
    //         }
    //     }

    //     // Add new player to the players array
    //     players.push(newPlayer)
    // })

    //----------------------- NOT USED END ----------------------//




    socket.once('leave room', function (room) {
        try {
            // console.log('Player ' + socket.id + ' leaving room');
            // socket.to(room).emit('user left', socket.id);
            
            var currentPlayer = playerById(socket.id);

            // Player not found
            if (!currentPlayer) {
                console.log('Player not found: ' + socket.id)
                return
            }

            socket.leave(room);

            // var clients = io.sockets.adapter.rooms[room].sockets;
            // var numClients = clients ? Object.keys(clients).length : 0;

            var removeRoom = false;
            //CHECK IF ROOM HAS ANYONE LEFT, IF NOT REMOVE
            roomList.find( function (r) {
                if (r.roomName !== room) return false;
                var playersLeft = r.numClients - 1;
                if (playersLeft === 0) {
                    removeRoom = true;
                    return false;
                } else {
                    r.numClients = playersLeft;
                    
                    io.to(room).emit('player count', { numClients: playersLeft })
                    io.to(room).emit('leave room', { id: currentPlayer.id, numClients: playersLeft, name: currentPlayer.getName() });

                }
                return true;
            });

            currentPlayer.setRoom('');
            currentPlayer.setName('');
            
            if (removeRoom) {
                const index = roomList.findIndex(item => item.roomName === room);
                clearInterval(roomList[index].invervalReference);
                roomList.splice(index,1);
            }
            
        }catch(e){
            console.log('[error]','leave room :',e);
            socket.emit('error','couldnt perform requested action');
        }
    });

    
    //All clients but user
    // socket.broadcast.emit();

    //All clients
    // io.emit();

    //Runs when client disconnects
    socket.on('disconnect', () => {

        var removePlayer = playerById(socket.id)

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }

        var removeRoom = false;
        //CHECK IF ROOM HAS ANYONE LEFT, IF NOT REMOVE
        roomList.find( function (r) {
            if (r.roomName !== removePlayer.getRoom()) return false;
            var playersLeft = r.numClients - 1;
            if (playersLeft === 0) {
                removeRoom = true;
                return false;
            } else {
                r.numClients = playersLeft;
                
                io.to(removePlayer.getRoom()).emit('player count', { numClients: playersLeft })
                io.to(removePlayer.getRoom()).emit('leave room', { id: removePlayer.id, numClients: playersLeft, name: removePlayer.getName() });

            }
            return true;
        });
        
        if (removeRoom) {
            const index = roomList.findIndex(item => item.roomName === removePlayer.getRoom());
            clearInterval(roomList[index].invervalReference);
            roomList.splice(index,1);
        }

        // Broadcast removed player to connected socket clients
        socket.to(removePlayer.getRoom()).emit('remove player', { id: socket.id, numClients: 1 })

        // Remove player from players array
        players.splice(players.indexOf(removePlayer), 1)
    })



    socket.on('start rules', data => {
            io.to(data.room).emit('start rules')
            duration = 5;
            var timer = duration, seconds;
            const r = setInterval(function () {
                seconds = parseInt(timer % 60, 10);
                seconds = seconds < 10 ? seconds : seconds;
                io.to(data.room).emit('update rule time', { seconds: seconds })
                if (--timer < 0) {
                    clearInterval(r);
                }
            }, 1000);
        
    })


    socket.on('start game', () => {
        // console.log('started')
        if (roomList.length > 0) {
            var currentPlayer = playerById(socket.id);

            // Player not found
            if (!currentPlayer) {
                console.log('Player not found: ' + socket.id)
                return
            }
            const index = roomList.findIndex(item => item.roomName === currentPlayer.getRoom());
            if (!roomList[index].started) {
                duration = 60;
                var timer = duration, minutes, seconds;
                var flipTimer = randomIntFromInterval(1, 4);
                const interval = setInterval(function () {
                    if (flipTimer == 0) {
                        roomList[index].go = !roomList[index].go;
                        io.to(roomList[index].roomName).emit('flip switch', { go: roomList[index].go })
                        flipTimer = randomIntFromInterval(1, 4);
                    }

                    minutes = parseInt(timer / 60, 10);
                    seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    io.to(roomList[index].roomName).emit('update time', { minutes: minutes, seconds: seconds })

                    flipTimer--;
                    if (--timer < 0) {
                        // timer = duration;
                        roomList[index].started = false;
                        clearInterval(roomList[index].invervalReference);
                    }
                }, 1000);
                roomList[index].invervalReference = interval;
                roomList[index].started = true;
            }
        }
    })

    
    socket.on('player eliminated', data => {
        var currentPlayer = playerById(socket.id);

        // Player not found
        if (!currentPlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }
        io.to(currentPlayer.getRoom()).emit('player eliminated', { name: currentPlayer.getName() })
    })


    socket.on('flip switch', data => {
        var currentPlayer = playerById(socket.id);

        // Player not found
        if (!currentPlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }
        const index = roomList.findIndex(item => item.roomName === currentPlayer.getRoom());
        roomList[index].go = !roomList[index].go;
        io.to(currentPlayer.getRoom()).emit('flip switch', { go: roomList[index].go })
    })


    socket.on('move player', data => {
        // Find player in array
        var movePlayer = playerById(data.id);

        // Player not found
        if (!movePlayer) {
            console.log('Player not found: ' + data.id);
            return;
        }

        // Update player position
        movePlayer.setX(data.x)
        movePlayer.setY(data.y)
        movePlayer.setAlive(data.alive)

        // Broadcast updated position to connected socket clients
        socket.broadcast.to(movePlayer.getRoom()).emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), alive: movePlayer.getAlive()})
    })

    
    socket.on('remove player', () => {
        var removePlayer = playerById(socket.id)

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }

        // Remove player from players array
        players.splice(players.indexOf(removePlayer), 1)

        // Broadcast removed player to connected socket clients
        socket.broadcast.to(removePlayer.getRoom()).emit('remove player', {id: socket.id})
    })
    
});


/* ************************************************
** GAME HELPER FUNCTIONS
************************************************ */
// Find player by ID
function playerById (id) {
    var i
    for (i = 0; i < players.length; i++) {
      if (players[i].id === id) {
        return players[i]
      }
    }
  
    return false
}

server.listen(PORT, () => console.log(`Server is up on port ${PORT}.`))
  
function readableRandomStringMaker(length) {
    for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
    return s;
}

function randomIntFromInterval(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}
  
  
