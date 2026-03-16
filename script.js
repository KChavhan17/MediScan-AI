const API_KEY = "AIzaSyDvyx6XLrG1i67RWHcry-_-zDm2mBOpNek";

async function scanMedicine() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    
    if (!fileInput.files[0]) {
        alert("Please select a medicine photo first!");
        return;
    }

    resultDiv.innerHTML = "<b>AI is analyzing... Please wait.</b>";

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Identify this medicine. List: 1. Name 2. Uses 3. Dosage 4. Side Effects. Keep it short." },
                            { inline_data: { mime_type: file.type, data: base64Data } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            
            // This checks if the API returned an error message
            if (data.error) {
                resultDiv.innerText = "API Error: " + data.error.message;
            } else {
                const textResponse = data.candidates[0].content.parts[0].text;
                resultDiv.innerText = textResponse;
            }
        } catch (error) {
            resultDiv.innerText = "Connection error. Please try again.";
        }
    };

    reader.readAsDataURL(file);
}

