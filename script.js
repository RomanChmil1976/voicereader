let audioBlob;
let voices = [];
let utterance;

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
    utterance = new SpeechSynthesisUtterance(text);
    const voiceSelect = document.getElementById('voiceSelect');
    const selectedVoice = voices[voiceSelect.value];

    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    const audioContext = new AudioContext();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();
    const source = audioContext.createMediaElementSource(new Audio());
    source.connect(mediaStreamDestination);
    source.connect(audioContext.destination);

    const recorder = new MediaRecorder(mediaStreamDestination.stream);
    let chunks = [];

    recorder.ondataavailable = function(event) {
        chunks.push(event.data);
    };

    recorder.onstop = function() {
        audioBlob = new Blob(chunks, { type: 'audio/mp3' });
        chunks = [];
    };

    utterance.onstart = function() {
        recorder.start();
    };

    utterance.onend = function() {
        recorder.stop();
    };

    speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
}

function clearText() {
    stopSpeaking();
    const textArea = document.getElementById('text');
    textArea.value = '';
}

function saveAudio() {
    if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'speech.mp3';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    } else {
        alert('Please speak the text first.');
    }
}

// Add event listeners to buttons
document.getElementById('speakButton').addEventListener('click', speakText);
document.getElementById('stopButton').addEventListener('click', stopSpeaking);
document.getElementById('clearButton').addEventListener('click', clearText);
