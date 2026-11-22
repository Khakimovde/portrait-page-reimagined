# Lootzy loyihasini ko‘chirish

## Ushbu arxiv nimalarni saqlaydi?

- Ilova va Telegram botining kodi, admin bo‘limi, taymerlar, uslublar va sinovlar.
- Baza tuzilishini yaratishga oid SQL fayllar va ularning tarixi: `drizzle/migrations/`.
- Loyihada ishlatiladigan mahalliy rasmlar va oltita CDN rasmning yuklab olingan nusxasi.
- Paketlar ro‘yxati, `bun.lock`, Vite sozlamalari va yig‘ish skriptlari.
- `SHA256SUMS.txt`: arxivdagi fayllarning yaxlitligini tekshirish ro‘yxati.

**Bu arxiv bazadagi haqiqiy ma’lumotlarning nusxasi emas.** SQL fayllarda mavjud foydalanuvchilar, balanslar, yechish so‘rovlari va ularning saqlangan tugash vaqtlari yo‘q. Ular quyidagi rasmiy eksport bilan ko‘chiriladi. Faqat kodni yoki dist fayllarini ko‘chirish ularni saqlab qolmaydi.

Maxfiy `.env`, xizmat kalitlari, Git metama’lumotlari, `node_modules`, keshlar va tayyor yig‘ilgan dist bu manba-kod arxiviga ataylab qo‘shilmagan. Paketlarni qayta o‘rnatish mumkin; maxfiy sozlamalar yangi joyda alohida sozlanadi.

## 1. To‘liq bazani eksport qilish — alohida bajariladi

1. Lovable’da **More → Database → Manage → Settings** ni oching.
2. **Export project data → Export data** ni bosing.
3. **Database → Export → Start export** ni tanlang.
4. Kelgan email havolasidan eksportni yuklab oling; nusxasi **More → Storage** da ham saqlanadi.

Eksport butun baza tuzilishi va ma’lumotlarini, foydalanuvchi hisoblari va parol xeshlarini ham o‘z ichiga oladi. Yechish so‘rovlarining `due_at`, `queue_started_at`, `queue_number`, `created_at` qiymatlari ham ma’lumotlar bilan saqlanadi. Eksportni maxfiy saqlang: unda foydalanuvchi va to‘lov ma’lumotlari bo‘ladi.

Baza eksportiga saqlash bo‘limidagi fayllar, funksiyalarning kodi, maxfiy kalitlar va kirish provayderlari sozlamalari kirmaydi. Kunlik zaxiralarga ham saqlash bo‘limidagi fayllar kirmaydi.

Chegaralar: baza 200 GiB gacha, eksport fayli 100 GiB gacha; har 24 soatda bir eksport. To‘xtatilgan loyihaning xizmatini avval qayta yoqish kerak; eksport o‘zi uni yoqmaydi.

## 2. Saqlash bo‘limidagi fayllar — alohida yuklanadi

**More → Storage** orqali kerakli barcha fayllarni yuklab oling. Ushbu arxivdagi rasmlar faqat loyiha manba fayllarida topilgan rasmlardir; ularni barcha Storage fayllari nusxasi deb hisoblamang. Storage ro‘yxati ushbu arxiv uchun tekshirilmagan.

## 3. Kod va rasmlar

```sh
npm install
npm test
npm run build:static
```

`dist/` ichidagi barcha fayllarni HTTPS hostingga joylashtiring. Bu faqat ilovaning ko‘rinadigan qismi: xavfsiz hisoblar, admin amallari va bot uchun alohida ishlaydigan Cloud API kerak.

Arxivdagi `source/` nusxasida g‘oliblar rasmlari mahalliy JPEG importlariga o‘tkazilgan; asl `.asset.json` ko‘rsatkichlari ham saqlangan. Shu sabab yangi joyda bu rasmlar eski CDN’ga bog‘liq bo‘lmaydi. Lovable’dagi ishlayotgan loyiha bu eksport uchun o‘zgartirilmagan.

## 4. Yangi joyda sozlanadiganlar

- To‘liq eksportni o‘zingizga tegishli alohida baza xizmatiga tiklang. Lovable’da bazani import qilish uchun o‘z-o‘ziga xizmat qiladigan menyu yo‘q; Export data sahifasi faqat eksport qiladi. Remix ma’lumotlarni ko‘chirmaydi.
- Koddagi eski SQL tarixini tayyor to‘liq eksport ustiga qayta ishlatmang. Fayllardagi raqam tartibi dastlabki bazani yaratish ketma-ketligi emas: `0001_migration.sql` asosiy tuzilmani, boshqa fayllar keyingi o‘zgarishlarni saqlaydi. To‘liq eksport — hozirgi tuzilma va ma’lumot uchun asosiy nusxa.
- Yangi xizmatning kirish provayderlari va API sozlamalarini qayta sozlang. Eksport foydalanuvchi parol xeshlarini saqlaydi, ammo kirish sozlamalarini ko‘chirmaydi.
- `VITE_LOOTZY_API_URL` yoki `scripts/api-url.mjs` yangi, o‘zingizning ishlaydigan API manzilingizga mos bo‘lsin. Aks holda eski loyihaning bazasiga murojaat qilish davom etadi.
- Telegram bot ulanishi, webhook va uning maxfiy tekshiruvi, kanal a’zoligini tekshirish hamda bot xabarlari alohida sozlanadi. Botning hozirgi Boshlash manzili `https://6a7ab988cb4f5.xvest6.ru/`; yangi hostingga ko‘chsangiz uni ham moslang.
- Server kodida kerak bo‘ladigan sozlama nomlari: `LOVABLE_API_KEY`, `TELEGRAM_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Ularning qiymatlari arxivga kiritilmagan. Lovable Cloud’ning xizmat kaliti va baza paroli foydalanuvchiga taqdim etilmaydi; yangi xizmat o‘z sozlamalarini beradi. Ularni brauzer kodiga joylamang.
- Soatbay rejalashtirilgan ishlar, tashqi ulanishlar va xizmat sozlamalarini yangi joyda alohida tekshiring: ular ushbu manba-kod arxivi bilan avtomatik ko‘chmaydi.

## 5. Taymerlar bo‘yicha muhim holat

Hozir taymerlar bazada saqlangan tugash vaqti va server soati asosida ishlaydi. Yangi joyga ko‘chganda muddat qaytadan boshlanmasligi uchun **baza ma’lumotlarini ham** tiklash kerak.

Ilovadan chiqqanda taymerni to‘xtatib, qayta kirganda davom ettirish bo‘yicha avvalgi so‘rov hali bajarilmagan. Ushbu arxiv shu funksiyani bor deb kafolatlamaydi: unda hozirgi taymer kodi saqlangan.

## 6. Ko‘chirgandan keyingi tekshiruv

1. Telegram ichidan haqiqiy foydalanuvchi bilan kiring va ism, balans, kalitlarni solishtiring.
2. Yechish so‘rovlaridagi karta, summa, holat, navbat raqami va tugash vaqtini eski joy bilan solishtiring.
3. Admin huquqlari, foydalanuvchi qidiruvi, mavjud so‘rovlar va bot xabarlarini tekshiring.
4. Barcha rasmlar ochilishini va Storage fayllari borligini tekshiring.
5. Imzolangan Telegram ma’lumoti tekshiruvi va pul amallaridagi takroriy hisoblashdan himoyani saqlang.

Yangi joy tekshiruvdan o‘tmaguncha eski loyihani o‘chirmang. Ushbu arxiv tayyorlanganda yangi joyga tiklash hamda haqiqiy Telegram orqali ko‘chirilgan ma’lumotlarni tekshirish bajarilmagan.