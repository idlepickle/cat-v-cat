import { ImageResponse } from '@vercel/og';
import { state } from './_store.js';

export const runtime = 'edge';

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get('mode');
    const CAT_A = state.cats.a;
    const CAT_B = state.cats.b;

    if (!CAT_A || !CAT_B) throw new Error('Cats not loaded');

    if (mode === 'poll') {
      return new ImageResponse(
        <div style={styles.page}>
          <h1 style={styles.title}>Cat v Cat</h1>
          <div style={styles.row}>
            <div style={styles.col}><img src={CAT_A.url} width={300} height={300} /><p>{CAT_A.label}</p></div>
            <div style={styles.col}><img src={CAT_B.url} width={300} height={300} /><p>{CAT_B.label}</p></div>
          </div>
        </div>,
        { width: 800, height: 800 }
      );
    }

    // results mode
    const total = state.votes.a + state.votes.b;
    const pctA = total ? Math.round(state.votes.a / total * 100) : 0;
    const pctB = total ? Math.round(state.votes.b / total * 100) : 0;

    return new ImageResponse(
      <div style={styles.page}>
        <h1 style={styles.title}>Results</h1>
        <div style={styles.row}>
          <div style={styles.col}><img src={CAT_A.url} width={300} height={300} /><p>{pctA}%</p></div>
          <div style={styles.col}><img src={CAT_B.url} width={300} height={300} /><p>{pctB}%</p></div>
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

const styles = {
  page: { fontSize: 32, background: 'white', color: 'black', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  title: { fontSize: 50, marginBottom: 20 },
  row: { display: 'flex', gap: '40px' },
  col: { display: 'flex', flexDirection: 'column', alignItems: 'center' }
};
