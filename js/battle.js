/* Beardy's Battle Chess — on-board capture battles.
 * Battle Chess style: the attacker walks up to the defender's square and
 * they fight right there on the board — weapon swing, impact, the loser
 * topples and fades away. Gore ON: cartoon blood. Gore OFF: star sparks. */
var Battle = (function () {
  'use strict';

  var GORE_WORDS = ['SPLAT!', 'CRUNCH!', 'KAPOW!', 'THWACK!', 'SQUISH!', 'CHOP!'];
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

  /* Burst of blood drops (or star sparks) inside a piece's .stand box. */
  function spawnParticles(box, gore, big) {
    var n = big ? 18 : 10;
    for (var i = 0; i < n; i++) {
      var p = el('div', gore ? 'blood-drop' : 'star-spark', box);
      var ang = Math.random() * Math.PI * 2;
      var dist = 12 + Math.random() * (big ? 70 : 42);
      p.style.left = '50%';
      p.style.top = '48%';
      p.style.setProperty('--dx', (Math.cos(ang) * dist) + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist * 0.7 - 22) + 'px');
      p.style.setProperty('--s', (0.35 + Math.random() * 0.6).toFixed(2));
      p.style.setProperty('--t', (0.45 + Math.random() * 0.4).toFixed(2) + 's');
      if (!gore) p.textContent = ['✦', '✶', '★', '✺'][i % 4];
    }
  }

  /* Fight on the square. attNode has already stepped up beside vicNode.
   * Resolves when the victim is down; caller then moves onto the square. */
  function fightOnBoard(attNode, vicNode, attackerType) {
    return new Promise(function (resolve) {
      var gore = goreOn();
      var stand = vicNode && vicNode.querySelector('.stand');
      var wrap = document.getElementById('board-wrap');
      if (attNode) attNode.classList.add('fighting');
      if (vicNode) vicNode.classList.add('fighting');

      var timers = [];
      function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

      at(220, function () {
        if (attNode) attNode.classList.add('strike');
        Sound.play(attackerType === 'q' ? 'zap' : 'swing');
      });

      at(500, function () {
        Sound.play('hit');
        if (gore) Sound.play('squelch');
        if (wrap) {
          wrap.classList.add('shake');
          setTimeout(function () { wrap.classList.remove('shake'); }, 500);
        }
        if (vicNode) vicNode.classList.add('hit');
        if (stand) {
          spawnParticles(stand, gore, false);
          var words = gore ? GORE_WORDS : SOFT_WORDS;
          var b = el('div', 'board-banner', stand);
          b.textContent = words[Math.floor(Math.random() * words.length)];
        }
      });

      at(880, function () {
        Sound.play('ko');
        if (vicNode) {
          vicNode.classList.add('dying');
          var svg = vicNode.querySelector('svg');
          if (svg) svg.classList.add('dead');
        }
        if (stand) spawnParticles(stand, gore, true);
      });

      at(1800, function () {
        if (attNode) attNode.classList.remove('strike', 'fighting');
        if (vicNode) vicNode.remove();
        resolve();
      });
    });
  }

  /* Blood stain that stays on the square after a capture. */
  function squareSplat(cellEl) {
    if (!goreOn()) return;
    var s = document.createElement('div');
    s.className = 'square-splat';
    s.style.setProperty('--rot', Math.floor(Math.random() * 360) + 'deg');
    s.style.setProperty('--s', (0.6 + Math.random() * 0.5).toFixed(2));
    cellEl.appendChild(s);
  }

  return { fightOnBoard: fightOnBoard, squareSplat: squareSplat, goreOn: goreOn, toggleGore: toggleGore };
})();
