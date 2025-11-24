// api/image.js
import { ImageResponse } from '@vercel/og';
import { state } from './_store.js'; // keep this if you use your cat state

export const runtime = 'edge'; // ⚠️ top-level, required

export default function handler(req) {
  try {
    // Example: simple poll image
    const CAT_A = state.cats?.a;
    const CAT_B = state.cats?.b;

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

    // Full JSX layout for poll or results here...
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
  } catch (err) {
    console.error(err);
    return new Response('Server error: ' + err.message, { status: 500 });
  }
}
