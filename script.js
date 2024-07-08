let audioBlob;
let voices = [];

function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');

    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang}) [${voice.gender || 'Unknown gender'}]`;
        voiceSelect.appendChild(option);
    });
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speakText() {
    const text = document.getElementById('text').value;
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
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
