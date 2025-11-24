import { state } from './_store.js';

export default async function handler(req, res) {
  const url = new URL(req.url);
  const cat = url.searchParams.get('cat');

  if (cat==='a'||cat==='b') state.votes[cat] += 1;

  res.json({
    version:'vNext',
    image:`${process.env.NEXT_PUBLIC_BASE_URL}/api/image?mode=results`,
    buttons:[{ label:'Vote Again', action:{ type:'post', target:`${process.env.NEXT_PUBLIC_BASE_URL}/api/frame` }}]
  });
}
