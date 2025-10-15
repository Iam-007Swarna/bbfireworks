// export const runtime = "nodejs";

// import { prisma } from "@/lib/prisma";

// export async function GET(_: Request, { params }: { params: { id: string } }) {
//   const row = await prisma.productImage.findUnique({ where: { id: params.id } });
//   if (!row) return new Response("Not found", { status: 404 });
//   return new Response(row.bytes, {
//     headers: {
//       "Content-Type": row.mime,
//       "Cache-Control": "public, max-age=31536000, immutable"
//     }
//   });
// }

export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await prisma.productImage.findUnique({
    where: { id },
    select: { bytes: true, mime: true },
  });
  if (!row) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(row.bytes), {
    headers: {
      "Content-Type": row.mime,
      // long cache for immutable images; DB id acts as content hash here
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
