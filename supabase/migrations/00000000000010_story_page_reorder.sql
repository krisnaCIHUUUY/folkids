-- RPC untuk menukar urutan (page_number) dua halaman cerita secara atomik.
-- unique(story_id, page_number) membuat swap langsung bentrok di tengah proses,
-- jadi salah satu baris dipindah ke nilai sementara (-1) dulu.
-- security invoker → RLS story_pages (kepemilikan story) tetap berlaku.

create or replace function public.reorder_story_page(
  p_page_id bigint,
  p_direction text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_story_id bigint;
  v_page_number int;
  v_neighbor_id bigint;
  v_neighbor_number int;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'Arah tidak valid: %', p_direction;
  end if;

  select story_id, page_number
    into v_story_id, v_page_number
  from public.story_pages
  where id = p_page_id;

  if not found then
    return;
  end if;

  select id, page_number
    into v_neighbor_id, v_neighbor_number
  from public.story_pages
  where story_id = v_story_id
    and page_number = case
      when p_direction = 'up' then v_page_number - 1
      else v_page_number + 1
    end;

  -- Tidak ada tetangga (sudah di ujung) → no-op.
  if not found then
    return;
  end if;

  update public.story_pages set page_number = -1 where id = p_page_id;
  update public.story_pages set page_number = v_page_number where id = v_neighbor_id;
  update public.story_pages set page_number = v_neighbor_number where id = p_page_id;
end;
$$;

revoke all on function public.reorder_story_page(bigint, text) from public;
grant execute on function public.reorder_story_page(bigint, text) to authenticated;
