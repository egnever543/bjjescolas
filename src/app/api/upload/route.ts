import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Bucket do Supabase Storage onde as fotos ficam. Precisa existir e ser público.
const BUCKET = "alunos";
// Limite abaixo do teto de request da Vercel (~4.5MB).
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Storage não configurado (defina SUPABASE_URL e SUPABASE_SECRET_KEY)." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie um arquivo de imagem" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Imagem muito grande (máx 4MB)" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
      "Content-Type": file.type,
      "x-upsert": "false",
    },
    body: Buffer.from(await file.arrayBuffer()),
  });

  if (!uploadRes.ok) {
    const detail = await uploadRes.text();
    return NextResponse.json(
      { error: `Falha no upload: ${detail || uploadRes.statusText}` },
      { status: 500 }
    );
  }

  const url = `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${path}`;
  return NextResponse.json({ url });
}
