export async function fetchTwoCats() {
  const headers = {};
  if (process.env.CAT_API_KEY) {
    headers['x-api-key'] = process.env.CAT_API_KEY;
  }

  const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=2', { headers });
  const data = await res.json();

  return {
    a: { url: data[0].url, label: 'Cat A' },
    b: { url: data[1].url, label: 'Cat B' }
  };
}
