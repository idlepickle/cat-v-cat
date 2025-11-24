import { state } from './_store.js';

export default async function handler(req, res) {
  try {
    const cat = req.query.cat; // Vercel automatically parses query parameters
    if (cat === 'a' || cat === 'b') {
      state.votes[cat] += 1;
    }
    res.json({
      version: 'vNext',
      image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/image?mode=results`,
      buttons: [
        {
          label: 'Vote Again',
          action: {
            type: 'post',
            target: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`
          }
        }
      ]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
