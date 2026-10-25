# Bloch-gömb Szimulátor

Böngészőben futó, interaktív oktatóprogram, amely egyetlen kvantumbit (qubit) állapotát jeleníti meg a Bloch-gömbön. A kezdőállapot csúszkákkal állítható be, majd az alapvető kvantumkapukat (X, Y, Z, Hadamard, S, T) alkalmazva valós időben követhető, hogyan mozog az állapotvektor a gömb felszínén.

A program nem igényel szerveroldali részt, minden számítás a böngészőben, JavaScriptben történik. A külső könyvtárak helyben megtalálhatók, ezért **internetkapcsolat nélkül is működik**.


## Funkciók

- Kezdőállapot megadása a θ (0–180°) és φ (0–360°) szögekkel, a vektor mozgatás közben azonnal frissül
- Hat kvantumkapu: X, Y, Z, Hadamard (H), S (fázisforgató, π/2) és T (π/4)
- Az alkalmazott kapuk sorozatának kijelzése az „Áramkör" mezőben (pl. `|ψ⟩ ➔ H ➔ T`)
- Az aktuális állapot rögzítése: számozott zöld vektorként a gömbön marad, és bekerül a „Rögzített állapotok" listába a létrehozó műveletekkel együtt
- 3D nézet: forgatás az egér bal gombjával, nagyítás görgővel
- Sötét témájú felület neon-kék és magenta színekkel

## Felhasznált technológiák

| Technológia | Verzió | Szerepe |
|---|---|---|
| HTML5 / CSS3 / JavaScript (ES6) | – | Felület, működés, számítások |
| [Plotly.js](https://plotly.com/javascript/) | 2.24.1 | 3D megjelenítés: átlátszó gömbfelület, tengelyek, állapotvektor, feliratok |
| [math.js](https://mathjs.org/) | 11.8.0 | Komplex számok és mátrixok kezelése |

## Fájlszerkezet

```
.
├── index.html          # Az oldal felépítése: vezérlők, gömb tárolója, rögzített állapotok listája
├── style.css           # Megjelenés: színek, elrendezés, gombok
├── script.js           # Működés: ábra, kvantumkapuk, állapotfrissítés, mentés és törlés
└── lib/
    ├── plotly.min.js   # Plotly.js 2.24.1 (helyi másolat)
    ├── math.min.js     # math.js 11.8.0 (helyi másolat)
    ├── plotly.LICENSE.txt
    └── math.LICENSE.txt
```

## Telepítés és indítás

Telepítés nem szükséges.

1. Töltsd le vagy másold át a teljes mappát, a `lib` mappával együtt.
2. Nyisd meg az `index.html` fájlt egy modern böngészőben (Chrome, Edge, Firefox vagy Safari, WebGL-támogatással).

## Használat

| Elem | Leírás |
|---|---|
| **Kezdőállapot** | A θ és φ csúszkákkal állítható be. A „Beállítás" gomb a csúszkák aktuális értékére állítja vissza a vektort. A kezdőállapot módosítása törli az áramkört. |
| **Kvantumkapuk** | Minden gombnyomás az aktuális állapotra alkalmazza a kaput, a rózsaszín vektor elmozdul, az áramkör-napló bővül. |
| **Állapot rögzítése** | A zöld gomb az aktuális vektort számozott zöld nyílként a gömbön hagyja, és felveszi a listába. |
| **Állapotok törlése** | Eltávolítja az összes rögzített vektort és a listát. Az aktuális állapot és az áramkör megmarad. |
| **Nézet** | Forgatás: egér bal gombja. Nagyítás: görgő. |

## Elméleti háttér

Egy qubit állapota `|ψ⟩ = α|0⟩ + β|1⟩`, ahol `|α|² + |β|² = 1`. A kezdőállapot a megadott szögekből:

```
|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)·sin(θ/2)|1⟩
```

A megjelenített Bloch-vektor:

```
x = 2·Re(α*β)    y = 2·Im(α*β)    z = |α|² − |β|²
```

| Kapu | Mátrix | Hatás a Bloch-vektorra |
|---|---|---|
| X | `[[0, 1], [1, 0]]` | π forgatás x körül: (x, −y, −z) |
| Y | `[[0, −i], [i, 0]]` | π forgatás y körül: (−x, y, −z) |
| Z | `[[1, 0], [0, −1]]` | π forgatás z körül: (−x, −y, z) |
| H | `1/√2 · [[1, 1], [1, −1]]` | x és z felcserélése, y előjelet vált |
| S | `[[1, 0], [0, i]]` | π/2 forgatás z körül |
| T | `[[1, 0], [0, e^(iπ/4)]]` | π/4 forgatás z körül |

## A kód felépítése

| Függvény | Feladata |
|---|---|
| `generateSphere()` | A gömbfelület rácspontjainak előállítása |
| `blochVector()` | Az (α, β) állapotból kiszámolja a Bloch-vektor (x, y, z) koordinátáit |
| `applyGate(név)` | Az adott kapu mátrixát megszorozza az állapotvektorral, normalizál, naplózza a kaput és frissíti az ábrát |
| `normalize()` | A lebegőpontos hibák felhalmozódását akadályozza meg |
| `setInitialState()` | A csúszkák értékéből felépíti a kezdőállapotot és alaphelyzetbe állítja az áramkört |
| `frissitGomb()` | A `Plotly.restyle` hívással csak az állapotvektort frissíti, a gömböt nem |

Az ábra hat alapréteget tartalmaz (gömb, három tengely, állapotvektor, feliratok), a rögzített állapotok ezek után, külön rétegként kerülnek hozzá.