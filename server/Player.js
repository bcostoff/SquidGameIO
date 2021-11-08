/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (dataX, dataY, dataA, dataId, dataRoom, dataName) {
    var x = dataX;
    var y = dataY;
    var alive = dataA;
    var id = dataId;
    var room = dataRoom;
    var name = dataName;
    var isHost = false;

  // Getters and setters
  var getX = function () {
      return x;
  }

  var getY = function () {
      return y;
  }

  var getAlive = function () {
      return alive;
  }
    
  var getRoom = function () {
    return room;
  }
    
  var getName = function () {
    return name;
  }

  var getIsHost = function () {
    return isHost;
  }
    


  var setX = function (newX) {
      x = newX;
  }

  var setY = function (newY) {
      y = newY;
  }

  var setAlive = function (newAlive) {
      alive = newAlive;
  }
    
  var setRoom = function (newRoom) {
    room = newRoom;
  }
    
  var setName = function (newName) {
    name = newName;
  }

  var setIsHost = function (newIsHost) {
    isHost = newIsHost;
  }
    

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    getAlive: getAlive,
    getRoom: getRoom,
    getName: getName,
    getIsHost: getIsHost,
    setX: setX,
    setY: setY,
    setAlive: setAlive,
    setRoom: setRoom,
    setName: setName,
    setIsHost: setIsHost,
    id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player
