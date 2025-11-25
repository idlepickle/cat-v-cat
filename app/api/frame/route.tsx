import { createFrames, Button } from "frames.js/next";
import { kv } from "@vercel/kv";

// Initialize frames.js starter kit
const frames = createFrames();

// Define the structure of data we get from TheCatAPI
interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
}

// Helper function to get 2 random cat images
async function getTwoRandomCats(): Promise<CatImage[]> {
  // We fetch 2 images. Using 'mime_types=jpg,png' to ensure static images.
  const res = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=2&mime_types=jpg,png",
    { cache: "no-store" } // Ensure fresh cats every time
  );
  if (!res.ok) {
    throw new Error("Failed to fetch cats");
  }
  return res.json();
}

// The main handler for GET and POST requests to this route
const handleRequest = frames(async (ctx) => {
  const LEADERBOARD_KEY = "cat_leaderboard";

  // ================================================================
  // STATE 1: HANDLE A VOTE (User clicked an image)
  // ================================================================
  // We know it's a vote if there is a message (button click) AND we have state passed from the previous frame
  if (ctx.message && ctx.state?.cat1 && ctx.state?.cat2) {
    const { cat1, cat2 } = ctx.state;
    // buttonIndex is 1-based. Index 1 = Left Image, Index 2 = Right Image
    const chosenCat = ctx.message.buttonIndex === 1 ? cat1 : cat2;
    const notChosenCat = ctx.message.buttonIndex === 1 ? cat2 : cat1;

    // 1. Increment score in Vercel KV sorted set.
    // We use the image URL as the unique member identifier.
    await kv.zincrby(LEADERBOARD_KEY, 1, chosenCat.url);

    // 2. Fetch current stats for the two cats in this match
    const chosenScore = await kv.zscore(LEADERBOARD_KEY, chosenCat.url) || 0;
    const notChosenScore = await kv.zscore(LEADERBOARD_KEY, notChosenCat.url) || 0;

    // 3. Fetch global top 3 leaderboard (zrevrange gets highest scores first)
    // withScores: true returns [member1, score1, member2, score2...]
    const rawTop3 = await kv.zrevrange(LEADERBOARD_KEY, 0, 2, { withScores: true });

    // 4. Render the "Results" UI
    return {
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a1a",
            color: "white",
            fontFamily: "sans-serif",
            padding: "20px",
          }}
        >
          <h1 style={{ fontSize: "40px", margin: "0 0 20px 0", color: "#FFD700" }}>
            Voted!
          </h1>

          {/* The Matchup Result */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
             {/* Left Cat Result */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={cat1.url} width="200" height="200" style={{ objectFit: "cover", borderRadius: "10px", border: cat1.id === chosenCat.id ? "4px solid #FFD700" : "none"}} />
              {cat1.id === chosenCat.id && <span style={{color: "#FFD700", fontSize: "24px", marginTop: "10px"}}>dis one ✓</span>}
              <span style={{fontSize: "20px", marginTop: "5px"}}>{cat1.id === chosenCat.id ? chosenScore : notChosenScore} Votes</span>
            </div>

             <span style={{ fontSize: "30px", fontWeight: "bold" }}>VS</span>

             {/* Right Cat Result */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={cat2.url} width="200" height="200" style={{ objectFit: "cover", borderRadius: "10px", border: cat2.id === chosenCat.id ? "4px solid #FFD700" : "none"}} />
              {cat2.id === chosenCat.id && <span style={{color: "#FFD700", fontSize: "24px", marginTop: "10px"}}>dis one ✓</span>}
              <span style={{fontSize: "20px", marginTop: "5px"}}>{cat2.id === chosenCat.id ? chosenScore : notChosenScore} Votes</span>
            </div>
          </div>

          {/* The Leaderboard Display */}
          <div style={{ backgroundColor: "#333", padding: "15px", borderRadius: "10px", width: "80%" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>🏆 All-Time Top 3</h2>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {/* We iterate by 2s because rawTop3 is [url, score, url, score...] */}
              {Array.from({ length: rawTop3.length / 2 }).map((_, i) => {
                  const url = rawTop3[i * 2] as string;
                  const score = rawTop3[i * 2 + 1] as number;
                  return (
                   <div key={url} style={{display: 'flex', flexDirection:'column', alignItems:'center'}}>
                       <img src={url} width="60" height="60" style={{objectFit:"cover", borderRadius:"50%"}}/>
                       <span>#{i+1}: {score} pts</span>
                   </div>
                  )
              })}
            </div>
          </div>
        </div>
      ),
      buttons: [
        // A button to start a new game. We don't pass state here, resetting the loop.
        <Button action="post">Play Again</Button>
      ],
    };
  }

  // ================================================================
  // STATE 2: INITIAL LOAD / NEW GAME
  // ================================================================
  // No vote happened yet, fetch fresh cats.
  try {
    const [cat1, cat2] = await getTwoRandomCats();

    return {
      // We embed the cat data into the state so it's available when the user clicks a button later.
      state: { cat1, cat2 },
      image: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#2b2b2b",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              fontStyle: "italic",
              color: "#FFD700",
              textShadow: "2px 2px 4px #000",
              marginBottom: "40px",
            }}
          >
            Cat v Cat
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "80%",
            }}
          >
            {/* Cat Image 1 styled container */}
            <div style={{ width: "300px", height: "300px", display: "flex", borderRadius: "15px", overflow: "hidden", border: "3px solid white" }}>
                <img src={cat1.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

            {/* VS Text styled */}
            <span
              style={{
                fontSize: "50px",
                fontWeight: "900",
                margin: "0 20px",
                color: "#FF4500",
              }}
            >
              VS
            </span>

            {/* Cat Image 2 styled container */}
            <div style={{ width: "300px", height: "300px", display: "flex", borderRadius: "15px", overflow: "hidden", border: "3px solid white"  }}>
               <img src={cat2.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      ),
      buttons: [
        // frames.js allows 4 buttons. We use the first two.
        // We set aspectRatio to 1:1 to make the buttons square, matching the image above them logically.
        // The label is empty because the image above serves as the visual label.
        <Button action="post" aspectRatio="1:1">👈 Vote Left</Button>,
        <Button action="post" aspectRatio="1:1">Vote Right 👉</Button>,
      ],
    };
  } catch (e) {
      // Basic error handling if CatAPI fails
      return {
          image: (<div>Error fetching cats. Try again.</div>),
          buttons: [<Button action="post">Retry</Button>]
      }
  }
});

export const GET = handleRequest;
export const POST = handleRequest;
