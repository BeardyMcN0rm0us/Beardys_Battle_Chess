/* Beardy's Battle Chess — character art, grimdark edition.
 * Faceless medieval warriors in the spirit of the original Battle Chess:
 * lowered visors, deep hoods and glowing eyes in the dark. Layered SVG
 * with shared gradient materials. Groups are classed (.body-root,
 * .arm-weapon, .head, .eyes/.eyes-dead) so CSS can animate idle bobbing,
 * weapon swings, knock-outs and decapitations.
 * Characters.defs() must be injected into the document once at boot. */
var Characters = (function () {
  'use strict';

  /* ---------- shared materials (document-wide <defs>) ---------- */

  function grad(id, stops, x2, y2) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 == null ? 1 : y2) + '">' +
      stops.map(function (s) {
        return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>';
      }).join('') + '</linearGradient>';
  }

  function defs() {
    return '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
      grad('bbcSteel', [[0, '#a8afbc'], [0.5, '#5f6673'], [1, '#2e323b']]) +
      grad('bbcSteelH', [[0, '#c4cad4'], [0.55, '#7b8494'], [1, '#474d59']], 1, 0.3) +
      grad('bbcIron', [[0, '#4a4f5a'], [0.55, '#2a2d35'], [1, '#14161b']]) +
      grad('bbcGold', [[0, '#c9a84c'], [0.5, '#8a6d2a'], [1, '#4e3d12']]) +
      grad('bbcLeather', [[0, '#5c422a'], [0.55, '#3a2a1a'], [1, '#20160c']]) +
      grad('bbcWood', [[0, '#4e3a22'], [1, '#291d0e']], 1, 0) +
      grad('bbcBlade', [[0, '#dfe3ea'], [0.5, '#98a0ae'], [1, '#5f6673']], 1, 0) +
      grad('bbcFabW', [[0, '#2c4a7d'], [0.55, '#182b4e'], [1, '#0a1424']]) +
      grad('bbcFabB', [[0, '#7d2626'], [0.55, '#4e1616'], [1, '#280a0a']]) +
      grad('bbcCloak', [[0, '#3f3b47'], [0.55, '#26232c'], [1, '#121017']]) +
      grad('bbcFur', [[0, '#b5aea0'], [1, '#6e675b']]) +
      '<pattern id="bbcMail" width="6" height="4.6" patternUnits="userSpaceOnUse">' +
      '<rect width="6" height="4.6" fill="#20232a"/>' +
      '<path d="M0 2.3 a3 3 0 0 1 6 0" stroke="#4a505c" stroke-width="1" fill="none"/>' +
      '</pattern>' +
      '<filter id="bbcGlow" x="-150%" y="-150%" width="400%" height="400%">' +
      '<feGaussianBlur stdDeviation="1.4"/></filter>' +
      '</defs></svg>';
  }

  var ST = ' stroke="#07080c" stroke-width="1" stroke-opacity="0.75"';
  var RIM = ' stroke="#aebfd4" stroke-width="0.7" stroke-opacity="0.5"';

  var TEAM = {
    w: { fab: 'url(#bbcFabW)', edge: '#0a1424', plume: '#2c4a7d', jewel: '#2f5da8',
         glow: '#8fc1ff', glyphColor: '#7f9ccb', beard: '#9d968a' },
    b: { fab: 'url(#bbcFabB)', edge: '#280a0a', plume: '#7d2626', jewel: '#a32633',
         glow: '#ff7a52', glyphColor: '#c98080', beard: '#453629' }
  };

  /* ---------- shared body parts (viewBox 0 0 100 140, ground y≈132) ---------- */

  /* Glowing eyes in a dark visor/hood. cy = eye line, gap = half distance. */
  function eyes(t, cy, gap) {
    gap = gap || 3.6;
    return '<g class="eyes">' +
      '<circle cx="' + (50 - gap) + '" cy="' + cy + '" r="3.2" fill="' + t.glow + '" opacity="0.5" filter="url(#bbcGlow)"/>' +
      '<circle cx="' + (50 + gap) + '" cy="' + cy + '" r="3.2" fill="' + t.glow + '" opacity="0.5" filter="url(#bbcGlow)"/>' +
      '<ellipse cx="' + (50 - gap) + '" cy="' + cy + '" rx="1.7" ry="1.4" fill="' + t.glow + '"/>' +
      '<ellipse cx="' + (50 + gap) + '" cy="' + cy + '" rx="1.7" ry="1.4" fill="' + t.glow + '"/>' +
      '<circle cx="' + (50 - gap) + '" cy="' + (cy - 0.4) + '" r="0.6" fill="#fff" opacity="0.9"/>' +
      '<circle cx="' + (50 + gap) + '" cy="' + (cy - 0.4) + '" r="0.6" fill="#fff" opacity="0.9"/>' +
      '</g>' +
      '<g class="eyes-dead" style="display:none">' +
      '<path d="M' + (48 - gap) + ' ' + (cy - 1.6) + ' l3.4 3.2 M' + (51.4 - gap) + ' ' + (cy - 1.6) + ' l-3.4 3.2" stroke="#8a8f99" stroke-width="1.2" stroke-linecap="round"/>' +
      '<path d="M' + (48 + gap) + ' ' + (cy - 1.6) + ' l3.4 3.2 M' + (51.4 + gap) + ' ' + (cy - 1.6) + ' l-3.4 3.2" stroke="#8a8f99" stroke-width="1.2" stroke-linecap="round"/>' +
      '</g>';
  }

  function boots() {
    return '<path d="M39.5 121 l-4.5 7.5 q-0.8 2.4 2 2.4 l9 0 l0.8 -9.9 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '<path d="M60.5 121 l4.5 7.5 q0.8 2.4 -2 2.4 l-9 0 l-0.8 -9.9 Z" fill="url(#bbcIron)"' + ST + '/>';
  }

  function legs(fill) {
    return '<g class="legs">' +
      '<rect x="39" y="82" width="8.5" height="41" rx="3" fill="' + fill + '"' + ST + '/>' +
      '<rect x="52.5" y="82" width="8.5" height="41" rx="3" fill="' + fill + '"' + ST + '/>' +
      '<circle cx="43.2" cy="101" r="3.4" fill="url(#bbcSteel)"' + ST + '/>' +
      '<circle cx="56.8" cy="101" r="3.4" fill="url(#bbcSteel)"' + ST + '/>' +
      boots() + '</g>';
  }

  function backArm(fill, hx, hy) {
    hx = hx || 31; hy = hy || 77;
    return '<g class="arm-back">' +
      '<path d="M37 48 Q29 60 ' + hx + ' ' + (hy - 3) + ' l6.5 2.5 Q38 62 44 50 Z" fill="' + fill + '"' + ST + '/>' +
      '<circle cx="' + (hx + 1.5) + '" cy="' + hy + '" r="3.8" fill="url(#bbcIron)"' + ST + '/>' +
      '</g>';
  }

  /* Weapon arm: shoulder at (63,48). CSS rotates about 64px 50px. */
  function weaponArm(fill, weapon, hx, hy) {
    hx = hx || 69; hy = hy || 76;
    return '<g class="arm-weapon">' +
      '<path d="M63 46 Q73 58 ' + (hx + 1.5) + ' ' + (hy - 4) + ' l-6.5 3.5 Q64 61 57.5 49 Z" fill="' + fill + '"' + ST + '/>' +
      weapon +
      '<circle cx="' + hx + '" cy="' + hy + '" r="4.2" fill="url(#bbcIron)"' + ST + '/>' +
      '</g>';
  }

  /* Ragged war-torn cape hanging behind the figure. */
  function cape(t, wide) {
    var w = wide ? 8 : 5;
    return '<path class="cape" d="M' + (38 - w / 2) + ' 48 Q' + (28 - w) + ' 84 ' + (30 - w) + ' 116 ' +
      'l5 -6 l3 7 l4 -8 l3 6 Q' + (36 - w / 3) + ' 80 ' + (42 - w / 2) + ' 52 Z" fill="' + t.edge + '"' + ST + '/>';
  }

  /* ---------- weapons (held vertical, hand ~ (69,76)) ---------- */

  var WEAPONS = {
    spear: function () {
      return '<rect x="67.5" y="12" width="3" height="78" rx="1.2" fill="url(#bbcWood)"' + ST + '/>' +
        '<path d="M69 0 q4.5 6.5 0 14.5 q-4.5 -8 0 -14.5 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<rect x="65" y="13" width="8" height="2.4" rx="1" fill="url(#bbcIron)"/>';
    },
    mace: function () {
      var flanges = '';
      for (var a = 0; a < 360; a += 45) {
        flanges += '<path transform="rotate(' + a + ' 69 21)" d="M69 21 L65 10 Q69 7.5 73 10 Z" fill="url(#bbcIron)"' + ST + '/>';
      }
      return '<rect x="67.3" y="27" width="3.4" height="62" rx="1.5" fill="url(#bbcWood)"' + ST + '/>' +
        flanges +
        '<circle cx="69" cy="21" r="5.8" fill="url(#bbcSteel)"' + ST + '/>';
    },
    maul: function () {
      return '<rect x="66.8" y="24" width="4.4" height="66" rx="2" fill="url(#bbcWood)"' + ST + '/>' +
        '<rect x="55" y="8" width="28" height="16" rx="2.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="55" y="8" width="28" height="5" rx="2" fill="url(#bbcSteelH)" opacity="0.45"/>' +
        '<path d="M83 12 l9 4 l-9 4 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<circle cx="59.5" cy="16" r="1.2" fill="#0e1013"/><circle cx="69" cy="16" r="1.2" fill="#0e1013"/><circle cx="78" cy="16" r="1.2" fill="#0e1013"/>';
    },
    crozier: function () {
      return '<path d="M67.8 92 L68 18 q0 -2 1.2 -2 q1.4 0 1.4 2 L70.4 92 Z" fill="url(#bbcWood)"' + ST + '/>' +
        '<path d="M69 17 C69 6.5 83 6.5 83 15.5 C83 22 76.5 23 74.5 19.5" stroke="url(#bbcGold)" stroke-width="3.4" fill="none" stroke-linecap="round"/>' +
        '<circle cx="74.5" cy="19.5" r="2" fill="url(#bbcGold)"/>' +
        '<path d="M66 30 l6 0" stroke="url(#bbcGold)" stroke-width="1.6"/>';
    },
    scepter: function (t) {
      return '<rect x="67.9" y="24" width="2.4" height="56" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M64.5 24 q4.5 3.4 9 0 l-1.6 -5.5 l-5.8 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="69" cy="14.5" r="5.4" fill="' + t.jewel + '"' + ST + '/>' +
        '<circle cx="67.2" cy="12.8" r="1.5" fill="#fff" opacity="0.4"/>' +
        '<path d="M69 6 v4.5 M66.4 8.2 h5.2" stroke="url(#bbcGold)" stroke-width="1.8" stroke-linecap="round"/>';
    },
    greatsword: function () {
      return '<path d="M66.6 74 L66.6 18 L69 7 L71.4 18 L71.4 74 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<path d="M69 15 V70" stroke="#5f6673" stroke-width="1" opacity="0.9"/>' +
        '<path d="M58 73.5 l22 0 l-3 4.4 l-16 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="67" y="77.5" width="4" height="12" rx="1.6" fill="url(#bbcLeather)"' + ST + '/>' +
        '<circle cx="69" cy="91.5" r="3" fill="url(#bbcGold)"' + ST + '/>';
    }
  };

  /* ---------- the six figures ---------- */

  var BUILDERS = {
    /* Pawn: hooded footman — mail hauberk, round shield, war spear */
    p: function (t) {
      return legs(t.fab) +
        '<g class="torso">' +
        '<path d="M38 46 Q35.5 66 39 84 L61 84 Q64.5 66 62 46 Q50 40 38 46 Z" fill="url(#bbcMail)"' + ST + '/>' +
        '<path d="M38 46 Q35.5 66 39 84" fill="none"' + RIM + '/>' +
        '<path d="M45.5 45 L50 84 L54.5 45 Z" fill="' + t.fab + '" opacity="0.9"' + ST + '/>' +
        '<rect x="38" y="76" width="24" height="4.4" fill="url(#bbcLeather)"' + ST + '/>' +
        '<rect x="47.6" y="75.6" width="4.8" height="5.2" fill="url(#bbcIron)"/>' +
        '</g>' +
        '<g class="arm-back">' +
        '<path d="M37 48 Q29 58 30 72 l6 1 Q35 60 43 50 Z" fill="url(#bbcMail)"' + ST + '/>' +
        '<circle cx="32" cy="74" r="10.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<circle cx="32" cy="74" r="10.5" fill="none" stroke="' + t.plume + '" stroke-width="1.8" stroke-opacity="0.9"/>' +
        '<circle cx="32" cy="74" r="3.2" fill="url(#bbcSteel)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M38 36 Q36 14 50 9 Q64 14 62 36 Q56 40 50 40 Q44 40 38 36 Z" fill="url(#bbcMail)"' + ST + '/>' +
        '<path d="M40 33 Q40 18 50 15 Q60 18 60 33 Q55 36.5 50 36.5 Q45 36.5 40 33 Z" fill="#0b0c11"/>' +
        eyes(t, 26) +
        '<path d="M38 36 Q36 14 50 9" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcMail)', WEAPONS.spear());
    },

    /* Knight: horned bascinet, layered spiked pauldrons, flanged mace */
    n: function (t) {
      return legs('url(#bbcSteel)') + cape(t) +
        '<g class="torso">' +
        '<path d="M37 46 Q34 64 38 82 L62 82 Q66 64 63 46 Q50 39 37 46 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<path d="M40 58 Q50 63 60 58 M41 68 Q50 73 59 68" stroke="#2e323b" stroke-width="1.3" fill="none"/>' +
        '<path d="M37 46 Q34 64 38 82" fill="none"' + RIM + '/>' +
        '<rect x="45" y="49" width="10" height="16" rx="1.5" fill="' + t.fab + '" opacity="0.95"' + ST + '/>' +
        '<path d="M50 51 v11 M46.5 55 h7" stroke="' + t.plume + '" stroke-width="1.4" opacity="0.8"/>' +
        '<path d="M36 41 L31 27 L42 39 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M64 41 L69 27 L58 39 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M30 45 q6 -6 14 -4 l-1 7 q-7 -2 -11 2 Z" fill="url(#bbcSteelH)"' + ST + '/>' +
        '<path d="M70 45 q-6 -6 -14 -4 l1 7 q7 -2 11 2 Z" fill="url(#bbcSteelH)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M40 38 Q38 12 50 9 Q62 12 60 38 Q50 42 40 38 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<path d="M41.5 22 L58.5 22 L58 28 Q50 31 42 28 Z" fill="#0b0c11"/>' +
        eyes(t, 25) +
        '<path d="M44 31.5 v4 M47 32.5 v4 M53 32.5 v4 M56 31.5 v4" stroke="#2e323b" stroke-width="1"/>' +
        '<path d="M42 13 Q34 4 30 -1 Q40 2 44 9 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M58 13 Q66 4 70 -1 Q60 2 56 9 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M40 38 Q38 12 50 9" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcSteel)', WEAPONS.mace());
    },

    /* Rook: the executioner — a faceless iron tower with a great maul */
    r: function (t) {
      return '<g class="legs">' +
        '<rect x="35" y="86" width="11" height="37" rx="3.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="54" y="86" width="11" height="37" rx="3.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M34 120 l-4 8 q-1 2.6 2 2.6 l11 0 l0.6 -10.6 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M66 120 l4 8 q1 2.6 -2 2.6 l-11 0 l-0.6 -10.6 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        '<g class="arm-back">' +
        '<path d="M33 50 Q23 62 26 80 l8 1 Q33 64 40 53 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<circle cx="30" cy="83" r="5.5" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        '<g class="torso">' +
        '<path d="M32 44 Q28 66 33 88 L67 88 Q72 66 68 44 Q50 36 32 44 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M32.5 56 h35 M32 70 h36 M33.5 81 h33" stroke="#0e1013" stroke-width="1.6" opacity="0.9"/>' +
        '<circle cx="37" cy="50" r="1.3" fill="#0e1013"/><circle cx="63" cy="50" r="1.3" fill="#0e1013"/>' +
        '<circle cx="35.5" cy="63" r="1.3" fill="#0e1013"/><circle cx="64.5" cy="63" r="1.3" fill="#0e1013"/>' +
        '<circle cx="36" cy="76" r="1.3" fill="#0e1013"/><circle cx="64" cy="76" r="1.3" fill="#0e1013"/>' +
        '<path d="M44 88 q-2 6 1 10 m4 -10 q0 5 2 9 m5 -9 q2 5 1 9" stroke="#3a3f4a" stroke-width="1.8" fill="none"/>' +
        '<rect x="44" y="47" width="12" height="9" rx="1" fill="' + t.fab + '" opacity="0.9"' + ST + '/>' +
        '<path d="M32 44 Q28 66 33 88" fill="none"' + RIM + '/>' +
        '<path d="M33 41 L27 26 L40 38 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M67 41 L73 26 L60 38 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M38 40 L38 12 L43.5 12 L43.5 17.5 L47 17.5 L47 12 L53 12 L53 17.5 L56.5 17.5 L56.5 12 L62 12 L62 40 Q50 44 38 40 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="40.5" y="23" width="19" height="5.5" rx="1.5" fill="#0b0c11"/>' +
        eyes(t, 25.8, 4.5) +
        '<path d="M38 20 h24 M38 34 h24" stroke="#0e1013" stroke-width="1.3"/>' +
        '<circle cx="41" cy="31" r="1" fill="#0e1013"/><circle cx="59" cy="31" r="1" fill="#0e1013"/>' +
        '<path d="M38 40 L38 12" fill="none"' + RIM + '/>' +
        '</g>' +
        '<g class="arm-weapon">' +
        '<path d="M64 48 Q75 60 71.5 74 l-7 2 Q66 62 58 51 Z" fill="url(#bbcIron)"' + ST + '/>' +
        WEAPONS.maul() +
        '<circle cx="69" cy="77" r="5" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>';
    },

    /* Bishop: hooded inquisitor — tall cowl, gold cross, gnarled crozier */
    b: function (t) {
      return '<g class="legs">' +
        '<path d="M39 78 Q32 106 33 125 l4 -5 l4 7 l5 -7 l4 7 l4 -7 l5 7 l4 -7 l4 5 Q68 106 61 78 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M42 88 Q40 108 40.5 121 M58 88 Q60 108 59.5 121" stroke="#121017" stroke-width="1" opacity="0.8"/>' +
        '</g>' +
        backArm('url(#bbcCloak)') +
        '<g class="torso">' +
        '<path d="M38 45 Q35.5 64 39 82 L61 82 Q64.5 64 62 45 Q50 39 38 45 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M46 44 L50 82 L54 44 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M50 52 v8 M46.8 55.4 h6.4" stroke="url(#bbcGold)" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M38 45 q12 -5.5 24 0 l-0.5 4.5 q-11.5 -5.5 -23 0 Z" fill="' + t.edge + '"' + ST + '/>' +
        '<path d="M38 45 Q35.5 64 39 82" fill="none"' + RIM + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M37 38 Q35 20 43 13 L50 -2 L57 13 Q65 20 63 38 Q56 42.5 50 42.5 Q44 42.5 37 38 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M50 2 L50 12 M46.6 5.8 h6.8" stroke="url(#bbcGold)" stroke-width="1.8" stroke-linecap="round"/>' +
        '<path d="M41 34 Q41 20 50 17 Q59 20 59 34 Q54.5 38 50 38 Q45.5 38 41 34 Z" fill="#0b0c11"/>' +
        eyes(t, 27) +
        '<path d="M42.5 15 q7.5 -3.5 15 0 l-0.6 3.6 q-7 -3.2 -13.8 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M37 38 Q35 20 43 13" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcCloak)', WEAPONS.crozier());
    },

    /* Queen: wraith-queen — tall crown, long veil, shadowed face */
    q: function (t) {
      return '<g class="legs">' +
        '<path d="M40 72 Q29 104 30 126 l5 -5 l5 7 l5 -7 l5 7 l5 -7 l5 7 l5 -7 l5 5 Q71 104 60 72 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M44 84 Q40 106 40.5 122 M56 84 Q60 106 59.5 122" stroke="' + t.edge + '" stroke-width="1" opacity="0.8"/>' +
        '<path d="M30.5 118 q19.5 6.5 39 0" stroke="url(#bbcGold)" stroke-width="1.6" fill="none" opacity="0.7"/>' +
        '</g>' +
        '<path class="cape" d="M38 26 Q30 60 32 100 l6 -8 Q35 60 42 32 Z" fill="' + t.edge + '"' + ST + '/>' +
        '<path class="cape" d="M62 26 Q70 60 68 100 l-6 -8 Q65 60 58 32 Z" fill="' + t.edge + '"' + ST + '/>' +
        backArm(t.fab) +
        '<g class="torso">' +
        '<path d="M40 44 Q38 60 42 74 L58 74 Q62 60 60 44 Q50 38.5 40 44 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M46 46 L54 58 M54 46 L46 58 M46 58 L54 70 M54 58 L46 70" stroke="url(#bbcGold)" stroke-width="0.9" opacity="0.7"/>' +
        '<path d="M40 44 q10 -4.5 20 0 l0 3.6 q-10 -4.5 -20 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M40 44 Q38 60 42 74" fill="none"' + RIM + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M39 34 Q38 16 50 13 Q62 16 61 34 Q56 39.5 50 39.5 Q44 39.5 39 34 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M42 32 Q42 20 50 18 Q58 20 58 32 Q54 36 50 36 Q46 36 42 32 Z" fill="#0b0c11"/>' +
        eyes(t, 26.5, 3.2) +
        '<path d="M41.5 17 L42.5 3 L46 12 L50 1 L54 12 L57.5 3 L58.5 17 Q50 13 41.5 17 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="42.6" cy="6" r="1.2" fill="' + t.jewel + '"/><circle cx="50" cy="4" r="1.4" fill="' + t.jewel + '"/><circle cx="57.4" cy="6" r="1.2" fill="' + t.jewel + '"/>' +
        '<circle cx="50" cy="41.5" r="1.4" fill="' + t.jewel + '"/>' +
        '<path d="M39 34 Q38 16 50 13" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.scepter(t));
    },

    /* King Beardy: great crown, fur mantle, the long beard, a greatsword */
    k: function (t) {
      return legs(t.fab) + cape(t, true) +
        '<g class="torso">' +
        '<path d="M36 45 Q33 66 37 85 L63 85 Q67 66 64 45 Q50 38 36 45 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<rect x="36" y="74" width="28" height="5" fill="url(#bbcLeather)"' + ST + '/>' +
        '<rect x="46.8" y="73.4" width="6.4" height="6.2" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M36 45 Q50 39.5 64 45 L62 56 Q50 50 38 56 Z" fill="url(#bbcFur)"' + ST + '/>' +
        '<circle cx="42" cy="49.5" r="0.9" fill="#4e4a41"/><circle cx="50" cy="47" r="0.9" fill="#4e4a41"/><circle cx="58" cy="49.5" r="0.9" fill="#4e4a41"/>' +
        '<path d="M36 45 Q33 66 37 85" fill="none"' + RIM + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M39 33 Q38 15 50 12 Q62 15 61 33 Q55 38 50 38 Q45 38 39 33 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M42 30 Q42 19 50 17 Q58 19 58 30 Q54 33.5 50 33.5 Q46 33.5 42 30 Z" fill="#0b0c11"/>' +
        eyes(t, 25) +
        '<path d="M40.5 31 Q38.5 47 50 49 Q61.5 47 59.5 31 Q55 36 50 36 Q45 36 40.5 31 Z" fill="' + t.beard + '"' + ST + '/>' +
        '<path d="M45 37 q5 3 10 0 M46.5 43 q3.5 2 7 0" stroke="#7c7568" stroke-width="0.8" fill="none" opacity="0.7"/>' +
        '<path d="M40.5 16 L41.5 2 L46 9.5 L50 0 L54 9.5 L58.5 2 L59.5 16 Q50 12 40.5 16 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="40.8" y="14" width="18.4" height="3.8" rx="1.6" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="44.5" cy="15.9" r="1.2" fill="' + t.jewel + '"/><circle cx="50" cy="15.9" r="1.2" fill="#d8dce4"/><circle cx="55.5" cy="15.9" r="1.2" fill="' + t.jewel + '"/>' +
        '<circle cx="50" cy="2.5" r="1.5" fill="' + t.jewel + '"/>' +
        '<path d="M39 33 Q38 15 50 12" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.greatsword(), 69, 82);
    }
  };

  /* Dirt, soot and old scratches — every soldier has seen campaigns. */
  function grime() {
    return '<g opacity="0.22" fill="#0c0a08">' +
      '<ellipse cx="44" cy="66" rx="4.5" ry="2.4"/>' +
      '<ellipse cx="57" cy="79" rx="3.4" ry="1.9"/>' +
      '<ellipse cx="47" cy="99" rx="3.8" ry="2"/>' +
      '<ellipse cx="55" cy="114" rx="3" ry="1.7"/>' +
      '<path d="M42 55 l7 6 M57 58 l-6 8 M46 86 l5 5" stroke="#0c0a08" stroke-width="1" fill="none"/>' +
      '</g>';
  }

  /* Build a full character SVG string. */
  function svg(type, color, cls) {
    var t = TEAM[color];
    return '<svg class="char char-' + type + ' team-' + color + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse class="shadow" cx="50" cy="131" rx="22" ry="4.5" fill="#000" opacity="0.35"/>' +
      '<g class="body-root"><g transform="translate(50 0) scale(1.18 1) translate(-50 0)">' +
      BUILDERS[type](t) + grime() + '</g></g></svg>';
  }

  var NAMES = { p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King' };
  var GLYPH = { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' };
  var MOVES_HINT = {
    p: 'marches forward, captures diagonally',
    n: 'jumps in an L shape',
    b: 'slides along diagonals',
    r: 'slides in straight lines',
    q: 'slides in any direction',
    k: 'steps one square'
  };
  var FLAVOR = {
    p: 'The Footman', n: 'The Horned Knight', b: 'The Inquisitor',
    r: 'The Executioner', q: 'The Wraith Queen', k: 'King Beardy'
  };

  return { svg: svg, defs: defs, NAMES: NAMES, GLYPH: GLYPH, MOVES_HINT: MOVES_HINT, FLAVOR: FLAVOR, TEAM: TEAM };
})();
