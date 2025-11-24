export const runtime = "edge";

export async function GET() {
  const res = await fetch(
    "https://api.thecatapi.com/v1/images/search?limit=2"
  );
  const cats = await res.json();

  return Response.json({
    a: { url: cats[0].url, id: cats[0].id },
    b: { url: cats[1].url, id: cats[1].id }
  });
}
