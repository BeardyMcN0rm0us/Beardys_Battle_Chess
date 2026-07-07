/* Beardy's Battle Chess — Academy curriculum, puzzles and progression.
 * Duolingo-style: units of bite-size lessons that unlock in order, with
 * XP and a daily streak. Every drill and mate puzzle in this file has
 * been machine-verified with the engine.
 * Lesson kinds:
 *   captureAll — enemies stand still; take them all (stars scored vs par)
 *   mate1     — real position; deliver checkmate in one move
 *   boss      — a real game against an opponent from the roster */
var Lessons = (function () {
  'use strict';

  var UNITS = [
    {
      id: 'u1', name: 'Unit 1 · Boot Camp', desc: 'Learn how each warrior moves and kills.',
      lessons: [
        {
          id: 'pawn', icon: 'p', name: 'Pawn Power', kind: 'captureAll', par: 2,
          fen: '8/8/8/5p2/8/8/4P3/8 w - - 0 1',
          tip: 'Pawns march straight ahead (two squares from home!) but kill diagonally. Take the enemy pawn.'
        },
        {
          id: 'rook', icon: 'r', name: 'Rook Rampage', kind: 'captureAll', par: 2,
          fen: 'p6p/8/8/8/8/8/8/R7 w - - 0 1',
          tip: 'Rooks charge in straight lines — any distance. Flatten both enemies.'
        },
        {
          id: 'bishop', icon: 'b', name: 'Bishop Bash', kind: 'captureAll', par: 2,
          fen: '3p4/8/8/6p1/8/8/8/2B5 w - - 0 1',
          tip: 'Bishops sweep the diagonals. Take both enemies — plan the order!'
        },
        {
          id: 'knight', icon: 'n', name: 'Knight Moves', kind: 'captureAll', par: 3,
          fen: '8/3p4/8/4p3/8/5p2/8/6N1 w - - 0 1',
          tip: 'Knights jump in an L: two squares one way, one square sideways. Chain all three kills.'
        },
        {
          id: 'queen', icon: 'q', name: 'Queen Quest', kind: 'captureAll', par: 2,
          fen: '8/3p4/8/8/6p1/8/8/3Q4 w - - 0 1',
          tip: 'The queen moves like a rook AND a bishop. Slay both enemies in two moves.'
        },
        {
          id: 'king', icon: 'k', name: 'King Combat', kind: 'captureAll', par: 2,
          fen: '8/8/8/8/8/6p1/5p2/4K3 w - - 0 1',
          tip: 'The king steps one square in any direction. Slow, but the greatsword still swings.'
        }
      ]
    },
    {
      id: 'u2', name: 'Unit 2 · Blood & Tactics', desc: 'Multi-kill patterns real players use.',
      lessons: [
        {
          id: 'fork', icon: 'n', name: 'The Fork Tour', kind: 'captureAll', par: 3,
          fen: '8/8/3p4/5p2/2p5/6N1/8/8 w - - 0 1',
          tip: 'A knight in the middle of the board threatens eight squares at once. Hop the L-path and butcher all three.'
        },
        {
          id: 'skewer', icon: 'r', name: 'Skewer Alley', kind: 'captureAll', par: 3,
          fen: 'p3p3/8/8/8/R3p3/8/8/8 w - - 0 1',
          tip: 'Rooks love open files and ranks — enemies lined up fall one after another. Take all three in three.'
        },
        {
          id: 'purge', icon: 'q', name: 'The Royal Purge', kind: 'captureAll', par: 4,
          fen: '3p3p/8/8/8/3Qp2p/8/8/8 w - - 0 1',
          tip: 'Four enemies, four moves. The queen never wastes a step — chain rank, file and diagonal into one massacre.'
        },
        {
          id: 'storm', icon: 'p', name: 'Pawn Storm', kind: 'captureAll', par: 3,
          fen: '8/8/8/8/4p3/3p1p2/2P1P3/8 w - - 0 1',
          tip: 'Pawns fight as a pack. Use BOTH pawns — each kill opens the next diagonal.'
        }
      ]
    },
    {
      id: 'u3', name: 'Unit 3 · The Kill', desc: 'Checkmate: the only move that ends the war.',
      lessons: [
        {
          id: 'mate', icon: 'r', name: 'The Back Rank', kind: 'mate1',
          fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
          tip: 'The enemy king is walled in by his own pawns. One rook on the back rank ends it — find the mate.'
        },
        {
          id: 'qtakes', icon: 'q', name: 'Take and Mate', kind: 'mate1',
          fen: '3r2k1/5ppp/8/8/8/8/8/3Q2K1 w - - 0 1',
          tip: 'Sometimes the mating square is guarded — until you kill the guard. Capture your way to checkmate.'
        },
        {
          id: 'guillotine', icon: 'r', name: 'The Guillotine', kind: 'mate1',
          fen: '7k/1R6/R7/8/8/8/8/6K1 w - - 0 1',
          tip: 'Two rooks working the ranks like a closing blade. One rook holds the 7th — the other drops the edge.'
        },
        {
          id: 'boss', icon: 'k', name: 'Boss Battle: Daisy', kind: 'boss', opponent: 'daisy',
          tip: 'Put it all together — defeat Daisy in a real battle to finish the Academy!'
        }
      ]
    }
  ];

  var LESSONS = [];
  UNITS.forEach(function (u) { u.lessons.forEach(function (l) { LESSONS.push(l); }); });

  /* Mate-in-one pack (each verified: the mate exists). */
  var PUZZLES = [
    { id: 'pz1', name: 'Back-Rank Blitz', depth: 1, fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1' },
    { id: 'pz2', name: 'Corridor of Doom', depth: 1, fen: '6k1/5ppp/8/8/8/8/8/4R1K1 w - - 0 1' },
    { id: 'pz3', name: 'Royal Escort', depth: 1, fen: '7k/8/5KQ1/8/8/8/8/8 w - - 0 1' },
    { id: 'pz4', name: 'Sneaky Knight', depth: 1, fen: '6rk/6pp/8/6N1/8/8/8/6K1 w - - 0 1' },
    { id: 'pz5', name: 'Ladder Finish', depth: 1, fen: '7k/R7/1R6/8/8/8/8/6K1 w - - 0 1' },
    { id: 'pz6', name: 'Queen Takes All', depth: 1, fen: '3q2k1/5ppp/8/8/8/8/5PPP/3Q2K1 w - - 0 1' },
    { id: 'pz7', name: 'Corner Trap', depth: 1, fen: 'k7/8/1QK5/8/8/8/8/8 w - - 0 1' },
    { id: 'pz8', name: 'Long Distance Call', depth: 1, fen: '5k2/1R6/8/8/8/8/8/Q5K1 w - - 0 1' }
  ];

  /* Mate-in-two pack (each verified: no mate in 1, forced mate in 2). */
  var PUZZLES2 = [
    { id: 'm2a', name: 'The Ladder', depth: 2, fen: '6k1/8/8/8/8/8/R7/1R4K1 w - - 0 1' },
    { id: 'm2b', name: 'Ladder II', depth: 2, fen: '6k1/8/8/8/8/8/1R6/R5K1 w - - 0 1' },
    { id: 'm2c', name: 'March of the King', depth: 2, fen: 'k7/8/2K5/8/8/8/8/7R w - - 0 1' },
    { id: 'm2d', name: 'Coronation', depth: 2, fen: '7k/4P3/5K2/8/8/8/8/8 w - - 0 1' },
    { id: 'm2e', name: 'Cut Off', depth: 2, fen: '2k5/8/1K6/8/8/8/8/5R2 w - - 0 1' },
    { id: 'm2f', name: 'The Long File', depth: 2, fen: 'k7/8/8/1K6/8/8/8/1Q6 w - - 0 1' }
  ];

  /* ---------- progress, XP & streak (localStorage) ---------- */

  function load() {
    try { return JSON.parse(localStorage.getItem('bbc-progress')) || {}; }
    catch (e) { return {}; }
  }
  function save(p) { localStorage.setItem('bbc-progress', JSON.stringify(p)); }

  function lessonStars(id) { return (load().lessons || {})[id] || 0; }
  function setLessonStars(id, stars) {
    var p = load();
    p.lessons = p.lessons || {};
    if (stars > (p.lessons[id] || 0)) p.lessons[id] = stars;
    save(p);
  }
  function puzzleDone(id) { return !!(load().puzzles || {})[id]; }
  function setPuzzleDone(id) {
    var p = load();
    p.puzzles = p.puzzles || {};
    p.puzzles[id] = true;
    save(p);
  }

  function getXP() { return load().xp || 0; }
  function addXP(n) {
    var p = load();
    p.xp = (p.xp || 0) + n;
    save(p);
    return p.xp;
  }

  /* Daily streak: call on any meaningful play. */
  function touchStreak() {
    var p = load();
    var today = new Date().toISOString().slice(0, 10);
    var yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (p.streakDay !== today) {
      p.streak = (p.streakDay === yest) ? (p.streak || 0) + 1 : 1;
      p.streakDay = today;
      save(p);
    }
    return p.streak;
  }
  function getStreak() {
    var p = load();
    var today = new Date().toISOString().slice(0, 10);
    var yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    return (p.streakDay === today || p.streakDay === yest) ? (p.streak || 0) : 0;
  }

  /* Lesson i (flat index) unlocks when the previous lesson has a star. */
  function unlocked(i) {
    if (i === 0) return true;
    return lessonStars(LESSONS[i - 1].id) > 0;
  }

  function starsFor(lesson, movesUsed) {
    if (movesUsed <= lesson.par) return 3;
    if (movesUsed <= lesson.par + 1) return 2;
    return 1;
  }

  /* For captureAll lessons: done when no black pieces remain. */
  function captureAllDone(state) {
    for (var i = 0; i < 64; i++) {
      var p = state.board[i];
      if (p && p.color === 'b') return false;
    }
    return true;
  }

  return {
    UNITS: UNITS, LESSONS: LESSONS, PUZZLES: PUZZLES, PUZZLES2: PUZZLES2,
    lessonStars: lessonStars, setLessonStars: setLessonStars,
    puzzleDone: puzzleDone, setPuzzleDone: setPuzzleDone,
    getXP: getXP, addXP: addXP, touchStreak: touchStreak, getStreak: getStreak,
    unlocked: unlocked, starsFor: starsFor, captureAllDone: captureAllDone
  };
})();
