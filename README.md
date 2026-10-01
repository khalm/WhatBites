# WhatBites 🎣

Hva biter? Pek kameraet mot vannet og agnboksen din — WhatBites viser hvilket agn du bør bruke akkurat nå.
*What bites? Point your camera at the water and your bait box — WhatBites shows which bait to use right now.*

**Åpne appen / Open the app:** https://khalm.github.io/WhatBites/

## Slik virker det / How it works
1. **Sted og vær** — henter posisjon, vær (temperatur, vind, skydekke, lufttrykk og trend, sol opp/ned) og fiskearter registrert innen ca. 30 km.
2. **Vis vannet** — ta bilde av fiskeplassen; AI vurderer vanntype, sikt, lys og struktur.
3. **Vis agnboksen** — ta bilde av boksen; appen markerer det beste agnet i bildet og rangerer resten.

Norsk er standard, trykk **EN/NO** øverst for å bytte språk.

## Installer på telefonen / Install on your phone
- **iPhone (Safari):** Åpne lenken → Del-knappen → **Legg til på Hjem-skjerm**.
- **Android (Chrome):** Åpne lenken → ⋮-menyen → **Installer app** / **Legg til på startskjermen**.

## API-nøkkel / API key
Bildeanalysen bruker Claude. Lag en nøkkel på [console.anthropic.com](https://console.anthropic.com), trykk ⚙︎ i appen og lim den inn.
Nøkkelen lagres kun på telefonen din. Hver analyse koster noen få øre i API-bruk.

## Datakilder / Data sources
- Vær: [Open-Meteo](https://open-meteo.com) (gratis, ingen nøkkel)
- Fiskearter: [GBIF](https://www.gbif.org) observasjonsdata
- Stedsnavn: [OpenStreetMap Nominatim](https://nominatim.org)

## Teknisk
Ren HTML/CSS/JavaScript uten byggesteg, hostet på GitHub Pages. Kan redigeres direkte i GitHub på mobilen.
- `index.html` — sider og layout
- `app.js` — all logikk og oversettelser (`T`-objektet øverst)
- `style.css` — utseende
- `sw.js`, `manifest.json` — installerbar app (PWA)
