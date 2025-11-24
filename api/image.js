// api/image.js
import { ImageResponse } from '@vercel/og';
import { state } from './_store.js'; // make sure this exists
// import { fetchTwoCats } from './fetchCats.js'; // optional if needed

export const runtime = 'edge'; // ⚠️ must be top-level for Vercel

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');

    const CAT_A = state.cats?.a;
    const CAT_B = state.cats?.b;

    // If cats not loaded yet, show placeholder
    if (!CAT_A || !CAT_B) {
      return new ImageResponse(
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            background: 'white',
            color: 'black',
          }}
        >
          Loading cats...
        </div>,
        { width: 800, height: 800 }
      );
    }

    if (mode === 'poll') {
      return new ImageResponse(
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            fontSize: 32,
            background: 'white',
            color: 'black',
          }}
        >
          <h1 style={{ fontSize: 50 }}>Cat v Cat</h1>
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={CAT_A.url} width={300} height={300} />
              <p>{CAT_A.label}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <img src={CAT_B.url} width={300} height={300} />
              <p>{CAT_B.label}</p>
            </div>
          </div>
        </div>,
        { width: 800, height: 800 }
      );
    }

    // results mode
    const total = (state.votes?.a || 0) + (state.votes?.b || 0);
    const pctA = total ? Math.round((state.votes.a / total) * 100) : 0;
    const pctB = total ? Math.round((state.votes.b / total) * 100) : 0;

    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          fontSize: 32,
          background: 'white',
          color: 'black',
        }}
      >
        <h1 style={{ fontSize: 50 }}>Results</h1>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={CAT_A.url} width={300} height={300} />
            <p>{pctA}%</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src={CAT_B.url} width={300} height={300} />
            <p>{pctB}%</p>
          </div>
        </div>
        <p>{total} votes</p>
      </div>,
      { width: 800, height: 800 }
    );
  } catch (err) {
    console.error(err);
    return new Response('Server error: ' + err.message, { status: 500 });
  }
}
