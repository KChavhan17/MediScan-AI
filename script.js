async function scanMedicine() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    
    // This will ask for your key during the demo - Keeps it safe from bots!
    const API_KEY = prompt("Enter your Gemini API Key:");

    if (!API_KEY) {
        alert("API Key is required!");
        return;
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
            // Using v1beta as it is currently the most stable for mobile API calls
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
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
                resultDiv.innerHTML = `<span style="color:red">Error: ${data.error.message}</span>`;
            } else if (data.candidates) {
                const aiText = data.candidates[0].content.parts[0].text;
                resultDiv.innerHTML = `<strong>Result:</strong><br>${aiText.replace(/\n/g, '<br>')}`;
            }
        } catch (error) {
            resultDiv.innerText = "Connection error. Check internet.";
        }
    };

    reader.readAsDataURL(file);
}






