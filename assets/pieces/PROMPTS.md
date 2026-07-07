# HD piece art — drop-in guide

The game automatically switches to photorealistic piece art the moment
PNG files exist in this folder. No code changes needed: if `w_p.png`
loads, ALL pieces render from images; if any file is missing you'll see
the vector fallback for every piece, so add all 12 at once.

## File names (all 12 required)

| File | Piece |
|---|---|
| `w_p.png` / `b_p.png` | white / black pawn |
| `w_n.png` / `b_n.png` | knight |
| `w_b.png` / `b_b.png` | bishop |
| `w_r.png` / `b_r.png` | rook |
| `w_q.png` / `b_q.png` | queen |
| `w_k.png` / `b_k.png` | king |

## Image spec

- **Transparent background** (PNG with alpha) — this is essential
- Portrait orientation, roughly 5:7 (e.g. 750×1050 or 1024×1434)
- Full HUMAN figure — a warrior, not a chess-piece shape — feet at the
  bottom edge (they stand directly on the board tiles, no base/plinth)
- Figure facing slightly to the RIGHT (the game mirrors it when attacking left)
- Consistent camera angle and lighting across all 12

## Generation prompts

Use the same style block for every piece so the set looks unified.
Works in Midjourney, DALL-E/ChatGPT, Stable Diffusion, etc.

**Style block (append to every prompt):**

> full body photograph-style render of a real medieval warrior, a
> living person in realistic human proportions, photorealistic dark
> fantasy, grimdark, battle-worn tarnished armor with scratches, dirt
> and dried blood, dramatic rim lighting, slightly low camera angle,
> standing on the ground in an aggressive battle stance facing slightly
> right, head to toe visible, isolated on a transparent background,
> no pedestal, no base, NOT a chess piece, NOT a figurine or statue,
> no ground shadow, centered, 8k detail

If your generator supports negative prompts, add:
`chess piece, figurine, statue, toy, pedestal, base, plinth, cartoon`

**Per piece — WHITE army** (steel & deep blue cloth):

- Pawn: `a grizzled man-at-arms footman in chainmail and a kettle helmet, deep blue tabard, kite shield and war spear, +style block`
- Knight: `a hulking knight in full blackened-steel plate armor with horned greathelm and spiked pauldrons, deep blue surcoat, flanged mace, +style block`
- Bishop: `a sinister war-priest in dark hooded vestments with a tall angular mitre, deep blue and gold trim, ornate crozier staff, face hidden in shadow, +style block`
- Rook: `a colossal armored executioner, riveted iron plates, tower-shaped greathelm with crenellations, massive two-handed warhammer, deep blue banner cloth, +style block`
- Queen: `a menacing warrior queen in a dark armored gown with tall golden crown and long veil, jeweled scepter, deep blue and gold, +style block`
- King: `a grim warlord king with a long grey beard, heavy gold crown, fur-lined mantle over deep blue robes, resting hands on a greatsword, +style block`

**Per piece — BLACK army:** same six prompts, but replace
`deep blue` with `blood red`, and add `darker armor, ember glow`.

## Getting the files into the game

Easiest: on GitHub, open `assets/pieces/` in this repo → **Add file →
Upload files** → drag the 12 PNGs in → Commit to `main`. The site
redeploys automatically within a minute or two and the game switches to
your art everywhere: board, menu, academy, everything.

Tip: most generators produce backgrounds even when asked not to — use
any free "remove background" tool on the results before uploading.

## Optional: action frames (real animation)

The 12 base images animate puppet-style (lunge, recoil, knockback,
blood). For true frame animation, add these OPTIONAL extra images —
the game detects and uses whichever exist, per piece:

- `{color}_{piece}_atk.png` — same character **mid-swing**, weapon
  raised/striking. Shown for a split second on every hit.
  Prompt: take the base prompt and add
  `mid-attack, weapon raised overhead mid-swing, aggressive lunge`.
- `{color}_{piece}_dead.png` — same character **lying dead on the
  ground** (horizontal composition, still transparent background).
  Replaces the topple animation with a real corpse.
  Prompt: base prompt + `lying dead on the ground, fallen, top-down
  slight angle, weapon dropped beside the body`.

Example: `w_n_atk.png`, `w_n_dead.png` for the white knight.
Add them for any subset of pieces — missing frames fall back cleanly.
