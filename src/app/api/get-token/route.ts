import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { getToken } = auth();

  const template = "test";

  const token = await getToken({ template });

  return Response.json({ token });
}
