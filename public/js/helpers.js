Math.getAngle = function (x1, y1, x2, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  return Math.atan2(dy, dx);
}


Math.degrees = function (radians) {
  return radians * 180 / Math.PI;
}


Math.radians = function (degrees) {
  return degrees * Math.PI / 180;
}


Math.difference = function (a, b) { 
  return Math.abs(a - b); 
}
  
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function randId(){
  return Math.floor(Math.random()*90000) + 10000000;
}

function arrTo2D(arr,row,col){
  var array2D = [];
  for (var i = 0; i < row; i++) {
    array2D[i] = [];
    for (var j = 0; j < col; j++) {
      array2D[i][j] = arr[i*row+j];
    }
  }
}

function getDistanceBetweenEntity(entity1, entity2){
  var vx = entity1.x - entity2.x;
  var vy = entity1.y - entity2.y;
  return Math.sqrt(vx*vx+vy*vy);
}

function testCollisionEntity(entity1, entity2){
  var distance = getDistanceBetweenEntity(entity1, entity2); 
  return distance < 30;
}


function preShake(){
  context.save();
  var dx = Math.random() * SHAKE_AMOUNT;
  var dy = Math.random() * SHAKE_AMOUNT;
  context.translate(dx,dy);
}
 
function postShake(){
  context.restore();
}


function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}


function getRandomSpawn(){
  var r = Math.floor(Math.random()*10);
  var s = Math.floor(Math.random()*10);
  var c = {
    x: 0,
    y: 0
  }
  if(r <= 4){
    if(s <= 4){
      c.x = 0;
      c.y = getRandomArbitrary(0, currentMap.height);
    }else{
      c.x = currentMap.width-32;
      c.y = getRandomArbitrary(0, currentMap.height);
    }
  }else{
    if(s <= 4){
      c.x = getRandomArbitrary(0, currentMap.width);
      c.y = 0;
    }else{
      c.x = getRandomArbitrary(0, currentMap.width);
      c.y = currentMap.height-32;
    }
  }
  return c;
}

function randomIntFromInterval(min,max){
  return Math.floor(Math.random()*(max-min+1)+min);
}

function getGridPos(y,x,map) {
  gridY = Math.floor(y/map.tsize);
  gridX = Math.floor(x/map.tsize);
  //return {y:gridY, x:gridX};
  return [gridY,gridX];
}

function debug(msg){
  throw new Error(msg);
}