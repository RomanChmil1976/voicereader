let audioBlob;

function speakText() {
    const text = document.getElementById('text').value;
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = 'en-US';

    const mediaStream = new MediaStream();
    const audioContext = new AudioContext();
    const mediaStreamDestination = audioContext.createMediaStreamDestination();

    utterance.onstart = function() {
        const audioInput = audioContext.createMediaElementSource(speechSynthesis.speak(utterance));
        audioInput.connect(mediaStreamDestination);
        audioInput.connect(audioContext.destination);
        mediaStream.addTrack(mediaStreamDestination.stream.getAudioTracks()[0]);

        const recorder = new RecordRTC(mediaStream, {
            type: 'audio',
            mimeType: 'audio/mp3'
        });

        recorder.startRecording();

        utterance.onend = function() {
            recorder.stopRecording(function() {
                audioBlob = recorder.getBlob();
            });
        };
    };
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
