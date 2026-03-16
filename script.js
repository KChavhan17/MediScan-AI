async function scanMedicine() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    
    // 1. Check if the key is already saved on your phone
    let API_KEY = localStorage.getItem('gemini_key');

    // 2. If no key, ask for it
    if (!API_KEY) {
        API_KEY = prompt("Enter your Gemini API Key (This will be saved on your phone):");
        if (API_KEY) {
            localStorage.setItem('gemini_key', API_KEY);
        } else {
            alert("API Key is required to scan!");
            return;
        }
    }

    if (!fileInput.files[0]) {
        alert("Please select a photo first!");
        return;
    }

    resultDiv.innerHTML = "<b>AI is analyzing... Please wait.</b>";
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        try {
            // Using the most stable URL for 2026
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Identify this medicine. List name and uses clearly." },
                            { inline_data: { mime_type: file.type, data: base64Data } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                // If the key is bad, delete it so you can enter a new one next time
                if (data.error.message.includes("API_KEY_INVALID") || data.error.message.includes("expired")) {
                    localStorage.removeItem('gemini_key');
                }
                resultDiv.innerHTML = `<span style="color:red">Error: ${data.error.message}</span>`;
            } else if (data.candidates && data.candidates[0].content.parts[0].text) {
                const aiText = data.candidates[0].content.parts[0].text;
                resultDiv.innerHTML = `<strong>Result:</strong><br>${aiText.replace(/\n/g, '<br>')}`;
            } else {
                resultDiv.innerText = "Could not identify medicine. Try a clearer photo.";
            }
        } catch (error) {
            resultDiv.innerText = "Connection error. Check your internet.";
        }
    };
    reader.readAsDataURL(file);
}

// Quick tip: If you want to change the key, you can clear it by calling localStorage.clear() in the console.







