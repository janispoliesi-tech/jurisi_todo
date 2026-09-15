# Saraksts — uzdevumi ar kategorijām

Uzdevumu saraksts, kas strādā uz telefona, planšetes un datora. Veidots ar
Next.js (App Router) un Supabase, gatavs publicēšanai Vercel.

- **Kategorijas.** Uz maza ekrāna tās ir josla lapas augšā ar ikonām — to var
  stumt uz sāniem; uz lielāka ekrāna tā pati josla kļūst par sānjoslu.
- **Kategorijas pievieno pats.** Nosaukums, ikona (~180 ikonas ar meklēšanu,
  tostarp būvniecības) un krāsa. Kategoriju var pārsaukt un izdzēst; uzdevumi
  pie tam netiek zaudēti.
- **Izdarītie paliek turpat.** Atzīmētais uzdevums nepazūd — tas noslīd saraksta
  apakšā zem atdalītāja «Izdarīts» un kļūst nosvītrots. Atdalītāju var sakļaut,
  izdarīto var atjaunot, bet visus izdarītos sadaļā — izdzēst ar vienu pogu.
- **Papildus.** Termiņi ar ātrajām pogām (šodien / rīt / pēc nedēļas), piezīmes,
  meklēšana, gaišs un tumšs noformējums, instalējama kā lietotne telefonā.
- **Katrs lietotājs redz tikai savus datus** — to nodrošina Supabase Row Level
  Security, nevis tikai aplikācijas kods.

---

## 1. Publicēšana Vercel

### 1.1. Augšupielādē kodu

Izpako arhīvu un ieliec kodu GitHub repozitorijā:

```bash
cd supabase-todo
git init
git add .
git commit -m "Sākuma versija"
git branch -M main
git remote add origin git@github.com:<tavs-lietotajvards>/supabase-todo.git
git push -u origin main
```

Pēc tam Vercel: **Add New → Project → Import Git Repository**. Iestatījumos
neko mainīt nevajag — Vercel pats atpazīst Next.js.

> Alternatīva bez GitHub: `npm i -g vercel`, tad `vercel` projekta mapē.

Pirmais deploy parādīs lapu ar uzrakstu «Vēl jāpieslēdz datubāze» — tas ir
gaidīts, jo datubāze vēl nav pievienota.

### 1.2. Pievieno Supabase

Vercel projektā: **Storage → Create Database → Supabase**. Nosaukumu ieraksti
**`supabase-todo`** un pievieno to šim projektam.

Integrācija pati ieliek vajadzīgos vides mainīgos, tostarp:

| Mainīgais | Kam vajadzīgs |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase projekta adrese |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publiskā atslēga (droši atklāt — datus sargā RLS) |

Ja tavā Supabase projektā atslēga saucas `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
vai `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`, aplikācija atpazīst arī tās —
neko pārsaukt nevajag.

### 1.3. Izveido tabulas

Supabase kontrolpanelī: **SQL Editor → New query**. Ielīmē visu faila
[`supabase/schema.sql`](supabase/schema.sql) saturu un nospied **Run**.

Skripts izveido tabulas `categories` un `todos`, indeksus, Row Level Security
politikas un trigeri, kas jaunam lietotājam uzreiz uzliek četras sākuma
kategorijas (Mājas, Darbs, Pirkumi, Idejas). Skriptu var droši palaist atkārtoti.

### 1.4. Noregulē pieteikšanos

Supabase: **Authentication → URL Configuration**

- **Site URL:** `https://<tavs-projekts>.vercel.app`
- **Redirect URLs:** pievieno `https://<tavs-projekts>.vercel.app/auth/callback`
  un — ja strādāsi arī lokāli — `http://localhost:3000/auth/callback`

Sadaļā **Authentication → Sign In / Providers → Email** izlem, vai e-pasts
jāapstiprina:

- **ieslēgts apstiprinājums** (noklusējums) — pēc reģistrācijas jāatver saite
  e-pastā; drošāk, bet Supabase bezmaksas plāna vēstuļu limits ir neliels;
- **izslēgts apstiprinājums** — konts strādā uzreiz pēc reģistrācijas; ērti, ja
  aplikāciju lietosi tikai tu un pāris cilvēki.

### 1.5. Pārpublicē

Vercel: **Deployments → pēdējais deploy → Redeploy**, lai jaunie vides mainīgie
nonāktu līdz aplikācijai. Atver adresi, izveido kontu — un viss.

---

## 2. Lokāla izstrāde

```bash
npm install
cp .env.example .env.local   # ieraksti Supabase URL un anon atslēgu
npm run dev                  # http://localhost:3000
```

Vērtības atrodamas Supabase: **Project Settings → API**.

Citas komandas:

```bash
npm run build   # ražošanas būvējums
npm run start   # palaiž uzbūvēto versiju
npm run lint    # ESLint
```

---

## 3. Kā tas ir salikts

```
src/
  app/
    layout.tsx              lapas karkass, tēma, PWA metadati
    page.tsx                galvenā lapa — ielādē datus servera pusē
    login/page.tsx          pieteikšanās un reģistrācija
    auth/callback/route.ts  e-pasta saišu apstrāde (?code=…)
    auth/confirm/route.ts   alternatīvais ceļš (token_hash + type)
    auth/update-password/   jaunas paroles ievade
    globals.css             krāsu mainīgie, gaišā/tumšā tēma
  components/
    TodoApp.tsx             visa stāvokļa un darbību loģika
    Navigation.tsx          kategoriju josla (mobilajam) un sānjosla
    Composer.tsx            jauna uzdevuma ievade
    TodoRow.tsx             viena uzdevuma rinda
    TodoSheet.tsx           uzdevuma rediģēšana
    CategorySheet.tsx       kategorijas izveide / rediģēšana
    …
  lib/
    supabase/               klienti pārlūkam, serverim un sesijas atjaunošanai
    icons.ts                ikonu saraksts kategorijām
    colors.ts               kategoriju krāsu palete
  proxy.ts                  sesijas atsvaidzināšana un piekļuves pārbaude
supabase/schema.sql         datubāzes shēma
```

### Datu modelis

**`categories`** — `id`, `user_id`, `name`, `icon`, `color`, `position`,
`created_at`.

**`todos`** — `id`, `user_id`, `category_id`, `title`, `note`, `done`,
`done_at`, `due_date`, `position`, `created_at`, `updated_at`.

Izdarīts uzdevums ir tāds, kuram `done = true`; atsevišķas arhīva tabulas nav.
Datubāzes trigeris pats ieliek `done_at`, kad uzdevumu atzīmē, un notīra to, kad
uzdevumu atjauno.

Izdzēšot kategoriju, tās uzdevumi paliek — tiem `category_id` kļūst tukšs un tie
parādās sadaļā «Bez kategorijas».

### Kā notiek saglabāšana

Izmaiņas parādās uzreiz ekrānā un tikai tad tiek aizsūtītas uz Supabase. Ja
sūtīšana neizdodas, izmaiņa tiek atritināta atpakaļ un parādās paziņojums. Kad
atgriezies pie cilnes pēc pārtraukuma, dati tiek pārlādēti, tāpēc telefons un
dators paliek sinhroni.

---

## 4. Biežākie jautājumi

**Lapa rāda «Vēl jāpieslēdz datubāze».** Trūkst vides mainīgo — izpildi 1.2.
soli un pēc tam pārpublicē projektu.

**Reģistrējos, bet vēstule nepienāk.** Supabase bezmaksas plānā ir zems
vēstuļu limits. Vai nu izslēdz e-pasta apstiprināšanu (1.4. solis), vai
pieslēdz savu SMTP: **Authentication → Emails → SMTP Settings**.

**Pēc pieteikšanās atgriež atpakaļ uz pieteikšanās lapu.** Pārbaudi, vai Site
URL un Redirect URLs Supabase sakrīt ar reālo Vercel adresi.

**Vai tiešām drīkst atklāt anon atslēgu?** Jā. Tā ir domāta pārlūkam; datus
sargā Row Level Security politikas, kas neļauj redzēt svešus ierakstus.

**Kā uzlikt uz telefona kā lietotni?** Atver adresi telefonā un izvēlies
«Pievienot sākuma ekrānam» — aplikācijai ir manifests un ikonas.
