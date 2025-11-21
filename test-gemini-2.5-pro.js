import fetch from 'node-fetch';

const apiKey = 'AIzaSyBwht67TzoIL1wp3PtsX15eHpxCuWv9_ag';

async function testGemini25Pro() {
  console.log('=== Testing Gemini 2.5 Pro API Call ===\n');

  try {
    console.log('Making API call to gemini-2.5-pro...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say hello and confirm you are Gemini 2.5 Pro' }]
          }]
        })
      }
    );

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ SUCCESS!\n');
      console.log('Model Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
      console.log('\nUsage Metadata:', JSON.stringify(data.usageMetadata, null, 2));
      console.log('\nModel Version:', data.modelVersion);
    } else {
      console.log('\n❌ FAILED!\n');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error('Error:', error.message);
  }
}

testGemini25Pro();
