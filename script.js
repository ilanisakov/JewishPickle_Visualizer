 (function(){
		"use strict";
		
		//CONSTANTS
		var NUM_SAMPLES = 256;
		
		//VARIABLES
		var canvas, ctx;
		var audioElement, analyserNode;
		
		
		//Init - function called when the page is loaded
		function init(){
			// set up canvas stuff
			canvas = document.querySelector('canvas');
			ctx = canvas.getContext("2d");
			
			// get reference to <audio> element on page
			audioElement = document.querySelector('audio');
			
			// call our helper function and get an analyser node
			analyserNode = createWebAudioContextWithAnalyserNode(audioElement);
			
			// get sound track <select> and Full Screen button working
			setupUI();
			
			// load and play default sound into audio element
			//playStream(audioElement,SOUND_1);
			
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
			delayNode = audioCtx.createDelay();
			delayNode.delayTime.value = delayAmount;
			
			// here we connect to the destination i.e. speakers
			//analyserNode.connect(audioCtx.destination);
			
			sourceNode.connect(audioCtx.destination);
			sourceNode.connect(delayNode);
			delayNode.connect(analyserNode);
			analyserNode.connect(audioCtx.destination);
			return analyserNode;
		}
		
		//Sets up the functions for the whole UI
		function setupUI(){
			
		}
		
		//Update Loop
		function update() {
			requestAnimationFrame(update);
			
		}
		window.addEventListener("load",init);
 }());