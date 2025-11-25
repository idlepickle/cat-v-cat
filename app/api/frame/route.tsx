// ADDED: Explicit React import to fix JSX syntax error
import React from "react";
import { createFrames, Button } from "frames.js/next";
import { kv } from "@vercel/kv";

// 1. We add '[key: string]: any' to satisfy the JSON requirements
interface CatImage {
  id: string;
  url: string;
  width: number;
  height: number;
  [key: string]: any; 
}

// 2. Define the State structure explicitly
type State = {
  cat1: CatImage | null;
  cat2: CatImage | null;
}

// 3. Initialize frames with the State type and initial values
const frames = createFrames<State>({
  initialState: {
    cat1: null,
    cat2: null
  }
});

async function getTwoRandomCats(): Promise<CatImage[]> {
  const res = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=2&mime_types=jpg,png",
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch cats");
  }
  return res.json();
}

const handleRequest = frames(async (ctx) => {
  const LEADERBOARD_KEY = "cat_leaderboard";

  // ================================================================
  // STATE 1: HANDLE A VOTE
  // ================================================================
  if (ctx.message && ctx.state.cat1 && ctx.state.cat2) {
    const { cat1, cat2 } = ctx.state;
    const chosenCat = ctx.message.buttonIndex === 1 ? cat1 : cat2;
    const notChosenCat = ctx.message.buttonIndex === 1 ? cat2 : cat1;

    await kv.zincrby(LEADERBOARD_KEY, 1, chosenCat.url);

    const chosenScore = await kv.zscore(LEADERBOARD_KEY, chosenCat.url) || 0;
    const notChosenScore = await kv.zscore(LEADERBOARD_KEY, notChosenCat.url) || 0;
    //const rawTop3 = await kv.zrevrange(LEADERBOARD_KEY, 0, 2, { withScores: true });
    const rawTop3 = await kv.zrange(LEADERBOARD_KEY, 0, 2, { withScores: true, rev: true });

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

          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={cat1.url} width="200" height="200" style={{ objectFit: "cover", borderRadius: "10px", border: cat1.id === chosenCat.id ? "4px solid #FFD700" : "none"}} />
              {cat1.id === chosenCat.id && <span style={{color: "#FFD700", fontSize: "24px", marginTop: "10px"}}>dis one ✓</span>}
              <span style={{fontSize: "20px", marginTop: "5px"}}>{cat1.id === chosenCat.id ? chosenScore : notChosenScore} Votes</span>
            </div>

             <span style={{ fontSize: "30px", fontWeight: "bold" }}>VS</span>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={cat2.url} width="200" height="200" style={{ objectFit: "cover", borderRadius: "10px", border: cat2.id === chosenCat.id ? "4px solid #FFD700" : "none"}} />
              {cat2.id === chosenCat.id && <span style={{color: "#FFD700", fontSize: "24px", marginTop: "10px"}}>dis one ✓</span>}
              <span style={{fontSize: "20px", marginTop: "5px"}}>{cat2.id === chosenCat.id ? chosenScore : notChosenScore} Votes</span>
            </div>
          </div>

          <div style={{ backgroundColor: "#333", padding: "15px", borderRadius: "10px", width: "80%" }}>
            <h2 style={{ textAlign: "center", margin: "0 0 10px 0" }}>🏆 All-Time Top 3</h2>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
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
        <Button action="post">Play Again</Button>
      ],
    };
  }

  // ================================================================
  // STATE 2: INITIAL LOAD / NEW GAME
  // ================================================================
  try {
    const [cat1, cat2] = await getTwoRandomCats();

    return {
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
            <div style={{ width: "300px", height: "300px", display: "flex", borderRadius: "15px", overflow: "hidden", border: "3px solid white" }}>
                <img src={cat1.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>

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

            <div style={{ width: "300px", height: "300px", display: "flex", borderRadius: "15px", overflow: "hidden", border: "3px solid white"  }}>
               <img src={cat2.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
        </div>
      ),
      buttons: [
        <Button action="post">👈 Vote Left</Button>,
        <Button action="post">Vote Right 👉</Button>,
      ],
    };
  } catch (e) {
      return {
          image: (<div>Error fetching cats. Try again.</div>),
          buttons: [<Button action="post">Retry</Button>]
      }
  }
});

export const GET = handleRequest;
export const POST = handleRequest;
