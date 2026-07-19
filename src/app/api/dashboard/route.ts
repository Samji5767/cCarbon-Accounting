export const dynamic = "force-static";

export async function GET() {
  return new Response(JSON.stringify({}), { status: 200 });
}
