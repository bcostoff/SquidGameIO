//-------GRAPHIC FUNCTIONS START------//
 
function fillRect(x,y,w,h,color){
    // ctx.fillStyle = color;
    // ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth=3;
    ctx.strokeRect(x, y, w, h);
  }
   
  function fillCircle(centerX,centerY,radius,color){
    // ctx.fillStyle=color;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
    // ctx.fill();
  }
   
  function drawBitmapCenteredWithRotation(useBitmap,x,y,angle,scaleX,scaleY){
  console.log(useBitmap.width);
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(angle);
    ctx.scale(scaleX,scaleY);
    ctx.drawImage(useBitmap,-useBitmap.width/2,-useBitmap.height/2);
    ctx.restore();
  }
  
  
  
  function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if(typeof stroke == 'undefined'){
      stroke = true;
    }
    if(typeof radius === 'undefined'){
      radius = 5;
    }
    if(typeof radius === 'number'){
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    }else{
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for(var side in defaultRadius){
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if(fill){
      ctx.fill();
    }
    if(stroke){
      ctx.stroke();
    }
  }
  
  
  function drawTriangle(x,y,w,h,colour){
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x+(w/2), y+h);
      ctx.lineTo(x-(w/2), y+h);
      ctx.closePath();
      ctx.strokeStyle = colour;
      ctx.lineWidth=3;
      ctx.stroke();
  }
   
  //-------GRAPHIC FUNCTIONS END------//
