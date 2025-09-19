// Check for browser support for the Web Speech API
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
    alert("Sorry, your browser does not support Speech Recognition. Please try Google Chrome.");
} else {
    // --- DOM ELEMENTS ---
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const languageSelect = document.getElementById('language');
    const notesArea = document.getElementById('notes');
    const status = document.getElementById('status');
    const copyButton = document.getElementById('copyButton');
    const clearButton = document.getElementById('clearButton');
    const translateButton = document.getElementById('translateButton');
    const translateToSelect = document.getElementById('translateTo');
    const translatedNotesArea = document.getElementById('translatedNotes');

    // --- SPEECH RECOGNITION SETUP ---
    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening even after a pause
    recognition.interimResults = true; // Show results as they are recognized
    
    let finalTranscript = '';

    recognition.onstart = () => {
        status.textContent = "Status: Recording... Speak now!";
        startButton.disabled = true;
        stopButton.disabled = false;
    };

    recognition.onerror = (event) => {
        status.textContent = `Error occurred in recognition: ${event.error}`;
    };

    recognition.onend = () => {
        status.textContent = "Status: Idle";
        startButton.disabled = false;
        stopButton.disabled = true;
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        notesArea.value = finalTranscript + interimTranscript;
    };

    // --- EVENT LISTENERS ---
    startButton.addEventListener('click', () => {
        finalTranscript = notesArea.value; // Allow appending to existing text
        recognition.lang = languageSelect.value;
        try {
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            status.textContent = "Error: Could not start recording. Another recording might be active.";
        }
    });

    stopButton.addEventListener('click', () => {
        recognition.stop();
    });

    copyButton.addEventListener('click', () => {
        notesArea.select();
        document.execCommand('copy');
        alert('Notes copied to clipboard!');
    });
    
    clearButton.addEventListener('click', () => {
        notesArea.value = '';
        translatedNotesArea.value = '';
        finalTranscript = '';
    });

    // --- TRANSLATION FUNCTIONALITY ---
    translateButton.addEventListener('click', async () => {
        const textToTranslate = notesArea.value;
        const sourceLang = languageSelect.value.split('-')[0]; // e.g., 'en-IN' -> 'en'
        const targetLang = translateToSelect.value;

        if (!textToTranslate.trim()) {
            alert("There's nothing to translate!");
            return;
        }

        translatedNotesArea.value = "Translating...";

        // Using the free MyMemory API for translation
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${sourceLang}|${targetLang}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.responseStatus === 200) {
                translatedNotesArea.value = data.responseData.translatedText;
            } else {
                translatedNotesArea.value = `Error: ${data.responseDetails}`;
            }
        } catch (error) {
            console.error("Translation API error:", error);
            translatedNotesArea.value = "Could not connect to the translation service.";
        }
    });
}
