import fetch from 'node-fetch';

const apiKey = 'AIzaSyBwht67TzoIL1wp3PtsX15eHpxCuWv9_ag';

// Test 1: List available models
async function listModels() {
  console.log('\n=== Testing: List Available Models ===');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await response.json();

    if (!response.ok) {
      console.log('Error:', JSON.stringify(data, null, 2));
      return;
    }

    console.log('Available models:');
    data.models
      .filter(m => m.name.includes('gemini'))
      .forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
      });
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

// Test 2: Direct REST API call to gemini-2.5-flash
async function testGemini25Flash() {
  console.log('\n=== Testing: Direct REST API call to gemini-2.5-flash ===');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 3: Try gemini-2.0-flash for comparison
async function testGemini20Flash() {
  console.log('\n=== Testing: Direct REST API call to gemini-2.0-flash-exp ===');
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
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

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  await listModels();
  await testGemini25Flash();
  await testGemini20Flash();
}

runTests().catch(console.error);
