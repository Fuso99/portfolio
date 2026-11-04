# Portfolio — Gabriele Fuso Nerini

Portfolio pubblico + backoffice personale, costruiti su un unico file dati: `data/cv-data.json`.

Stack: Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, Framer Motion, Lucide, React Hook Form + Zod, dnd-kit, Sonner, jose, @react-pdf/renderer.

## Avvio

```bash
npm install
cp .env.example .env.local   # imposta ADMIN_PASSWORD e AUTH_SECRET (openssl rand -base64 48)
npm run dev                  # http://localhost:3000 (→ /it o /en), backoffice su /admin
```

Produzione: `npm run build && npm start`. Serve un server Node con disco scrivibile (VPS, Docker, Raspberry Pi…): i dati sono file JSON. Su piattaforme serverless con filesystem in sola lettura (es. Vercel) il backoffice non può salvare: in quel caso va sostituito `src/lib/store.ts` con un database o un blob store.

## Struttura

```
data/cv-data.json            Fonte unica dei dati (estratta dal CV .docx)
data/backups/                Ultime 20 versioni del CV, una per salvataggio (ignorato da git)
src/proxy.ts                 Redirect alla lingua (/ → /it o /en) e controllo ottimistico di /admin
src/i18n/                    Lingue supportate e dizionari dei testi dell'interfaccia (sito e PDF)
src/app/[lang]/              Il portfolio pubblico, una versione per lingua
src/lib/schema.ts            Schema Zod del CV: validazione lato client, API e import
src/lib/store.ts             Lettura/scrittura atomica dei file JSON + backup
src/lib/public-cv.ts         CV pubblico in cache ("use cache", tag "cv")
src/lib/auth.ts              Sessione: JWT HS256 in cookie httpOnly (jose)
src/components/public/       Sezioni del portfolio (usate anche dall'anteprima live)
src/components/admin/        Editor, tab, drag & drop, anteprima, import/export
src/pdf/                     Documento PDF del CV e rendering lato server
src/app/api/                 API route (vedi sotto)
```

## API

| Metodo | Rotta | Accesso | Cosa fa |
| --- | --- | --- | --- |
| GET | `/api/cv?lang=en` | pubblico | CV senza gli elementi nascosti, in una lingua (`it` predefinita) |
| GET | `/api/cv/pdf?lang=en&skills=java,kafka` | pubblico | PDF nel modello scelto dal backoffice, filtrato per id di competenza; `&template=modern\|classic\|trace` lo forza |
| POST | `/api/admin/login`, `/api/admin/logout` | — | Apre/chiude la sessione |
| GET / PUT | `/api/admin/cv` | admin | Legge (`?download=1` per scaricare) / valida, salva e invalida la cache |
| POST | `/api/admin/pdf?template=&lang=` | admin | PDF generato dalla bozza non salvata (con telefono) |

## Come funziona

- **Cache**: la home è prerenderizzata. Salvando dal backoffice viene chiamato `revalidateTag("cv")` e la pagina successiva mostra già i nuovi dati. Se modifichi `cv-data.json` a mano, riavvia il server.
- **Anteprima live**: l'editor renderizza gli stessi componenti del sito con i dati della bozza. Le sezioni usano container query, quindi si adattano al riquadro (modalità desktop a 1280px ridotta, oppure mobile a 390px).
- **Filtri per competenza**: una competenza corrisponde a una tecnologia se il nome coincide o ne è il prefisso ("Java" → "Java 21") o tramite gli alias. Se aggiungi tecnologie agli incarichi, tieni allineati nomi e alias.
- **Sicurezza**: il proxy fa solo un controllo ottimistico; ogni API admin e la pagina `/admin` verificano di nuovo la sessione. Cookie `SameSite=Strict`, `Secure` in produzione, login limitato a 8 tentativi ogni 15 minuti per IP.

## Lingue

Il sito è in italiano (`/it`) e in inglese (`/en`). Chi apre `/` va alla lingua scelta l'ultima volta con il selettore (cookie `NEXT_LOCALE`), altrimenti a quella del browser: italiano se lo preferisce, inglese in tutti gli altri casi.

- **Testi dell'interfaccia** (titoli delle sezioni, pulsanti, messaggi, etichette del PDF): in `src/i18n/dictionaries.ts`. Il tipo dell'inglese è ricavato dall'italiano, quindi una chiave mancante è un errore di compilazione.
- **Contenuti del CV**: nel JSON i campi traducibili sono `{ "it": "…", "en": "…" }`. Nel backoffice il selettore **IT / EN** in alto cambia la lingua dei campi e dell'anteprima; sotto ogni campo inglese compare il testo italiano da tradurre. Un campo inglese vuoto mostra l'italiano sul sito, e il backoffice conta i campi ancora da tradurre.
- Restano uguali nelle due lingue i nomi propri (aziende, clienti, istituti), le tecnologie e le competenze, perché i filtri si basano su di essi.
- I JSON esportati prima dell'i18n si importano ancora: i testi diventano la versione italiana.

## PDF

Tre modelli in `src/pdf/templates/`: **Moderno** (predefinito), **Classico** e **Trace**. Si sceglie da Backoffice › Import ed export; la scelta è salvata in `settings.pdfTemplate`. Il PDF esce nella lingua della pagina da cui lo si scarica. Il telefono non compare mai nel PDF pubblico.

## Da rivedere nei dati

Il CV originale non contiene livelli di competenza, soft skill, certificazioni né link GitHub. I livelli (1–5) sono stime derivate dalle esperienze: correggili da **Backoffice › Competenze**.
