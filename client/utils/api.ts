export async function apiFetch(url: string, options: any = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',  // For sending JSON
  };

  // If there's a body (JSON), stringify it
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for successful response
  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  // If expecting a binary response (e.g., audio), return a Blob
  if (options.responseType === 'blob') {
    return response.blob();
  }

  // Otherwise, return the JSON response
  return response.json();
}
