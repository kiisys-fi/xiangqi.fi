---
title: 'Pelisäännöt'
path: 'pelisaannot'
---

Kiinalainen shakki, eli XiànQí (lausutaan ɕiaŋ53 tɕʰi35 [IPA], hsiang-chi), eli elefanttipeli, on vanha kahden hengen lautapeli. Pelin alkuperästä ei ole varmuutta, mutta sen oletetaan kehittyneen samoista alkulähteistä kuin länsimaisen shakin. Aiheesta on kerrottu hieman enemmän myös myös Kiisysin pitämissä esitelmissä.

## Miten pelataan?

Tässä on lyhyt kuvaus pelisäännöistä suomeksi. Viralliset WXF:n säännöt löytyvät [täältä](https://www.wxf-xiangqi.org/index.php?option=com_content&view=article&id=269&Itemid=291&lang=en). Säännöt on selitetty selkeästi kuvineen myös [tässä](https://www.pychess.org/variants/xiangqi).

### Alkuasema

Alkuasema on seuraavassa kuvassa. Pelilaudan jakaa kahteen puoliskoon viidennen ja kuudennen rivin välissä kulkeva joki, jonka vain sotilaat, hevoset, tykit ja vaunut pystyvät ylittämään. Molempien pelaajien tärkein nappula, kenraali, sijaitsee koko pelin ajan palatsissa. Punaisen palatsi on pisteiden d1-d3-f3-f1 rajaama alue.

Seuraavalla interaktiivisella laudalla voit harjoitella nappuloiden liikuttamista

<link rel="stylesheet" href="https://cdn.elephantchess.io/dist/0.1.1/board.min.css">
<script defer src="https://cdn.elephantchess.io/dist/0.1.1/xiangqi.min.js"></script>
<script defer src="https://cdn.elephantchess.io/dist/0.1.1/board-gui.min.js"></script>

<style>
  .xiangqi-board {
    max-width: 640px;
    margin: 1.5rem auto;
  }

  .xiangqi-board .board-container {
    box-sizing: content-box;
  }

  .piece-pair {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0 0.75rem;
  }

  .piece-pair img {
    width: 56px;
    height: 56px;
  }
</style>

<div class="xiangqi-board">
  <div id="board-container" class="board-container" role="region" aria-label="Kiinalaisen shakin alkuasema"></div>
  <div class="text-center mt-3">
    <button id="board-reset" class="btn btn-outline-secondary btn-sm" type="button">
      <i class="fas fa-undo-alt" aria-hidden="true"></i>
      Palauta alkuasema
    </button>
    <small class="d-block mt-2">powered by <a href="https://elephantchess.io">elephantchess.io</a></small>
  </div>
</div>

<script>
  window.addEventListener('load', () => {
    const boardGui = new BoardGui({ elementId: 'board-container' });
    boardGui.loadFen(DEFAULT_START_FEN);
    document.getElementById('board-reset').addEventListener('click', () => {
      boardGui.loadFen(DEFAULT_START_FEN, true);
    });
  });
</script>

### Kuinka nappulat liikkuvat?

#### Kenrali

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_general.png" alt="Punainen kenraali" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_general.png" alt="Musta kenraali" width="56" height="56" loading="lazy">
</div>

Kenraali (K) siirtyy yhden pisteen linjaa tai riviä pitkin palatsissa. Kenraalit eivät saa olla samalla linjalla ilman että niiden välissä olisi vähintään yksi nappula.

#### Vaunu

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_chariot.png" alt="Punainen vaunu" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_chariot.png" alt="Musta vaunu" width="56" height="56" loading="lazy">
</div>

Vaunu (V) siirtyy linjaa tai riviä pitkin halutun matkan.

#### Tykki

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_cannon.png" alt="Punainen tykki" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_cannon.png" alt="Musta tykki" width="56" height="56" loading="lazy">
</div>

Tykki (T) siirtyy linjaa tai riviä pitkin halutun matkan tai lyö vastustajan nappulan, jolloin tykin ja lyötävän nappulan välisellä linjalla tai rivillä on oltava täsmälleen yksi oma tai vastustajan nappula ‘pukkina’.

#### Hevonen

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_horse.png" alt="Punainen hevonen" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_horse.png" alt="Musta hevonen" width="56" height="56" loading="lazy">
</div>

Hevonen (H) siirtyy ensin yhden pisteen linjaa tai riviä pitkin vapaaseen pisteeseen, jonka jälkeen vinottain yhden pistevälin samaan etenemissuuntaan. Jos ensimmäisessä pisteessä on nappula, siirto ei ole sallittu.

#### Sotilas

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_soldier.png" alt="Punainen sotilas" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_soldier.png" alt="Musta sotilas" width="56" height="56" loading="lazy">
</div>

Sotilas (S) siirtyy yhden pisteen eteenpäin, joen ylitettyään myös sivulle.

#### Elefantti

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_elephant.png" alt="Punainen elefantti" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_elephant.png" alt="Musta elefantti" width="56" height="56" loading="lazy">
</div>

Elefantti (E) siirtyy vinoon 2 pistettä yhden vapaana olevan pisteen yli; se ei ylitä jokea.

#### Neuvonantaja

<div class="piece-pair">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/red_advisor.png" alt="Punainen neuvonantaja" width="56" height="56" loading="lazy">
  <img src="https://cdn.elephantchess.io/static/images/pieces/traditional/black_advisor.png" alt="Musta neuvonantaja" width="56" height="56" loading="lazy">
</div>

Neuvonantaja (N) siirtyy yhden pisteen vinoon palatsissa.

### Kuinka peli voitetaan?

Pelin voittaa pelaaja joka uhkaa lyödä vastapuolen kenraalin siten, ettei uhkausta voi mitenkään torjua. Vastapelaajasta on näin tehty matti. Pelin voittaa myös, kun siirtovuorossa olevalla vastapuolella ei ole yhtään laillista siirtoa - hänestä on tehty patti.

### Nappuloiden arvioitu voimasuhde

Näihin arvioituihin voimasuhteisin käytännön pelissä vaikuttavat lisäksi myös muiden nappuloiden sijainti laudalla sekä jäljellä olevien nappuloiden määrä. Esimerkiksi tykin voimakkuus pienenee nappulamäärän laudalla vähetessä, ja viimeisellle riville edennyt sotilas heikkenee sen menettäessä kyvyn liikkua enää eteenpäin. Näihin ei siis kannata luottaa sokeasti.

- **Sotilas ennen joen ylittämistä**: 1p
- **Sotilas joen ylittämisen jälkeen**: 2p
- **Neuvonantaja**: 2p
- **Elefantti**: 2p
- **Hevonen**: 4p
- **Tykki**: 4.5p
- **Vaunu**: 9p
