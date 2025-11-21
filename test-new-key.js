import fetch from 'node-fetch';

const apiKey = 'AIzaSyBjqLussUsQFRQnnnZAd-skkWRHCC2LTi0';

async function testGemini3Pro() {
  console.log('=== Testing Gemini 3 Pro Preview with new API key ===\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say hello' }]
          }]
        })
      }
    );

    console.log('Status:', response.status);
    const data = await response.json();

    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
    } else {
      console.log('❌ FAILED!');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testGemini3Pro();
