-- Lootzy trusted schema (accounts, keys, cases, mining, withdrawals, referrals, roles, events).
--
-- Reconstructed on 2026-11-15 from the database this project actually deployed: the remix
-- copied drizzle/schema.ts but dropped this file, so it was rebuilt from the live catalog
-- (pg_attribute/pg_constraint/pg_indexes/pg_proc/pg_trigger) rather than from memory.
--
-- Access model: row-level security is ON for every table and no policies exist, so nothing
-- outside the service-role database functions below can read or write these rows.

CREATE SEQUENCE IF NOT EXISTS public.lootzy_withdrawal_queue_seq;

CREATE TABLE public.lootzy_accounts (
  telegram_id bigint not null,
  first_name text not null default 'User'::text,
  last_name text,
  username text,
  photo_url text,
  balance_cents bigint not null default 0,
  earned_cents bigint not null default 0,
  red integer not null default 0,
  purple integer not null default 0,
  green integer not null default 0,
  pink integer not null default 0,
  opened integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  subscribed_at timestamp with time zone
);

CREATE TABLE public.lootzy_bonus_entries (
  game_id text not null,
  telegram_id bigint not null,
  pink_count integer not null,
  added_by bigint not null,
  created_at timestamp with time zone not null default now(),
  rank integer
);

CREATE TABLE public.lootzy_bonus_games (
  id text not null default 'pink-2026-11-08'::text,
  drawn_at timestamp with time zone,
  drawn_by bigint
);

CREATE TABLE public.lootzy_events (
  id uuid not null,
  telegram_id bigint not null,
  actor_id bigint,
  kind text not null,
  color text,
  quantity integer not null default 0,
  amount_cents bigint not null default 0,
  verified boolean not null default false,
  created_at timestamp with time zone not null default now()
);

CREATE TABLE public.lootzy_mining (
  id uuid not null,
  telegram_id bigint not null,
  actor_id bigint not null,
  principal_uzs integer not null,
  rate_uzs integer not null,
  payout_cents bigint not null,
  started_at timestamp with time zone not null default now(),
  ends_at timestamp with time zone not null default (now() + interval '48 hours'),
  paid_at timestamp with time zone
);

CREATE TABLE public.lootzy_referrals (
  referred_id bigint not null,
  referrer_id bigint not null,
  status text not null default 'pending'::text,
  created_at timestamp with time zone not null default now(),
  confirmed_at timestamp with time zone
);

CREATE TABLE public.lootzy_roles (
  telegram_id bigint not null,
  role text not null
);

CREATE TABLE public.lootzy_withdrawals (
  id uuid not null,
  telegram_id bigint not null,
  amount_cents bigint not null,
  method text not null,
  destination text not null,
  status text not null default 'pending'::text,
  decided_by bigint,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  queue_number bigint,
  queue_started_at timestamp with time zone,
  due_at timestamp with time zone
);
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_balance_cents_check CHECK ((balance_cents >= 0));
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_green_check CHECK ((green >= 0));
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_pink_check CHECK ((pink >= 0));
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_pkey PRIMARY KEY (telegram_id);
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_purple_check CHECK ((purple >= 0));
ALTER TABLE public.lootzy_accounts ADD CONSTRAINT lootzy_accounts_red_check CHECK ((red >= 0));
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_game_id_fkey FOREIGN KEY (game_id) REFERENCES public.lootzy_bonus_games(id);
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_game_id_rank_key UNIQUE (game_id, rank);
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_pink_count_check CHECK (((pink_count >= 1) AND (pink_count <= 100000)));
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_pkey PRIMARY KEY (game_id, telegram_id);
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_rank_check CHECK (((rank >= 1) AND (rank <= 3)));
ALTER TABLE public.lootzy_bonus_entries ADD CONSTRAINT lootzy_bonus_entries_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.lootzy_accounts(telegram_id);
ALTER TABLE public.lootzy_bonus_games ADD CONSTRAINT lootzy_bonus_games_pkey PRIMARY KEY (id);
ALTER TABLE public.lootzy_events ADD CONSTRAINT lootzy_events_pkey PRIMARY KEY (id);
ALTER TABLE public.lootzy_events ADD CONSTRAINT lootzy_events_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.lootzy_accounts(telegram_id) ON DELETE CASCADE;
ALTER TABLE public.lootzy_mining ADD CONSTRAINT lootzy_mining_payout_cents_check CHECK ((payout_cents > 0));
ALTER TABLE public.lootzy_mining ADD CONSTRAINT lootzy_mining_pkey PRIMARY KEY (id);
ALTER TABLE public.lootzy_mining ADD CONSTRAINT lootzy_mining_principal_uzs_check CHECK ((principal_uzs = ANY (ARRAY[50000, 100000])));
ALTER TABLE public.lootzy_mining ADD CONSTRAINT lootzy_mining_rate_uzs_check CHECK (((rate_uzs >= 1000) AND (rate_uzs <= 1000000)));
ALTER TABLE public.lootzy_mining ADD CONSTRAINT lootzy_mining_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.lootzy_accounts(telegram_id);
ALTER TABLE public.lootzy_referrals ADD CONSTRAINT lootzy_referrals_check CHECK ((referred_id <> referrer_id));
ALTER TABLE public.lootzy_referrals ADD CONSTRAINT lootzy_referrals_pkey PRIMARY KEY (referred_id);
ALTER TABLE public.lootzy_referrals ADD CONSTRAINT lootzy_referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.lootzy_accounts(telegram_id) ON DELETE CASCADE;
ALTER TABLE public.lootzy_referrals ADD CONSTRAINT lootzy_referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.lootzy_accounts(telegram_id) ON DELETE CASCADE;
ALTER TABLE public.lootzy_referrals ADD CONSTRAINT lootzy_referrals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text])));
ALTER TABLE public.lootzy_roles ADD CONSTRAINT lootzy_roles_pkey PRIMARY KEY (telegram_id, role);
ALTER TABLE public.lootzy_roles ADD CONSTRAINT lootzy_roles_role_check CHECK ((role = 'admin'::text));
ALTER TABLE public.lootzy_roles ADD CONSTRAINT lootzy_roles_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.lootzy_accounts(telegram_id) ON DELETE CASCADE;
ALTER TABLE public.lootzy_withdrawals ADD CONSTRAINT lootzy_withdrawals_amount_cents_check CHECK ((amount_cents > 0));
ALTER TABLE public.lootzy_withdrawals ADD CONSTRAINT lootzy_withdrawals_method_check CHECK ((method = ANY (ARRAY['visa'::text, 'btc'::text, 'ltc'::text, 'doge'::text, 'uzcard'::text, 'humo'::text])));
ALTER TABLE public.lootzy_withdrawals ADD CONSTRAINT lootzy_withdrawals_pkey PRIMARY KEY (id);
ALTER TABLE public.lootzy_withdrawals ADD CONSTRAINT lootzy_withdrawals_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'paid'::text])));
ALTER TABLE public.lootzy_withdrawals ADD CONSTRAINT lootzy_withdrawals_telegram_id_fkey FOREIGN KEY (telegram_id) REFERENCES public.lootzy_accounts(telegram_id) ON DELETE CASCADE;
CREATE INDEX lootzy_events_created_idx ON public.lootzy_events USING btree (created_at);
CREATE INDEX lootzy_events_user_idx ON public.lootzy_events USING btree (telegram_id, kind, created_at);
CREATE INDEX lootzy_mining_due ON public.lootzy_mining USING btree (ends_at) WHERE (paid_at IS NULL);
CREATE UNIQUE INDEX lootzy_mining_one_active ON public.lootzy_mining USING btree (telegram_id) WHERE (paid_at IS NULL);
CREATE INDEX lootzy_referrals_referrer_idx ON public.lootzy_referrals USING btree (referrer_id, status);
CREATE UNIQUE INDEX lootzy_withdrawal_queue_unique ON public.lootzy_withdrawals USING btree (queue_number);
CREATE INDEX lootzy_withdrawals_user_idx ON public.lootzy_withdrawals USING btree (telegram_id, created_at DESC);
ALTER TABLE public.lootzy_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_bonus_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_bonus_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_mining ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lootzy_withdrawals ENABLE ROW LEVEL SECURITY;

-- Trusted operations: SECURITY DEFINER, service-role only, role-checked inside.
CREATE OR REPLACE FUNCTION public.lootzy_bonus_manage(p_actor bigint, p_action text, p_target bigint DEFAULT NULL::bigint, p_quantity integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
 v_game text := 'pink-2026-11-08'; v_drawn timestamptz; v_id bigint; v_rank integer; v_total bigint; v_ticket double precision; v_qty integer; v_color text;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Admin uchun ruxsat yo‘q'; END IF;
 IF p_action NOT IN ('add','draw') OR p_action IS NULL THEN RAISE EXCEPTION 'Noto‘g‘ri amal'; END IF;
 PERFORM pg_advisory_xact_lock(811202614);
 INSERT INTO public.lootzy_bonus_games(id) VALUES(v_game) ON CONFLICT DO NOTHING;
 SELECT drawn_at INTO v_drawn FROM public.lootzy_bonus_games WHERE id=v_game FOR UPDATE;
 IF v_drawn IS NOT NULL THEN
   IF p_action='draw' THEN RETURN jsonb_build_object('drawn',true,'replayed',true); END IF;
   RAISE EXCEPTION 'O‘yin yakunlangan';
 END IF;
 IF p_action='add' THEN
   IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100000 THEN RAISE EXCEPTION 'Kamida 1 ta pink case, ko‘pi bilan 100000'; END IF;
   IF NOT EXISTS (SELECT 1 FROM public.lootzy_accounts WHERE telegram_id=p_target) THEN RAISE EXCEPTION 'ID topilmadi. Foydalanuvchi botga /start bosishi kerak'; END IF;
   INSERT INTO public.lootzy_bonus_entries(game_id,telegram_id,pink_count,added_by) VALUES(v_game,p_target,p_quantity,p_actor)
   ON CONFLICT (game_id,telegram_id) DO UPDATE SET pink_count=excluded.pink_count, added_by=excluded.added_by;
   RETURN jsonb_build_object('saved',true);
 END IF;
 IF now() < '2026-11-08 14:00:00+05'::timestamptz THEN RAISE EXCEPTION 'O‘yin 08.11.2026 soat 14:00 (Toshkent) dan keyin boshlanadi'; END IF;
 IF (SELECT count(*) FROM public.lootzy_bonus_entries WHERE game_id=v_game) < 3 THEN RAISE EXCEPTION 'Kamida 3 ta ishtirokchi kerak'; END IF;
 FOR v_rank IN 1..3 LOOP
   SELECT sum(pink_count) INTO v_total FROM public.lootzy_bonus_entries WHERE game_id=v_game AND rank IS NULL;
   v_ticket := random()*v_total;
   SELECT telegram_id INTO v_id FROM (
     SELECT telegram_id,sum(pink_count) OVER (ORDER BY telegram_id) AS cumulative FROM public.lootzy_bonus_entries WHERE game_id=v_game AND rank IS NULL
   ) weighted WHERE cumulative>v_ticket ORDER BY cumulative LIMIT 1;
   UPDATE public.lootzy_bonus_entries SET rank=v_rank WHERE game_id=v_game AND telegram_id=v_id;
   v_qty := CASE v_rank WHEN 1 THEN 10 WHEN 2 THEN 3 ELSE 5 END;
   v_color := CASE WHEN v_rank<3 THEN 'pink' ELSE 'green' END;
   UPDATE public.lootzy_accounts SET pink=pink+CASE WHEN v_color='pink' THEN v_qty ELSE 0 END,green=green+CASE WHEN v_color='green' THEN v_qty ELSE 0 END,updated_at=now() WHERE telegram_id=v_id;
   INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,color,quantity,verified) VALUES(gen_random_uuid(),v_id,p_actor,'grant',v_color,v_qty,true);
 END LOOP;
 UPDATE public.lootzy_bonus_games SET drawn_at=now(),drawn_by=p_actor WHERE id=v_game;
 RETURN jsonb_build_object('drawn',true,'replayed',false);
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_bonus_nov09_manage(p_actor bigint, p_action text, p_target bigint DEFAULT NULL::bigint, p_quantity integer DEFAULT NULL::integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
 v_game text := 'pink-2026-11-09'; v_drawn timestamptz; v_id bigint; v_rank integer; v_total bigint; v_ticket double precision; v_qty integer;
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Admin uchun ruxsat yo‘q'; END IF;
 IF p_action NOT IN ('add','draw') OR p_action IS NULL THEN RAISE EXCEPTION 'Noto‘g‘ri amal'; END IF;
 PERFORM pg_advisory_xact_lock(911202623);
 INSERT INTO public.lootzy_bonus_games(id) VALUES(v_game) ON CONFLICT DO NOTHING;
 SELECT drawn_at INTO v_drawn FROM public.lootzy_bonus_games WHERE id=v_game FOR UPDATE;
 IF v_drawn IS NOT NULL THEN
   IF p_action='draw' THEN RETURN jsonb_build_object('drawn',true,'replayed',true); END IF;
   RAISE EXCEPTION 'O‘yin yakunlangan';
 END IF;
 IF p_action='add' THEN
   IF p_quantity IS NULL OR p_quantity < 1 OR p_quantity > 100000 THEN RAISE EXCEPTION 'Kamida 1 ta pink case, ko‘pi bilan 100000'; END IF;
   IF NOT EXISTS (SELECT 1 FROM public.lootzy_accounts WHERE telegram_id=p_target) THEN RAISE EXCEPTION 'ID topilmadi. Foydalanuvchi botga /start bosishi kerak'; END IF;
   INSERT INTO public.lootzy_bonus_entries(game_id,telegram_id,pink_count,added_by) VALUES(v_game,p_target,p_quantity,p_actor)
   ON CONFLICT (game_id,telegram_id) DO UPDATE SET pink_count=excluded.pink_count, added_by=excluded.added_by;
   RETURN jsonb_build_object('saved',true);
 END IF;
 IF now() < '2026-11-09 23:00:00+05'::timestamptz THEN RAISE EXCEPTION 'O‘yin 09.11.2026 soat 23:00 (Toshkent) dan keyin boshlanadi'; END IF;
 IF (SELECT count(*) FROM public.lootzy_bonus_entries WHERE game_id=v_game) < 3 THEN RAISE EXCEPTION 'Kamida 3 ta ishtirokchi kerak'; END IF;
 FOR v_rank IN 1..3 LOOP
   SELECT sum(pink_count) INTO v_total FROM public.lootzy_bonus_entries WHERE game_id=v_game AND rank IS NULL;
   v_ticket := random()*v_total;
   SELECT telegram_id INTO v_id FROM (
     SELECT telegram_id,sum(pink_count) OVER (ORDER BY telegram_id) AS cumulative FROM public.lootzy_bonus_entries WHERE game_id=v_game AND rank IS NULL
   ) weighted WHERE cumulative>v_ticket ORDER BY cumulative LIMIT 1;
   UPDATE public.lootzy_bonus_entries SET rank=v_rank WHERE game_id=v_game AND telegram_id=v_id;
   v_qty := CASE v_rank WHEN 1 THEN 15 WHEN 2 THEN 10 ELSE 5 END;
   UPDATE public.lootzy_accounts SET pink=pink+v_qty,updated_at=now() WHERE telegram_id=v_id;
   INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,color,quantity,verified) VALUES(gen_random_uuid(),v_id,p_actor,'grant','pink',v_qty,true);
 END LOOP;
 UPDATE public.lootzy_bonus_games SET drawn_at=now(),drawn_by=p_actor WHERE id=v_game;
 RETURN jsonb_build_object('drawn',true,'replayed',false);
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_bot_start(p_id bigint, p_first text, p_last text, p_username text, p_referrer bigint DEFAULT NULL::bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE existed boolean; recorded boolean := false;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.lootzy_accounts WHERE telegram_id=p_id) INTO existed;
  INSERT INTO public.lootzy_accounts(telegram_id, first_name, last_name, username)
  VALUES (p_id, left(coalesce(nullif(p_first,''),'User'),256), left(p_last,256), left(p_username,256))
  ON CONFLICT (telegram_id) DO UPDATE SET first_name=EXCLUDED.first_name, last_name=EXCLUDED.last_name, username=EXCLUDED.username, updated_at=now();
  IF NOT existed AND p_referrer IS NOT NULL AND p_referrer <> p_id AND EXISTS(SELECT 1 FROM public.lootzy_accounts WHERE telegram_id=p_referrer) THEN
    INSERT INTO public.lootzy_referrals(referred_id, referrer_id) VALUES (p_id, p_referrer) ON CONFLICT DO NOTHING;
    recorded := FOUND;
  END IF;
  RETURN jsonb_build_object('new', NOT existed, 'referral_recorded', recorded);
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_confirm_subscription(p_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE ref bigint; total integer := 0; granted boolean := false;
BEGIN
  UPDATE public.lootzy_accounts SET subscribed_at=coalesce(subscribed_at, now()), updated_at=now() WHERE telegram_id=p_id;
  UPDATE public.lootzy_referrals SET status='confirmed', confirmed_at=now()
    WHERE referred_id=p_id AND status='pending' RETURNING referrer_id INTO ref;
  IF ref IS NOT NULL THEN
    PERFORM 1 FROM public.lootzy_accounts WHERE telegram_id=ref FOR UPDATE;
    SELECT count(*) INTO total FROM public.lootzy_referrals WHERE referrer_id=ref AND status='confirmed';
    IF total % 10 = 0 THEN
      UPDATE public.lootzy_accounts SET purple=purple+1, updated_at=now() WHERE telegram_id=ref;
      INSERT INTO public.lootzy_events(id, telegram_id, kind, color, quantity, verified) VALUES (gen_random_uuid(), ref, 'referral_key', 'purple', 1, true);
      granted := true;
    END IF;
  END IF;
  RETURN jsonb_build_object('referrer', ref, 'confirmed_total', total, 'key_granted', granted);
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_mining_settle(p_target bigint DEFAULT NULL::bigint)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE m public.lootzy_mining; n integer:=0;
BEGIN
FOR m IN SELECT * FROM public.lootzy_mining WHERE paid_at IS NULL AND ends_at<=now() AND (p_target IS NULL OR telegram_id=p_target) ORDER BY telegram_id FOR UPDATE SKIP LOCKED LOOP
 UPDATE public.lootzy_accounts SET balance_cents=balance_cents+m.payout_cents,earned_cents=earned_cents+m.payout_cents,updated_at=now() WHERE telegram_id=m.telegram_id;
 UPDATE public.lootzy_mining SET paid_at=now() WHERE id=m.id;
 n:=n+1;
END LOOP;
RETURN n;
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_mining_start(p_actor bigint, p_target bigint, p_id uuid, p_principal integer, p_rate integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE m public.lootzy_mining;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 IF p_id IS NULL OR p_principal IS NULL OR p_principal NOT IN (50000,100000) OR p_rate IS NULL OR p_rate NOT BETWEEN 1000 AND 1000000 THEN RAISE EXCEPTION 'Invalid mining plan or exchange rate'; END IF;
 PERFORM pg_advisory_xact_lock(p_target);
 SELECT * INTO m FROM public.lootzy_mining WHERE id=p_id;
 IF FOUND THEN
  IF m.telegram_id<>p_target OR m.principal_uzs<>p_principal OR m.rate_uzs<>p_rate THEN RAISE EXCEPTION 'Request conflict'; END IF;
  RETURN to_jsonb(m);
 END IF;
 PERFORM public.lootzy_mining_settle(p_target);
 PERFORM 1 FROM public.lootzy_accounts WHERE telegram_id=p_target;
 IF NOT FOUND THEN RAISE EXCEPTION 'Foydalanuvchi topilmadi'; END IF;
 IF EXISTS(SELECT 1 FROM public.lootzy_mining WHERE telegram_id=p_target AND paid_at IS NULL) THEN RAISE EXCEPTION 'Mining allaqachon ishlamoqda'; END IF;
 INSERT INTO public.lootzy_mining(id,telegram_id,actor_id,principal_uzs,rate_uzs,payout_cents) VALUES(p_id,p_target,p_actor,p_principal,p_rate,round(p_principal::numeric*3*100/p_rate)::bigint) RETURNING * INTO m;
 RETURN to_jsonb(m);
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_mutate(p_actor bigint, p_action text, p_id uuid, p_target bigint DEFAULT NULL::bigint, p_color text DEFAULT NULL::text, p_quantity integer DEFAULT 0, p_amount bigint DEFAULT 0, p_method text DEFAULT NULL::text, p_destination text DEFAULT NULL::text, p_status text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE a public.lootzy_accounts; w public.lootzy_withdrawals; e public.lootzy_events; lo int; hi int; reward int; v_min bigint; v_day_start timestamptz; v_count int;
BEGIN
  IF p_id IS NULL THEN RAISE EXCEPTION 'Amal raqami kerak'; END IF;
  p_quantity := coalesce(p_quantity,0); p_amount := coalesce(p_amount,0);

  IF p_action = 'grant' THEN
    IF NOT EXISTS(SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
    IF p_target IS NULL OR p_quantity < 0 OR p_amount < 0 OR (p_quantity = 0 AND p_amount = 0) THEN RAISE EXCEPTION 'Foydalanuvchi va miqdor kerak'; END IF;
    IF p_quantity > 0 AND (p_color IS NULL OR p_color NOT IN ('red','purple','green','pink')) THEN RAISE EXCEPTION 'Kalit rangini tanlang'; END IF;
    SELECT * INTO e FROM public.lootzy_events WHERE id=p_id;
    IF FOUND THEN SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=e.telegram_id; RETURN to_jsonb(a); END IF;
    SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_target FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Foydalanuvchi topilmadi'; END IF;
    UPDATE public.lootzy_accounts SET
      balance_cents = balance_cents + p_amount,
      red = red + CASE WHEN p_color='red' THEN p_quantity ELSE 0 END,
      purple = purple + CASE WHEN p_color='purple' THEN p_quantity ELSE 0 END,
      green = green + CASE WHEN p_color='green' THEN p_quantity ELSE 0 END,
      pink = pink + CASE WHEN p_color='pink' THEN p_quantity ELSE 0 END,
      updated_at = now()
    WHERE telegram_id=p_target RETURNING * INTO a;
    INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,color,quantity,amount_cents,verified)
    VALUES (p_id,p_target,p_actor,'grant',CASE WHEN p_quantity>0 THEN p_color END,p_quantity,p_amount,true);
    RETURN to_jsonb(a);

  ELSIF p_action = 'open' THEN
    IF p_color IS NULL OR p_color NOT IN ('red','purple','green','pink') THEN RAISE EXCEPTION 'Kalit rangini tanlang'; END IF;
    SELECT * INTO e FROM public.lootzy_events WHERE id=p_id;
    IF FOUND THEN
      IF e.telegram_id<>p_actor THEN RAISE EXCEPTION 'Request conflict'; END IF;
      SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_actor;
      RETURN jsonb_build_object('account',to_jsonb(a),'reward',e.amount_cents);
    END IF;
    SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_actor FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Foydalanuvchi topilmadi'; END IF;
    IF (CASE p_color WHEN 'red' THEN a.red WHEN 'purple' THEN a.purple WHEN 'green' THEN a.green ELSE a.pink END) < 1 THEN RAISE EXCEPTION 'Kalit yetarli emas'; END IF;
    lo := CASE p_color WHEN 'red' THEN 1 WHEN 'purple' THEN 5 WHEN 'green' THEN 100 ELSE 500 END;
    hi := CASE p_color WHEN 'red' THEN 7 WHEN 'purple' THEN 20 WHEN 'green' THEN 300 ELSE 1000 END;
    reward := lo + floor(random()*(hi-lo+1))::int;
    UPDATE public.lootzy_accounts SET
      red = red - CASE WHEN p_color='red' THEN 1 ELSE 0 END,
      purple = purple - CASE WHEN p_color='purple' THEN 1 ELSE 0 END,
      green = green - CASE WHEN p_color='green' THEN 1 ELSE 0 END,
      pink = pink - CASE WHEN p_color='pink' THEN 1 ELSE 0 END,
      balance_cents = balance_cents + reward, earned_cents = earned_cents + reward, opened = opened + 1, updated_at = now()
    WHERE telegram_id=p_actor RETURNING * INTO a;
    INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,color,quantity,amount_cents,verified)
    VALUES (p_id,p_actor,p_actor,'open',p_color,-1,reward,true);
    RETURN jsonb_build_object('account',to_jsonb(a),'reward',reward);

  ELSIF p_action = 'ad_report' THEN
    IF EXISTS(SELECT 1 FROM public.lootzy_events WHERE id=p_id) THEN SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_actor; RETURN to_jsonb(a); END IF;
    PERFORM pg_advisory_xact_lock(p_actor);
    v_day_start := (date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')) AT TIME ZONE 'Asia/Tashkent';
    SELECT count(*) INTO v_count FROM public.lootzy_events WHERE telegram_id=p_actor AND kind='ad_report' AND created_at >= v_day_start;
    IF v_count >= 30 THEN RAISE EXCEPTION 'Bugungi reklama limiti tugadi'; END IF;
    INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,quantity,verified) VALUES (p_id,p_actor,p_actor,'ad_report',0,false);
    SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_actor;
    RETURN to_jsonb(a);

  ELSIF p_action = 'withdraw' THEN
    IF p_method IS NULL OR p_method NOT IN ('visa','btc','ltc','doge','uzcard','humo') THEN RAISE EXCEPTION 'To‘lov usulini tanlang'; END IF;
    IF p_destination IS NULL OR length(trim(p_destination)) < 4 THEN RAISE EXCEPTION 'Hamyon yoki karta raqamini kiriting'; END IF;
    v_min := CASE WHEN p_method IN ('uzcard','humo') THEN 250 ELSE 500 END;
    IF p_amount < v_min THEN RAISE EXCEPTION 'Minimal miqdor $%', (v_min::numeric/100); END IF;
    SELECT * INTO w FROM public.lootzy_withdrawals WHERE id=p_id;
    IF FOUND THEN
      IF w.telegram_id<>p_actor THEN RAISE EXCEPTION 'Request conflict'; END IF;
      RETURN to_jsonb(w);
    END IF;
    SELECT * INTO a FROM public.lootzy_accounts WHERE telegram_id=p_actor FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Foydalanuvchi topilmadi'; END IF;
    IF a.balance_cents < p_amount THEN RAISE EXCEPTION 'Balans yetarli emas'; END IF;
    UPDATE public.lootzy_accounts SET balance_cents = balance_cents - p_amount, updated_at = now() WHERE telegram_id=p_actor;
    INSERT INTO public.lootzy_withdrawals(id,telegram_id,amount_cents,method,destination)
    VALUES (p_id,p_actor,p_amount,p_method,left(trim(p_destination),256)) RETURNING * INTO w;
    INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,amount_cents,verified) VALUES (gen_random_uuid(),p_actor,p_actor,'withdraw',-p_amount,true);
    RETURN to_jsonb(w);

  ELSIF p_action = 'decision' THEN
    IF NOT EXISTS(SELECT 1 FROM public.lootzy_roles WHERE telegram_id=p_actor AND role='admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
    SELECT * INTO w FROM public.lootzy_withdrawals WHERE id=p_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'So‘rov topilmadi'; END IF;
    IF w.status = p_status THEN RETURN to_jsonb(w); END IF;
    IF NOT ((w.status='pending' AND p_status IN ('approved','rejected')) OR (w.status='approved' AND p_status IN ('paid','rejected'))) THEN
      RAISE EXCEPTION 'Bu holatga o‘tkazib bo‘lmaydi';
    END IF;
    IF p_status = 'rejected' THEN
      UPDATE public.lootzy_accounts SET balance_cents = balance_cents + w.amount_cents, updated_at = now() WHERE telegram_id=w.telegram_id;
      INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,amount_cents,verified) VALUES (gen_random_uuid(),w.telegram_id,p_actor,'refund',w.amount_cents,true);
    END IF;
    UPDATE public.lootzy_withdrawals SET status=p_status, decided_by=p_actor, updated_at=now() WHERE id=p_id RETURNING * INTO w;
    RETURN to_jsonb(w);
  END IF;
  RAISE EXCEPTION 'Unknown action';
END $function$;
CREATE OR REPLACE FUNCTION public.lootzy_withdrawal_enqueue()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
 NEW.queue_number:=nextval('public.lootzy_withdrawal_queue_seq');
 NEW.queue_started_at:=now(); NEW.due_at:=now()+interval '7 days'; RETURN NEW;
END $function$;

-- Withdrawal queue: immutable global ticket number + seven-day deadline on every new request.
CREATE TRIGGER lootzy_withdrawal_enqueue BEFORE INSERT ON public.lootzy_withdrawals FOR EACH ROW EXECUTE FUNCTION lootzy_withdrawal_enqueue();

-- Backfill: open requests that predate the queue get their deadline from the request date.
UPDATE public.lootzy_withdrawals
   SET due_at = created_at + interval '7 days'
 WHERE status IN ('pending','approved') AND due_at IS NULL;
