import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to a Supabase Storage bucket and return its public URL.
 * Assumes the bucket is Public. For Private buckets, use createSignedUrl instead.
 */
export async function uploadToBucket(
  bucket: "article_image" | "meditation_images" | "sounds_images",
  file: File,
  pathPrefix: string
): Promise<string> {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const ext = file.name.includes(".") ? file.name.split(".").pop() || "bin" : "bin";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const filePath = `${pathPrefix}/${clean(name)}.${clean(ext)}`;

  const { error: upErr } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (upErr) {
    throw upErr;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
