const axios = require('axios');

const API_URL = 'https://book-locator-api.vercel.app/api';

async function debugProfile() {
  try {
    // 1. Register a random user
    const email = `debug_${Date.now()}@test.com`;
    const password = 'password123';
    const name = 'Debug User';
    
    console.log('Registering user:', email);
    
    const registerRes = await axios.post(`${API_URL}/readers/register`, {
      name,
      email,
      password,
      location: 'Test City'
    });
    
    const token = registerRes.data.token;
    console.log('Registration successful, token received.');

    // 2. Try to update profile with EMPTY city
    // The user's screenshot shows "City, Country" placeholder, so maybe they sent empty string?
    const updatePayload = {
      name: 'Updated Name',
      city: '', // Empty string
      image: '',
    };
    
    console.log('Updating profile with payload:', updatePayload);
    
    const updateRes = await axios.put(`${API_URL}/readers/profile`, updatePayload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Update successful:', updateRes.data);

  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

debugProfile();
