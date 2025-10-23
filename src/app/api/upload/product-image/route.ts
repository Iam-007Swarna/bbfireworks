// export const runtime = "nodejs"; // prisma/sharp need node runtime

// import { prisma } from "@/lib/prisma";
// import sharp from "sharp";

// export async function POST(req: Request) {
//   const form = await req.formData();
//   const file = form.get("file") as File | null;
//   const productId = (form.get("productId") as string) ?? "";
//   if (!file || !productId) return new Response("Bad request", { status: 400 });

//   const buf = Buffer.from(await file.arrayBuffer());
//   const webp = await sharp(buf).webp({ quality: 82 }).toBuffer();
//   const meta = await sharp(webp).metadata();

//   const row = await prisma.productImage.create({
//     data: {
//       productId,
//       mime: "image/webp",
//       width: meta.width ?? 0,
//       height: meta.height ?? 0,
//       bytes: webp
//     }
//   });

//   return Response.json({ id: row.id });
// }

export const runtime = "nodejs"; // Prisma + sharp need Node runtime

import { auth } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import sharp from "sharp";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"]);

export async function POST(req: Request) {
  // RBAC: only admin/member can upload
  const session = await auth();
  const role = session?.user?.role;
  if (!session || !role || !["admin", "member"].includes(role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const productId = (form.get("productId") as string) ?? "";

  if (!file || !productId) {
    return new Response("Bad request", { status: 400 });
  }

  // basic product existence check
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return new Response("Product not found", { status: 404 });

  // validate file
  const inType = (file.type || "").toLowerCase();
  if (!ALLOWED.has(inType)) {
    return new Response("Unsupported file type", { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return new Response("File too large (max 4MB)", { status: 413 });
  }

  // convert → WEBP, cap width for perf, keep reasonable quality
  const inputBuf = Buffer.from(await file.arrayBuffer());
  const pipeline = sharp(inputBuf, { failOn: "none" }).rotate(); // honor EXIF
  const meta = await pipeline.metadata();

  const resized = await pipeline
    .resize({ width: 1600, withoutEnlargement: true }) // big enough for product page
    .webp({ quality: 82 })
    .toBuffer();

  const outMeta = await sharp(resized).metadata();

  const row = await prisma.productImage.create({
    data: {
      productId,
      mime: "image/webp",
      width: outMeta.width ?? meta.width ?? 0,
      height: outMeta.height ?? meta.height ?? 0,
      bytes: Uint8Array.from(resized),
    },
  });

  // (Optional) If you want a tiny thumbnail too, you can create another row here:
  // const thumb = await sharp(resized).resize({ width: 240 }).toBuffer();
  // await prisma.productImage.create({ data: { productId, mime: "image/webp", width: 240, height: Math.round((outMeta.height??0)*(240/(outMeta.width??1))), bytes: thumb } });

  return Response.json({ id: row.id });
}
