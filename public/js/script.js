// var canvas;
// var ctx;
const socket = io();
var picsToLoad = 0;
var gameOver = false;
var player;
var p;
var gameTime = '';
var moving = false;
const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;
var timer;
var go = false;
const canvas = document.getElementById("squid");
const ctx = canvas.getContext("2d");
//var paused = true;
var gameStarted = false;
var opponents = [];
var capacity = 2;
var totalPlayers = 0;
var animation;
var paused = true;


var bgPic = new Image();

var initGame = function(){
  ctx.canvas.width = CANVAS_WIDTH;
  ctx.canvas.height = CANVAS_HEIGHT;
  ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  loadImages();
}


//-------EVENT HANDLERS START------//
 
let runEl = document.getElementById("run");

runEl.addEventListener('touchend', function(e){
  player.moving = false;
  e.preventDefault();
});

runEl.addEventListener('mouseup', function(e){
    player.moving = false;
    e.preventDefault();
  });
 
runEl.addEventListener('touchstart', function(e){
//   console.log('moving started');
  player.moving = true;
  e.preventDefault();
});

runEl.addEventListener('mousedown', function(e){
    player.moving = true;
    e.preventDefault();
});
 
// document.body.addEventListener('touchmove', function(e){
//   touchX = e.changedTouches[0].pageX-player.w;
//   //touchY = e.changedTouches[0].pageY - 50;
//   player.x = touchX;
//   e.preventDefault();
// });

socket.on('message', message => {
  console.log(message);
})

// Socket connection successful
socket.on('connect', () => {
  console.log('Connected to socket server')
  // player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 16, 15, 'player', socket.id);
  // //SEND LOCAL DATA TO SERVER
  // socket.emit('new player', { x: player.x, y: player.y, alive: player.alive, id: player.id })
})

// Socket disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from socket server')
})

// New player message received
socket.on('new player', data => {
  console.log('New player connected: ', data.id)
  // console.log('Total Players: ', data.num_of_players)
  //AVOID DUPLICATE PLAYERS AS WELL AS LOCAL PLAYER
  var duplicate = playerById(data.id)
  if (duplicate) {
    // console.log('Duplicate player!')
    return
  }

  //ADD EXISTING PLAYERS TO OPPONENTS ARRAY
  var opp = new Player(data.x - 100, data.y, 8, 8, "opponent", data.id);
  var rand = Math.ceil(Math.random() * 10);
  if (rand > 5) {
    opp.shape = 'rect';
  } else {
    opp.shape = 'circ';
  }
  opponents.push(opp)
  console.log(opponents);
})


// Player move message received
socket.on('move player', data => {
  var movePlayer = playerById(data.id)

  // Player not found
  if (!movePlayer) {
    // console.log('Player not found: ', data.id)
    return
  }

  // Update player position
  movePlayer.y = data.y
})  

// Player removed message received
socket.on('remove player', data => {
  removePlayer(data.id, data.numClients);
})

socket.on('player count', function (data) {
  var playerCount = data.numClients;
  let a = document.getElementsByClassName('participating');
  [...a].forEach( x => x.innerText = playerCount );
  // totalPlayers = playerCount;
  // console.log('There are currently ' + playerCount + ' players participating.')
  if (playerCount == capacity) {
    manualStart();
  }
});


socket.on('update time', function (data) {
  var minutes = data.minutes;
  var seconds = data.seconds;
  var display = document.querySelector('#timer');
  display.textContent = minutes + ":" + seconds;
  gameTime = minutes + ":" + seconds;
});


socket.on('update rule time', function (data) {
  var seconds = data.seconds;
  var display = document.querySelector('#ruleTimer');
  display.textContent = seconds;
  if (seconds == 0) {
    document.getElementById('rules').classList.toggle("hidden");
    document.getElementById('game').classList.toggle("hidden");
    initGame();
  }
});

socket.on('player eliminated', function (data) {
  console.log('Player ' + data.name + ' Eliminated!')
  // document.getElementById('eliminations').innerText = 'Player ' + data.name + ' Eliminated!';
});

socket.on('flip switch', function (data) {
  if(data.go){
    // document.getElementById("ready").classList.remove("active");
    document.getElementById("light").classList.add("active");
  } else {
    // document.getElementById("ready").classList.remove("active");
    document.getElementById("light").classList.remove("active");
  }
});


socket.on('join room', data => {
  //console.log(data)
  //console.log(data + ' joined room')
  player.room = data.room;
  player.name = data.name;
  let a = document.getElementsByClassName('myName');
  [...a].forEach( x => x.innerText = player.name );
  document.getElementById('lobby').classList.toggle("hidden");
  document.getElementById('queue').classList.toggle("hidden");
})


socket.on('leave room', data => {
  removePlayer(data.id, data.numClients);
  // document.getElementById('eliminations').innerText = 'Player ' + data.name + ' Eliminated!';
})


socket.on('list rooms', function (data) {
  console.log(data)
  var arr = Object.values(data);
  var output = '';
  arr.forEach(element => {
    if (element.locked) {
      output += '<div class="col-6 my-3"><button class="room-btn disabled">Full</button></div>';
    } else {
      output += '<div class="col-6 my-3"><button class="room-btn" onclick="joinRoom(\'' + element.roomName + '\')">Join Room ' + element.numClients + '/' + capacity + '</button></div>';
    }
  });
  document.getElementById('rooms').innerHTML = output;
})



 
//-------EVENT HANDLERS END------//
 











//-------IMAGE LOADING PROCESS START------//
 
function checkPicsToLoad(){
  picsToLoad--;
  if(picsToLoad == 0){
    setTimeout(startGame,100);
    //showSplashScreen();
  }
}
 
function sourceImage(varName, fileName){
  varName.onload = checkPicsToLoad();
  varName.src = fileName;
}
 
function loadImages(){
  var imageList = [
    {varName: bgPic, fileName: "bg-pattern.jpg"}
  ];
 
  picsToLoad = imageList.length;
 
  for(var i=0;i<imageList.length;i++){
    sourceImage(imageList[i].varName, imageList[i].fileName);
  }
}
 
//-------IMAGE LOADING PROCESS END------//





function startGame(){
  timer = randomIntFromInterval(3, 8) * 30;
  paused = false;
  animation = requestAnimationFrame(update);
  //document.getElementById("timer").innerText = timer;
}

function readableRandomStringMaker(length) {
  for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
  return s;
}

function quickPlay() {
  opponents = [];
  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 8, 8, 'player', socket.id);
  socket.emit('quick play', { x: player.x, y: player.y, alive: player.alive, id: player.id })
}

function manualStart() {
  document.getElementById('queue').classList.toggle("hidden");
  document.getElementById('rules').classList.toggle("hidden");
  document.getElementById('hud').classList.toggle("hidden");
  document.getElementById('hud').classList.toggle("flex");
  socket.emit('start rules', { room: player.room });
}

function createRoom() {
  opponents = [];
  var room = readableRandomStringMaker(12);
  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 8, 8, 'player', socket.id);
  socket.emit('new player', { x: player.x, y: player.y, alive: player.alive, id: player.id, room: room })
  socket.emit('create room', { room: room, capacity: capacity });
  document.getElementById('capacity').innerText = capacity;
}

function joinRoom(room) {
  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 8, 8, 'player', socket.id);
  socket.emit('new player', { x: player.x, y: player.y, alive: player.alive, id: player.id, room: room })
  socket.emit('join room', room);
  document.getElementById('capacity').innerText = capacity;
}

function leaveRoom(room,alive) {
  socket.emit('leave room', room);
  document.getElementById("game").classList.toggle("hidden");
  document.getElementById("hud").classList.toggle("hidden");
  document.getElementById("hud").classList.toggle("flex");
  if (alive) {
    document.getElementById("survived").classList.toggle("hidden");
  } else {
    document.getElementById("eliminated").classList.toggle("hidden");
  }
}

function toLobby() {
  location.reload();
}

var update = function () {
  if (!paused) {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    timer--;
    //document.getElementById("timer").innerText = timer;
    if (timer == 0) {
      if (!gameStarted) {
        //     var oneMin = 60;
        //     var display =   document.querySelector('#timer');
        //     startTimer(oneMin, display);
        socket.emit('start game');
        gameStarted = true;
      }
      if (gameStarted) {
        go = !go;
        socket.emit('flip switch', { go: go });
        timer = randomIntFromInterval(3, 8) * 30;
      }
    }
    // if (gameTime == '00:00') {
    //   player.alive = false;
    //   player.kill();
    // }
    if (player.moving && !go && player.alive) {
      player.alive = false;
      player.kill();
    }
    if (player.alive) {
      player.draw();
      player.update();
    }
    opponents.forEach(function (opponent) {
      opponent.draw();
    })
    if (!player.alive) {
      updateParticles();
    }
    requestAnimationFrame(update);
  }
}


// Find player by ID
function playerById (id) {
  for (var i = 0; i < opponents.length; i++) {
    if (opponents[i].id === id) {
      return opponents[i]
    }
  }

  return false
}

function removePlayer(id,numClients) {
  var removePlayer = playerById(id)
  var playerCount = numClients;
  let a = document.getElementsByClassName('participating');
  [...a].forEach( x => x.innerText = playerCount );

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ', id)
    return
  }

  // console.log(opponents)
  // Remove player from array
  opponents.splice(opponents.indexOf(removePlayer), 1)
}
