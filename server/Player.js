/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (dataX, dataY, dataA, dataId) {
    var x = dataX;
    var y = dataY;
    var alive = dataA;
    var id = dataId;

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


  var setX = function (newX) {
      x = newX;
  }

  var setY = function (newY) {
      y = newY;
  }

  var setAlive = function (newAlive) {
      alive = newAlive;
  }

  // Define which variables and methods can be accessed
  return {
    getX: getX,
    getY: getY,
    getAlive: getAlive,
    setX: setX,
    setY: setY,
    setAlive: setAlive,
    id: id
  }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player