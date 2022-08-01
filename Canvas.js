const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth-200;
canvas.height= window.innerHeight-200;

var context=canvas.getContext("2d");
context.fillStyle="white";
context.fillRect(0,0,canvas.width,canvas.height);

var draw_color="black";
var draw_width=document.getElementById("pen").defaultValue;
var is_drawing=false;
var x;
var y;
var xo;
var yo;
var mode="Free";
var draw=1;
var click=0;
var startx;
var starty;
var restore_array=[];
var index = -1;
var redo_array=[];
var redo_index=-1;
var circles=[];
var rectangles=[];
var lines=[];
var ellipses=[];
var squares=[];
var polygons=[];
var rect=null;
var circle=null;
var isDown=false;
var startX1,startY1;
var nearest=null;
var nearestrect=null;



	document.getElementById("redo").disabled = true;
	document.getElementById("undo").disabled = true;
	document.getElementById("done").disabled = true;
	canvas.addEventListener("mousedown", start, false);
	canvas.addEventListener("mousemove", drag, false);
	canvas.addEventListener("mouseup", stop, false);

	const saveButton = document.getElementById("save");
  saveButton.addEventListener('click', () => save(canvas));


	var imageLoader = document.getElementById("imageLoader");
	imageLoader.addEventListener('change', handleImage, false);
 	 

function color_change(element){

	draw_color=element.style.background;
}





function save_image(){
    save_image_data=context.getImageData(0,0,canvas.width,canvas.height);

 }
 function put_image(){
     context.putImageData(save_image_data,0,0);
 }




function start(event){


if (mode=="Move Lines")

{
	event.preventDefault();
	event.stopPropagation();

	startX1=parseInt(event.clientX - canvas.offsetLeft);
	startY1=parseInt(event.clientY - canvas.offsetTop);
	nearest=closestLine(startX1,startY1);
  redraw();
  // set dragging flag
  isDown=true;
	
}


if(mode=="Move Rectangles"){

			event.preventDefault();
			event.stopPropagation();

			startX1=parseInt(event.clientX - canvas.offsetLeft);
			startY1=parseInt(event.clientY - canvas.offsetTop);

			nearestrect=closestrect(startX1,startY1);
			console.log(nearestrect);
					
			redraw();
				  // set dragging flag
			isDown=true;
}




if (draw)
{

		is_drawing=true;
		document.getElementById("redo").disabled = true;
		redo_array=[];
		redo_index=-1;



		if (mode=="Free")

		{
			xo=event.clientX - canvas.offsetLeft;
			yo=event.clientY - canvas.offsetTop;
			context.beginPath();
			context.moveTo(xo,yo);
			return;
		}

		if (mode=="Polygon")

		{
			if (click==0)
			{
				xo=event.clientX - canvas.offsetLeft;
				yo=event.clientY - canvas.offsetTop;
				startx=xo;
				starty=yo;
				document.getElementById("done").disabled = false;
			}

				save_image();
				return;
		}


				xo=event.clientX - canvas.offsetLeft;
				yo=event.clientY - canvas.offsetTop;
				save_image();

}	


}



function drag(event) {


	if (mode=="Move Lines"||mode=="Move Rectangles")
	{
		if(!isDown){return;}
		event.preventDefault();
    event.stopPropagation();

		//mouse position
		mouseX=parseInt(event.clientX - canvas.offsetLeft);
		mouseY=parseInt(event.clientY - canvas.offsetTop);
		var dx=mouseX-startX1;
		var dy=mouseY-startY1;
		startX1=mouseX;
		startY1=mouseY;



		if(nearestrect){

			var rect=nearestrect.rect;
			rect.x1+=dx;
			rect.y1+=dy;
			rect.x2+=dx;
			rect.y2+=dy;
			redraw();
		}

		
		if(nearest){

		var line=nearest.line;
				line.x1+=dx;
				line.y1+=dy;
				line.x2+=dx;
				line.y2+=dy;

				redraw();
		

		}

}

if(draw)

{
	if(is_drawing)

	{
			x=event.clientX - canvas.offsetLeft;
			y=event.clientY - canvas.offsetTop;
			context.strokeStyle = draw_color;
			context.lineWidth = draw_width;
			context.lineCap = "round";
			context.lineJoin = "round";	
	
	if(mode!="Free") {put_image();}

	switch(mode) { 

		case "Polygon":
		
		if (click>0 && Math.abs(x-startx)<15 && Math.abs(y-starty)<15) 
		{
			x=startx;
			y=starty;
		}
	

		//put_image();
		context.beginPath();
		context.moveTo(xo,yo);
		context.lineTo(x,y);
		context.stroke();

		break;
		
		case "Line":

		put_image();
		context.beginPath();
		context.moveTo(xo,yo);
		context.lineTo(x,y);
		context.stroke();
		break;
		

		case "Rectangle":
		
		//put_image();
		context.beginPath();
		context.moveTo(xo,yo);
		context.rect(xo,yo,x-xo,y-yo);
		context.stroke();
		
		break;
		


		case "Square":
		
		//put_image();
		context.beginPath();
		context.moveTo(xo,yo);
		context.rect(xo,yo,x-xo,x-xo);
		context.stroke();

		break;
		


		case "Ellipse":
		
		
		
		context.moveTo(xo,yo);
		context.beginPath();
		context.ellipse(xo,yo,x-xo,y-yo,0, 0, 2 * Math.PI);
		context.stroke();
		
		break;


		case "Circle":
		
		
		//put_image();
		context.moveTo(xo,yo);
		context.beginPath();
		context.arc(xo,yo,x-xo,0,2*Math.PI);
		context.stroke();
		
		break;
		
		case "Free":

		context.lineTo(x,y);
		context.stroke();
		break;


		}

	}

}

}



function stop(event) {


if (mode=="Move Lines"|| mode=="Move Rectangles")
{
	event.preventDefault();
	event.stopPropagation();
	isDown=false;
	nearest=null;
	nearestrect=null;
	redraw();
	restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
	index +=1;
	document.getElementById("undo").disabled = false;
	console.log(restore_array);

}	

if(is_drawing)
		
	{
	
	is_drawing=false;

	if (mode=="Polygon")
		{

			if (click==0) 
					click=click+1;
	    
	    xo=event.clientX - canvas.offsetLeft;
			yo=event.clientY - canvas.offsetTop;

			if (x==startx && y==starty)
				{ 
					Done();
					console.log(click);
				}
		
				return;

		
		}
	}


	if (mode=="Line")
		{
			lines.push( {x1:xo,y1:yo,x2:x,y2:y,color:draw_color});
			console.log(lines);
		}

	if(mode=="Rectangle")
	{
		rectangles.push({x1:xo,y1:yo,x2:x,y2:y,color:draw_color});
		console.log(rectangles);
	}

	if (mode=="Circle")
		{
			circles.push( {cx:xo,cy:yo,r:x-xo,color:draw_color});
			console.log(circles);
		}

	if (mode=="Ellipse")
	{

	ellipses.push({cx:xo,cy:yo,ca:x-xo,cb:y-yo,color:draw_color});
console.log(circles);
	}

	if(mode=="Square")
	{
		squares.push({x1:xo,y1:yo,side:x-xo,color:draw_color});
		console.log(rectangles);
	}


	restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
	index +=1;
	document.getElementById("undo").disabled = false;
	console.log(restore_array);
}


function Done() {

	click=0;
	document.getElementById("done").disabled = true;
	restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
	index +=1;
	document.getElementById("undo").disabled = false;
	return;

}
function ChangemodeList(){


	mode=document.getElementById("mode").value;

	if (mode=="Move Lines"|| mode=="Move Rectangles")
		draw=0;
	else 
		draw=1;



	if (mode=="Polygon")
		document.getElementById("done").disabled = false;
	else 
		document.getElementById("done").disabled = true;

	console.log(mode);
}

function clear_canvas() {


context.fillStyle="white";
context.clearRect(0,0,canvas.width,canvas.height);
context.fillRect(0,0,canvas.width,canvas.height);

restore_array=[];
index= -1;''
redo_array=[];
redo_index=-1;
circles=[];
rectangles=[];
lines=[];
ellipses=[];
squares=[];
polygons=[];


document.getElementById("undo").disabled = true;
document.getElementById("redo").disabled = true;


}

function undo(){


		redo_array.push(restore_array[index]);
		redo_index+=1;
		index-=1;
		restore_array.pop();
		document.getElementById("redo").disabled = false;

		if( index == -1 ) 
		{
		context.fillStyle="white";
		context.clearRect(0,0,canvas.width,canvas.height);
		context.fillRect(0,0,canvas.width,canvas.height);
		document.getElementById("undo").disabled = true;
		}
		
		else 
			context.putImageData(restore_array[index],0,0);



}


function redo(){

	

	context.putImageData(redo_array[redo_index],0,0);
	restore_array.push(redo_array[redo_index])
	index+=1;
	document.getElementById("undo").disabled = false;
	redo_array.pop();
	redo_index-=1;

	if (redo_index == -1)
	{
	document.getElementById("redo").disabled = true;	
	}
	
}


function closestXY(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var k = -1;
  if (len_sq != 0) //in case of 0 length line
      k = dot / len_sq;

  var xx, yy;

  if (k < 0) {
    xx = x1;
    yy = y1;
  }
  else if (k > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + k* C;
    yy = y1 + k* D;
  }


  	return({x:xx,y:yy});
 
}






function save(canvas) {
  const data = canvas.toDataURL('image/png');
  const anchor = document.createElement('a');
  anchor.href = data;
  anchor.download = 'image.png';
  anchor.click();
}


function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        var img = new Image();
        img.onload = function(){
            clear_canvas();
            context.drawImage(img,0,0);
            restore_array.push(context.getImageData(0,0,canvas.width,canvas.height));
			index +=1;
		
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);   

}



function closestLine(mx,my){
    var dist=100000000;
    var index,pt;
    for(var i=0;i<lines.length;i++){
        //
        var xy=closestXY(mx,my, lines[i].x1,lines[i].y1,lines[i].x2,lines[i].y2);
        //
        var dx=mx-xy.x;
        var dy=my-xy.y;
        var thisDist=dx*dx+dy*dy;
        if(thisDist<dist){
            dist=thisDist;
            pt=xy;
            index=i;
        }
    }
    var line=lines[index];

    if (dist>100)
    	return null;
    else 
    return({ pt:pt, line:line, originalLine:{x1:line.x1,y1:line.y1,x2:line.x2,y2:line.y2} });
}


function redraw(){
    		context.clearRect(0,0,canvas.width,canvas.height);
    // draw all lines at their current positions

					for(var i=0;i<rectangles.length;i++){
		        drawRect(rectangles[i],rectangles[i].color);
		      }

		      for(var i=0;i<lines.length;i++){
		        drawLine(lines[i],lines[i].color);
		    }
		    
		    for (var i=0; i<circles.length; i++){

						context.moveTo(circles.cx,circles.cy);
						context.strokeStyle=circles[i].color
						context.beginPath();
						context.arc(circles[i].cx,circles[i].cy,circles[i].r,0,2*Math.PI);
						context.stroke();
					}


					for (var i=0; i<ellipses.length; i++){

						context.moveTo(ellipses[i].cx,ellipses[i].cy);
						context.strokeStyle=ellipses[i].color
						context.beginPath();
						context.ellipse(ellipses[i].cx,ellipses[i].cy,ellipses[i].rx,ellipses[i].ry,0,0,2*Math.PI);
						context.stroke();
					}


						for(var i=0;i<squares.length;i++){
		        

		        context.beginPath();
						context.moveTo(squares[i].x1,squares[i].y1);
						context.strokeStyle=squares[i].color
						context.rect(squares[i].x1,squares[i].y1,squares[i].side,squares[i].side);
						context.stroke();

		      }

					


								
							

		    

		    if(nearest){
		        
		        
		        // hightlight the line as its dragged
		        drawLine(nearest.line,'red');
		    }
  	
  			if(nearestrect){
		        // point on line nearest to mouse
		        
		        // hightlight the line as its dragged
		        drawRect(nearestrect.rect,'red');
		    }
  	




}

function drawLine(line,color){
    context.beginPath();
    context.moveTo(line.x1,line.y1);
    context.lineTo(line.x2,line.y2);
    context.strokeStyle=color;
    context.stroke();

}


function drawRect(rect,color){
		
		context.beginPath();
    context.moveTo(rect.x1,rect.y1);
    context.rect(rect.x1,rect.y1,rect.x2-rect.x1,rect.y2- rect.y1);
    context.strokeStyle=color;
    context.stroke();



}



function closestrect(Xr,Yr){
  
    var index;
    var pt=null;
    for(var i=0;i<rectangles.length;i++)
    {
        

     if (Xr >= rectangles[i].x1 && Xr <= rectangles[i].x2 && Yr >= rectangles[i].y1 && Yr <= rectangles[i].y2) 
        {
        		
            index=i;
        }
    }
    var rect=rectangles[index];

   console.log(rect);

    if (pt==null)
    	return null;
    else 
    return({rect:rect, originalrect:{x1:rect.x1,y1:rect.y1,x2:rect.x2,y2:rect.y2}});
}
