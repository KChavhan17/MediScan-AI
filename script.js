
async function scanMedicine() {
    const fileInput = document.getElementById('imageInput');
    const resultDiv = document.getElementById('result');
    
    // 1. Get or Ask for the API Key
    let API_KEY = localStorage.getItem('gemini_key');
    if (!API_KEY) {
        API_KEY = prompt("Enter your Gemini API Key:");
        if (API_KEY) {
            localStorage.setItem('gemini_key', API_KEY);
        } else {
            return;
        }
    }

    if (!fileInput.files[0]) {
        alert("Please select a photo first!");
        return;
    }

    resultDiv.innerHTML = "<b>Step 1: Fetching available models...</b>";

    try {
        // 2. THE DYNAMIC FETCH: This finds 1.5, 2.5, or 3.0 automatically
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const listData = await listResponse.json();
        
        if (listData.error) {
            throw new Error(listData.error.message);
        }

        // Filter the list to find a 'flash' model, or use the first one available
        const allModels = listData.models.map(m => m.name);
        const bestModel = allModels.find(name => name.includes('flash')) || allModels[0];

        resultDiv.innerHTML = `<b>Step 2: Using ${bestModel.split('/')[1]}... Analyzing...</b>`;

        // 3. Process the Image
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64Data = reader.result.split(',')[1];
            try {
                // 4. THE SCAN: Uses the model name we just fetched
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/${bestModel}:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: "Identify this medicine. Provide Name and Uses clearly." },
                                { inline_data: { mime_type: file.type, data: base64Data } }
                            ]
                        }]
                    })
                });

                const data = await res.json();
                
                if (data.error) {
                    resultDiv.innerHTML = `<span style="color:red">Error: ${data.error.message}</span>`;
                } else if (data.candidates) {
                    const aiText = data.candidates[0].content.parts[0].text;
                    resultDiv.innerHTML = `<strong>Scan Result:</strong><br>${aiText.replace(/\n/g, '<br>')}`;
                }
            } catch (error) {
                resultDiv.innerText = "Error during scan. Check connection.";
            }
        };

        reader.readAsDataURL(file);

    } catch (e) {
        resultDiv.innerHTML = `<span style="color:red">Failed to find models: ${e.message}</span>`;
        // If the key is bad, clear it so you can try again
        localStorage.removeItem('gemini_key');
    }
}







