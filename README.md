# Janhavi Panwar — Rakhi Sale Google Ads Landing Page

Ek single-page, animated, direct-purchase landing page — Google Ads traffic ke liye
banayi gayi hai. Isme:

- **10 courses** (Basic English, Advance English, British Accent, American Accent,
  Japanese, Spanish, French, IELTS, Interview-English, Interview-Hindi) — real
  images/prices `janhavipanwar.com` se liye gaye hain.
- **15% Raksha Bandhan discount** — sabhi prices pe automatically apply hota hai
  (28 August 2026 tak countdown timer ke saath).
- **Free English Level Test** (12 MCQs) — 70%+ score par IELTS/Accent/Interview
  courses recommend karta hai, kam score par Basic/Advance English.
- **Buy Now → Checkout modal → Razorpay payment** — direct isi page se purchase.
- Har order aur cancellation request **`digitalscript07@gmail.com`** par email
  hoti hai + backend ke `orders.json` file me store hoti hai.
- Google Ads / GA4 conversion tracking ready (`gtag.js` already lagi hai).

---

## Folder structure
```
public/
  index.html       → Landing page
  css/style.css    → Styling
  js/main.js       → Countdown, products, checkout modal, Razorpay call
  js/quiz.js       → Level test logic
server.js          → Backend: Razorpay order + verify + email + storage
package.json
.env.example        → Copy to .env and fill your real keys
.gitignore
```

⚠️ Is baar site sirf static HTML nahi hai — payment aur email ke liye ek chhota
**Node.js backend** (`server.js`) bhi hai. Isliye Render par **"Web Service"**
use karna hai, "Static Site" nahi.

---

## 1. Zaroori accounts pehle बना lein

### A) Razorpay (payment gateway)
1. https://razorpay.com par account banayein (KYC/bank details verify karne
   honge — tabhi real payments le paayenge; tab tak **Test Mode** keys se
   testing kar sakte hain).
2. Dashboard → **Settings → API Keys** → "Generate Test Key" ya "Generate Live Key".
3. `Key Id` aur `Key Secret` copy kar lein — yeh `.env` me daalenge.

### B) Email bhejne ke liye (Gmail App Password)
1. Jis Gmail se emails bhejni hain (recommend: koi bhi aapka Gmail, e.g.
   `panwarjanhavi@gmail.com` khud se bhi bhej sakte hain) — us par
   https://myaccount.google.com/apppasswords se ek **App Password** banayein
   (2-Step Verification on honi chahiye account par).
2. 16-digit password copy kar lein — yeh `SMTP_PASS` me jaayega.
   (`SMTP_USER` = wahi Gmail address)
3. Saari order/cancellation details **`digitalscript07@gmail.com`** par
   automatically forward ho jaayengi (already `OWNER_EMAIL` me set hai).

---

## 2. GitHub par push karna

```bash
cd is-folder-ke-andar
git init
git add .
git commit -m "Rakhi sale landing page with checkout backend"
git branch -M main
git remote add origin https://github.com/<your-username>/janhavi-rakhi-landing.git
git push -u origin main
```
(`.env` aur `orders.json` `.gitignore` me hain, isliye woh GitHub par nahi jaayenge —
yeh sahi hai, inme sensitive/customer data hota hai.)

---

## 3. Render par deploy karna (Web Service)

1. https://render.com par login karein.
2. **New + → Web Service** click karein → apna GitHub repo connect karein.
3. Settings:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. **Environment → Environment Variables** me yeh sab add karein
   (`.env.example` file me poori list hai):
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = aapki Gmail address
   - `SMTP_PASS` = 16-digit App Password
   - `OWNER_EMAIL` = `digitalscript07@gmail.com`
5. **Create Web Service** click karein. 2-3 minute me live ho jaayega, URL
   milega jaise: `https://janhavi-rakhi-landing.onrender.com`

Is single URL par hi poori landing page + backend dono chalenge (frontend
`public/` folder se serve hoti hai, backend `/api/...` routes pe).

> **Important:** Render ka free plan disk **ephemeral** hai — matlab
> `orders.json` file restart/redeploy par reset ho sakti hai. Chunki har order
> anyway email ho raha hai `digitalscript07@gmail.com` par, koi data miss
> nahi hoga. Agar aapko permanent database bhi chahiye, aage chal ke isko
> Google Sheets ya MySQL/MongoDB se jod sakte hain — bata dena, woh bhi kar
> denge.

---

## 4. Local par test karna (deploy se pehle)

```bash
npm install
cp .env.example .env
# .env me apni Razorpay test keys + Gmail app password bhar dein
npm start
# Browser me kholein:
http://localhost:3000
```
Razorpay **Test Mode** me test card `4111 1111 1111 1111`, koi bhi future
expiry, koi bhi CVV se payment test kar sakte hain — real paisa nahi katega.

Jab satisfied ho jaayein, Razorpay dashboard me **Live Mode** activate karke
(KYC complete karne ke baad) live keys `.env`/Render env variables me daal
dein — bas, real payments chalna shuru ho jaayenge.

---

## 5. Google Ads se connect karna

1. `public/index.html` ke `<head>` me yeh lines already hain:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=AW-CONVERSION_ID"></script>
   <script>
     gtag('config', 'AW-CONVERSION_ID');
   </script>
   ```
2. Google Ads account kholein → **Tools & Settings → Conversions → + New
   conversion action → Website**.
3. "Purchase" ke liye conversion banayein — Google aapko ek **Conversion ID**
   (e.g. `AW-123456789`) aur **Conversion Label** dega.
4. `index.html` me `AW-CONVERSION_ID` ko is real ID se replace kar dein (do
   jagah — `<script src=...id=...>` aur `gtag('config', ...)` dono me).
5. `js/main.js` me purchase event already fire hota hai jab payment success
   hota hai:
   ```js
   gtag('event', 'purchase', { transaction_id: ..., value: amount, currency:"INR" });
   ```
   Isse Google Ads automatically track kar lega ki ad se click aakar kitni
   sales hui.
6. (Optional but recommended) Google Analytics 4 property bhi banayein aur
   `G-GA4_ID` ko bhi `gtag('config', ...)` me add kar dein — behaviour/funnel
   analysis ke liye.
7. Google Ads Campaign banate waqt **Final URL** me apni Render live URL
   dalein (e.g. `https://janhavi-rakhi-landing.onrender.com`).

---

## Naye updates (is version me)

1. **Fully mobile-friendly** — header, hero, countdown, quiz, course cards,
   checkout modal, sab kuch chhote phone screens (320px tak) par test karke
   fix kiya gaya hai. Buttons stack ho jaate hain, text/padding chhota ho
   jaata hai, mobile par neeche sticky "Enroll Now" bar rehta hai.

2. **Level Test ab email + phone maange bina result nahi dikhata.** Quiz
   khatam hote hi ek "🔒 Unlock My Result" screen aati hai — valid email aur
   mobile number daalne ke baad hi score aur course-recommendation dikhta
   hai. Yeh lead automatically `digitalscript07@gmail.com` par bhi chali
   jaati hai (naya endpoint `/api/quiz-lead`), taaki aap follow-up kar sakein
   chahe woh student course na bhi khareede.

3. **Purchase ke baad janhavipanwar.com access:**
   > ⚠️ Important limitation: Humare paas `janhavipanwar.com` (aapki
   > asli LMS website) ke backend/admin ka access ya API nahi hai, isliye
   > payment hone ke turant baad automatically account create/enable
   > **karna abhi possible nahi hai** — usके liye unke system se connect
   > karna padega (agar unka koi API/webhook ho to bata dena, hum jod
   > denge).
   >
   > Filhaal jo flow set kiya hai:
   > - Payment success hote hi customer ko ek button dikhta hai **"Go to
   >   your course on janhavipanwar.com →"** (seedha us course ke real
   >   page par), aur bataya jaata hai ki wahi email use karke
   >   sign in/register karein.
   > - Usi waqt `digitalscript07@gmail.com` par ek email jaati hai jisme
   >   clearly likha hota hai: **"Action needed: is student (email) ko is
   >   course ka access janhavipanwar.com par activate/grant karein"** —
   >   taaki aap ya aapki team manually 1-click enroll kar sake.
   >
   > Agar aap chahte hain ki yeh bhi 100% automatic ho (bina manual step
   > ke), to `janhavipanwar.com` (jo shayad Laravel-based LMS hai) me ek
   > chhota internal API endpoint banwana hoga jise yeh landing-page
   > backend payment-success par call kare — yeh agla step ho sakta hai,
   > bata dena.

## Content update karna

- **Sale % / end date:** `public/js/main.js` ke top me `DISCOUNT_PCT` aur
  `SALE_END` variables.
- **Courses / prices / images:** same file ke `PRODUCTS` array — yahin se
  naya course add ya price change kar sakte hain.
- **Quiz questions / recommendation logic:** `public/js/quiz.js`.
- **Contact info / address / social links:** `public/index.html` footer section.
- **Colors / fonts:** `public/css/style.css` ke top `:root` variables.
- **Hero banner photo (Janhavi ma'am ki image):** `public/index.html` me
  `.hero-photo-frame` block — bas `<img src="...">` ka URL badal dijiye.
- **Support Chatboard Q&A (login/account questions):** `public/js/chatbot.js`
  ke top me `CHAT_FAQ` array — har entry `{ q, keywords, a }` format me hai.
  Bas naya object add kar dijiye, koi aur JS change karne ki zaroorat nahi.
  Filhal 5 starter login-related Q&A already daal diye hain, taaki chat
  abhi se live/kaam karta rahe — aap jitne chahein add kar sakte hain.

## Already-done SEO checklist
- Unique title/meta description, Open Graph tags
- `Course` schema.org structured data
- Mobile-first fully responsive layout
- Fast load (no heavy framework, only Google Fonts + Razorpay SDK)

> Go-live se pehle `index.html` ke `canonical`/OG URL ko apni real domain se
> replace kar dein, aur agar chahen to ek custom subdomain
> (e.g. `offers.janhavipanwar.com`) Render ke **Custom Domain** settings se
> jod sakte hain.
