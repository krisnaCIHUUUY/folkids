import DOMPurify from "isomorphic-dompurify";

// Tag yang diizinkan untuk konten cerita berformat (editor TipTap).
const ALLOWED_TAGS = ["p", "br", "strong", "em", "b", "i", "h2", "ul", "ol", "li"];

// Apakah string tampak mengandung markup HTML (untuk membedakan konten lama
// teks-polos dari konten baru berformat).
export function isHtml(s: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(s);
}

// Sanitasi HTML konten sebelum dirender (buang tag/atribut di luar whitelist —
// mencegah XSS dari konten tersimpan).
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: [] });
}

// Buang seluruh tag → teks polos, untuk preview ringkas di daftar halaman CMS.
export function stripHtml(s: string): string {
  return s
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
