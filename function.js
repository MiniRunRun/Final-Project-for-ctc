  // Sound Responsive Brightness Code
  const statusElement = document.getElementById('status');
  const overlay = document.getElementById('overlay');
  const levelElement = document.getElementById('level');
  
  let audioContext;
  let analyser;
  let microphone;
  let isRunning = false;
  let animationId;
  
  // Brightness parameters
  const minBrightness = 0.8;  // Darkest level (80% black overlay)
  const maxBrightness = 0;    // Brightest level (0% black overlay)
  
  // Click to start/stop
  document.body.addEventListener('click', toggleMicrophone);
  
  async function toggleMicrophone() {
      if (isRunning) {
          stopMicrophone();
          statusElement.textContent = 'Microphone stopped. Click to start again.';
      } else {
          try {
              await startMicrophone();
              statusElement.textContent = 'Listening... Speak louder to brighten the screen!';
              isRunning = true;
          } catch (error) {
              statusElement.textContent = `Error: ${error.message}`;
              console.error(error);
          }
      }
  }
  
  async function startMicrophone() {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      
      // Connect microphone to analyser
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      
      // Start processing audio
      processAudio();
  }
  
  function stopMicrophone() {
      if (microphone && audioContext) {
          microphone.disconnect();
          cancelAnimationFrame(animationId);
          audioContext.close();
      }
      isRunning = false;
      overlay.style.backgroundColor = `rgba(0, 0, 0, ${minBrightness})`;
      levelElement.style.width = '0%';
  }
  
  function processAudio() {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
      }
      const averageVolume = sum / bufferLength;
      
      // Normalize volume to 0-1 range (adjust sensitivity as needed)
      const normalizedVolume = Math.min(averageVolume / 100, 1);
      
      // Map volume to brightness level (inverted because higher opacity = darker)
      const brightnessLevel = minBrightness - (normalizedVolume * (minBrightness - maxBrightness));
      
      // Update screen brightness
      overlay.style.backgroundColor = `rgba(0, 0, 0, ${brightnessLevel})`;
      
      // Update visualizer
      levelElement.style.width = `${normalizedVolume * 100}%`;
      
      // Continue processing
      animationId = requestAnimationFrame(processAudio);
  }
  
  // Initial state
  overlay.style.backgroundColor = `rgba(0, 0, 0, ${minBrightness})`;