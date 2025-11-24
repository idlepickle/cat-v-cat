import { state } from './_store.js';
import { fetchTwoCats } from './fetchCats.js';

export default async function handler(req, res) {
  const today = new Date().toISOString().slice(0,10);

  if (state.lastRotation !== today) {
    const newCats = await fetchTwoCats();
    state.cats = newCats;
    state.votes = { a:0, b:0 };
    state.lastRotation = today;
  }

  res.json({
    version: 'vNext',
    image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?mode=poll`,
    buttons: [
      { label:'Vote Cat A', action: { type:'post', target:`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote?cat=a` } },
      { label:'Vote Cat B', action: { type:'post', target:`${process.env.NEXT_PUBLIC_BASE_URL}/api/vote?cat=b` } }
    ]
  });
}
