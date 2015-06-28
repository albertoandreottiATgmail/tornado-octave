var w, h;
var canvas, drawing=false, prevX=0, currX=0, prevY=0, currY=0, dot_flag=false;
var timer;
var clear = false;
var maxX = 0, maxY = 0, minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
var trainDigit = 0;
var scaled;
var handwrite;
var person = "someGuy";



function Handwrite(canvas, letterFound, wordFound) {

	this.canvas = canvas;
	this.letterHandler = letterFound;
	this.wordHandler = wordFound;
	this.ctx=canvas.getContext("2d");
	w=canvas.width;
        h=canvas.height;

    if(navigator.userAgent.match(/Android/i)){
        canvas.addEventListener("touchmove", function(e){ findxy('move',e)}, false);
        canvas.addEventListener("touchstart", function(e){ findxy('down',e)}, false);
        canvas.addEventListener("touchend", function(e){ findxy('up',e)}, false);
    }
    else{
        canvas.addEventListener("mousemove", function(e){ findxy('move',e)}, false);
        canvas.addEventListener("mousedown", function(e){ findxy('down',e)}, false);
        canvas.addEventListener("mouseup", function(e){ findxy('up',e)}, false);
        canvas.addEventListener("mouseout", function(e){ findxy('out',e)}, false);
    }
	
	handwrite = this;

}

function draw()
{
    handwrite.ctx.beginPath();
    handwrite.ctx.moveTo(prevX,prevY);
    handwrite.ctx.lineTo(currX,currY);
    handwrite.ctx.strokeStyle=x;
    handwrite.ctx.lineWidth=y;
    handwrite.ctx.stroke();
    handwrite.ctx.closePath();
}

function erase()
{
    var m=confirm("Want to clear");
    if(m)
    {
        handwrite.ctx.clearRect(0,0,w,h);
        document.getElementById("canvasimg").style.display="none";
    }
}

/*this one is used to send training data to the server*/

function send()
{
	var a = document.getElementById('trainDigit');
	trainDigit = a.value;
    person=document.getElementById('person').value;

    postImage(runLengthEncodeColumn(scaled));
    maxX = 0, maxY = 0, minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
 }

function findxy(res,e)
{

    var clientY = e.clientY + window.scrollY;
    var clientX = e.clientX + window.scrollX;

    /*Fetch these values from somewhere else in Android*/
    if(navigator.userAgent.match(/Android/i)){
        clientY = e.targetTouches[0].clientY;
        clientX = e.targetTouches[0].clientX; // - window.scrollX;
    }

    //Press mouse down
    if(res=='down') {
        prevX=currX;prevY=currY;
        currX=clientX-canvas.offsetLeft;
        currY=clientY-canvas.offsetTop;
	    
		//Start timer
        clearTimeout(timer);
        timer = setTimeout(processBuffer, 600);
        clear = false;
        drawing=true;
        dot_flag=true;

        if(dot_flag){
            handwrite.ctx.beginPath();
            handwrite.ctx.fillStyle=x;
            handwrite.ctx.fillRect(currX,currY,2,2);
            handwrite.ctx.closePath();
            dot_flag=false;
         }
    }
           
    //Press mouse up
    if(res=='up'||res=="out"){
                drawing=false; 
    } 

    //Move mouse
    if(res=='move') {
        if(drawing) {
            //if timeout hasn't fired, reset it.
            if(!clear) {
                clearTimeout(timer);
                timer = setTimeout(processBuffer, 700);
            }
            prevX=currX;
            prevY=currY;

            currX=clientX-canvas.offsetLeft;
            currY=clientY-canvas.offsetTop;

            maxX = currX>maxX ? currX : maxX;
            maxY = currY>maxY ? currY : maxY;
            minX = currX<minX ? currX : minX;
            minY = currY<minY ? currY : minY;
            draw();

        }
    }
}

function max(x, y) {

	return x>y? x: y;

}

function processBuffer() {

	clear = true;
	var width = maxX-minX;
	var height = maxY-minY;
	var diff = height-width;
	var frame = 0.10;

	/*make a squared image*/
	minX = minX - Math.floor(diff/2);
	maxX = minX + Math.floor(diff/2);
        
	/*frame the image, at this point height==width*/
	minX = Math.floor(minX - frame*height);
	maxX = Math.ceil(maxX + frame*height);
	minY = Math.floor(minY - frame*height);
	maxY = Math.ceil(maxY + frame*height);

	height = maxY-minY;

	//TODO: this image data will have to come from the current buffer
	var imgData = handwrite.ctx.getImageData(minX, minY, height, height);

	//var scaled = scaleImageData(imgData,factor);
	scaled = nn_resize(imgData, height, height, 20, 20);
	//TODO: this step should be removed, used for debugging
	handwrite.ctx.putImageData(scaled, 10, 370);  
	if(trainDigit == 0) {
		postImage(runLengthEncodeColumn(scaled));
    }
	maxX = 0, maxY = 0, minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
}


/*takes an imageData and encodes it using run length enconding, return an array of tuples (numZeroes, value)*/
function runLengthEncodeRow(imageData) {
	var encoded = [];
	var zeroCount = 0;
	var index = 0;
	for(var i = 3; i<imageData.data.length; i = i+4){
		if(imageData.data[i] == 0)
			zeroCount++;
		else {
			encoded[index++] = zeroCount;
			encoded[index++] = 1;
			zeroCount = 0;
		}
	}
	return encoded;
}


/*takes an imageData and encodes it using run length enconding, return an array of tuples (numZeroes, value)*/
function runLengthEncodeColumn(imageData) {
	var encoded = [];
	var zeroCount = 0;
	var index = 0;

	for(var j = 3; j<80 ; j=j+4){
		for(var i = j; i<imageData.data.length; i = i+80){
			if(imageData.data[i] == 0)
				zeroCount++;
			else {
				encoded[index++] = zeroCount;
				encoded[index++] = 1;//imageData.data[i];
				zeroCount = 0;
			}
		}
	}

	return encoded;
}



function postImage(samples){		

    var fd = new FormData();
    fd.append('image', '[' + samples.toString() + ']');
    fd.append('trainDigit', trainDigit.toString());
    fd.append('$', 'draw');
    fd.append('person', person);

    $.ajax({
					type: 'POST',
					url: "/digit",
					data: fd,
					processData: false,
					contentType: false
					}).done(function(data) {
					    //minor corrections to cope with NN coding.
                                            var number = data.match("pred.*")
                                            number[0]= number[0].replace("10", "0");
					    //call the handler
                                            handwrite.letterHandler(number[0].substring(7, 9));
					});
    }



function scaleImageData(imageData, scale) {

  var scaled = handwrite.ctx.createImageData(imageData.width * scale, imageData.height * scale);

  for(var row = 0; row < imageData.height; row++) {
    for(var col = 0; col < imageData.width; col++) {
      var sourcePixel = [
        imageData.data[(row * imageData.width + col) * 4 + 0],
        imageData.data[(row * imageData.width + col) * 4 + 1],
        imageData.data[(row * imageData.width + col) * 4 + 2],
        imageData.data[(row * imageData.width + col) * 4 + 3]
      ];

      for(var y = 0; y < scale; y++) {
        var destRow = row * scale + y;
        for(var x = 0; x < scale; x++) {
          var destCol = col * scale + x;
          for(var i = 0; i < 4; i++) {
            scaled.data[(destRow * scaled.width + destCol) * 4 + i] =
              sourcePixel[i];
          }
        }
      }
    }
  }

  return scaled;

}

function nn_resize(pixels,w1,h1,w2,h2) { 
    
    var temp = handwrite.ctx.createImageData(w2, h2);
    var x_ratio = w1/w2;
    var y_ratio = h1/h2;
    lastCeilY = 0;
    lastCeilX = 0;
	
    for (var i=0; i<h2; i++) {
        for (var j=0; j<w2; j++) {
            for (var k=lastCeilX; k<lastCeilX+x_ratio; k++) {
                for (var l=lastCeilY; l<lastCeilY+y_ratio; l++) {
                    temp.data[(i*w2+j)*4 + 3] += pixels.data[(l*w1+k)*4 + 3];
				}
			}
			lastCeilX = Math.ceil((j+1)*x_ratio);
		}
		lastCeilX = 0;
		lastCeilY = Math.ceil((i+1)*y_ratio);
    }
    return temp;
}
