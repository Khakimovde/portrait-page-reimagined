ALTER TABLE public.lootzy_withdrawals ADD COLUMN IF NOT EXISTS created_by_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.lootzy_admin_withdraw(p_actor bigint, p_action text, p_id uuid, p_target bigint, p_amount bigint, p_method text, p_destination text, p_status text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE w public.lootzy_withdrawals;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF p_action = 'create' THEN
    IF p_target IS NULL OR p_target <= 0 THEN RAISE EXCEPTION 'Foydalanuvchi ID sini kiriting'; END IF;
    IF p_amount IS NULL OR p_amount < 1 THEN RAISE EXCEPTION 'Summani kiriting'; END IF;
    IF p_method IS NULL OR p_method NOT IN ('visa','btc','ltc','doge','uzcard','humo') THEN RAISE EXCEPTION 'To‘lov usulini tanlang'; END IF;
    IF p_destination IS NULL OR length(trim(p_destination)) < 4 THEN RAISE EXCEPTION 'Karta raqamini kiriting'; END IF;
    SELECT * INTO w FROM public.lootzy_withdrawals WHERE id=p_id;
    IF FOUND THEN RETURN to_jsonb(w); END IF;
    INSERT INTO public.lootzy_accounts(telegram_id) VALUES (p_target) ON CONFLICT (telegram_id) DO NOTHING;
    INSERT INTO public.lootzy_withdrawals(id,telegram_id,amount_cents,method,destination,created_by_admin,decided_by)
    VALUES (p_id,p_target,p_amount,p_method,left(trim(p_destination),256),true,p_actor) RETURNING * INTO w;
    UPDATE public.lootzy_withdrawals SET due_at = now() + interval '5 days' WHERE id=p_id RETURNING * INTO w;
    RETURN to_jsonb(w);
  ELSIF p_action = 'decision' THEN
    SELECT * INTO w FROM public.lootzy_withdrawals WHERE id=p_id AND created_by_admin FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'So‘rov topilmadi'; END IF;
    IF w.status = p_status THEN RETURN to_jsonb(w); END IF;
    IF NOT ((w.status='pending' AND p_status IN ('approved','rejected')) OR (w.status='approved' AND p_status IN ('paid','rejected'))) THEN
      RAISE EXCEPTION 'Bu holatga o‘tkazib bo‘lmaydi';
    END IF;
    -- Admin-created requests were never paid from the balance, so rejection refunds nothing.
    UPDATE public.lootzy_withdrawals SET status=p_status, decided_by=p_actor, updated_at=now() WHERE id=p_id RETURNING * INTO w;
    RETURN to_jsonb(w);
  END IF;
  RAISE EXCEPTION 'Unknown action';
END $$;
REVOKE ALL ON FUNCTION public.lootzy_admin_withdraw(bigint,text,uuid,bigint,bigint,text,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lootzy_admin_withdraw(bigint,text,uuid,bigint,bigint,text,text,text) TO service_role;