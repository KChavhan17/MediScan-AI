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
            // Using the 2026 Stable V1 URL and Gemini 2.5 Flash
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Identify this medicine. List name and primary uses." },
                            { inline_data: { mime_type: file.type, data: base64Data } }
                        ]
                    }]
                })
            });

            const data = await response.json();
            
            if (data.error) {
                // This tells us the exact error from Google
                resultDiv.innerHTML = `<span style="color:red">Error: ${data.error.message}</span>`;
            } else if (data.candidates && data.candidates[0].content.parts[0].text) {
                const aiText = data.candidates[0].content.parts[0].text;
                resultDiv.innerHTML = `<strong>Scan Result:</strong><br>${aiText.replace(/\n/g, '<br>')}`;
            } else {
                resultDiv.innerText = "No medicine detected. Try a clearer photo.";
            }

        } catch (error) {
            resultDiv.innerText = "Connection error. Check internet.";
        }
    };

    reader.readAsDataURL(fileInput.files[0]);
}





