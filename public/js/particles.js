// function runParticles(x,y,canvas2){
//requestAnimationFrame(updateParticles);
const doFor = (c, C) => { var i = 0; while (i < c && C(i++) !== true); return i };
const randI = (min, max = min + (min = 0)) => (Math.random() * (max - min) + min) | 0;
const rand  = (min = 1, max = min + (min = 0)) => Math.random() * (max - min) + min;
//const canvas2 = document.getElementById("particals");
// const ctx2 = canvas2.getContext("2d");
var particleIndex = 0;


//==================================================================
// WARNING next two control CPU load.
// Number of particles is width * height / density
const density = 500;  // particles per pixel squared WARNING Small numbers bad
const airVortexCount = 8;  // number of vortex Warning big number bad
//==================================================================

const airVortexSpeed = 10;  // speed of vortex movement in pixels
const vortexTurn = 0.02; // bigger values and vortex movement more circular
var airList;
const airForceCof = 1;  // amount of force airVortex applys to circle
const circleDrag = 0.99; // drag is 1-circleDrag Must be less than 1
                        // the smaller the number the less movement in circles
const buoyancySpeed  = 0.01; //  Particle buoyancy  speed
var circleList;
const circleMinSize = 1;  // size is radius in pixels
const circleMaxSize = 2;
const floatPhaseCycleMax = 0.02; // Particle buoyancy phase shift. Bigger numbers
                                // create faster updown movement
var airWidth,airHeight;
var cirWidth,cirHeight;

function createParticles(){
  particleIndex = 0;
    airList = {...list};
    circleList = {...list};
    airList.init();
    circleList.init();
    doFor(airVortexCount, () => airList.add({...particle, ...air}).init());
    var circleCount = (canvas.width * canvas.height) / density;
    doFor(circleCount, () => circleList.add({...particle, ...circle}).init());
    airWidth = canvas.width * 2;
    airHeight = canvas.height * 2;
    cirWidth = canvas.width + circleMaxSize * 2;
    cirHeight = canvas.height + circleMaxSize * 2;   
}

function updateParticles(){
    airList.update();
    airList.each(circleList.update.bind(circleList));
    circleList.update();
    // ctx.beginPath();
    circleList.draw();
    // ctx.fill();
    if(circleList.items.length == 0){
      //valid = false;
      cancelAnimationFrame(animation);
      document.getElementById("player-eliminated").innerText = player.name;
      document.getElementById("elimination-overlay").style.display = "block";
      setTimeout(() => {
        leaveRoom(player.room);
        document.getElementById("elimination-overlay").style.display = "none";
      }, 2000, player);
      // cancelAnimationFrame(animationId);
    }
    // console.log(circleList.items.length);
    // throw new Error("my error message");
    //cancelAnimationFrame(animationId);
}
           


// var w,h,cw,ch;
// function updateParticles(timer){
//    //ctx2.setTransform(1,0,0,1,0,0); // reset transform
//    if(w !== innerWidth || h !== innerHeight){  // resize canvas if needed
//        cw = (w = canvas2.width = innerWidth) / 2;
//        ch = (h = canvas2.height = innerHeight) / 2;
//        createParticles();
//    }
//    // ctx2.fillStyle = "black";
//    // ctx2.fillRect(0,0,w,h);
//    // ctx2.fillStyle = "rgba(255,200,100,0.5)";
//    ctx2.clearRect(0,0,w,h)
//    updateAll();
//    //requestAnimationFrame(updateParticles);
// }




// air is a Vortex (bad naming when I started)
const air = {
    update(){
        this.x += Math.cos(this.phase) * airVortexSpeed;
        this.y += Math.sin(this.phase) * airVortexSpeed;
        this.phase += this.phaseShift;
       
        this.x = ((this.x % airWidth) + airWidth) % airWidth;
        this.y = ((this.y % airHeight) + airHeight) % airHeight;
    },
    init(){
        this.x = randI(canvas.width);
        this.y = randI(canvas.height);
        this.size2 = randI(canvas.height * canvas.width);
        this.size = Math.sqrt(this.size2);
        this.phase = rand(Math.PI * 2);
        this.phaseShift = rand(-vortexTurn,vortexTurn);
        return this;
    },
}
// the things that float in air
const circle = {
    init(){
        // this.x = randI(canvas.width);
        // this.y = randI(canvas.height);
        var combo = [
        {
          x: player.x,
          y: player.y
        },
        {
          x: player.x+8,
          y: player.y+15
        },
        {
          x: player.x+4,
          y: player.y+15
        },
        {
          x: player.x+4,
          y: player.y+8
        },
        {
          x: player.x-4,
          y: player.y+8
        },
        {
          x: player.x-8,
          y: player.y+15
        },
        {
          x: player.x-2,
          y: player.y+4
        },
        {
          x: player.x+2,
          y: player.y+4
        },
        {
          x: player.x-6,
          y: player.y+12
        },
        {
          x: player.x+6,
          y: player.y+12
        },
        {
          x: player.x,
          y: player.y+15
        },
        {
          x: player.x-6,
          y: player.y+15
        },
        {
          x: player.x-4,
          y: player.y+15
        },
        {
          x: player.x-2,
          y: player.y+15
        },
        {
          x: player.x+2,
          y: player.y+15
        },
        {
          x: player.x+4,
          y: player.y+15
        },
        {
          x: player.x+6,
          y: player.y+15
        },
        ]
        var randomCombo = combo[Math.floor(Math.random()*combo.length)];
        this.id = particleIndex;
        this.x = randomCombo.x;
        this.y = randomCombo.y;
        this.dx = 0;
        this.dy = 0;
        this.size = rand(circleMinSize,circleMaxSize);
        this.mass = this.size ** 3;
        this.depth = rand(0.5,1);
        this.floatPhase = rand(Math.PI * 2);
        this.floatPhaseCycle = rand(floatPhaseCycleMax );
        this.life = 0;
        this.opacity = 1;
        particleIndex++;
        return this;
    },   
    update(air) {  // if air is undefined then do momentum and bouyancy

        if(this.life < Math.random()*80){
            if(air === undefined){
                this.dy += Math.sin(this.floatPhase)*buoyancySpeed;
                this.floatPhase += this.floatPhaseCycle;
                this.x += this.dx * this.depth;
                this.y += this.dy * this.depth;
                this.dx *= circleDrag;
                this.dy *= circleDrag;
                this.x = ((this.x % cirWidth) + cirWidth) % cirWidth;
                this.y = ((this.y % cirHeight) + cirHeight) % cirHeight;
                return;
            }
            var x = this.x - (air.x - airWidth / 4);
            var y = this.y - (air.y - airHeight / 4);
            var dist = x * x + y * y;
            if(dist < air.size2){
                dist = Math.sqrt(dist);
                x /= dist;
                y /= dist;
                var force = (1 - dist / air.size) * airForceCof;
               
                // using f = ma  (force = mass * acceleration)
                var a = (force / this.mass) * Math.sign(air.phaseShift);
                this.dx += -y * a;
                this.dy += x * a;
            }
        }else {
          
        //   console.log("dead")
        }
    },
    draw(){
        this.life++;
        if(this.opacity > 0){
            ctx.globalAlpha = this.opacity;
            this.opacity = this.opacity - 0.02;
            var x = this.x - circleMaxSize;
            var y = this.y - circleMaxSize;
            ctx.beginPath();
            ctx.moveTo(x + this.size,y);
            ctx.arc(x,y,this.size,0,Math.PI * 2);
            ctx.fillStyle = "#e63178";
            ctx.fill();
            ctx.globalAlpha = 1;
        }else{
        //   console.log("gone")
            var index = circleList.items.map(function(e){
                return e.id
            }).indexOf(this.id);
            circleList.items.splice(index,1);
            circleList.items = circleList.items.filter(Boolean);
        }
    }
}
// basic particle
const particle = { x : 0,  y : 0, size : 0}
// basic list handles all particle arrays
const list = {
    items : [],
    init(){ this.items = [] },
    add(item) {
        this.items.push(item);
        return item;
    },
    each(callback) { for(const item of this.items) { callback(item) } },
    update(data) { for(const item of this.items) { item.update(data) } },
    draw() { for(const item of this.items) { item.draw() } },
    }
    
    
