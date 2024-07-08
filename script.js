let audioBlob;

function speakText() {
    const text = document.getElementById('text').value;
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';

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
