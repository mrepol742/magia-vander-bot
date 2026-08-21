export const FAQ_KNOWLEDGE = `
=== FAQ (community-sourced, Tagalog/Taglish) ===

Q1. Paano mag-awaken?
A: Pumunta sa dulo ng World 7. May makikitang suggestion sa baba na
"Mga dapat gawin bago mag-awaken." I-pindot/i-click ang suggestion na iyon
para lumabas ang buong checklist:
  1. Kailangang Max Level 1000+.
  2. Ilagay ang mga sumusunod sa Trading Booth at sa World 2 Tundra Bank:
     Trading Booth:
       - Pinakamalakas na World 1-3 newbie items
       - XP and Gold Potions
       - Skill Scrolls
       (Note: Gawing 1 Billion ang price para walang aksidenteng bumili.)
     World 2 Tundra Bank:
       - World 6-7 weapons at armors
       - Iba pang items na hindi masyadong kailangan pa (enchant items,
         forgeshard, atbp.)

Q2. Paano ka makakakuha ng pets?
A: Sa Tower at Dungeon shop.

Q3. Anong magagandang skills sa ngayon?
A: 1) Umbral Sundering, 2) Blackhole, 3) Radiant Judgement.

Q4. Anong floor ng Tower ang laging pinagkukunan ng pet?
A: Depende sa luck, pero ayon sa maraming players, mas madalas ito sa
floor 25 o floor 28.

Q5. Paano mag-reroll ng race?
A: Sa dulo pa rin ng World 7. Kung nag-awaken ka na ng 3 beses, sa 4th
awaken pataas, 80M shards + 200M gold coins na lang bawat reroll —
ibig sabihin, unli reroll of race basta may 80M shards at 200M gold
coins ka.

Q6. Anong magandang hatian ng stats?
A: Karaniwang build para hindi agad mamatay sa Worlds/Dungeon/Infinity
Tower: HP 600, DEF 2000+, ATK 1000+.

Q7. Anong magandang rune?
A: Equilibrium o Bloodstone. Kung Angel race ka, mas bagay ang Celestial
Rune.

Q8. Paano tumaas ang clan score contribution?
A: Bawat World ay may NPC na dapat kausapin per area. Tuwing macoclomplete
mo ang quest ng NPC, may clan score itong ibinibigay. May clan score rin
sa 3-World Mode ng Dungeon.

Q9. Anong magandang weapon/armor set sa ngayon?
A: Ang Radiant Set, galing sa Dungeon.

Q10. Bakit hindi ako makabili/makaroll/makaspin sa Dungeon Shop kahit
maraming Soul Shards?
A: Kailangan mo munang matapos ng 5-6x ang 3-World Mode ng Dungeon,
kahit Easy Mode lang, para mabilis itong mabuksan/ma-unlock.
`.trim();

export const STATS_KNOWLEDGE = `
=== Reference sheet: Infinity Tower Drops / P2W Pets / Battle Pass Pet ===
(Values are base pet damage/stat at Level 1 vs Level 100.)

Infinity Tower Drops:
  Wolf      -> Lv1: 315   | Lv100: 9,904
  Snake     -> Lv1: 349   | Lv100: 10,966
  Phoenix   -> Lv1: 394   | Lv100: 12,380
  Dragon    -> Lv1: 450   | Lv100: 14,149
  Cerberus  -> Lv1: 518   | Lv100: 16,271

P2W Pets (with drop rate %):
  Royal Griffin   -> Drop Rate: 74%   | Lv1: 300 | Lv100: 9,433
  Kitsune         -> Drop Rate: 24.9% | Lv1: 400 | Lv100: 12,577
  Kraken          -> Drop Rate: 1%    | Lv1: 600 | Lv100: 18,866
  Wendigo         -> Drop Rate: 0.1%  | Lv1: 900 | Lv100: 28,298
  ---
  Venom Hound     -> Drop Rate: 74%   | Lv1: 300 | Lv100: 9,433
  Abyss Prowler   -> Drop Rate: 24.9% | Lv1: 400 | Lv100: 12,577
  Frostpawn Stag  -> Drop Rate: 1%    | Lv1: 600 | Lv100: 18,866
  Void Drake      -> Drop Rate: 0.1%  | Lv1: 900 | Lv100: 28,298

Battle Pass Pet:
  Pegasus -> Lv1: 750 | Lv100: 23,582

Note: Pets with the same drop-rate tier (e.g. Royal Griffin / Venom Hound
at 74%, or Kraken / Frostpawn Stag at 1%) deal the same amount of damage —
they're stat-equivalent, just different skins/rarities pulled from
different pools.
`.trim();

export const KNOWLEDGE_BASE = `${FAQ_KNOWLEDGE}\n\n${STATS_KNOWLEDGE}`;
