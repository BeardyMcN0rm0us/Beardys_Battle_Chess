/* Beardy's Battle Chess — character art: war miniatures.
 * Each piece is a tabletop-style miniature warrior on a round base:
 * heroic proportions (small helmed head sunk between massive pauldrons,
 * hunched battle stance, wide-planted legs), heavy layered plate with
 * shadow and highlight passes, glowing eyes in dark visors. High-detail
 * vector — crisp at any resolution.
 * Groups are classed (.body-root, .arm-weapon, .head, .eyes/.eyes-dead)
 * so CSS can animate weapon swings, knock-outs and decapitations.
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
      grad('bbcSteelH', [[0, '#d4d9e1'], [0.55, '#7b8494'], [1, '#474d59']], 1, 0.3) +
      grad('bbcIron', [[0, '#4a4f5a'], [0.55, '#2a2d35'], [1, '#14161b']]) +
      grad('bbcGold', [[0, '#c9a84c'], [0.5, '#8a6d2a'], [1, '#4e3d12']]) +
      grad('bbcLeather', [[0, '#5c422a'], [0.55, '#3a2a1a'], [1, '#20160c']]) +
      grad('bbcWood', [[0, '#4e3a22'], [1, '#291d0e']], 1, 0) +
      grad('bbcBlade', [[0, '#e6eaf0'], [0.5, '#98a0ae'], [1, '#5f6673']], 1, 0) +
      grad('bbcFabW', [[0, '#2c4a7d'], [0.55, '#182b4e'], [1, '#0a1424']]) +
      grad('bbcFabB', [[0, '#7d2626'], [0.55, '#4e1616'], [1, '#280a0a']]) +
      grad('bbcCloak', [[0, '#3f3b47'], [0.55, '#26232c'], [1, '#121017']]) +
      grad('bbcFur', [[0, '#a59d8e'], [1, '#5c554a']]) +
      grad('bbcBase', [[0, '#3c3f48'], [0.6, '#23252c'], [1, '#101116']]) +
      '<pattern id="bbcMail" width="5" height="3.8" patternUnits="userSpaceOnUse">' +
      '<rect width="5" height="3.8" fill="#1c1f26"/>' +
      '<path d="M0 1.9 a2.5 2.5 0 0 1 5 0" stroke="#454b57" stroke-width="0.9" fill="none"/>' +
      '</pattern>' +
      '<filter id="bbcGlow" x="-150%" y="-150%" width="400%" height="400%">' +
      '<feGaussianBlur stdDeviation="1.4"/></filter>' +
      '</defs></svg>';
  }

  var ST = ' stroke="#07080c" stroke-width="1" stroke-opacity="0.8"';
  var RIM = ' stroke="#aebfd4" stroke-width="0.7" stroke-opacity="0.45"';

  var TEAM = {
    w: { fab: 'url(#bbcFabW)', edge: '#0a1424', plume: '#2c4a7d', jewel: '#2f5da8',
         glow: '#8fc1ff', glyphColor: '#7f9ccb', beard: '#9d968a' },
    b: { fab: 'url(#bbcFabB)', edge: '#280a0a', plume: '#7d2626', jewel: '#a32633',
         glow: '#ff7a52', glyphColor: '#c98080', beard: '#453629' }
  };

  /* ---------- shared parts (viewBox 0 0 100 140) ----------
   * Miniature stands on a round base: base top ellipse centre y≈126.
   * Figure is hunched and wide: feet planted y≈122, shoulders y≈40,
   * helmet crown y≈18. Weapon arm shoulder at (64,44). */

  /* Round tabletop base with a rocky top. */
  function base() {
    return '<g class="base">' +
      '<ellipse cx="50" cy="128" rx="27" ry="8" fill="url(#bbcBase)"' + ST + '/>' +
      '<ellipse cx="50" cy="125.5" rx="27" ry="7.2" fill="#2e313a"' + ST + '/>' +
      '<ellipse cx="50" cy="125.5" rx="27" ry="7.2" fill="none" stroke="#565c68" stroke-width="0.6" stroke-opacity="0.5"/>' +
      '<path d="M32 124 l5 -2.4 l4 2 l-4.5 2.2 Z M60 126.5 l4.5 -2 l4 1.6 l-4 2.2 Z M46 128 l4 -1.6 l3.6 1.4 l-3.8 1.8 Z" fill="#3c404b" stroke="#14161b" stroke-width="0.5"/>' +
      '</g>';
  }

  /* Glowing eyes in a dark visor slit. */
  function eyes(t, cy, gap) {
    gap = gap || 3.4;
    return '<g class="eyes">' +
      '<circle cx="' + (50 - gap) + '" cy="' + cy + '" r="3" fill="' + t.glow + '" opacity="0.5" filter="url(#bbcGlow)"/>' +
      '<circle cx="' + (50 + gap) + '" cy="' + cy + '" r="3" fill="' + t.glow + '" opacity="0.5" filter="url(#bbcGlow)"/>' +
      '<ellipse cx="' + (50 - gap) + '" cy="' + cy + '" rx="1.8" ry="1.1" fill="' + t.glow + '"/>' +
      '<ellipse cx="' + (50 + gap) + '" cy="' + cy + '" rx="1.8" ry="1.1" fill="' + t.glow + '"/>' +
      '</g>' +
      '<g class="eyes-dead" style="display:none">' +
      '<path d="M' + (48 - gap) + ' ' + (cy - 1.4) + ' l3 2.8 M' + (51 - gap) + ' ' + (cy - 1.4) + ' l-3 2.8" stroke="#8a8f99" stroke-width="1.1" stroke-linecap="round"/>' +
      '<path d="M' + (48 + gap) + ' ' + (cy - 1.4) + ' l3 2.8 M' + (51 + gap) + ' ' + (cy - 1.4) + ' l-3 2.8" stroke="#8a8f99" stroke-width="1.1" stroke-linecap="round"/>' +
      '</g>';
  }

  /* Wide-planted armored legs: left foot forward, right foot back. */
  function stanceLegs(fill) {
    return '<g class="legs">' +
      '<path d="M41 84 L35 110 L33 120 l12 0 L46 92 Z" fill="' + fill + '"' + ST + '/>' +
      '<path d="M59 84 L64 108 L67 119 l-12.5 0 L54.5 92 Z" fill="' + fill + '"' + ST + '/>' +
      '<circle cx="40" cy="99" r="3.8" fill="url(#bbcSteel)"' + ST + '/>' +
      '<circle cx="60.5" cy="98" r="3.8" fill="url(#bbcSteel)"' + ST + '/>' +
      '<path d="M31 118 l14.5 0 l1 5.5 q-9 2.5 -17.5 0 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '<path d="M54 117 l13.5 0 l2.5 5.5 q-9.5 2.5 -18 0 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '</g>';
  }

  /* Hunched armored torso: broad chest tapering down, lean forward. */
  function hunchTorso(fill, extra) {
    return '<g class="torso">' +
      '<path d="M31 44 Q29 52 33 60 Q35 76 41 86 L59 86 Q65 76 67 60 Q71 52 69 44 Q50 32 31 44 Z" fill="' + fill + '"' + ST + '/>' +
      '<path d="M35 52 Q50 60 65 52 M38 64 Q50 71 62 64 M42 76 Q50 81 58 76" stroke="#0e1013" stroke-width="1.3" fill="none" opacity="0.85"/>' +
      '<path d="M31 44 Q29 52 33 60 Q35 76 41 86" fill="none"' + RIM + '/>' +
      (extra || '') + '</g>';
  }

  /* Massive layered pauldrons with spikes. */
  function pauldrons(spiked) {
    var s = '';
    if (spiked) {
      s += '<path d="M30 34 L24 20 L37 32 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M70 34 L76 20 L63 32 Z" fill="url(#bbcIron)"' + ST + '/>';
    }
    return s +
      '<path d="M24 44 Q24 32 38 33 Q44 34 44 42 Q42 50 34 51 Q26 50 24 44 Z" fill="url(#bbcSteelH)"' + ST + '/>' +
      '<path d="M76 44 Q76 32 62 33 Q56 34 56 42 Q58 50 66 51 Q74 50 76 44 Z" fill="url(#bbcSteelH)"' + ST + '/>' +
      '<path d="M27 47 Q34 52 42 48 M73 47 Q66 52 58 48" stroke="#2e323b" stroke-width="1.2" fill="none"/>' +
      '<path d="M24 44 Q24 32 38 33" fill="none"' + RIM + '/>';
  }

  /* Back arm as a heavy gauntlet fist at the side. */
  function fistArm(fill) {
    return '<g class="arm-back">' +
      '<path d="M30 48 Q24 60 27 74 l7.5 1 Q32 62 38 52 Z" fill="' + fill + '"' + ST + '/>' +
      '<path d="M25.5 74 q-1.5 8 4 9 q6 1 7 -5 l-1.5 -6 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '</g>';
  }

  /* Kite shield carried on the back arm. */
  function shieldArm(t) {
    return '<g class="arm-back">' +
      '<path d="M31 46 Q26 56 28 66 l7 1 Q33 58 39 50 Z" fill="url(#bbcMail)"' + ST + '/>' +
      '<path d="M20 52 Q20 44 30 44 Q40 44 40 52 Q40 72 30 82 Q20 72 20 52 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '<path d="M20 52 Q20 44 30 44 Q40 44 40 52 Q40 72 30 82 Q20 72 20 52 Z" fill="none" stroke="' + t.plume + '" stroke-width="1.6" stroke-opacity="0.85"/>' +
      '<path d="M30 47 V78 M23 56 H37" stroke="' + t.plume + '" stroke-width="1.6" stroke-opacity="0.6"/>' +
      '<circle cx="30" cy="56" r="2.6" fill="url(#bbcSteel)"' + ST + '/>' +
      '</g>';
  }

  /* Weapon arm: shoulder (64,44), gauntlet at (hx,hy).
   * CSS rotates the group about 64px 46px. */
  function weaponArm(fill, weapon, hx, hy) {
    hx = hx || 71; hy = hy || 70;
    return '<g class="arm-weapon">' +
      '<path d="M62 42 Q74 52 ' + (hx + 2) + ' ' + (hy - 5) + ' l-7 4 Q64 56 56 46 Z" fill="' + fill + '"' + ST + '/>' +
      weapon +
      '<path d="M' + (hx - 4) + ' ' + (hy - 4) + ' q-1.5 7 3.5 8.5 q5.5 1.5 7 -4 l-1.5 -6.5 Z" fill="url(#bbcIron)"' + ST + '/>' +
      '</g>';
  }

  /* Ragged war-torn cape hanging behind. */
  function cape(t, wide) {
    var w = wide ? 9 : 5;
    return '<path class="cape" d="M' + (36 - w / 2) + ' 44 Q' + (24 - w) + ' 80 ' + (27 - w) + ' 114 ' +
      'l5.5 -6.5 l3 7.5 l4.5 -8.5 l3 6.5 Q' + (34 - w / 3) + ' 78 ' + (41 - w / 2) + ' 48 Z" fill="' + t.edge + '"' + ST + '/>';
  }

  /* ---------- weapons (gripped at ~(71,70), blade rising right) ---------- */

  var WEAPONS = {
    spear: function () {
      return '<rect x="69.5" y="8" width="3.2" height="76" rx="1.3" fill="url(#bbcWood)" transform="rotate(8 71 70)"' + ST + '/>' +
        '<g transform="rotate(8 71 70)">' +
        '<path d="M71 -6 q5 7 0 16 q-5 -8.5 0 -16 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<rect x="66.8" y="9" width="8.5" height="2.6" rx="1" fill="url(#bbcIron)"/>' +
        '<path d="M71 -4 v10" stroke="#5f6673" stroke-width="0.8"/></g>';
    },
    mace: function () {
      var flanges = '';
      for (var a = 0; a < 360; a += 45) {
        flanges += '<path transform="rotate(' + a + ' 73 16)" d="M73 16 L68.6 4 Q73 1.5 77.4 4 Z" fill="url(#bbcIron)"' + ST + '/>';
      }
      return '<g transform="rotate(10 71 70)">' +
        '<rect x="70" y="22" width="3.8" height="52" rx="1.6" fill="url(#bbcWood)"' + ST + '/>' +
        flanges +
        '<circle cx="73" cy="16" r="6.2" fill="url(#bbcSteel)"' + ST + '/>' +
        '<circle cx="71" cy="14" r="1.8" fill="#d4d9e1" opacity="0.5"/></g>';
    },
    maul: function () {
      return '<g transform="rotate(12 71 70)">' +
        '<rect x="69" y="16" width="4.8" height="60" rx="2" fill="url(#bbcWood)"' + ST + '/>' +
        '<rect x="56" y="0" width="30" height="17" rx="2.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="56" y="0" width="30" height="5.5" rx="2" fill="url(#bbcSteelH)" opacity="0.4"/>' +
        '<path d="M86 4 l10 4.5 l-10 4.5 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<circle cx="61" cy="8.5" r="1.3" fill="#0e1013"/><circle cx="71" cy="8.5" r="1.3" fill="#0e1013"/><circle cx="81" cy="8.5" r="1.3" fill="#0e1013"/></g>';
    },
    crozier: function () {
      return '<g transform="rotate(6 71 70)">' +
        '<path d="M69.8 86 L70 12 q0 -2 1.2 -2 q1.4 0 1.4 2 L72.4 86 Z" fill="url(#bbcWood)"' + ST + '/>' +
        '<path d="M71 11 C71 0 85.5 0 85.5 9.5 C85.5 16 79 17 77 13.5" stroke="url(#bbcGold)" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
        '<circle cx="77" cy="13.5" r="2.1" fill="url(#bbcGold)"/>' +
        '<path d="M67.8 26 l6.4 0" stroke="url(#bbcGold)" stroke-width="1.7"/></g>';
    },
    scepter: function (t) {
      return '<g transform="rotate(8 71 70)">' +
        '<rect x="70" y="18" width="2.6" height="56" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M66.4 18 q4.8 3.6 9.6 0 l-1.7 -5.8 l-6.2 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="71.2" cy="8" r="5.6" fill="' + t.jewel + '"' + ST + '/>' +
        '<circle cx="69.3" cy="6.2" r="1.6" fill="#fff" opacity="0.4"/>' +
        '<path d="M71.2 -1 v5 M68.4 1.4 h5.6" stroke="url(#bbcGold)" stroke-width="1.9" stroke-linecap="round"/></g>';
    },
    greatsword: function () {
      return '<g transform="rotate(9 71 70)">' +
        '<path d="M68.4 66 L68.4 10 L71 -2 L73.6 10 L73.6 66 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<path d="M71 7 V62" stroke="#5f6673" stroke-width="1" opacity="0.9"/>' +
        '<path d="M59.5 65.5 l23 0 l-3.2 4.6 l-16.6 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="68.9" y="69.5" width="4.2" height="12" rx="1.7" fill="url(#bbcLeather)"' + ST + '/>' +
        '<circle cx="71" cy="83.5" r="3.1" fill="url(#bbcGold)"' + ST + '/></g>';
    }
  };

  /* ---------- the six miniatures ---------- */

  var BUILDERS = {
    /* Pawn: man-at-arms — kettle helm, mail aventail, kite shield, war spear */
    p: function (t) {
      return base() + stanceLegs('url(#bbcMail)') +
        hunchTorso('url(#bbcMail)',
          '<path d="M45 40 L50 86 L55 40 Z" fill="' + t.fab + '" opacity="0.92"' + ST + '/>' +
          '<rect x="37" y="78" width="26" height="4.6" fill="url(#bbcLeather)"' + ST + '/>' +
          '<rect x="47.4" y="77.4" width="5.2" height="5.6" fill="url(#bbcIron)"/>') +
        shieldArm(t) +
        '<g class="head">' +
        '<path d="M40 40 Q38 26 42 22 L58 22 Q62 26 60 40 Q50 45 40 40 Z" fill="url(#bbcMail)"' + ST + '/>' +
        '<path d="M42 34 Q42 24 50 22.5 Q58 24 58 34 Q54 37 50 37 Q46 37 42 34 Z" fill="#0b0c11"/>' +
        eyes(t, 29) +
        '<path d="M39 22 Q40 12 50 10.5 Q60 12 61 22 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<ellipse cx="50" cy="22" rx="16" ry="3.4" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M39 22 Q40 12 50 10.5" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcMail)', WEAPONS.spear());
    },

    /* Knight: horned juggernaut — fluted plate, spiked pauldrons, flanged mace */
    n: function (t) {
      return base() + cape(t) + stanceLegs('url(#bbcSteel)') +
        hunchTorso('url(#bbcSteel)',
          '<rect x="44" y="44" width="12" height="18" rx="1.5" fill="' + t.fab + '" opacity="0.95"' + ST + '/>' +
          '<path d="M50 46 v13 M45.8 50.5 h8.4" stroke="' + t.plume + '" stroke-width="1.5" opacity="0.85"/>' +
          '<path d="M44 34 Q50 30 56 34 L55 42 Q50 39 45 42 Z" fill="url(#bbcIron)"' + ST + '/>') +
        pauldrons(true) +
        fistArm('url(#bbcSteel)') +
        '<g class="head">' +
        '<path d="M42 40 Q40 18 50 15 Q60 18 58 40 Q50 44 42 40 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<path d="M43 27 L57 27 L56.5 32.5 Q50 35 43.5 32.5 Z" fill="#0b0c11"/>' +
        eyes(t, 29.5, 3.2) +
        '<path d="M45 35.5 v4 M48 36.5 v4 M52 36.5 v4 M55 35.5 v4" stroke="#2e323b" stroke-width="1"/>' +
        '<path d="M44 19 Q35 10 29 2 Q41 6 46 15 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M56 19 Q65 10 71 2 Q59 6 54 15 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M50 15 Q46 8 48 2 Q52 8 50 15" fill="' + t.plume + '"' + ST + '/>' +
        '<path d="M42 40 Q40 18 50 15" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcSteel)', WEAPONS.mace());
    },

    /* Rook: the siege golem — riveted iron mass, tower helm, great maul */
    r: function (t) {
      return base() +
        '<g class="legs">' +
        '<path d="M38 86 L31 108 L29 121 l14 0 L45 92 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M62 86 L68 106 L71 120 l-14 0 L55 92 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M27 119 l16 0 l1 6 q-9.5 2.5 -18.5 0 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M56 118 l15 0 l2.5 6 q-10 2.5 -19 0 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        '<g class="torso">' +
        '<path d="M27 42 Q24 66 31 90 L69 90 Q76 66 73 42 Q50 30 27 42 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M28 54 h44 M27.5 68 h45 M30 80 h40" stroke="#0e1013" stroke-width="1.7" opacity="0.9"/>' +
        '<circle cx="33" cy="48" r="1.4" fill="#0e1013"/><circle cx="67" cy="48" r="1.4" fill="#0e1013"/>' +
        '<circle cx="31" cy="61" r="1.4" fill="#0e1013"/><circle cx="69" cy="61" r="1.4" fill="#0e1013"/>' +
        '<circle cx="32" cy="74" r="1.4" fill="#0e1013"/><circle cx="68" cy="74" r="1.4" fill="#0e1013"/>' +
        '<path d="M42 90 q-2.5 7 1 12 m5.5 -12 q0 6 2 11 m5.5 -11 q2.5 6 1.5 11" stroke="#3a3f4a" stroke-width="1.9" fill="none"/>' +
        '<rect x="43" y="44" width="14" height="10" rx="1" fill="' + t.fab + '" opacity="0.92"' + ST + '/>' +
        '<path d="M27 42 Q24 66 31 90" fill="none"' + RIM + '/>' +
        '<path d="M28 38 L20 22 L36 35 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M72 38 L80 22 L64 35 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        fistArm('url(#bbcIron)') +
        '<g class="head">' +
        '<path d="M37 38 L37 10 L43 10 L43 16 L47 16 L47 10 L53 10 L53 16 L57 16 L57 10 L63 10 L63 38 Q50 42 37 38 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="40" y="22" width="20" height="6" rx="1.5" fill="#0b0c11"/>' +
        eyes(t, 25, 4.6) +
        '<path d="M37 18.5 h26 M37 32.5 h26" stroke="#0e1013" stroke-width="1.4"/>' +
        '<circle cx="40.5" cy="30" r="1.1" fill="#0e1013"/><circle cx="59.5" cy="30" r="1.1" fill="#0e1013"/>' +
        '<path d="M37 38 L37 10" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcIron)', WEAPONS.maul());
    },

    /* Bishop: the dark pontiff — angular mitre, layered vestments, crozier */
    b: function (t) {
      return base() +
        '<g class="legs">' +
        '<path d="M38 76 Q30 102 31 123 l4.5 -5 l4 7 l5 -7 l4.5 7 l4.5 -7 l5 7 l4 -7 l4.5 5 Q70 102 62 76 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M42 86 Q39 106 39.5 119 M58 86 Q61 106 60.5 119" stroke="#121017" stroke-width="1" opacity="0.8"/>' +
        '</g>' +
        hunchTorso('url(#bbcCloak)',
          '<path d="M45 38 L50 86 L55 38 Z" fill="' + t.fab + '"' + ST + '/>' +
          '<path d="M50 48 v9 M46.4 51.8 h7.2" stroke="url(#bbcGold)" stroke-width="1.9" stroke-linecap="round"/>' +
          '<path d="M31 44 q19 -8.5 38 0 l-0.6 5 q-18.5 -8.5 -36.8 0 Z" fill="' + t.edge + '"' + ST + '/>') +
        fistArm('url(#bbcCloak)') +
        '<g class="head">' +
        '<path d="M39 38 Q37 24 44 18 L50 2 L56 18 Q63 24 61 38 Q50 43 39 38 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M50 5 L50 15 M46.4 8.6 h7.2" stroke="url(#bbcGold)" stroke-width="1.9" stroke-linecap="round"/>' +
        '<path d="M42 34 Q42 22 50 20 Q58 22 58 34 Q54 37.5 50 37.5 Q46 37.5 42 34 Z" fill="#0b0c11"/>' +
        eyes(t, 28) +
        '<path d="M43.5 19 q6.5 -3 13 0 l-0.6 3.8 q-6 -2.8 -11.8 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M39 38 Q37 24 44 18" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm('url(#bbcCloak)', WEAPONS.crozier());
    },

    /* Queen: the wraith queen — tall crown, twin capes, jeweled scepter */
    q: function (t) {
      return base() +
        '<path class="cape" d="M37 22 Q28 60 30 102 l6.5 -9 Q33 58 41 28 Z" fill="' + t.edge + '"' + ST + '/>' +
        '<path class="cape" d="M63 22 Q72 60 70 102 l-6.5 -9 Q67 58 59 28 Z" fill="' + t.edge + '"' + ST + '/>' +
        '<g class="legs">' +
        '<path d="M40 68 Q28 100 29 124 l5 -5.5 l5 7.5 l5.5 -7.5 l5.5 7.5 l5.5 -7.5 l5 7.5 l5 -7.5 l5 5.5 Q72 100 60 68 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M44 80 Q40 104 40.5 120 M56 80 Q60 104 59.5 120" stroke="' + t.edge + '" stroke-width="1" opacity="0.8"/>' +
        '<path d="M29.5 116 q20.5 7 41 0" stroke="url(#bbcGold)" stroke-width="1.7" fill="none" opacity="0.7"/>' +
        '</g>' +
        '<g class="torso">' +
        '<path d="M38 42 Q36 56 41 70 L59 70 Q64 56 62 42 Q50 34 38 42 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M45 44 L55 56 M55 44 L45 56 M45 56 L55 68 M55 56 L45 68" stroke="url(#bbcGold)" stroke-width="1" opacity="0.7"/>' +
        '<path d="M38 42 q12 -5.5 24 0 l0 4 q-12 -5.5 -24 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M38 42 Q36 56 41 70" fill="none"' + RIM + '/>' +
        '</g>' +
        fistArm(t.fab) +
        '<g class="head">' +
        '<path d="M40 34 Q39 18 50 15 Q61 18 60 34 Q55 39.5 50 39.5 Q45 39.5 40 34 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M43 31 Q43 21 50 19 Q57 21 57 31 Q53.5 34.5 50 34.5 Q46.5 34.5 43 31 Z" fill="#0b0c11"/>' +
        eyes(t, 26.5, 3) +
        '<path d="M42 18 L43 2 L46.5 12 L50 0 L53.5 12 L57 2 L58 18 Q50 14 42 18 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="43.2" cy="5" r="1.3" fill="' + t.jewel + '"/><circle cx="50" cy="3" r="1.5" fill="' + t.jewel + '"/><circle cx="56.8" cy="5" r="1.3" fill="' + t.jewel + '"/>' +
        '<circle cx="50" cy="42" r="1.5" fill="' + t.jewel + '"/>' +
        '<path d="M40 34 Q39 18 50 15" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.scepter(t));
    },

    /* King Beardy: the warlord — great crown, fur mantle, beard, greatsword */
    k: function (t) {
      return base() + cape(t, true) + stanceLegs(t.fab) +
        hunchTorso(t.fab,
          '<rect x="36" y="76" width="28" height="5.2" fill="url(#bbcLeather)"' + ST + '/>' +
          '<rect x="46.6" y="75.2" width="6.8" height="6.6" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
          '<path d="M31 44 Q50 33 69 44 L67 57 Q50 47 33 57 Z" fill="url(#bbcFur)"' + ST + '/>' +
          '<circle cx="40" cy="49" r="1" fill="#4e4a41"/><circle cx="50" cy="45" r="1" fill="#4e4a41"/><circle cx="60" cy="49" r="1" fill="#4e4a41"/>') +
        fistArm(t.fab) +
        '<g class="head">' +
        '<path d="M40 32 Q39 17 50 14 Q61 17 60 32 Q55 37 50 37 Q45 37 40 32 Z" fill="url(#bbcCloak)"' + ST + '/>' +
        '<path d="M43 29 Q43 20 50 18 Q57 20 57 29 Q53.5 32.5 50 32.5 Q46.5 32.5 43 29 Z" fill="#0b0c11"/>' +
        eyes(t, 25.5) +
        '<path d="M41 30 Q39 47 50 49 Q61 47 59 30 Q55 35 50 35 Q45 35 41 30 Z" fill="' + t.beard + '"' + ST + '/>' +
        '<path d="M45 36 q5 3 10 0 M46.5 42 q3.5 2 7 0" stroke="#6e675b" stroke-width="0.8" fill="none" opacity="0.7"/>' +
        '<path d="M41 18 L42 3 L46.5 10.5 L50 1 L53.5 10.5 L58 3 L59 18 Q50 14 41 18 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="41.2" y="16" width="17.6" height="4" rx="1.7" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="45" cy="18" r="1.3" fill="' + t.jewel + '"/><circle cx="50" cy="18" r="1.3" fill="#d8dce4"/><circle cx="55" cy="18" r="1.3" fill="' + t.jewel + '"/>' +
        '<circle cx="50" cy="3.5" r="1.6" fill="' + t.jewel + '"/>' +
        '<path d="M40 32 Q39 17 50 14" fill="none"' + RIM + '/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.greatsword(), 71, 74);
    }
  };

  /* Dirt, soot and old scratches. */
  function grime() {
    return '<g opacity="0.2" fill="#0c0a08">' +
      '<ellipse cx="43" cy="62" rx="4.5" ry="2.4"/>' +
      '<ellipse cx="58" cy="75" rx="3.4" ry="1.9"/>' +
      '<ellipse cx="45" cy="96" rx="3.8" ry="2"/>' +
      '<path d="M41 52 l7 6 M58 55 l-6 8 M45 84 l5 5" stroke="#0c0a08" stroke-width="1" fill="none"/>' +
      '</g>';
  }

  /* Build a full character SVG string. */
  function svg(type, color, cls) {
    var t = TEAM[color];
    return '<svg class="char char-' + type + ' team-' + color + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">' +
      '<g class="body-root"><g transform="translate(50 0) scale(1.12 1) translate(-50 0)">' +
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
    p: 'The Footman', n: 'The Horned Knight', b: 'The Dark Pontiff',
    r: 'The Siege Golem', q: 'The Wraith Queen', k: 'King Beardy'
  };

  return { svg: svg, defs: defs, NAMES: NAMES, GLYPH: GLYPH, MOVES_HINT: MOVES_HINT, FLAVOR: FLAVOR, TEAM: TEAM };
})();
