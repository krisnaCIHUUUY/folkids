-- Fungsi badge hanya dipanggil oleh trigger internal (eksekusi trigger tak
-- memerlukan privilege EXECUTE). Cabut akses RPC dari anon & authenticated agar
-- tak ter-ekspos di PostgREST.
revoke all on function public.evaluate_badges(uuid) from anon, authenticated;
revoke all on function public.trg_eval_badges() from public, anon, authenticated;
