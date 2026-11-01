# AstroQuack

Sito di AstroQuack, astrologia con le piume: il cielo giorno per giorno, il calendario dei transiti, le lune del mese, il calcolo del tema natale con Swiss Ephemeris, il blog delle rubriche, il modulo Contattami e gli eventi.

Il sito è statico: nessun database e nessun login. Tutti i calcoli astronomici avvengono nel browser con Swiss Ephemeris 2.10 compilato in WebAssembly. A ogni pubblicazione, Vercel avvia `scripts/build.mjs`, che genera una pagina per ogni articolo del blog, l’indice `/blog`, `sitemap.xml`, `robots.txt` e i dati per i motori di ricerca nella cartella `dist/`.

## Struttura

```
index.html                     pagina principale
admin/                         pannello di gestione (Decap CMS): articoli, eventi, impostazioni
api/auth.js, api/callback.js   accesso al pannello con GitHub
content/
  settings.json                impostazioni: indirizzo, email, social, chiavi dei servizi
  posts/*.json                 un file per ogni articolo del blog
  events.json                  eventi
assets/
  css/style.css                stile
  fonts/                       caratteri ospitati nel sito (nessuna richiesta a Google)
  icons/                       icone per telefono e schede del browser
  img/og/                      immagini di anteprima per i social
  img/uploads/                 immagini caricate dal pannello
  js/main.js                   interfaccia del sito
  js/engine.js                 motore astrologico (case, aspetti, transiti, lune)
  js/atlas.js                  atlante: tutti i comuni italiani e oltre 7.000 città del mondo
  js/boot.mjs, js/swisseph-*   Swiss Ephemeris in WebAssembly
  swisseph/                    effemeridi 1800–2399
scripts/build.mjs              genera pagine articolo, privacy, 404, sitemap e contenuti
vercel.json                    impostazioni di Vercel
```

## Pubblicare su Vercel

1. Su GitHub crea un repository **pubblico** (per esempio `astroquack`) e carica tutti i file di questa cartella, mantenendo la struttura.
2. Su [vercel.com](https://vercel.com) scegli **Add New → Project** e importa il repository.
3. Impostazioni del progetto: Framework Preset **Other**. Comando di generazione e cartella di uscita sono già scritti in `vercel.json`, non serve impostarli.
4. Premi **Deploy**. A ogni modifica salvata su GitHub, Vercel ripubblica il sito da solo.
5. Per usare il tuo dominio: nel progetto Vercel apri **Settings → Domains**, aggiungi il dominio e segui le istruzioni per i record DNS.

## Attivare i servizi

Tutte le chiavi si inseriscono nel pannello, alla voce **Impostazioni**, oppure nel file `content/settings.json`.

1. **Pannello di gestione (`/admin`).**
   - Su GitHub: Settings → Developer settings → OAuth Apps → **New OAuth App**. Homepage URL: l’indirizzo del sito. Authorization callback URL: `https://INDIRIZZO-DEL-SITO/api/callback`. Crea e genera un **Client secret**.
   - Su Vercel: progetto → Settings → **Environment Variables**: aggiungi `GITHUB_CLIENT_ID` e `GITHUB_CLIENT_SECRET`, poi **Redeploy**.
   - Il pannello chiede a GitHub solo il permesso sui repository **pubblici** (`public_repo`), quindi il repository deve essere pubblico. Se per un periodo resta privato, aggiungi su Vercel anche `GITHUB_OAUTH_SCOPE` con valore `repo`, e toglila quando lo rendi pubblico.
   - Apri `/admin` e accedi con GitHub. Ogni salvataggio crea un commit e Vercel ripubblica il sito in un minuto.
   - Dopo il primo accesso al pannello, sul sito compaiono solo per te l’elenco degli aspetti del tema natale e il riquadro «Il tuo pannello» nel Blog.
2. **Invio diretto dei messaggi.** Su [web3forms.com](https://web3forms.com) inserisci la tua email e ricevi una chiave: copiala in `web3formsKey`. Senza chiave il modulo apre l’app di posta del visitatore.
3. **Statistiche.** Su Vercel: progetto → **Analytics** → Enable. Non usano cookie; per spegnerle metti `analytics` a `false`.
4. **Newsletter.** Crea un modulo di iscrizione nel servizio che preferisci (per esempio Brevo, MailerLite o Buttondown) e copia l’indirizzo «action» del modulo in `newsletterAction`, il nome del campo email in `newsletterEmailField` ed eventuali campi nascosti in `newsletterExtraFields`. Finché `newsletterAction` è vuoto, la sezione non compare.
5. **Privacy.** Compila `titolare` (nome e cognome, eventuale partita IVA): la pagina `/privacy` si aggiorna da sola. Il testo è una base da far verificare a un consulente.

## Modifiche frequenti

Tutte si fanno direttamente su GitHub: apri il file, premi la matita, modifica e salva con **Commit changes**.

- **Indirizzo del sito, email, social, codice di Google e chiavi dei servizi:** pannello → Impostazioni, oppure `content/settings.json`. Quando avrai un dominio, cambia `url` (per esempio `https://www.astroquack.it`): pagine, sitemap e anteprime si aggiornano da sole.
- **Articoli ed eventi:** dal pannello `/admin`. In alternativa, un articolo è un file JSON in `content/posts/` (il nome del file diventa l’indirizzo) e gli eventi sono in `content/events.json`.
- **Testi delle sezioni:** in `index.html`.

## Motori di ricerca

- Ogni articolo ha una pagina propria, `/blog/nome-articolo`, con titolo, descrizione, immagine di anteprima e dati strutturati `BlogPosting`.
- `sitemap.xml` e `robots.txt` si generano da soli a ogni pubblicazione.
- **Google Search Console:** aggiungi il sito come «Prefisso URL», scegli la verifica con «Tag HTML», copia solo il valore di `content="…"` in `googleVerification` (pannello → Impostazioni), salva e attendi la nuova pubblicazione, poi premi «Verifica». Infine, alla voce «Sitemap», invia `sitemap.xml`.
- **Articoli programmati:** un articolo con data futura compare in home dal giorno stabilito, ma la sua pagina entra nella sitemap alla pubblicazione successiva. Basta una qualsiasi modifica salvata su GitHub, oppure «Redeploy» su Vercel.

## Provare il sito sul computer

Il sito carica le effemeridi con `fetch`, quindi non funziona aprendo `index.html` con un doppio clic. Avvia un piccolo server nella cartella:

```
python3 -m http.server 8000
```

e apri `http://localhost:8000`. Per provare anche le pagine del blog: `node scripts/build.mjs`, poi avvia il server dentro la cartella `dist`.

## Calcoli

- Swiss Ephemeris 2.10, effemeridi `.se1` (precisione piena), zodiaco tropicale, posizioni geocentriche apparenti.
- Case Placidus predefinite; Koch, Regiomontano, Campano, Porfirio, Equal e Whole Sign selezionabili. Nodo vero o medio, Lilith media o osculante.
- Ora locale convertita con il database dei fusi IANA del browser, ora legale storica italiana compresa.
- Luogo di nascita: tutti i 7.894 comuni italiani, distinti per provincia (Samone TO e Samone TN), con i nomi bilingui dell’Alto Adige, e oltre 7.000 città del mondo con il loro fuso orario. Per i luoghi assenti si inseriscono le coordinate.
- Coordinate in gradi e primi come su astro.com (41°54′ = 41,9°).
- Verifica di riferimento: 15/05/1994 ore 20:35, Roma (41°54′ N, 12°29′ E) → Ascendente 28°00′ Scorpione, Medio Cielo 13°10′ Vergine, come astro.com.

## Limiti di questa versione

- **Elenco degli aspetti:** compare a chi ha effettuato l’accesso al pannello da quel browser. Non è un dato riservato, quindi basta questa protezione leggera.
- **Immagini di anteprima:** ogni articolo usa l’immagine della sua rubrica; il titolo dell’articolo compare nel testo dell’anteprima.

## Sicurezza

- **Intestazioni di sicurezza** in `vercel.json`: Content Security Policy rigorosa (nessuno script esterno o inline, solo WebAssembly), protezione dal caricamento in iframe, HSTS, `nosniff`, Permissions-Policy. Il pannello `/admin` ha una politica separata.
- **Nessun codice di terze parti caricato a runtime:** font, Swiss Ephemeris e Decap CMS sono ospitati nel sito.
- **Contenuti filtrati:** tutto ciò che arriva da articoli, eventi e moduli viene trasformato in testo sicuro prima di entrare nella pagina; le immagini accettano solo indirizzi del sito o `https`.
- **Accesso al pannello:** OAuth con controllo dello stato, token consegnato solo alla finestra del pannello sullo stesso indirizzo, permessi minimi.
- **Segnalazioni:** `/.well-known/security.txt` indica l’indirizzo a cui scrivere.
- **Da tenere attivi:** autenticazione a due fattori su GitHub e Vercel; chiavi e segreti solo nelle variabili d’ambiente di Vercel, mai nel repository.

## Licenza

Il codice è distribuito con licenza **GNU AGPL-3.0-or-later** (file `LICENSE`), come richiesto da Swiss Ephemeris. Chi usa il sito deve poter accedere al codice sorgente: per questo il repository è pubblico e il footer contiene il link «Codice sorgente».

Logo, nome AstroQuack, illustrazioni e testi sono contenuti riservati di AstroQuack e non rientrano nella licenza del codice. Dettagli in `NOTICE.md`.
