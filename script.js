 (function(){
		"use strict";
		
		//CONSTANTS
		var NUM_SAMPLES = 1024;
		var SCREEN_RADIUS = 755;
		var SOUND_1 = 'media/Enjoy the Ride.mp3';
		
		//VARIABLES
		var canvas, ctx, canvas2, ctx2;
		var audioElement, analyserNode;
		var drawing, ready, clickLoc, mouseLoc, lines;
		var circleRadius, strokeColor, fillColor, angle, thickness;
		var circleBox, lineBox, linesBox, crazyBox;
		
		//Init - function called when the page is loaded
		function init(){
			console.log("testmouse");
			
			// set up canvas stuff
			canvas = document.querySelector('#canvas');
			ctx = canvas.getContext("2d");
			canvas2 = document.querySelector('#bCanvas');
			ctx2 = canvas2.getContext("2d");
			strokeColor = 'rgba(0, 255, 0, 0.6)';
			fillColor = 'rgba(255, 0, 255, 0.6)';
			circleRadius = 10;
			angle=0;
			thickness = 5;
			ready = false;
			drawing = false;
			lines = new Uint8Array(100);
			circleBox = true;
			lineBox = true;
			linesBox = true;
			crazyBox = false;
			
			// get reference to <audio> element on page
			audioElement = document.querySelector('audio');
			
			// call our helper function and get an analyser node
			analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
			//Get all our controls working
			setupUI();
			
			// load and play default sound into audio element
			playStream(audioElement,SOUND_1);
			
			//setup map function
			Number.prototype.map = function (in_min, in_max, out_min, out_max) {
				return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
			}
			
			//Mouse
			canvas.onmousemove = doMousemove;
			canvas.onmousedown = doMousedown;
			canvas.onmouseup = doMouseup;
			//topCanvas.onmouseout = doMouseout;
			
			// start animation loop
			update();
		}
		
		function createWebAudioContextWithAnalyserNode(audioElement) {
			var audioCtx, analyserNode, sourceNode;
			// create new AudioContext
			// The || is because WebAudio has not been standardized across browsers yet
			// http://webaudio.github.io/web-audio-api/#the-audiocontext-interface
			audioCtx = new (window.AudioContext || window.webkitAudioContext);
			
			// create an analyser node
			analyserNode = audioCtx.createAnalyser();
			
			/*
			We will request NUM_SAMPLES number of samples or "bins" spaced equally 
			across the sound spectrum.
			
			If NUM_SAMPLES (fftSize) is 256, then the first bin is 0 Hz, the second is 172 Hz, 
			the third is 344Hz. Each bin contains a number between 0-255 representing 
			the amplitude of that frequency.
			*/ 
			
			// fft stands for Fast Fourier Transform
			analyserNode.fftSize = NUM_SAMPLES;
			
			// this is where we hook up the <audio> element to the analyserNode
			sourceNode = audioCtx.createMediaElementSource(audioElement); 
			sourceNode.connect(analyserNode);
						
			//create DelayNode instance
			//delayNode = audioCtx.createDelay();
			//delayNode.delayTime.value = delayAmount;
			
			// here we connect to the destination i.e. speakers
			//analyserNode.connect(audioCtx.destination);
			
			sourceNode.connect(audioCtx.destination);
			//sourceNode.connect(delayNode);
			//delayNode.connect(analyserNode);
			analyserNode.connect(audioCtx.destination);
			return analyserNode;
		}
		
		//Sets up the functions for the whole UI
		function setupUI(){
			document.querySelector("#songSelect").onchange = function(e){
				playStream(audioElement,e.target.value);
			};
			document.querySelector("#bGColor").onchange = function(e){
				canvas2.style.backgroundColor = e.target.value;
			};
			document.querySelector("#sColor").onchange = function(e){
				strokeColor = e.target.value;
			};
			document.querySelector("#fColor").onchange = function(e){
				fillColor = e.target.value;
			};
			document.querySelector("#radiusSlider").onchange = function(e){
				circleRadius = e.target.value * 2;
			};
			document.querySelector("#lineThicknessSlider").onchange = function(e){
				thickness = e.target.value;
			};
			document.querySelector("#clearButton").onclick = function(e){
				clearCanvas(ctx2);
			};
			document.querySelector("#ilanButton").onclick = function(e){
				drawing = true;
			};
			document.querySelector("#circleBox").onchange = function(e){
				circleBox = !circleBox;
			};
			document.querySelector("#lineBox").onchange = function(e){
				lineBox = !lineBox;
			};
			document.querySelector("#linesBox").onchange = function(e){
				linesBox = !linesBox;
			};
			document.querySelector("#crazyBox").onchange = function(e){
				crazyBox = !crazyBox;
			};
		}
		
		function playStream(audioElement,path){
			audioElement.src = path;
			audioElement.play();
			audioElement.volume = 0.5;
			//document.querySelector('#status').innerHTML = "Now playing: " + path;
		}
		
		// HELPER
		function makeColor(red, green, blue, alpha){
   			var color='rgba('+red+','+green+','+blue+', '+alpha+')';
   			return color;
		}
		
		function getMouse(e){
			var mouse = {}
			mouse.x = e.pageX - e.target.offsetLeft - 8;
			mouse.y = e.pageY - e.target.offsetTop - 8;
			return mouse;
		}
		
		function doMousemove(e) {
			if(!drawing) return;
			
			mouseLoc = getMouse(e);
				
			//console.log("x: " + mouse.x + " y: " + mouse.y);
		}
		
		function doMousedown(e){
			console.log("down");
			ready = true;
			clickLoc = getMouse(e);
			if(drawing){
				lines[0] = clickLoc.x;
				lines[1] = clickLoc.y;
			}
		}
		
		function doMouseup(e){
			console.log("up");
			ready = false;
			drawing = false;
		}
		
		//Update Loop
		function update() {
			requestAnimationFrame(update);
			var data = new Uint8Array(NUM_SAMPLES/2);
			var wave = new Uint8Array(NUM_SAMPLES/2);
			
			analyserNode.getByteFrequencyData(data);
			analyserNode.getByteTimeDomainData(wave);
						
			clearCanvas(ctx);//clearing the top canvas
			
			var temp = data[3];
			drawBottom(data, wave);
			drawTop(temp);
			
			if (crazyBox)
			{
				changeCanvas(ctx2);
			}
		}
		
		function drawBottom(data, wave){
			var space = canvas.width / data.length;
			ctx.save();
			ctx.lineWidth = 3;
			ctx.strokeStyle = strokeColor;
			var j = 0;
			for(var i = 0; i < data.length; i++)
			{
				//default line - audio frequency
				if (lineBox)
				{
					ctx.beginPath();
					ctx.moveTo(i * space, 750 - data[i]);
					if (i == (NUM_SAMPLES / 2) - 1)
					{
						ctx.lineTo(canvas.width, 750 - data[i]);
					}
					else
					{
						ctx.lineTo((i + 1) * space, 750 - data[i + 1]);
					}
					//ctx.strokeStyle = makeColor(255,0,0,data[NUM_SAMPLES / 4].map(0,255,0,1));
					ctx.stroke();
					ctx.closePath();
				}
				
				//default line - wave
				ctx.beginPath();
				ctx.moveTo(i * space, wave[i]);
				if (i == (NUM_SAMPLES / 2) - 1)
				{
					ctx.lineTo(canvas.width,wave[i]);
				}
				else
				{
					ctx.lineTo((i + 1) * space, wave[i + 1]);
				}
				//ctx.strokeStyle = makeColor(255,0,0,data[NUM_SAMPLES / 4].map(0,255,0,1));
				ctx.stroke();
				ctx.closePath();
				
				//Drawing - under construction
				if(ready)
				{
					ctx.beginPath();
					ctx.moveTo(lines[j], lines[j+1] + wave[i]);
					if(drawing)
					{
							lines[j+2] = mouseLoc.x;
							lines[j+3] = mouseLoc.y;
							ctx.lineTo(lines[j+2], lines[j+3] + wave[i+1]);
						
					}
					ctx.stroke();
					ctx.closePath();
				}
				
				//test - lines from wave to middle
				/*ctx.beginPath();
				ctx.moveTo(i*space, 750 - data[i]);
				ctx.lineTo(canvas.width / 2, canvas.height / 2);
				ctx.stroke();*/	
				j+=2;
				
				if (circleBox) //circle
				{
					ctx.save();
					ctx.fillStyle = fillColor;
					ctx.beginPath();
					ctx.arc(canvas.width/2, canvas.height/2, circleRadius * (data[i] / 15), 0, Math.PI * 2, false);
					ctx.fillStyle = makeColor(data[i],0,0,data[i].map(0,255,0,1));
					//ctx.globalAlpha = data[i].map(0,255,0,1);
					ctx.fill();
					ctx.closePath();
					ctx.restore();
				}
			}
			ctx.restore();
			
		}
		
		function drawTop(g){
			if(g==255){ctx2.strokeStyle = makeColor(255,255,255,0.3);}
			else if( g > 250) {ctx2.strokeStyle = makeColor(0, 0, 0, 0.3);}
			else if( g > 225){ctx2.strokeStyle = makeColor(g, 0, g, 0.3);}
			else if( g > 215) {ctx2.strokeStyle = makeColor(g, g, 0, 0.3);}
			else if( g > 200){ctx2.strokeStyle = makeColor(0, g, 0, 0.3);}
			else if( g > 195) {ctx2.strokeStyle = makeColor(g, 0, 0, 0.3);}
			else if( g > 180) {ctx2.strokeStyle = makeColor(0, 0, g, 0.3);}
			else {ctx2.strokeStyle = makeColor(0, g, g, 0.3);}
			
			ctx2.lineWidth = thickness;
			if (linesBox)
			{
				for(var i = 0; i < 3; i++){
					ctx2.beginPath();
					ctx2.moveTo(canvas2.width/2 + Math.cos(angle + (i*90)) * 10, canvas2.height / 2 + Math.sin(angle + (i*90)) * 10);
					ctx2.lineTo(SCREEN_RADIUS * Math.cos(angle + (i*90)) + canvas2.width / 2, SCREEN_RADIUS * Math.sin(angle + (i*90)) + canvas2.height / 2);
					ctx2.stroke();
					ctx2.closePath();
				}
			}
			angle+= (1/50);
		}
		
		function clearCanvas(ctx){
			ctx.clearRect(0, 0, 1280, 800);
		}
		
		function changeCanvas(ctx){
			var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
			var data = imageData.data;
			var length = data.length;
			
			for (var i = 0; i < length; i+=4)
			{
				if (Math.random() < .10){
					data[i + (Math.floor(Math.random() * 2))] = Math.floor(Math.random() * 255);
				}
			}
			ctx.putImageData(imageData, 0, 0);
		}
		window.addEventListener("load",init);
 }());