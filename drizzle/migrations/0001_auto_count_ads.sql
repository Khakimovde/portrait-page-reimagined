CREATE OR REPLACE FUNCTION public.lootzy_ad_auto_before() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.kind='ad_report' THEN
    IF EXISTS(SELECT 1 FROM public.lootzy_events WHERE telegram_id=NEW.telegram_id AND kind='ad_report' AND created_at > now() - interval '15 seconds') THEN
      RAISE EXCEPTION 'Biroz kuting, keyin keyingi reklamani ko‘ring';
    END IF;
    NEW.verified := true;
  END IF;
  RETURN NEW;
END $$;
CREATE OR REPLACE FUNCTION public.lootzy_ad_auto_after() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_start timestamptz; v_count int;
BEGIN
  IF NEW.kind='ad_report' THEN
    v_start := (date_trunc('day', now() AT TIME ZONE 'Asia/Tashkent')) AT TIME ZONE 'Asia/Tashkent';
    SELECT count(*) INTO v_count FROM public.lootzy_events WHERE telegram_id=NEW.telegram_id AND kind='ad_report' AND verified AND created_at >= v_start;
    IF v_count > 0 AND v_count % 10 = 0 AND v_count <= 30 THEN
      UPDATE public.lootzy_accounts SET red = red + 1, updated_at = now() WHERE telegram_id=NEW.telegram_id;
      INSERT INTO public.lootzy_events(id,telegram_id,actor_id,kind,color,quantity,verified) VALUES (gen_random_uuid(),NEW.telegram_id,NEW.telegram_id,'ad_key','red',1,true);
    END IF;
  END IF;
  RETURN NULL;
END $$;
REVOKE ALL ON FUNCTION public.lootzy_ad_auto_before() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.lootzy_ad_auto_after() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS lootzy_ad_auto_before ON public.lootzy_events;
CREATE TRIGGER lootzy_ad_auto_before BEFORE INSERT ON public.lootzy_events FOR EACH ROW EXECUTE FUNCTION public.lootzy_ad_auto_before();
DROP TRIGGER IF EXISTS lootzy_ad_auto_after ON public.lootzy_events;
CREATE TRIGGER lootzy_ad_auto_after AFTER INSERT ON public.lootzy_events FOR EACH ROW EXECUTE FUNCTION public.lootzy_ad_auto_after();