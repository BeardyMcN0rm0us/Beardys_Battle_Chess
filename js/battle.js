/* Beardy's Battle Chess — on-board capture battles, Battle Chess style.
 * The attacker walks up and beats the defender down where he stands:
 * a three-hit combo, directional blood spray, a final killing blow that
 * takes the head off, blood pools spreading over the tile and splatter
 * on neighbouring squares. Gore OFF swaps all of it for star sparks
 * and a polite faint. */
var Battle = (function () {
  'use strict';

  var GORE_WORDS = ['SPLAT!', 'CRUNCH!', 'KAPOW!', 'THWACK!', 'SQUISH!', 'CHOP!', 'GUSH!', 'SPLURT!'];
  var SOFT_WORDS = ['BONK!', 'OOF!', 'WHAM!', 'POW!', 'BOOP!', 'ZONK!'];

  function el(tag, cls, parent) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  function goreOn() { return localStorage.getItem('bbc-gore') !== 'off'; }
  function toggleGore() {
    var on = !goreOn();
    localStorage.setItem('bbc-gore', on ? 'on' : 'off');
    return on;
  }

  /* Burst of blood (or sparks) inside a piece's .stand box.
   * dir biases the spray away from the attacker; power 1..3 scales it. */
  function spawnParticles(box, gore, power, dir) {
    if (!box) return;
    var n = gore ? 8 + power * 8 : 6 + power * 3;
    for (var i = 0; i < n; i++) {
      var p = el('div', gore ? 'blood-drop' : 'star-spark', box);
      var ang = Math.random() * Math.PI * 2;
      var dist = 10 + Math.random() * (25 + power * 22);
      var dx = Math.cos(ang) * dist + (dir || 0) * (8 + Math.random() * 20 * power);
      var dy = Math.sin(ang) * dist * 0.7 - (14 + power * 9);
      p.style.left = '50%';
      p.style.top = '46%';
      p.style.setProperty('--dx', dx + 'px');
      p.style.setProperty('--dy', dy + 'px');
      p.style.setProperty('--s', (0.3 + Math.random() * (0.4 + power * 0.25)).toFixed(2));
      p.style.setProperty('--t', (0.4 + Math.random() * 0.5).toFixed(2) + 's');
      if (!gore) p.textContent = ['✦', '✶', '★', '✺'][i % 4];
    }
  }

  /* Growing puddle on a tile. Persists until the board re-renders squares. */
  function bloodPool(cellEl, big) {
    if (!cellEl) return;
    var p = el('div', 'blood-pool', cellEl);
    var w = big ? 45 + Math.random() * 30 : 22 + Math.random() * 20;
    p.style.width = w + '%';
    p.style.height = (w * 0.55) + '%';
    p.style.left = (12 + Math.random() * (82 - w)) + '%';
    p.style.top = (30 + Math.random() * 40) + '%';
  }

  function restrike(node) {
    if (!node) return;
    node.classList.remove('strike');
    void node.offsetWidth; // restart the swing animation
    node.classList.add('strike');
  }

  /* Fight on the square. attNode has stepped up beside vicNode already.
   * mainCell is the defender's tile, neighborCells its adjacent tiles. */
  function fightOnBoard(attNode, vicNode, attackerType, mainCell, neighborCells) {
    return new Promise(function (resolve) {
      var gore = goreOn();
      var stand = vicNode && vicNode.querySelector('.stand');
      var vicSvg = vicNode && vicNode.querySelector('svg');
      var wrap = document.getElementById('board-wrap');
      var dir = 1;
      if (attNode && vicNode) {
        dir = parseFloat(vicNode.style.left) >= parseFloat(attNode.style.left) ? 1 : -1;
      }
      if (attNode) attNode.classList.add('fighting');
      if (vicNode) vicNode.classList.add('fighting');

      function at(ms, fn) { setTimeout(fn, ms); }
      function shake() {
        if (!wrap) return;
        wrap.classList.remove('shake');
        void wrap.offsetWidth;
        wrap.classList.add('shake');
        setTimeout(function () { wrap.classList.remove('shake'); }, 500);
      }
      function flash() {
        if (!wrap || !gore) return;
        wrap.classList.add('blood-flash');
        setTimeout(function () { wrap.classList.remove('blood-flash'); }, 260);
      }
      function hitFx() {
        if (!vicNode) return;
        vicNode.classList.remove('hit');
        void vicNode.offsetWidth;
        vicNode.classList.add('hit');
      }

      // --- hit 1: opener ---
      at(200, function () {
        restrike(attNode);
        Sound.play(attackerType === 'q' ? 'zap' : 'swing');
      });
      at(460, function () {
        Sound.play('hit');
        hitFx();
        spawnParticles(stand, gore, 1, dir);
      });

      // --- hit 2: keep the pressure on ---
      at(780, function () { restrike(attNode); Sound.play('swing'); });
      at(1040, function () {
        Sound.play('hit');
        if (gore) Sound.play('squelch');
        hitFx();
        shake();
        spawnParticles(stand, gore, 2, dir);
        if (stand) {
          var words = gore ? GORE_WORDS : SOFT_WORDS;
          var b = el('div', 'board-banner', stand);
          b.textContent = words[Math.floor(Math.random() * words.length)];
        }
        if (gore) bloodPool(mainCell, false);
      });

      // --- hit 3: the killing blow ---
      at(1400, function () { restrike(attNode); Sound.play('swing'); });
      at(1660, function () {
        Sound.play('hit');
        Sound.play('ko');
        if (gore) Sound.play('squelch');
        shake();
        flash();
        spawnParticles(stand, gore, 3, dir);
        if (vicNode) {
          vicNode.classList.add('dying');
          if (gore) vicNode.classList.add('decap');
          if (vicSvg) {
            vicSvg.classList.add('dead');
            vicSvg.style.setProperty('--kb', (dir * 14) + 'px');
            vicSvg.style.setProperty('--dir', dir);
          }
        }
        if (gore) {
          bloodPool(mainCell, true);
          bloodPool(mainCell, false);
          // splatter reaches the neighbouring tiles
          (neighborCells || []).slice(0, 2).forEach(function (c) {
            if (Math.random() < 0.8) squareSplat(c);
          });
          // arterial fountain — pulses of spray while the body drops
          var pulses = 0;
          var fountain = setInterval(function () {
            spawnParticles(stand, true, 2, dir);
            if (++pulses >= 4) clearInterval(fountain);
          }, 160);
        }
      });

      at(2750, function () {
        if (attNode) attNode.classList.remove('strike', 'fighting');
        if (vicNode) vicNode.remove();
        resolve();
      });
    });
  }

  /* Blood stain that stays on a square. */
  function squareSplat(cellEl) {
    if (!goreOn() || !cellEl) return;
    var s = document.createElement('div');
    s.className = 'square-splat';
    s.style.setProperty('--rot', Math.floor(Math.random() * 360) + 'deg');
    s.style.setProperty('--s', (0.6 + Math.random() * 0.5).toFixed(2));
    cellEl.appendChild(s);
  }

  return { fightOnBoard: fightOnBoard, squareSplat: squareSplat, goreOn: goreOn, toggleGore: toggleGore };
})();
