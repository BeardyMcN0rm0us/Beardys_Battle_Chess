/* Beardy's Battle Chess — character art.
 * Realistic-styled medieval figures rendered as layered SVG with shared
 * gradient materials (steel, gold, leather, cloth). Groups are classed
 * (.body-root, .arm-weapon, .head, .eyes/.eyes-dead) so CSS can animate
 * idle bobbing, weapon swings and knock-outs.
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
      grad('bbcSteel', [[0, '#b9bfca'], [0.5, '#6f7683'], [1, '#3b404a']]) +
      grad('bbcSteelH', [[0, '#cdd2db'], [0.55, '#8b93a2'], [1, '#5a6170']], 1, 0.3) +
      grad('bbcIron', [[0, '#565b66'], [0.55, '#33363e'], [1, '#191b20']]) +
      grad('bbcGold', [[0, '#c9a84c'], [0.5, '#8a6d2a'], [1, '#4e3d12']]) +
      grad('bbcLeather', [[0, '#6b4d31'], [0.55, '#453120'], [1, '#251a10']]) +
      grad('bbcWood', [[0, '#5c452a'], [1, '#312312']], 1, 0) +
      grad('bbcBlade', [[0, '#dfe3ea'], [0.5, '#98a0ae'], [1, '#5f6673']], 1, 0) +
      grad('bbcSkin', [[0, '#d4ad85'], [1, '#a67c56']]) +
      grad('bbcFabW', [[0, '#33507f'], [0.55, '#1c2f52'], [1, '#0d1626']]) +
      grad('bbcFabB', [[0, '#8f3030'], [0.55, '#5c1c1c'], [1, '#300d0d']]) +
      grad('bbcRobe', [[0, '#c9c2b0'], [0.6, '#9a927e'], [1, '#655e4f']]) +
      grad('bbcFur', [[0, '#d2ccc0'], [1, '#918a7c']]) +
      '</defs></svg>';
  }

  var ST = ' stroke="#0a0b10" stroke-width="1" stroke-opacity="0.7"';

  var TEAM = {
    w: { fab: 'url(#bbcFabW)', edge: '#0d1626', plume: '#3a5c94', jewel: '#2f5da8',
         glyphColor: '#7f9ccb', hair: '#4a3a26', beard: '#b8b2a4' },
    b: { fab: 'url(#bbcFabB)', edge: '#300d0d', plume: '#8f3030', jewel: '#a32633',
         glyphColor: '#c98080', hair: '#241a10', beard: '#453629' }
  };

  /* ---------- shared body parts (viewBox 0 0 100 140, ground y≈132) ---------- */

  function face(t, opts) {
    opts = opts || {};
    var s = '';
    var ey = opts.eyeY || 25;
    s += '<g class="eyes">' +
      '<ellipse cx="46.4" cy="' + ey + '" rx="1.5" ry="1.9" fill="#221d18"/>' +
      '<ellipse cx="53.6" cy="' + ey + '" rx="1.5" ry="1.9" fill="#221d18"/>' +
      '<circle cx="46.9" cy="' + (ey - 0.6) + '" r="0.5" fill="#fff" opacity="0.8"/>' +
      '<circle cx="54.1" cy="' + (ey - 0.6) + '" r="0.5" fill="#fff" opacity="0.8"/>' +
      '</g>';
    s += '<g class="eyes-dead" style="display:none">' +
      '<path d="M44.2 ' + (ey - 2) + ' l4.4 4 M48.6 ' + (ey - 2) + ' l-4.4 4" stroke="#221d18" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M51.4 ' + (ey - 2) + ' l4.4 4 M55.8 ' + (ey - 2) + ' l-4.4 4" stroke="#221d18" stroke-width="1.5" stroke-linecap="round"/>' +
      '</g>';
    if (!opts.noNose) {
      s += '<path d="M50 ' + (ey + 1) + ' q1 2 0 3.4" stroke="#b78a5f" stroke-width="1" fill="none" stroke-linecap="round"/>';
    }
    if (!opts.noMouth) {
      s += '<path d="M47.4 ' + (ey + 7) + ' h5.2" stroke="#8a5d3d" stroke-width="1.1" stroke-linecap="round"/>';
    }
    return s;
  }

  function headBase(t) {
    return '<circle cx="50" cy="25" r="9.2" fill="url(#bbcSkin)"' + ST + '/>' +
      '<path d="M41.5 22 Q50 17.5 58.5 22" stroke="#c2926a" stroke-width="0.8" fill="none" opacity="0.6"/>';
  }

  function neck() {
    return '<rect x="46.8" y="32" width="6.4" height="6" fill="url(#bbcSkin)"/>';
  }

  function boots(kind) {
    var fill = kind === 'steel' ? 'url(#bbcSteel)' : 'url(#bbcLeather)';
    return '<path d="M40 122 l-3.5 7 q-0.5 2 2 2 l8 0 l0.5 -9 Z" fill="' + fill + '"' + ST + '/>' +
      '<path d="M60 122 l3.5 7 q0.5 2 -2 2 l-8 0 l-0.5 -9 Z" fill="' + fill + '"' + ST + '/>';
  }

  function legs(t, kind) {
    var fill = kind === 'steel' ? 'url(#bbcSteel)' : kind === 'iron' ? 'url(#bbcIron)' : t.fab;
    var wide = kind === 'iron';
    var lw = wide ? 8.5 : 6.5;
    return '<g class="legs">' +
      '<rect x="' + (46 - lw) + '" y="84" width="' + lw + '" height="40" rx="3" fill="' + fill + '"' + ST + '/>' +
      '<rect x="54" y="84" width="' + lw + '" height="40" rx="3" fill="' + fill + '"' + ST + '/>' +
      (kind === 'steel' || kind === 'iron'
        ? '<path d="M40 103 h12 M54 103 h12" stroke="#3a3e46" stroke-width="1" opacity="0.7"/>' : '') +
      boots(kind === 'steel' || kind === 'iron' ? 'steel' : 'leather') +
      '</g>';
  }

  function backArm(fill, hx, hy) {
    hx = hx || 31; hy = hy || 77;
    return '<g class="arm-back">' +
      '<path d="M37 48 Q30 60 ' + hx + ' ' + (hy - 3) + ' l6 2 Q38 62 43 50 Z" fill="' + fill + '"' + ST + '/>' +
      '<circle cx="' + (hx + 1.5) + '" cy="' + hy + '" r="3.6" fill="url(#bbcSkin)"' + ST + '/>' +
      '</g>';
  }

  /* Weapon arm: shoulder at (63,48), hand at (hx,hy). CSS rotates about 64px 50px. */
  function weaponArm(fill, weapon, hx, hy) {
    hx = hx || 69; hy = hy || 76;
    return '<g class="arm-weapon">' +
      '<path d="M63 46 Q72 58 ' + (hx + 1) + ' ' + (hy - 4) + ' l-6 3 Q64 60 58 49 Z" fill="' + fill + '"' + ST + '/>' +
      weapon +
      '<circle cx="' + hx + '" cy="' + hy + '" r="3.9" fill="url(#bbcSkin)"' + ST + '/>' +
      '</g>';
  }

  /* ---------- weapons (held vertical, hand ~ (69,76)) ---------- */

  var WEAPONS = {
    spear: function () {
      return '<rect x="67.6" y="14" width="2.8" height="76" rx="1.2" fill="url(#bbcWood)"' + ST + '/>' +
        '<path d="M69 2 q4 6 0 13 q-4 -7 0 -13 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<rect x="65.5" y="14.5" width="7" height="2.2" rx="1" fill="url(#bbcIron)"/>';
    },
    mace: function () {
      var flanges = '';
      for (var a = 0; a < 360; a += 60) {
        flanges += '<path transform="rotate(' + a + ' 69 22)" d="M69 22 L65.6 12.5 Q69 10 72.4 12.5 Z" fill="url(#bbcIron)"' + ST + '/>';
      }
      return '<rect x="67.5" y="28" width="3" height="60" rx="1.4" fill="url(#bbcWood)"' + ST + '/>' +
        flanges +
        '<circle cx="69" cy="22" r="5.4" fill="url(#bbcSteel)"' + ST + '/>';
    },
    hammer: function () {
      return '<rect x="67" y="26" width="4" height="64" rx="1.8" fill="url(#bbcWood)"' + ST + '/>' +
        '<rect x="58" y="12" width="22" height="13" rx="2.5" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="58" y="12" width="22" height="4" rx="2" fill="url(#bbcSteelH)" opacity="0.55"/>' +
        '<path d="M80 15 l8 3.5 l-8 3.5 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<circle cx="62" cy="18.5" r="1" fill="#2e3138"/><circle cx="75" cy="18.5" r="1" fill="#2e3138"/>';
    },
    crozier: function () {
      return '<rect x="67.8" y="18" width="2.6" height="74" rx="1.2" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M69 18 C69 8 82 8 82 16 C82 22 76 23 74 20" stroke="url(#bbcGold)" stroke-width="3.2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="74" cy="20" r="1.8" fill="url(#bbcGold)"/>';
    },
    scepter: function (t) {
      return '<rect x="68" y="26" width="2.2" height="54" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M65 26 q4 3 8 0 l-1.5 -5 l-5 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="69" cy="16.5" r="5" fill="' + t.jewel + '"' + ST + '/>' +
        '<circle cx="67.4" cy="14.8" r="1.5" fill="#fff" opacity="0.55"/>' +
        '<path d="M69 9 v5 M66.5 11.5 h5" stroke="url(#bbcGold)" stroke-width="1.8" stroke-linecap="round"/>';
    },
    sword: function () {
      return '<path d="M67.2 72 L67.2 22 L69 13 L70.8 22 L70.8 72 Z" fill="url(#bbcBlade)"' + ST + '/>' +
        '<path d="M69 20 V70" stroke="#8b93a2" stroke-width="0.9" opacity="0.8"/>' +
        '<rect x="60.5" y="71.5" width="17" height="3.6" rx="1.6" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="67.3" y="75" width="3.4" height="11" rx="1.5" fill="url(#bbcLeather)"' + ST + '/>' +
        '<circle cx="69" cy="88.5" r="2.6" fill="url(#bbcGold)"' + ST + '/>';
    }
  };

  /* ---------- the six figures ---------- */

  var BUILDERS = {
    /* Pawn: man-at-arms — kettle helm, quilted gambeson, spear */
    p: function (t) {
      return legs(t, 'cloth') +
        backArm('url(#bbcLeather)') +
        '<g class="torso">' +
        '<path d="M39 46 Q37 66 40 82 L60 82 Q63 66 61 46 Q50 41 39 46 Z" fill="url(#bbcLeather)"' + ST + '/>' +
        '<path d="M44 45 V81 M50 44 V82 M56 45 V81" stroke="#40301e" stroke-width="0.8" opacity="0.7"/>' +
        '<path d="M39 60 h22 M39.5 71 h21" stroke="#40301e" stroke-width="0.8" opacity="0.7"/>' +
        '<rect x="38.5" y="74" width="23" height="4" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="47.5" y="74" width="5" height="4" fill="url(#bbcGold)"/>' +
        '</g>' +
        '<g class="head">' + neck() +
        '<path d="M42 33 Q50 38 58 33 L58 30 L42 30 Z" fill="url(#bbcIron)" opacity="0.9"/>' +
        headBase(t) + face(t) +
        '<path d="M40.5 20 Q41 11 50 10.5 Q59 11 59.5 20 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<ellipse cx="50" cy="20" rx="14.5" ry="3.2" fill="url(#bbcIron)"' + ST + '/>' +
        '</g>' +
        weaponArm('url(#bbcLeather)', WEAPONS.spear());
    },

    /* Knight: full plate, great helm with plume, flanged mace */
    n: function (t) {
      return legs(t, 'steel') +
        backArm('url(#bbcSteel)') +
        '<g class="torso">' +
        '<path d="M38 46 Q35 64 39 80 L61 80 Q65 64 62 46 Q50 40 38 46 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<path d="M45 46 L50 62 L55 46" stroke="#8b93a2" stroke-width="0.9" fill="none" opacity="0.8"/>' +
        '<rect x="44" y="52" width="12" height="18" rx="2" fill="' + t.fab + '" opacity="0.92"' + ST + '/>' +
        '<path d="M39.5 80 q10.5 5 21 0 l-1 7 q-9.5 4 -19 0 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<path d="M37 42 L33.5 31 L42 41 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M63 42 L66.5 31 L58 41 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<circle cx="37" cy="47" r="6.8" fill="url(#bbcSteelH)"' + ST + '/>' +
        '<circle cx="63" cy="47" r="6.8" fill="url(#bbcSteelH)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M41 12 Q41 8 50 8 Q59 8 59 12 L59 34 Q50 37 41 34 Z" fill="url(#bbcSteel)"' + ST + '/>' +
        '<rect x="41" y="10" width="18" height="3" fill="url(#bbcIron)"/>' +
        '<rect x="42.5" y="21.5" width="15" height="4.6" rx="2" fill="#0e0f13"/>' +
        '<g transform="translate(0,-1)">' + face(t, { eyeY: 24.6, noNose: true, noMouth: true }) + '</g>' +
        '<path d="M50 13 V34 M44 28.5 h3 M53 28.5 h3 M44 31.5 h3 M53 31.5 h3" stroke="#5c6470" stroke-width="0.9" opacity="0.8"/>' +
        '<path d="M50 8 Q44 -2 34 1 Q42 4 41.5 12 Q45 8.5 50 8 Z" fill="' + t.plume + '"' + ST + '/>' +
        '</g>' +
        weaponArm('url(#bbcSteel)', WEAPONS.mace());
    },

    /* Rook: tower guardian — crenellated helm, massive frame, warhammer */
    r: function (t) {
      return legs(t, 'iron') +
        '<g class="arm-back">' +
        '<path d="M34 48 Q26 60 28 76 l7 1 Q34 62 40 51 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<circle cx="31" cy="79" r="4.4" fill="url(#bbcSkin)"' + ST + '/>' +
        '</g>' +
        '<g class="torso">' +
        '<path d="M34 46 Q31 66 35 82 L65 82 Q69 66 66 46 Q50 39 34 46 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M34.5 56 h31 M34 66 h32 M34.8 75 h30.4" stroke="#2e3138" stroke-width="1.4" opacity="0.8"/>' +
        '<circle cx="38" cy="51" r="1.1" fill="#23252b"/><circle cx="62" cy="51" r="1.1" fill="#23252b"/>' +
        '<circle cx="37" cy="61" r="1.1" fill="#23252b"/><circle cx="63" cy="61" r="1.1" fill="#23252b"/>' +
        '<rect x="44" y="48" width="12" height="10" rx="1.5" fill="' + t.fab + '" opacity="0.9"' + ST + '/>' +
        '<path d="M35 40 L30 27 L41 39 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<path d="M65 40 L70 27 L59 39 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<circle cx="35" cy="46" r="8" fill="url(#bbcSteel)"' + ST + '/>' +
        '<circle cx="65" cy="46" r="8" fill="url(#bbcSteel)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' +
        '<path d="M39 34 L39 10 L44 10 L44 15 L47.5 15 L47.5 10 L52.5 10 L52.5 15 L56 15 L56 10 L61 10 L61 34 Q50 37.5 39 34 Z" fill="url(#bbcIron)"' + ST + '/>' +
        '<rect x="41.5" y="22" width="17" height="4.4" rx="2" fill="#0e0f13"/>' +
        '<g transform="translate(0,-0.5)">' + face(t, { eyeY: 24.4, noNose: true, noMouth: true }) + '</g>' +
        '<path d="M39 19 h22" stroke="#2e3138" stroke-width="1.2"/>' +
        '<rect x="47" y="28.5" width="6" height="1.6" fill="' + t.plume + '" opacity="0.9"/>' +
        '</g>' +
        weaponArm('url(#bbcIron)', WEAPONS.hammer());
    },

    /* Bishop: robed cleric — tall mitre, grey beard, gilded crozier */
    b: function (t) {
      return '<g class="legs">' +
        '<path d="M40 80 Q34 108 35 126 Q50 131 65 126 Q66 108 60 80 Z" fill="url(#bbcRobe)"' + ST + '/>' +
        '<path d="M42 90 Q41 110 41.5 124 M58 90 Q59 110 58.5 124" stroke="#a2977f" stroke-width="0.9" opacity="0.8"/>' +
        '<path d="M35.5 121 q14.5 5 29 0 l0 4.5 q-14.5 5 -29 0 Z" fill="' + t.fab + '"' + ST + '/>' +
        '</g>' +
        backArm('url(#bbcRobe)') +
        '<g class="torso">' +
        '<path d="M39 46 Q37 64 40 82 L60 82 Q63 64 61 46 Q50 41 39 46 Z" fill="url(#bbcRobe)"' + ST + '/>' +
        '<path d="M46.5 44 L50 82 L53.5 44" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M50 52 v7 M47.5 54.8 h5" stroke="url(#bbcGold)" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M39 46 q11 -5 22 0 l0 4 q-11 -5 -22 0 Z" fill="' + t.fab + '"' + ST + '/>' +
        '</g>' +
        '<g class="head">' + neck() + headBase(t) + face(t, { noMouth: true }) +
        '<path d="M42 35 Q42 44 50 44.5 Q58 44 58 35 Q54 32.5 50 32.5 Q46 32.5 42 35 Z" fill="' + t.beard + '"' + ST + '/>' +
        '<path d="M46 36.5 q4 2.5 8 0" stroke="#8f887a" stroke-width="0.7" fill="none" opacity="0.7"/>' +
        '<path d="M42.5 18 L50 1.5 L57.5 18 Q50 21.5 42.5 18 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M50 4.5 V17 M46.7 9.5 h6.6" stroke="url(#bbcGold)" stroke-width="1.6" stroke-linecap="round"/>' +
        '<path d="M42.3 16.5 q7.7 4 15.4 0 l0 3.6 q-7.7 4 -15.4 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '</g>' +
        weaponArm('url(#bbcRobe)', WEAPONS.crozier());
    },

    /* Queen: crowned regent — gown, jeweled scepter */
    q: function (t) {
      return '<g class="legs">' +
        '<path d="M41 74 Q30 106 31 127 Q50 132 69 127 Q70 106 59 74 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M44 84 Q40 108 40.5 125 M56 84 Q60 108 59.5 125" stroke="' + t.edge + '" stroke-width="0.9" opacity="0.75"/>' +
        '<path d="M31.5 122 q18.5 6 37 0 l0.3 4 q-19 6 -37.6 0 Z" fill="url(#bbcGold)" opacity="0.85"/>' +
        '</g>' +
        backArm(t.fab) +
        '<g class="torso">' +
        '<path d="M40 46 Q38 62 42 76 L58 76 Q62 62 60 46 Q50 41 40 46 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<path d="M46 48 L54 60 M54 48 L46 60 M46 60 L54 70 M54 60 L46 70" stroke="url(#bbcGold)" stroke-width="0.9" opacity="0.85"/>' +
        '<path d="M40 46 q10 -4.5 20 0 l0 3.5 q-10 -4.5 -20 0 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '</g>' +
        '<g class="head">' + neck() +
        '<path d="M40 22 Q37 40 42 50 L45 47 Q42 36 43.5 24 Z" fill="' + t.hair + '"' + ST + '/>' +
        '<path d="M60 22 Q63 40 58 50 L55 47 Q58 36 56.5 24 Z" fill="' + t.hair + '"' + ST + '/>' +
        headBase(t) + face(t) +
        '<path d="M41 22 Q42 13.5 50 13 Q58 13.5 59 22 Q50 18 41 22 Z" fill="' + t.hair + '"' + ST + '/>' +
        '<path d="M42.5 15.5 L44 7.5 L47.5 12 L50 5.5 L52.5 12 L56 7.5 L57.5 15.5 Q50 12.5 42.5 15.5 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="44" cy="8.5" r="1.2" fill="#fff"/><circle cx="50" cy="6.5" r="1.3" fill="' + t.jewel + '"/><circle cx="56" cy="8.5" r="1.2" fill="#fff"/>' +
        '<circle cx="50" cy="36.5" r="1.3" fill="' + t.jewel + '"/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.scepter(t));
    },

    /* King: fur mantle, great crown, full beard, longsword */
    k: function (t) {
      return legs(t, 'cloth') +
        '<path class="cape" d="M36 47 Q28 80 31 112 L39 106 Q36 78 41 52 Z" fill="' + t.edge + '"' + ST + '/>' +
        backArm(t.fab) +
        '<g class="torso">' +
        '<path d="M37 46 Q34 66 38 84 L62 84 Q66 66 63 46 Q50 40 37 46 Z" fill="' + t.fab + '"' + ST + '/>' +
        '<rect x="37" y="74" width="26" height="4.5" fill="url(#bbcLeather)"' + ST + '/>' +
        '<rect x="47" y="73.5" width="6" height="5.5" rx="1" fill="url(#bbcGold)"' + ST + '/>' +
        '<path d="M37 46 Q50 41 63 46 L61.5 56 Q50 50 38.5 56 Z" fill="url(#bbcFur)"' + ST + '/>' +
        '<circle cx="42" cy="50" r="0.8" fill="#8d8577"/><circle cx="50" cy="47.5" r="0.8" fill="#8d8577"/><circle cx="58" cy="50" r="0.8" fill="#8d8577"/>' +
        '</g>' +
        '<g class="head">' + neck() + headBase(t) + face(t, { noMouth: true }) +
        '<path d="M40.5 30 Q39 46 50 47.5 Q61 46 59.5 30 Q55 34.5 50 34.5 Q45 34.5 40.5 30 Z" fill="' + t.beard + '"' + ST + '/>' +
        '<path d="M45 36 q5 3 10 0 M47 42 q3 1.6 6 0" stroke="#9a917f" stroke-width="0.7" fill="none" opacity="0.65"/>' +
        '<path d="M41 20 Q42 12.5 50 12 Q58 12.5 59 20 Q50 16.5 41 20 Z" fill="' + t.hair + '"/>' +
        '<path d="M41.5 16 L42.5 5 L46.5 10.5 L50 3 L53.5 10.5 L57.5 5 L58.5 16 Q50 12.5 41.5 16 Z" fill="url(#bbcGold)"' + ST + '/>' +
        '<rect x="41.8" y="14.2" width="16.4" height="3.4" rx="1.5" fill="url(#bbcGold)"' + ST + '/>' +
        '<circle cx="45" cy="15.9" r="1.1" fill="' + t.jewel + '"/><circle cx="50" cy="15.9" r="1.1" fill="#fff"/><circle cx="55" cy="15.9" r="1.1" fill="' + t.jewel + '"/>' +
        '<circle cx="50" cy="5.5" r="1.4" fill="' + t.jewel + '"/>' +
        '</g>' +
        weaponArm(t.fab, WEAPONS.sword(), 69, 80);
    }
  };

  /* Dirt, soot and old scratches — every soldier has seen campaigns. */
  function grime() {
    return '<g opacity="0.24" fill="#120e0a">' +
      '<ellipse cx="44" cy="66" rx="4.5" ry="2.4"/>' +
      '<ellipse cx="57" cy="79" rx="3.4" ry="1.9"/>' +
      '<ellipse cx="47" cy="99" rx="3.8" ry="2"/>' +
      '<ellipse cx="55" cy="114" rx="3" ry="1.7"/>' +
      '<path d="M42 55 l7 6 M57 58 l-6 8 M46 86 l5 5" stroke="#120e0a" stroke-width="1" fill="none"/>' +
      '</g>';
  }

  /* Build a full character SVG string. */
  function svg(type, color, cls) {
    var t = TEAM[color];
    return '<svg class="char char-' + type + ' team-' + color + (cls ? ' ' + cls : '') + '" viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse class="shadow" cx="50" cy="131" rx="21" ry="4.5" fill="#000" opacity="0.22"/>' +
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
    p: 'Pikeman Pokey', n: 'Sir Bonk', b: 'Brother Whack',
    r: 'Ironclad Rook', q: 'Queen Zapper', k: 'King Beardy'
  };

  return { svg: svg, defs: defs, NAMES: NAMES, GLYPH: GLYPH, MOVES_HINT: MOVES_HINT, FLAVOR: FLAVOR, TEAM: TEAM };
})();
