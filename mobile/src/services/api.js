// Default server URL - change this to your server's IP/domain
const API_URL = 'http://10.0.2.2:3000/api'; // Android emulator localhost

export async function register(username, password, publicKey) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password, publicKey }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  
  return data;
}

export async function login(username, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }
  
  return data;
}

export async function getUserPublicKey(username) {
  const response = await fetch(`${API_URL}/users/${username}/public-key`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to get public key');
  }
  
  return data;
}

export async function updatePublicKey(userId, publicKey, token) {
  const response = await fetch(`${API_URL}/users/public-key`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ userId, publicKey }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update public key');
  }
  
  return data;
}

export async function searchUsers(query) {
  const response = await fetch(`${API_URL}/users/search/${encodeURIComponent(query)}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Search failed');
  }
  
  return data;
}
