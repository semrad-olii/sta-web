# STA – Šťastný · statický web

Čisté HTML + CSS + JS, žádný build ani server. Stačí nahrát celou složku na libovolný hosting.

## Fotky

- `img/z/` – skutečné fotky zakázek od klienta (velké) a `img/z/t/` (náhledy). Jsou už v balíčku.
- Ostatní fotky v `img/` (pozadí, mapa, ilustrace) pocházejí z Figmy – postup exportu níže.

## 1. Doplnit fotky z Figmy (jednorázově)

Fotky nejsou součástí balíčku – vyexportujte je z Figmy:

1. Ve Figmě najděte rám **„EXPORT → fotky pro web (složka img)“** (řádek *05 — Export fotek pro web*).
2. Dvojklik do rámu → **Cmd/Ctrl + A** → vpravo v panelu **Export** → **Export 18 layers**.
3. Rozbalte stažený ZIP a všechny soubory (`hero-brankar.jpg`, `betony.jpg`, …) vložte do složky **`img/`**.

Názvy souborů musí zůstat přesně tak, jak je Figma vyexportuje. Dokud fotka chybí, web místo ní ukáže tmavý placeholder s názvem souboru.

Soubory, které web očekává:
`arena, betony, betony-hbc, detail-kuze, dilna, galerie-akce, galerie-betony, galerie-hero, galerie-vesta, galerie-vyrazecka, hero-brankar, lapacka, mapa, remeslnik, repase-pred-po, stadion, vesta, vyrazecka` (vše `.jpg`).

> Tip: před ostrým spuštěním fotky zmenšete (např. squoosh.app, šířka max. 1600 px), web bude rychlejší.

## 2. Zobrazit lokálně

Stačí otevřít `index.html` v prohlížeči.

## 3. Nahrát na hosting

**Netlify (nejrychlejší, zdarma):** app.netlify.com/drop → přetáhnout celou složku → hned máte odkaz pro klienta.

**GitHub Pages:**
1. Nový repozitář na GitHubu → *Add file → Upload files* → přetáhnout **obsah** této složky (ne složku samotnou).
2. *Settings → Pages → Source: Deploy from a branch → main / (root)* → Save.
3. Za minutu běží na `https://<uživatel>.github.io/<repozitář>/`.

**Vlastní hosting (Wedos, Forpsi…):** nahrát obsah složky přes FTP do `www/` nebo `public_html/`.

## 4. Formulář

V ukázce formulář jen přesměruje na `dekujeme.html` (nic se neodesílá). Pro ostrý provoz:
- **Netlify Forms:** do `<form>` v `kontakt.html` a `index.html` přidat `name="poptavka" method="POST" data-netlify="true"`.
- **Formspree / Basin:** změnit `action` na URL od služby a `method="POST"`.

## Stránky

| Soubor | Stránka |
|---|---|
| index.html | Úvod |
| vyroba.html | Výroba na zakázku (rozcestník) |
| betony / lapacky / vyrazecky / vesty .html | Produkty |
| repase.html | Repase a opravy |
| galerie.html | Galerie s filtrem a lightboxem |
| zakazka.html | Detail zakázky |
| o-nas.html | O nás |
| kontakt.html | Kontakt a poptávka |
| dekujeme.html | Po odeslání formuláře |
| obchodni-podminky.html, ochrana-osobnich-udaju.html | Právní stránky (zástupný text) |
| 404.html | Chybová stránka (GitHub Pages i Netlify ji použijí automaticky) |

## K ověření s klientem

Ceník repasí, doby oprav, parametry a citace u detailu zakázky a právní texty jsou ukázkové – před spuštěním nahradit skutečnými. Odkazy na Instagram a Facebook v patičce zatím vedou na `#`.
