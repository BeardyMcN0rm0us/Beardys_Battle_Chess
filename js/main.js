/* Beardy's Battle Chess — app shell: screens, board UI, game flow. */
(function () {
  'use strict';

  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, parent) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (parent) parent.appendChild(d);
    return d;
  }

  /* ---------- screens ---------- */

  function show(id) {
    document.querySelectorAll('.screen').forEach(function (s) {
      s.classList.toggle('active', s.id === id);
    });
    if (id === 'screen-menu') renderMenu();
    if (id === 'screen-opponents') renderOpponents();
    if (id === 'screen-academy') renderAcademy();
    if (id === 'screen-puzzles') renderPuzzles();
  }

  /* ---------- game context ---------- */

  var G = null;
  /* G = { state, mode: 'ai'|'2p'|'lesson'|'puzzle', opponent, lesson, puzzle,
   *       playerColor, flipped, history: [state...], captured: {w:[],b:[]},
   *       moveCount, over, busy, loose, selected, targets } */

  var cells = [];   // 64 cell divs
  var pieceLayer;

  function dispRC(i) {
    var p = Engine.rc(i);
    return G && G.flipped ? { r: 7 - p.r, c: 7 - p.c } : p;
  }

  function buildBoard() {
    var grid = $('#board-cells');
    grid.innerHTML = '';
    cells = [];
    for (var i = 0; i < 64; i++) {
      var p = Engine.rc(i);
      var c = el('div', 'cell ' + (((p.r + p.c) % 2) ? 'dark' : 'light'), grid);
      c.dataset.i = i;
      c.addEventListener('pointerdown', onCell);
      cells.push(c);
    }
    pieceLayer = $('#board-pieces');
    layoutCells();
  }

  /* ---------- manual perspective projection (all 2D, exact hit-testing) ----------
   * The board is drawn as a trapezoid: far rows are narrower and shorter,
   * like the classic Battle Chess table. Cells are clip-path trapezoids
   * (clip-path clips pointer hit-testing too), pieces scale with depth. */
  var W_FAR = 0.70;   // top edge width as a fraction of the bottom edge
  var ROW_G = 1.11;   // each row toward the viewer is 11% taller
  var ROW_Y = (function () {
    var h = [], sum = 0, i;
    for (i = 0; i < 8; i++) { h.push(Math.pow(ROW_G, i)); sum += h[i]; }
    var y = [0];
    for (i = 0; i < 8; i++) y.push(y[i] + h[i] / sum * 100);
    return y;
  })();

  function rowY(rf) { // rf in 0..8, fractional ok
    var i = Math.max(0, Math.min(7, Math.floor(rf)));
    return ROW_Y[i] + (rf - i) * (ROW_Y[i + 1] - ROW_Y[i]);
  }
  function lineW(y) { // board width fraction at height y (0=far,100=near)
    return W_FAR + (1 - W_FAR) * y / 100;
  }
  function colX(cf, y) { // x% of a column center line at height y
    return 50 + (cf - 4) * lineW(y) * 12.5;
  }

  function layoutCells() {
    for (var i = 0; i < 64; i++) {
      var d = dispRC(i);
      var yT = rowY(d.r), yB = rowY(d.r + 1);
      var xTL = colX(d.c, yT), xTR = colX(d.c + 1, yT);
      var xBL = colX(d.c, yB), xBR = colX(d.c + 1, yB);
      var left = Math.min(xTL, xBL), right = Math.max(xTR, xBR);
      var w = right - left, h = yB - yT;
      var st = cells[i].style;
      st.left = left + '%';
      st.top = yT + '%';
      st.width = w + '%';
      st.height = h + '%';
      var pts = [
        ((xTL - left) / w * 100).toFixed(2) + '% 0%',
        ((xTR - left) / w * 100).toFixed(2) + '% 0%',
        ((xBR - left) / w * 100).toFixed(2) + '% 100%',
        ((xBL - left) / w * 100).toFixed(2) + '% 100%'
      ];
      st.clipPath = 'polygon(' + pts.join(', ') + ')';
      cells[i].innerHTML = '';
      // coordinate labels on the display edges
      var name = Engine.sqName(i);
      if (d.r === 7) el('span', 'coord coord-f', cells[i]).textContent = name[0];
      if (d.c === 0) el('span', 'coord coord-r', cells[i]).textContent = name[1];
    }
  }

  /* Piece box for (possibly fractional) display coords: feet on the tile. */
  function placeAt(node, rf, cf) {
    var yB = rowY(rf + 1);
    var sq = lineW(yB) * 12.5;        // square width % at the feet line
    var pw = sq * 1.45, ph = pw * 1.4; // svg viewBox is 100x140
    var xC = colX(cf + 0.5, yB);
    var st = node.style;
    st.left = (xC - pw / 2) + '%';
    st.top = (yB - ph + sq * 0.10) + '%';
    st.width = pw + '%';
    st.height = ph + '%';
    st.zIndex = 10 + Math.round(rf * 2);
  }

  function positionPiece(node, i) {
    var d = dispRC(i);
    placeAt(node, d.r, d.c);
  }

  function renderPieces() {
    pieceLayer.innerHTML = '';
    for (var i = 0; i < 64; i++) {
      var p = G.state.board[i];
      if (!p) continue;
      var node = el('div', 'piece', pieceLayer);
      node.dataset.i = i;
      node.innerHTML = '<div class="stand">' + Characters.svg(p.type, p.color) +
        '<span class="piece-badge badge-' + p.color + '">' + Characters.GLYPH[p.type] + '</span></div>';
      positionPiece(node, i);
    }
  }

  function pieceAt(i) {
    return pieceLayer.querySelector('.piece[data-i="' + i + '"]');
  }

  var SAN_L = { p: '', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' };
  function sanOf(pre, move, post) {
    var s;
    if (move.castle) s = move.castle === 'K' ? 'O-O' : 'O-O-O';
    else {
      var cap = move.captured ? 'x' : '';
      if (move.piece === 'p') s = (cap ? Engine.sqName(move.from)[0] : '') + cap + Engine.sqName(move.to);
      else s = SAN_L[move.piece] + cap + Engine.sqName(move.to);
      if (move.promo) s += '=' + SAN_L[move.promo];
    }
    var st = Engine.status(post);
    if (st === 'checkmate') s += '#';
    else if (Engine.inCheck(post, post.turn)) s += '+';
    return s;
  }

  function renderMoveList() {
    var ml = $('#move-list');
    if (!ml || !G) return;
    var out = '';
    for (var i = 0; i < G.san.length; i += 2) {
      out += '<span class="mv-num">' + (i / 2 + 1) + '.</span> ' + G.san[i] +
        (G.san[i + 1] ? ' ' + G.san[i + 1] : '') + '  ';
    }
    ml.innerHTML = out || '<span class="mv-num">the war has not begun</span>';
    ml.scrollTop = ml.scrollHeight;
  }

  function clearMarks() {
    cells.forEach(function (c) {
      c.classList.remove('sel', 'move', 'take', 'last', 'check', 'hint');
    });
  }

  function markLast(move) {
    if (!move) return;
    cells[move.from].classList.add('last');
    cells[move.to].classList.add('last');
  }

  function markCheck() {
    if (Engine.inCheck(G.state, G.state.turn)) {
      var k = Engine.findKing(G.state.board, G.state.turn);
      if (k >= 0) cells[k].classList.add('check');
    }
  }

  /* ---------- HUD ---------- */

  function setStatus(html) { $('#game-status').innerHTML = html; }

  function updateHud(lastMove) {
    clearMarks();
    markLast(lastMove);
    markCheck();
    renderCaptured();
    if (G.over) return;
    if (G.mode === 'lesson' && G.lesson.kind === 'captureAll') {
      setStatus('<b>' + G.lesson.name + '</b> &middot; Moves: ' + G.moveCount +
        ' / par ' + G.lesson.par);
      return;
    }
    if (G.mode === 'lesson' || G.mode === 'puzzle') {
      setStatus('<b>Find the checkmate!</b> One move wins it.');
      return;
    }
    var turnName;
    if (G.mode === '2p') {
      turnName = G.state.turn === 'w' ? 'Blue' : 'Red';
      setStatus('<b>' + turnName + '</b> to move');
    } else {
      setStatus(G.state.turn === G.playerColor ? '<b>Your move</b>'
        : '<b>' + G.opponent.name + '</b> is thinking<span class="dots"></span>');
    }
  }

  function renderCaptured() {
    ['w', 'b'].forEach(function (color) {
      var tray = $('#captured-' + color);
      tray.innerHTML = '';
      G.captured[color].forEach(function (t) {
        var m = el('div', 'mini', tray);
        m.innerHTML = Characters.svg(t, color, 'mini-dead');
      });
    });
  }

  /* ---------- interaction ---------- */

  function legalFor(i) {
    return Engine.legalMoves(G.state, i, G.loose);
  }

  function onCell(ev) {
    if (!G || G.busy || G.over) return;
    var i = parseInt(ev.currentTarget.dataset.i, 10);
    var piece = G.state.board[i];
    var humanTurn = G.mode === '2p' || G.mode === 'lesson' || G.mode === 'puzzle' ||
      G.state.turn === G.playerColor;
    if (!humanTurn) return;

    if (G.selected != null) {
      var mv = G.targets.filter(function (m) { return m.to === i; });
      if (mv.length) {
        var chosen = mv[0];
        if (mv.length > 1) { promoPicker(mv, doPlayerMove); deselect(); return; }
        deselect();
        doPlayerMove(chosen);
        return;
      }
      deselect();
      if (piece && piece.color === G.state.turn) select(i);
      return;
    }
    if (piece && piece.color === G.state.turn) select(i);
  }

  function select(i) {
    G.selected = i;
    G.targets = legalFor(i);
    if (!G.targets.length) { G.selected = null; return; }
    Sound.play('select');
    var sp = G.state.board[i];
    setStatus('<b>' + Characters.NAMES[sp.type] + '</b> \u2014 ' +
      Characters.MOVES_HINT[sp.type] + ' \u00b7 tap a gold dot to move, a red ring to attack');
    cells[i].classList.add('sel');
    G.targets.forEach(function (m) {
      cells[m.to].classList.add(m.captured ? 'take' : 'move');
    });
  }

  function deselect() {
    G.selected = null;
    G.targets = [];
    clearMarks();
    markCheck();
    updateHud();
    markCheck();
  }

  function promoPicker(moves, cb) {
    var layer = $('#modal-layer');
    layer.innerHTML = '';
    var ov = el('div', 'modal-overlay show', layer);
    var box = el('div', 'modal promo', ov);
    el('h3', null, box).textContent = 'Promote your pawn!';
    var row = el('div', 'promo-row', box);
    moves.forEach(function (m) {
      var b = el('button', 'promo-btn', row);
      b.innerHTML = Characters.svg(m.promo, m.color) +
        '<span>' + Characters.NAMES[m.promo] + '</span>';
      b.addEventListener('click', function () {
        layer.innerHTML = '';
        cb(m);
      });
    });
  }

  /* ---------- moves & animation ---------- */

  function slide(node, to) {
    return new Promise(function (res) {
      positionPiece(node, to);
      setTimeout(res, 300);
    });
  }

  /* Step to a spot just beside the victim, facing them. */
  function slideBeside(node, from, victimSq) {
    var a = dispRC(from), v = dispRC(victimSq);
    var dc = a.c - v.c, dr = a.r - v.r;
    var m = Math.max(Math.abs(dc), Math.abs(dr)) || 1;
    node.classList.toggle('face-l', v.c < a.c);
    return new Promise(function (res) {
      placeAt(node, v.r + (dr / m) * 0.62, v.c + (dc / m) * 0.62);
      node.style.zIndex = 12 + Math.round(v.r * 2); // in front of the victim
      setTimeout(res, 340);
    });
  }

  function animateMove(move) {
    G.busy = true;
    clearMarks();
    var attacker = G.state.board[move.from];
    var victimSq = move.ep ? move.to + (attacker.color === 'w' ? 8 : -8) : move.to;
    var victim = move.captured ? G.state.board[victimSq] || { type: move.captured, color: attacker.color === 'w' ? 'b' : 'w' } : null;
    var node = pieceAt(move.from);
    var seq = Promise.resolve();

    Sound.play('move');
    if (move.castle) {
      var home = attacker.color === 'w' ? 7 : 0;
      var rookFrom = Engine.idx(home, move.castle === 'K' ? 7 : 0);
      var rookNode = pieceAt(rookFrom);
      if (rookNode) slide(rookNode, Engine.idx(home, move.castle === 'K' ? 5 : 3));
    }
    if (node) {
      if (victim) {
        var vicNode = pieceAt(victimSq);
        var neighbors = [];
        [-1, 1, -8, 8].forEach(function (d) {
          var n = victimSq + d;
          if (n < 0 || n > 63) return;
          if (Math.abs(d) === 1 && Math.floor(n / 8) !== Math.floor(victimSq / 8)) return;
          neighbors.push(cells[n]);
        });
        seq = seq
          .then(function () { return slideBeside(node, move.from, victimSq); })
          .then(function () { return Battle.fightOnBoard(node, vicNode, attacker.type, cells[victimSq], neighbors); })
          .then(function () { return slide(node, move.to); });
      } else {
        seq = seq.then(function () { return slide(node, move.to); });
      }
    }
    return seq.then(function () {
      if (victim) {
        G.captured[victim.color].push(victim.type);
        Battle.squareSplat(cells[victimSq]);
      }
      var pre = G.state;
      G.history.push(pre);
      G.state = Engine.makeMove(pre, move);
      G.san.push(sanOf(pre, move, G.state));
      renderMoveList();
      renderPieces();
      G.busy = false;
      return move;
    });
  }

  /* ---------- game flow ---------- */

  function startGame(opts) {
    G = {
      state: opts.fen ? Engine.fromFEN(opts.fen) : Engine.initialState(),
      mode: opts.mode,
      opponent: opts.opponent || null,
      lesson: opts.lesson || null,
      puzzle: opts.puzzle || null,
      playerColor: opts.playerColor || 'w',
      flipped: (opts.playerColor || 'w') === 'b',
      history: [],
      captured: { w: [], b: [] },
      moveCount: 0,
      san: [],
      over: false, busy: false,
      loose: !!(opts.lesson && opts.lesson.kind === 'captureAll'),
      selected: null, targets: []
    };
    Lessons.touchStreak();
    if (G.opponent) Opponents.preload(G.opponent);
    layoutCells();
    renderPieces();
    show('screen-game');

    $('#game-title').textContent =
      G.mode === 'ai' ? 'You vs ' + G.opponent.name :
      G.mode === '2p' ? 'Blue vs Red' :
      G.mode === 'puzzle' ? G.puzzle.name :
      G.lesson.name;
    $('#lesson-tip').style.display = (G.lesson || G.puzzle) ? '' : 'none';
    $('#lesson-tip').textContent = G.lesson ? G.lesson.tip :
      G.puzzle ? (G.puzzle.depth === 2 ? 'Force checkmate in TWO moves — the enemy plays its best defence!'
        : 'White to move. Deliver checkmate in ONE move!') : '';
    $('#btn-undo').style.display = (G.mode === 'ai' || G.mode === '2p') ? '' : 'none';
    $('#btn-hint').style.display = (G.mode === 'ai' || G.mode === '2p') ? '' : 'none';
    $('#btn-restart').style.display = (G.mode === 'lesson' || G.mode === 'puzzle') ? '' : 'none';

    updateHud();
    renderMoveList();
    if (G.mode === 'ai' && G.playerColor === 'b') aiTurn();
  }

  function doPlayerMove(move) {
    animateMove(move).then(function () {
      G.moveCount++;
      afterPlayerMove(move);
    });
  }

  function afterPlayerMove(move) {
    if (G.mode === 'lesson' && G.lesson.kind === 'captureAll') {
      G.state.turn = 'w'; // enemies in drills stand still
      updateHud(move);
      if (Lessons.captureAllDone(G.state)) {
        var stars = Lessons.starsFor(G.lesson, G.moveCount);
        Lessons.setLessonStars(G.lesson.id, stars);
        lessonWin(stars);
      }
      return;
    }
    if (G.mode === 'puzzle' || (G.mode === 'lesson' && G.lesson.kind === 'mate1')) {
      updateHud(move);
      var pzDepth = G.puzzle ? (G.puzzle.depth || 1) : 1;
      var st0 = Engine.status(G.state);
      if (st0 === 'checkmate') {
        if (G.puzzle) Lessons.setPuzzleDone(G.puzzle.id);
        else Lessons.setLessonStars(G.lesson.id, 3);
        lessonWin(3);
      } else if (pzDepth === 2 && G.moveCount < 2 && (st0 === 'normal' || st0 === 'check')) {
        // the defender fights back with its best move
        G.busy = true;
        setTimeout(function () {
          var reply = AI.bestMove(G.state, 3);
          if (!reply) { G.busy = false; return; }
          animateMove(reply).then(function () { updateHud(reply); });
        }, 300);
      } else {
        setStatus(pzDepth === 2 ? 'The mate slipped away — the position resets!'
          : 'Not quite — that\'s not mate. Try again!');
        Sound.play('lose');
        setTimeout(function () {
          if (G.puzzle) startPuzzle(G.puzzle);
          else {
            G.state = G.history.pop();
            G.san.pop();
            renderMoveList();
            renderPieces();
            updateHud();
          }
        }, 1000);
      }
      return;
    }

    var st = Engine.status(G.state);
    updateHud(move);
    if (st === 'check') { flashCheck(); }
    if (endIfOver(st)) return;
    if (G.mode === 'ai') aiTurn();
  }

  function aiTurn() {
    if (G.over) return;
    G.busy = true;
    updateHud();
    var myG = G;
    Opponents.getMove(G.opponent, G.state, function (move) {
      if (G !== myG || G.over) return; // player left the game meanwhile
      if (!move) { G.busy = false; endIfOver(Engine.status(G.state)); return; }
      animateMove(move).then(function () {
        var st = Engine.status(G.state);
        updateHud(move);
        if (st === 'check') flashCheck();
        endIfOver(st);
      });
    });
  }

  function flashCheck() {
    Sound.play('check');
    var b = el('div', 'check-flash', $('#board-wrap'));
    b.textContent = 'CHECK!';
    setTimeout(function () { b.remove(); }, 1100);
  }

  function endIfOver(st) {
    if (st !== 'checkmate' && st !== 'stalemate' && st !== 'draw') return false;
    G.over = true;
    var result, title, sub;
    if (st === 'checkmate') {
      var winner = G.state.turn === 'w' ? 'b' : 'w';
      if (G.mode === '2p') {
        title = (winner === 'w' ? 'Blue' : 'Red') + ' wins!';
        sub = 'Checkmate!';
        result = 1;
      } else {
        var playerWon = winner === G.playerColor;
        title = playerWon ? 'Victory!' : 'Defeated!';
        sub = playerWon ? 'You checkmated ' + G.opponent.name + '!' :
          G.opponent.name + ' got you — rematch?';
        result = playerWon ? 1 : 0;
      }
    } else {
      title = 'Draw!';
      sub = st === 'stalemate' ? 'Stalemate — nobody wins.' : 'Neither army can win.';
      result = 0.5;
    }

    var newRating = null;
    if (G.mode === 'ai') {
      newRating = Opponents.recordResult(Opponents.effectiveRating(G.opponent), result);
      Lessons.addXP(result === 1 ? 120 : result === 0.5 ? 40 : 15);
    }
    if (G.mode === 'ai' && G.lessonBoss && result === 1) {
      Lessons.setLessonStars('boss', 3);
    }
    setTimeout(function () { endModal(title, sub, result, newRating); }, 700);
    return true;
  }

  function confetti(box, n) {
    var colors = ['#f6c445', '#3567c9', '#c03a3a', '#7ed36b', '#4fc3f7', '#e4526e'];
    for (var i = 0; i < n; i++) {
      var c = el('div', 'confetti', box);
      c.style.left = Math.random() * 100 + '%';
      c.style.background = colors[i % colors.length];
      c.style.setProperty('--d', (2.4 + Math.random() * 2.2) + 's');
      c.style.setProperty('--delay', (Math.random() * 1.4) + 's');
      c.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    }
  }

  function endModal(title, sub, result, newRating) {
    Sound.play(result === 1 ? 'win' : result === 0 ? 'lose' : 'check');
    var layer = $('#modal-layer');
    layer.innerHTML = '';
    var ov = el('div', 'modal-overlay show', layer);
    if (result === 1) confetti(ov, 60);
    var box = el('div', 'modal end-modal', ov);
    el('h2', null, box).textContent = title;
    el('p', null, box).textContent = sub;
    if (newRating != null) {
      var r = el('p', 'rating-line', box);
      r.innerHTML = 'Your rating: <b>' + newRating + '</b>';
    }
    if (result === 1 && G.mode !== '2p') {
      var champ = el('div', 'end-champ', box);
      champ.innerHTML = Characters.svg('k', G.playerColor, 'dance');
    }
    var row = el('div', 'modal-btns', box);
    if (G.mode === 'ai' || G.mode === '2p') {
      btn(row, 'Rematch', function () {
        layer.innerHTML = '';
        startGame({ mode: G.mode, opponent: G.opponent, playerColor: G.playerColor });
      });
    }
    if (G.mode === 'ai') {
      btn(row, 'Opponents', function () { layer.innerHTML = ''; show('screen-opponents'); });
    }
    if (G.san.length > 1) btn(row, 'Battle Report', openReview);
    btn(row, 'Menu', function () { layer.innerHTML = ''; show('screen-menu'); });
  }

  /* Post-battle review: static-eval swings flag blunders chess.com-style. */
  function openReview() {
    var states = G.history.concat([G.state]);
    var evals = states.map(AI.evaluate);
    var cells2 = [];
    var blunders = 0;
    for (var i = 0; i < G.san.length; i++) {
      var mover = states[i].turn;
      var swing = evals[i + 1] - evals[i];
      var against = mover === 'w' ? -swing : swing;
      var mark = against >= 250 ? '??' : against >= 120 ? '?!' : '';
      if (mark === '??') blunders++;
      cells2.push({ san: G.san[i], mark: mark });
    }
    var rows = '';
    for (var j = 0; j < cells2.length; j += 2) {
      var a = cells2[j], b = cells2[j + 1];
      rows += '<tr><td class="rv-num">' + (j / 2 + 1) + '.</td>' +
        '<td class="rv-mv' + (a.mark === '??' ? ' rv-bad' : '') + '">' + a.san + ' ' + a.mark + '</td>' +
        '<td class="rv-mv' + (b && b.mark === '??' ? ' rv-bad' : '') + '">' + (b ? b.san + ' ' + b.mark : '') + '</td></tr>';
    }
    var layer = $('#modal-layer');
    layer.innerHTML = '';
    var ov = el('div', 'modal-overlay show', layer);
    var box = el('div', 'modal review-modal', ov);
    el('h2', null, box).textContent = 'Battle Report';
    el('p', null, box).textContent = blunders
      ? blunders + ' blunder' + (blunders > 1 ? 's' : '') + ' marked ?? — those moves bled the most.'
      : 'No outright blunders. A disciplined slaughter.';
    var sc = el('div', 'review-scroll', box);
    sc.innerHTML = '<table class="review-table">' + rows + '</table>';
    var row = el('div', 'modal-btns', box);
    btn(row, 'Close', function () { layer.innerHTML = ''; show('screen-menu'); });
  }

  function lessonWin(stars) {
    G.over = true;
    var xp = G.puzzle ? (G.puzzle.depth === 2 ? 60 : 40) : stars * 25;
    Lessons.addXP(xp);
    Lessons.touchStreak();
    Sound.play('win');
    setTimeout(function () { Sound.play('star'); }, 350);
    var layer = $('#modal-layer');
    layer.innerHTML = '';
    var ov = el('div', 'modal-overlay show', layer);
    confetti(ov, 40);
    var box = el('div', 'modal end-modal', ov);
    el('h2', null, box).textContent = G.puzzle ? 'Puzzle solved!' : 'Lesson complete!';
    var starRow = el('div', 'star-row', box);
    for (var i = 1; i <= 3; i++) {
      var s = el('span', 'star' + (i <= stars ? ' lit' : ''), starRow);
      s.textContent = '★';
      s.style.animationDelay = (i * 0.18) + 's';
    }
    el('p', 'xp-line', box).textContent = '+' + xp + ' XP';
    var row = el('div', 'modal-btns', box);
    var next = nextItem();
    if (next) btn(row, 'Next ▸', function () { layer.innerHTML = ''; next(); });
    btn(row, G.puzzle ? 'Puzzles' : 'Academy', function () {
      layer.innerHTML = '';
      show(G.puzzle ? 'screen-puzzles' : 'screen-academy');
    });
  }

  function nextItem() {
    if (G.puzzle) {
      var idx = Lessons.PUZZLES.indexOf(G.puzzle);
      var nx = Lessons.PUZZLES[idx + 1];
      return nx ? function () { startPuzzle(nx); } : null;
    }
    var li = Lessons.LESSONS.indexOf(G.lesson);
    var nl = Lessons.LESSONS[li + 1];
    return nl ? function () { startLesson(nl); } : null;
  }

  function btn(parent, label, fn) {
    var b = el('button', 'btn', parent);
    b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }

  /* ---------- lesson / puzzle starters ---------- */

  function startLesson(lesson) {
    if (lesson.kind === 'boss') {
      startGame({ mode: 'ai', opponent: Opponents.byId(lesson.opponent), playerColor: 'w' });
      G.lessonBoss = true;
      $('#game-title').textContent = 'Boss Battle: ' + G.opponent.name;
      return;
    }
    startGame({ mode: 'lesson', lesson: lesson, fen: lesson.fen });
  }

  function startPuzzle(pz) {
    startGame({ mode: 'puzzle', puzzle: pz, fen: pz.fen });
  }

  /* ---------- screen renderers ---------- */

  function renderMenu() {
    $('#menu-rating').innerHTML = 'Rating: <b>' + Opponents.playerRating() + '</b> \u00b7 \u26a1 ' + Lessons.getXP() + ' XP \u00b7 \ud83d\udd25 ' + Lessons.getStreak();
    var heroes = $('#menu-heroes');
    if (!heroes.dataset.built) {
      heroes.dataset.built = '1';
      ['n', 'k', 'q'].forEach(function (t, i) {
        var h = el('div', 'hero', heroes);
        h.innerHTML = Characters.svg(t, i === 1 ? 'w' : (i ? 'b' : 'w'));
        h.querySelector('.body-root').style.animationDelay = (-i * 0.4) + 's';
      });
    }
    refreshToggles();
  }

  function renderOpponents() {
    var list = $('#opponent-list');
    list.innerHTML = '';
    Opponents.ROSTER.forEach(function (opp) {
      var card = el('div', 'opp-card', list);
      var av = el('div', 'opp-avatar', card);
      av.innerHTML = Characters.svg(opp.avatar[0], opp.avatar[1]);
      var info = el('div', 'opp-info', card);
      el('h3', null, info).textContent = opp.name;
      el('div', 'opp-title', info).textContent = opp.title +
        (opp.rating ? ' · ~' + opp.rating : ' · matches you');
      el('p', null, info).textContent = opp.desc;
      var play = el('button', 'btn btn-play', card);
      play.textContent = 'Fight!';
      play.addEventListener('click', function () {
        var colorSel = document.querySelector('input[name="pcolor"]:checked').value;
        var pc = colorSel === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : colorSel;
        startGame({ mode: 'ai', opponent: opp, playerColor: pc });
      });
    });
  }

  function renderAcademy() {
    $('#academy-stats').innerHTML =
      '<span class="chip">\u26a1 ' + Lessons.getXP() + ' XP</span>' +
      '<span class="chip">\ud83d\udd25 ' + Lessons.getStreak() + ' day streak</span>' +
      '<span class="chip">\ud83c\udfc6 ' + Opponents.playerRating() + '</span>';
    var path = $('#lesson-path');
    path.innerHTML = '';
    var flat = 0;
    Lessons.UNITS.forEach(function (unit) {
      var uh = el('div', 'unit-head', path);
      uh.innerHTML = '<b>' + unit.name + '</b><span>' + unit.desc + '</span>';
      unit.lessons.forEach(function (lesson, ui) {
        var i = flat++;
        var stars = Lessons.lessonStars(lesson.id);
        var open = Lessons.unlocked(i);
        var node = el('div', 'lesson-node' + (open ? '' : ' locked') + (ui % 2 ? ' alt' : ''), path);
        var bubble = el('button', 'lesson-bubble', node);
        bubble.innerHTML = open
          ? Characters.svg(lesson.icon, 'w')
          : '<span class="lock">\ud83d\udd12</span>';
        if (open) bubble.addEventListener('click', function () { startLesson(lesson); });
        var meta = el('div', 'lesson-meta', node);
        el('div', 'lesson-name', meta).textContent = lesson.name;
        var sr = el('div', 'lesson-stars', meta);
        for (var s = 1; s <= 3; s++) {
          el('span', 'star' + (s <= stars ? ' lit' : ''), sr).textContent = '\u2605';
        }
      });
    });
  }

  function renderPuzzles() {
    var grid = $('#puzzle-grid');
    grid.innerHTML = '';
    [['Mate in One', Lessons.PUZZLES], ['Mate in Two \u00b7 the enemy fights back', Lessons.PUZZLES2]]
      .forEach(function (pack) {
        var h = el('div', 'unit-head', grid);
        h.innerHTML = '<b>' + pack[0] + '</b>';
        var wrap = el('div', 'pz-grid', grid);
        pack[1].forEach(function (pz, i) {
          var card = el('button', 'puzzle-card' + (Lessons.puzzleDone(pz.id) ? ' done' : ''), wrap);
          el('div', 'pz-num', card).textContent = '#' + (i + 1);
          el('div', 'pz-name', card).textContent = pz.name;
          el('div', 'pz-check', card).textContent = Lessons.puzzleDone(pz.id) ? '\u2714 solved'
            : (pz.depth === 2 ? 'Mate in 2' : 'Mate in 1');
          card.addEventListener('click', function () { startPuzzle(pz); });
        });
      });
  }

  /* ---------- toggles & buttons ---------- */

  function refreshToggles() {
    $('#btn-sound').textContent = Sound.isOn() ? '🔊' : '🔇';
    $('#btn-gore').textContent = Battle.goreOn() ? '🩸' : '✨';
    $('#btn-gore').title = Battle.goreOn() ? 'Battle style: blood (click for family-friendly sparks)'
      : 'Battle style: sparks (click for blood)';
  }

  function wireUp() {
    document.querySelectorAll('[data-show]').forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.show); });
    });
    $('#btn-2p').addEventListener('click', function () { startGame({ mode: '2p' }); });
    $('#btn-sound').addEventListener('click', function () { Sound.toggle(); refreshToggles(); });
    $('#btn-gore').addEventListener('click', function () { Battle.toggleGore(); refreshToggles(); });

    $('#btn-undo').addEventListener('click', function () {
      if (!G || G.busy || !G.history.length) return;
      var steps = (G.mode === 'ai' && G.history.length >= 2) ? 2 : 1;
      while (steps-- && G.history.length) {
        var prev = G.history.pop();
        // rebuild captured trays from what disappeared
        ['w', 'b'].forEach(function (color) {
          var now = 0, was = 0, i;
          for (i = 0; i < 64; i++) {
            if (G.state.board[i] && G.state.board[i].color === color) now++;
            if (prev.board[i] && prev.board[i].color === color) was++;
          }
          if (was > now) G.captured[color].pop();
        });
        G.state = prev;
        G.san.pop();
      }
      G.over = false;
      renderPieces();
      renderMoveList();
      updateHud();
    });

    $('#btn-hint').addEventListener('click', function () {
      if (!G || G.busy || G.over) return;
      var m = AI.bestMove(G.state, 3);
      if (!m) return;
      clearMarks();
      cells[m.from].classList.add('hint');
      cells[m.to].classList.add('hint');
      Sound.play('select');
    });

    $('#btn-restart').addEventListener('click', function () {
      if (!G) return;
      if (G.lesson) startLesson(G.lesson);
      else if (G.puzzle) startPuzzle(G.puzzle);
    });

    $('#btn-quit').addEventListener('click', function () {
      show('screen-menu');
      G = null;
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    document.body.insertAdjacentHTML('afterbegin', Characters.defs());
    buildBoard();
    wireUp();
    show('screen-menu');
  }

  document.addEventListener('DOMContentLoaded', function () {
    // if HD sprites are present in assets/pieces/, use them everywhere
    var probe = new Image();
    probe.onload = function () { Characters.useSprites(true); boot(); };
    probe.onerror = function () { boot(); };
    probe.src = 'assets/pieces/w_p.png?t=' + Date.now();
  });
})();
