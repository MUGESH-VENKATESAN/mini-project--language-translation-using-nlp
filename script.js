const main_url = 'https://api.mymemory.translated.net/get?q=';

// Select DOM elements
const startRecordBtn = document.getElementById('startRecord');
const stopRecordBtn = document.getElementById('stopRecord');
const translateFromTXTArea = document.getElementById('translateFromTXTArea');
const translateToTXTArea = document.getElementById('translateToTXTArea');
const languagesFrom = document.getElementById('languagesFrom');
const languagesTo = document.getElementById('languagesTo');
const btn = document.querySelector('.btn');
const icon = document.getElementById('icon');
const closeBtn = document.getElementById('close');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];
let recognition;
let isRecording = false;

// Check if SpeechRecognition API is available
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = languagesFrom.value;
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const transcript = Array.from(event.results).map(result => result[0].transcript).join('');
        translateFromTXTArea.value = transcript;

        if (event.results[0].isFinal) {
            translateText(transcript);
        }
    };

    recognition.onend = () => {
        if (isRecording) recognition.start();
    };
}

startRecordBtn.addEventListener('click', () => {
    if (recognition) {
        isRecording = true;
        recognition.lang = languagesFrom.value;
        recognition.start();
        startRecordBtn.classList.add('hidden');
        stopRecordBtn.classList.remove('hidden');
    } else {
        alert("Speech Recognition not supported in this browser.");
    }
});

stopRecordBtn.addEventListener('click', () => {
    if (recognition) {
        isRecording = false;
        recognition.stop();
        startRecordBtn.classList.remove('hidden');
        stopRecordBtn.classList.add('hidden');
    }
});

// Function to translate text using an API
function translateText(text) {
    const translateFrom = languagesFrom.value;
    const translateTo = languagesTo.value;

    fetch(`${main_url}${encodeURIComponent(text)}&langpair=${translateFrom}|${translateTo}`)
        .then(response => response.json())
        .then(data => {
            translateToTXTArea.value = data.responseData.translatedText;
        })
        .catch(error => console.error("Error translating text:", error));
}

// Trigger translation on button click
btn.addEventListener('click', () => {
    translateText(translateFromTXTArea.value);
});

// Voice recording functionality
startRecordBtn.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                audioPlayback.src = audioUrl;
                audioPlayback.classList.remove('hidden');
            });

            startRecordBtn.classList.add('hidden');
            stopRecordBtn.classList.remove('hidden');
        })
        .catch(error => console.error("Error accessing microphone:", error));
});

stopRecordBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    startRecordBtn.classList.remove('hidden');
    stopRecordBtn.classList.add('hidden');
});

// Clear input and translation on close button click
closeBtn.addEventListener('click', () => {
    translateFromTXTArea.value = '';
    translateToTXTArea.value = '';
    closeBtn.classList.add('hidden');
    translateToTXTArea.setAttribute("placeholder", "Translation");
});

// Enable close button when input field has text
translateFromTXTArea.addEventListener("keyup", () => {
    if (translateFromTXTArea.value) {
        closeBtn.classList.remove('hidden');
    } else {
        closeBtn.classList.add('hidden');
    }
});

// Swap languages and text areas on icon click
icon.addEventListener("click", () => {
    const tempText = translateFromTXTArea.value;
    translateFromTXTArea.value = translateToTXTArea.value;
    translateToTXTArea.value = tempText;

    const tempLang = languagesTo.value;
    languagesTo.value = languagesFrom.value;
    languagesFrom.value = tempLang;
});

// Auto-translate when Enter key is pressed
translateFromTXTArea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        translateText(translateFromTXTArea.value);
    }
});
