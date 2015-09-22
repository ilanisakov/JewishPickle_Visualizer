 (function(){
		"use strict";
		
		//CONSTANTS
		var NUM_SAMPLES = 1024;
		var SOUND_1 = 'media/Touch The Sky.mp3';
		
		//VARIABLES
		var canvas, ctx;
		var audioElement, analyserNode;
		var effectColor;
		
		
		//Init - function called when the page is loaded
		function init(){
			console.log("test1");
			
			// set up canvas stuff
			canvas = document.querySelector('canvas');
			ctx = canvas.getContext("2d");
			effectColor = 'rgba(0, 255, 0, 0.6)';
			
			// get reference to <audio> element on page
			audioElement = document.querySelector('audio');
			
			// call our helper function and get an analyser node
			analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
			//Get all our controls working
			setupUI();
			
			// load and play default sound into audio element
			playStream(audioElement,SOUND_1);
			
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
				canvas.style.backgroundColor = e.target.value;
			};
			document.querySelector("#eColor").onchange = function(e){
				effectColor = e.target.value;
			};
		}
		
		function playStream(audioElement,path){
			audioElement.src = path;
			audioElement.play();
			audioElement.volume = 0.2;
			//document.querySelector('#status').innerHTML = "Now playing: " + path;
		}
		
		//function bGColorChange(e)
		//{
		//	console.log('bgcolor');
		//	canvas.style.backgroundColor = e.value;
		//}
		
		//Update Loop
		function update() {
			requestAnimationFrame(update);
			var data = new Uint8Array(NUM_SAMPLES/2);
			var space = canvas.width / data.length;
			
			
			
			analyserNode.getByteFrequencyData(data);
			
			
			ctx.clearRect(0,0,1280,800);
			
			ctx.save();
			ctx.strokeStyle = effectColor;
			for(var i = 0; i < data.length; i++)
			{
				//default line
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
				ctx.stroke();
				ctx.closePath();
			}
			ctx.restore();
			
		}
		window.addEventListener("load",init);
 }());