// Sound Responsive Brightness Code
const statusElement = document.getElementById('status');
const overlay = document.getElementById('overlay');

let audioContext;
let analyser;
let microphone;
let isRunning = false;
let animationId;

// Brightness parameters
const minBrightness = 0.8;  // Darkest level (80% black overlay)
const maxBrightness = 0;    // Brightest level (0% black overlay)

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        // Remove the event listener after first interaction
        document.body.removeEventListener('click', initAudioContext);
    }
}

// Set up initial event listener for audio context
document.body.addEventListener('click', initAudioContext);

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
    // Make sure we have an audio context
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Connect microphone to analyser
    microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    // Resume audio context if suspended
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    
    // Start processing audio
    processAudio();
}

function stopMicrophone() {
    if (microphone && audioContext) {
        microphone.disconnect();
        cancelAnimationFrame(animationId);
        if (audioContext.state !== 'closed') {
            audioContext.close();
        }
    }
    isRunning = false;
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${minBrightness})`;
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
    
    // Continue processing
    animationId = requestAnimationFrame(processAudio);
}

// Initial state
overlay.style.backgroundColor = `rgba(0, 0, 0, ${minBrightness})`;

// Update the click handler to properly initialize and toggle
document.body.addEventListener('click', function() {
    if (!audioContext) {
        initAudioContext();
        statusElement.textContent = 'Audio ready. Click again to start microphone.';
    } else {
        toggleMicrophone();
    }
});