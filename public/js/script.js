// var canvas;
// var ctx;
const socket = io();
var picsToLoad = 0;
var gameOver = false;
var player;
var p;
var gameTime = 0;
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


var bgPic = new Image();

var initGame = function(){
  // canvas = document.getElementById("squid");
  // ctx = canvas.getContext("2d");
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
  opponents.push(new Player(data.x - 100, data.y, 16, 15, "opponent", data.id))
  // console.log(opponents);
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
  document.getElementById('participating').innerText = playerCount;
  // totalPlayers = playerCount;
  // console.log('There are currently ' + playerCount + ' players participating.')
  if (playerCount == capacity) {
    initGame();
  }
});


socket.on('update time', function (data) {
  var minutes = data.minutes;
  var seconds = data.seconds;
  var display = document.querySelector('#timer');
  display.textContent = minutes + ":" + seconds;
});

socket.on('player eliminated', function (data) {
  document.getElementById('eliminations').innerText = 'Player ' + data.name + ' Eliminated!';
});

socket.on('flip switch', function (data) {
  if(data.go){
    document.getElementById("stop").classList.remove("active");
    document.getElementById("ready").classList.remove("active");
    document.getElementById("go").classList.add("active");
  }else{
    document.getElementById("stop").classList.add("active");
    document.getElementById("ready").classList.remove("active");
    document.getElementById("go").classList.remove("active");
  }
});


socket.on('join room', data => {
  //console.log(data)
  //console.log(data + ' joined room')
  player.room = data.room;
  document.getElementById('lobby').style.display = "none";
  document.getElementById('game').style.display = "block";
})


socket.on('leave room', data => {
  //console.log(data)
  //console.log(data + ' joined room')
  cancelAnimationFrame(animation);
  removePlayer(data.id, data.numClients);
  document.getElementById('lobby').style.display = "block";
  document.getElementById('game').style.display = "none";
})


socket.on('list rooms', function (data) {
  var arr = Object.values(data);
  arr.forEach(element => {
    var myClass;
    element.locked ? myClass = ' disabled ' : myClass = '';
    document.getElementById('rooms').innerHTML = '<div class="col-6 my-3"><button class="room-btn ' + myClass + '" onclick="joinRoom(\'' + element.roomName + '\')" ' + myClass + '>Join Room ' + element.numClients + '/' + capacity + '</button></div>';
  });
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
  update();
  timer = randomIntFromInterval(3,8)*30;
  //document.getElementById("timer").innerText = timer;
}

function readableRandomStringMaker(length) {
  for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
  return s;
}

function createRoom() {
  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 16, 15, 'player', socket.id);
  //SEND LOCAL DATA TO SERVER
  socket.emit('new player', { x: player.x, y: player.y, alive: player.alive, id: player.id })
  var room = readableRandomStringMaker(12);
  socket.emit('create room', room);
  document.getElementById('capacity').innerText = capacity;
}

function joinRoom(room) {
  player = new Player(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 400, 16, 15, 'player', socket.id);
  //SEND LOCAL DATA TO SERVER
  socket.emit('new player', { x: player.x, y: player.y, alive: player.alive, id: player.id })
  socket.emit('join room', room);
  document.getElementById('capacity').innerText = capacity;
}

function leaveRoom(room) {
  socket.emit('leave room', room);
}

var update = function(){
  ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
  if(player.moving && !go && player.alive){
    player.alive = false;
    player.kill();
  }
  if(player.alive){
    player.draw();
    player.update();
  }
  opponents.forEach(function (opponent) {
    opponent.draw();
  })
  gameTime++;
  timer--;
  //document.getElementById("timer").innerText = timer;
  if(timer==0){
    if(!gameStarted){
  //     var oneMin = 60;
  //     var display =   document.querySelector('#timer');
  //     startTimer(oneMin, display);
      socket.emit('start game');
      gameStarted = true;
    }
    if (gameStarted) {
      go = !go;
      socket.emit('flip switch', {go: go});
      timer = randomIntFromInterval(3,8)*30;
    }
  }
  if(!player.alive){
    updateParticles();
  }
  animation = requestAnimationFrame(update);
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
  document.getElementById('participating').innerText = playerCount;

  // Player not found
  if (!removePlayer) {
    // console.log('Player not found: ', data.id)
    return
  }

  // Remove player from array
  opponents.splice(opponents.indexOf(removePlayer), 1)
}
