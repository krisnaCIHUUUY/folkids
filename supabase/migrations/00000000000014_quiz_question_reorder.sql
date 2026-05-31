-- RPC untuk menukar urutan (order_number) dua soal kuis secara atomik.
-- unique(quiz_id, order_number) membuat swap langsung bentrok di tengah proses,
-- jadi salah satu baris dipindah ke nilai sementara (-1) dulu.
-- security invoker → RLS quiz_questions (kepemilikan kuis lewat cerita) tetap berlaku.
-- Pola identik dengan reorder_story_page (migrasi 010).

create or replace function public.reorder_quiz_question(
  p_question_id bigint,
  p_direction text
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_quiz_id bigint;
  v_order_number int;
  v_neighbor_id bigint;
  v_neighbor_number int;
begin
  if p_direction not in ('up', 'down') then
    raise exception 'Arah tidak valid: %', p_direction;
  end if;

  select quiz_id, order_number
    into v_quiz_id, v_order_number
  from public.quiz_questions
  where id = p_question_id;

  if not found then
    return;
  end if;

  select id, order_number
    into v_neighbor_id, v_neighbor_number
  from public.quiz_questions
  where quiz_id = v_quiz_id
    and order_number = case
      when p_direction = 'up' then v_order_number - 1
      else v_order_number + 1
    end;

  -- Tidak ada tetangga (sudah di ujung) → no-op.
  if not found then
    return;
  end if;

  update public.quiz_questions set order_number = -1 where id = p_question_id;
  update public.quiz_questions set order_number = v_order_number where id = v_neighbor_id;
  update public.quiz_questions set order_number = v_neighbor_number where id = p_question_id;
end;
$$;

revoke all on function public.reorder_quiz_question(bigint, text) from public;
grant execute on function public.reorder_quiz_question(bigint, text) to authenticated;
