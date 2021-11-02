const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, 'public');
const PORT = 3000 || process.env.PORT;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

//Set static folder
app.use(express.static(publicPath));

let Player = require('./server/Player');
let players = [];	// Array of connected players
let num_of_players = 0 // Player count
let started = false
let roomList = [];

//Run when client connects
io.on('connection', socket => {
    // console.log('New Squid Game Connection: ' + socket.id);
    io.emit('list rooms', socket.rooms);

    // console.log(socket.rooms);

    //Welcome current user
    socket.emit('message', 'Welcome to Squid Game');

    num_of_players++;

    socket.on('create room', function (room) {
        try {
            socket.join(room, function() {
                // console.log("Socket now in rooms", socket.rooms);
                // io.to(room).emit('user joined', socket.id);

                var currentPlayer = playerById(socket.id);

                // Player not found
                if (!currentPlayer) {
                    console.log('Player not found: ' + socket.id)
                    return
                }

                var clients = io.sockets.adapter.rooms[room].sockets;
                var numClients = clients ? Object.keys(clients).length : 0;

                currentPlayer.setRoom(room);
                currentPlayer.setName(numClients);

                var r = { roomName: room, locked: false, numClients: numClients }
                roomList.push(r);
                io.emit('list rooms', roomList);
                io.to(room).emit('player count', { numClients: numClients })
                socket.emit('join room', { room: room });
            });
        }catch(e){
            console.log('[error]','join room :',e);
            socket.emit('error','couldnt perform requested action');
        }
    });


    socket.on('join room', function (room) {
        try {
            socket.join(room, function() {
                // console.log("Socket now in rooms", socket.rooms);
                // io.to(room).emit('user joined', socket.id);

                var currentPlayer = playerById(socket.id);

                // Player not found
                if (!currentPlayer) {
                    console.log('Player not found: ' + socket.id)
                    return
                }

                var clients = io.sockets.adapter.rooms[room].sockets;
                var numClients = clients ? Object.keys(clients).length : 0;

                currentPlayer.setRoom(room);
                currentPlayer.setName(numClients);

                var r = { roomName: room, locked: false, numClients: numClients }
                roomList.push(r);
                io.emit('list rooms', roomList);
                io.to(room).emit('player count', { numClients: numClients })
                socket.emit('join room', { room: room });
            });
        }catch(e){
            console.log('[error]','join room :',e);
            socket.emit('error','couldnt perform requested action');
        }
    });


    socket.on('leave room', function (room) {
        try {
            // console.log(room)
            // socket.to(room).emit('user left', socket.id);
            
            var currentPlayer = playerById(socket.id);

            // Player not found
            if (!currentPlayer) {
                console.log('Player not found: ' + socket.id)
                return
            }

            // var clients = io.sockets.adapter.rooms[room].sockets;
            // var numClients = clients ? Object.keys(clients).length : 0;
            // var obj = getByValue(roomList, room);


            currentPlayer.setRoom('');
            currentPlayer.setName('');

            socket.leave(room);

            io.emit('list rooms', roomList);
            io.to(room).emit('player count', { numClients: 1 })
            socket.emit('leave room', { id: socket.id, numClients: 1 });
            
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
        num_of_players--;

        // var currentPlayer = playerById(socket.id);

        // // Player not found
        // if (!currentPlayer) {
        //     console.log('(Disconnect)Player not found: ' + socket.id)
        //     return
        // }

        // var clients = io.sockets.adapter.rooms[currentPlayer.getRoom()].sockets;
        // var numClients = clients ? Object.keys(clients).length : 0;

        var removePlayer = playerById(socket.id)

        // Player not found
        if (!removePlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }

        // // Remove player from players array
        players.splice(players.indexOf(removePlayer), 1)

        // // Broadcast removed player to connected socket clients
        socket.broadcast.to(removePlayer.getRoom()).emit('remove player', { id: socket.id, numClients: 1 })
    })

    socket.on('new player', data => {
        var newPlayer = new Player(data.x, data.y, data.alive, data.id)
        // console.log('New player ' + newPlayer.id)

        // Broadcast new player to connected socket clients
        socket.broadcast.emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), alive: newPlayer.getAlive(), num_of_players: num_of_players })

        // Send existing players to the new player
        var i, existingPlayer;
        if (players.length > 0) {
            for (i = 0; i < players.length; i++) {
                existingPlayer = players[i];
                socket.emit('new player', { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), alive: existingPlayer.getAlive(), num_of_players: num_of_players })
                // console.log('Existing player ' + existingPlayer.id)
            }
        }

        // Add new player to the players array
        players.push(newPlayer)
    })

    socket.on('start game', () => {
        var currentPlayer = playerById(socket.id);

        // Player not found
        if (!currentPlayer) {
            console.log('Player not found: ' + socket.id)
            return
        }
        if (!started) {
            duration = 60;
            var timer = duration, minutes, seconds;
            setInterval(function () {
                minutes = parseInt(timer / 60, 10);
                seconds = parseInt(timer % 60, 10);

                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;

                io.to(currentPlayer.getRoom()).emit('update time', { minutes: minutes, seconds: seconds })

                if (--timer < 0) {
                    timer = duration;
                }
            }, 1000);
            started = true;
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
        io.to(currentPlayer.getRoom()).emit('flip switch', { go: data.go })
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
        socket.broadcast.to(removePlayer.getRoom()).emit('remove player', {id: socket.id, num_of_players: num_of_players})
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

// server.listen(PORT, err => {
//     if (err) {
//         throw err;
//     }
//     init();
// })

// function init() {
//     //Create empty array of players
    

//     //Listen for events
//     setEventHandlers();
// }

// function setEventHandlers() {
//     // socket.so
// }

function getByValue(arr, value) {

    for (var i=0, iLen=arr.length; i<iLen; i++) {
  
      if (arr[i].b == value) return arr[i];
    }
  }
