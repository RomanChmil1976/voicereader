let audioBlob;
let voices = [];
let recorder;
let chunks = [];

function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');
    voiceSelect.innerHTML = ''; // Clear existing options

    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speakText() {
    const text = document.getElementById('text').value;
    speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoice = voices[voiceSelect.value];
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    const volumeControl = document.getElementById('volumeControl');
    utterance.volume = volumeControl.value;

    console.log(`Speaking text: "${text}" with volume: ${utterance.volume}`);

    const audioContext = new AudioContext();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const sourceNode = audioContext.createMediaStreamSource(mediaStreamDestination.stream);
    sourceNode.connect(audioContext.destination);

    recorder = new MediaRecorder(mediaStreamDestination.stream);
    chunks = [];

    recorder.ondataavailable = function(event) {
        chunks.push(event.data);
    };

    recorder.onstop = function() {
        audioBlob = new Blob(chunks, { type: 'audio/webm' });
        console.log("Recording stopped. Blob size: ", audioBlob.size);
        chunks = [];
    };

    utterance.onstart = function() {
        recorder.start();
        console.log("Recording started");
    };

    utterance.onend = function() {
        if (recorder && recorder.state === "recording") {
            recorder.stop();
            console.log("Recording stopped");
        }
    };

    speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        console.log("Speech synthesis cancelled");
    }
    if (recorder && recorder.state === "recording") {
        recorder.stop();
        console.log("Recording stopped manually");
    }
}

function clearText() {
    stopSpeaking();
    const textArea = document.getElementById('text');
    textArea.value = '';
    console.log("Text cleared");
}

function saveAudio() {
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'speech.webm';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        console.log("Audio saved");
    } else {
        alert('Please speak the text first.');
        console.log("No audio to save");
    }
}

// Add event listeners to buttons
document.getElementById('speakButton').addEventListener('click', speakText);
document.getElementById('stopButton').addEventListener('click', stopSpeaking);
document.getElementById('clearButton').addEventListener('click', clearText);
