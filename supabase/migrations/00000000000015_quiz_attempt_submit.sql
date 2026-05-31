-- Pengerjaan kuis oleh siswa: jaminan "sekali saja" + RPC scoring server-authoritative.
-- Scoring dihitung di dalam fungsi SECURITY DEFINER sehingga kunci jawaban
-- (quiz_questions.correct_answer) tidak perlu dikirim ke browser.

-- Sekali saja: satu attempt per (kuis, siswa).
alter table public.quiz_attempts
  add constraint quiz_attempts_quiz_student_unique unique (quiz_id, student_id);

create or replace function public.submit_quiz_attempt(
  p_quiz_id bigint,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_total int := 0;
  v_max int := 0;
  q record;
  v_correct boolean;
  v_student_answer jsonb;
  pair jsonb;
begin
  if public.current_user_role() <> 'siswa' then
    return jsonb_build_object('ok', false, 'error', 'Hanya siswa yang dapat mengerjakan kuis');
  end if;

  -- Sudah pernah mengerjakan → tolak (kuis sekali saja).
  if exists (
    select 1 from public.quiz_attempts
    where quiz_id = p_quiz_id and student_id = v_uid
  ) then
    return jsonb_build_object('ok', false, 'error', 'Kuis ini sudah pernah dikerjakan');
  end if;

  for q in
    select id, question_type, correct_answer, score_weight
    from public.quiz_questions
    where quiz_id = p_quiz_id
  loop
    v_max := v_max + q.score_weight;
    v_correct := false;

    case q.question_type
      when 'pilihan_ganda' then
        v_correct := (p_answers ->> q.id::text) = q.correct_answer;
      when 'benar_salah' then
        v_correct := (p_answers ->> q.id::text) = q.correct_answer;
      when 'isian' then
        v_correct := lower(trim(coalesce(p_answers ->> q.id::text, '')))
                     = lower(trim(q.correct_answer));
      when 'mencocokkan' then
        -- correct_answer = JSON array [{left,right}]; jawaban siswa = objek {<left>:<chosenRight>}.
        v_student_answer := p_answers -> q.id::text;
        v_correct := true;
        if v_student_answer is null or jsonb_typeof(v_student_answer) <> 'object' then
          v_correct := false;
        else
          for pair in select * from jsonb_array_elements(q.correct_answer::jsonb)
          loop
            if (v_student_answer ->> (pair ->> 'left')) is distinct from (pair ->> 'right') then
              v_correct := false;
              exit;
            end if;
          end loop;
        end if;
    end case;

    if v_correct then
      v_total := v_total + q.score_weight;
    end if;
  end loop;

  insert into public.quiz_attempts
    (quiz_id, student_id, answers, total_score, max_score, completed_at)
  values
    (p_quiz_id, v_uid, p_answers, v_total, v_max, now());

  return jsonb_build_object('ok', true, 'total_score', v_total, 'max_score', v_max);
end;
$$;

revoke all on function public.submit_quiz_attempt(bigint, jsonb) from public;
grant execute on function public.submit_quiz_attempt(bigint, jsonb) to authenticated;
