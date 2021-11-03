class Entity{
    constructor(x,y,w,h){
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }
    
  
  class Player extends Entity{
    constructor(x,y,w,h,type,id){
      super(x,y,w,h);
      this.moving = false;
      this.type = type;
      this.alive = true;
      this.id = id;
      this.room = "";
      this.name = "";
      this.data = { x: this.x, y: this.y, alive: this.alive, id: this.id }
    } 
  
    draw() {
        if (this.type == 'player') { 
            drawTriangle(this.x, this.y, this.w, this.h, '#e63178');
        }else if(this.type == 'opponent') {
            drawTriangle(this.x, this.y, this.w, this.h, 'white');
        }
    }
    
    update() {
      if (gameStarted) {
        if (this.moving) {
          this.y -= 1;
          this.data = { x: this.x, y: this.y, alive: this.alive, id: this.id, room: this.room }
          this.sendToServer(this.data);
        }
      }
    }

    kill() {
      if (!this.alive) {
        createParticles();
        this.data = { x: this.x, y: this.y, alive: this.alive, id: this.id, room: this.room }
        socket.emit('player eliminated', this.data);
      }
    }
      
    sendToServer(d) {
      setTimeout(function () {
        socket.emit('move player', d);
      }, 100, d)
    }
  
  }
