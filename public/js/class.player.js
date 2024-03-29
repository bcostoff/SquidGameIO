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
      this.shape = "";
      this.isHost = false;
      this.data = { x: this.x, y: this.y, alive: this.alive, id: this.id }
    } 
  
    draw() {
        if (this.type == 'player') { 
            drawTriangle(this.x, this.y, this.w, this.h, '#ffffff');
        } else if (this.type == 'opponent') {
          if (this.shape == 'rect') {
            fillRect(this.x, this.y, this.w, this.h, '#e63178');
          } else if (this.shape == 'circ') {
            fillCircle(this.x, this.y, this.w/1.5, '#e63178');
          }
        }
    }
    
    update() {
      if ((this.y + this.h) <= 0) {
        paused = true;
        cancelAnimationFrame(animation);
        leaveRoom(this.room,this.alive);
      } else {
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
