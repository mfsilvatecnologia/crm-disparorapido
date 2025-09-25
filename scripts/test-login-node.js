const fetch = require('node-fetch');

async function testLogin() {
  const payload = {
    email: 'joao@leadsrapido.com.br',
    password: 'password123'
  };

  console.log('Testing login with payload:', payload);

  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response data:', data);

  } catch (error) {
    console.error('Error:', error);
  }
}

testLogin();
