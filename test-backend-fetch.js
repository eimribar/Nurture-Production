// Exact copy of what the backend should be doing
import dotenv from 'dotenv';
dotenv.config({ path: '/Users/eimribar/nurture/packages/backend/.env' });

const apiKey = process.env.GEMINI_API_KEY;

console.log('API Key from .env:', apiKey);
console.log('API Key length:', apiKey?.length);

async function testQuickTips() {
  console.log('\n=== Testing Quick Tips (same as backend) ===\n');

  const prompt = `Provide 3 quick, general tips for soothing a crying baby.
Be concise and practical. Return as a JSON array of strings.
Example: ["Tip 1", "Tip 2", "Tip 3"]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=${apiKey}`;

  console.log('URL:', url.replace(apiKey, 'HIDDEN'));

  const body = JSON.stringify({
    contents: [{
      parts: [{ text: prompt }]
    }]
  });

  console.log('Request body:', body.substring(0, 200) + '...');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

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

testQuickTips();
