// Native fetch is available in Node 18+

async function testServer() {
    try {
        console.log("Testing connection to http://localhost:3000/api/analyze with model gemini-3.0-pro...");
        const response = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: "Say 'Hello from Gemini 3 Pro' if you are real.",
                generationConfig: { responseMimeType: "text/plain" }
            })
        });

        const data = await response.json();
        console.log("\n--- SERVER RESPONSE ---");
        console.log(data);
        console.log("-----------------------");

        if (data.text && data.text.includes("Simulation Mode")) {
            console.log("RESULT: ⚠️ FALLBACK DETECTED. The model 'gemini-3.0-pro' failed, so the server used Simulation Mode.");
        } else {
            console.log("RESULT: ✅ SUCCESS? Received a live response (or the simulation text didn't match the known fallback string).");
        }

    } catch (error) {
        console.error("Test Failed:", error.message);
    }
}

testServer();
