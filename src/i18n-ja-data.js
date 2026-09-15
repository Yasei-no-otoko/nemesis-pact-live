/* NEMESIS PACT — authored Japanese presentation dictionary. */
(function (root, factory) {
  const data = factory();
  if (typeof module === 'object' && module.exports) module.exports = data;
  else root.PactJapaneseData = data;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Keys are authored English display strings. Canonical ids, schemas and
  // protocol/error strings intentionally remain outside this presentation map.
  return Object.freeze({
    // Classic contracts
    'Slow Violence': '緩慢な暴力', 'SLOW VIOLENCE': '緩慢な暴力', 'BULLET CONTROL': '弾丸制御',
    '“Slow your bullets. Send as many as you like.”': '「弾丸を遅くしろ。好きなだけ撃て。」',
    'Enemy bullet speed −30%': '敵弾の速度 −30%', 'About 40% more enemy bullets': '敵弾が約40%増加',
    'Read the gaps, not the density.': '密度ではなく、隙間を読め。', 'Bullet speed −30%': '弾速 −30%',
    'Return to Sender': '送り返し', 'RETURN TO SENDER': '送り返し', 'REFLECTION': '反射',
    '“Your own bullets will end you.”': '「己の弾が、お前を終わらせる。」', 'Reflected damage ×2.2': '反射ダメージ ×2.2',
    'Normal shot damage −25%': '通常弾のダメージ −25%', 'Press E or right-click to return fire.': 'Eキーまたは右クリックで撃ち返せ。',
    'Glass Covenant': '硝子の契約', 'GLASS COVENANT': '硝子の契約', 'HIGH RISK': '高リスク',
    '“Drop your armor. I will drop mine.”': '「装甲を捨てろ。私も捨てよう。」', 'All enemy hull −30%': '全敵の耐久力 −30%',
    'You take double damage': '受けるダメージが2倍', 'End it quickly. Trust your evasive skills.': '素早く終わらせろ。回避の腕を信じろ。',
    'Ceasefire': '停戦', 'CEASEFIRE': '停戦', 'TIME CONTROL': '時間制御',
    '“Every five seconds, silence the world.”': '「5秒ごとに、世界を沈黙させる。」', 'Bullets stop for 1.3s every 5s': '5秒ごとに1.3秒、弾丸が停止',
    'You cannot fire during the pause': '停止中は射撃できない', 'You can still move, parry and dash.': '移動・パリィ・ダッシュは可能。', '1.3s pause every 5s': '5秒ごとに1.3秒停止',
    'No Witnesses': '目撃者なし', 'NO WITNESSES': '目撃者なし', 'BOSS DUEL': 'ボス決闘',
    '“No reinforcements. Just you and me.”': '「増援はない。お前と私だけだ。」', 'Bosses summon no reinforcements': 'ボスが増援を召喚しない',
    'Boss attack rate +25%': 'ボスの攻撃頻度 +25%', 'One opponent. Your undivided attention.': '敵は一体。全神経を向けろ。', 'No reinforcements': '増援なし',
    'Sacred Ground': '聖域', 'SACRED GROUND': '聖域', 'SAFE ZONE': '安全地帯',
    '“Leave the circle at the center untouched.”': '「中央の円には触れるな。」', 'Center circle erases enemy bullets': '中央の円が敵弾を消去',
    'Normal shot damage −22%': '通常弾のダメージ −22%', 'Lasers and enemy bodies can still hit you.': 'レーザーと敵の体には当たる。', 'Center erases bullets': '中央が弾丸を消去',
    'Fast & Fearless': '速く、恐れず', 'FAST & FEARLESS': '速く、恐れず', 'MOBILITY': '機動性',
    '“Shoot faster. I will move faster still.”': '「もっと速く撃て。私はさらに速く動く。」', 'Dash cooldown −45%': 'ダッシュの再使用待機 −45%',
    'Enemy bullet speed +30%': '敵弾の速度 +30%', 'Dash through bullets and lasers unharmed.': '弾丸とレーザーを無傷でダッシュ通過。',
    // Upgrades
    'Trident': 'トライデント', 'TRIDENT': 'トライデント', 'SPREAD': '拡散', 'Add 2 projectiles per shot. Damage per projectile −18%.': '1発につき弾を2発追加。弾1発あたりのダメージ −18%。', 'Spread build': '拡散ビルド',
    'Overclock': 'オーバークロック', 'OVERCLOCK': 'オーバークロック', 'FIREPOWER': '火力', 'Time between shots −18%.': '射撃間隔 −18%。', 'Firepower': '火力',
    'Phase Rail': 'フェーズレール', 'PHASE RAIL': 'フェーズレール', 'PIERCING': '貫通', 'Shots pierce 2 more enemies. Shot damage +20%.': '弾がさらに2体の敵を貫通。弾のダメージ +20%。', 'Piercing build': '貫通ビルド',
    'Echo Wing': 'エコーウィング', 'ECHO WING': 'エコーウィング', 'AFTERIMAGE': '残像', 'An armed echo follows your past flight path.': '武装した残像が過去の飛行経路を追う。', 'Echo build': 'エコービルド',
    'Mirror Engine': 'ミラーエンジン', 'MIRROR ENGINE': 'ミラーエンジン', 'Parry window +0.08s. Parry cooldown −22%.': 'パリィ受付時間 +0.08秒。パリィの再使用待機 −22%。', 'Reflection build': '反射ビルド',
    'Razor Drive': 'レイザードライブ', 'RAZOR DRIVE': 'レイザードライブ', 'DASH ATTACK': 'ダッシュ攻撃', 'Dashing into an enemy deals 90 damage.': '敵へダッシュすると90ダメージ。', 'Dash build': 'ダッシュビルド',
    'Orbital': 'オービタル', 'ORBITAL': 'オービタル', 'SUPPORT': '支援', 'A satellite circles your ship and fires at enemies.': '衛星が機体を周回し、敵を撃つ。', 'Satellite build': '衛星ビルド',
    'Danger Magnet': 'デンジャーマグネット', 'DANGER MAGNET': 'デンジャーマグネット', 'ENERGY': 'エネルギー', 'Graze radius +14. Energy gain +35%.': 'かすり判定半径 +14。エネルギー獲得量 +35%。', 'Nova build': 'ノヴァビルド',
    'Second Heart': 'セカンドハート', 'SECOND HEART': 'セカンドハート', 'SURVIVAL': '生存', 'Maximum hull +2. Restore 3 hull.': '最大耐久力 +2。耐久力を3回復。', 'Survival': '生存',
    'Regenerator': 'リジェネレーター', 'REGENERATOR': 'リジェネレーター', 'Restore 1 hull for every 12 enemies destroyed.': '敵を12体倒すごとに耐久力を1回復。',
    'Field Repair': 'フィールド修理', 'FIELD REPAIR': 'フィールド修理', 'RECOVERY': '回復', 'Fully restore your hull instead of taking an upgrade.': '強化を取らず、耐久力を全回復。', 'Recovery': '回復',
    'Seeker': 'シーカー', 'SEEKER': 'シーカー', 'HOMING': '追尾', 'Shots gently home in on enemies. Shot damage +10%.': '弾が敵を穏やかに追尾。弾のダメージ +10%。', 'Homing build': '追尾ビルド',
    'Supernova': 'スーパーノヴァ', 'SUPERNOVA': 'スーパーノヴァ', 'ENERGY BURST': 'エネルギー爆発', 'Nova damage +70%. Energy cost −20.': 'ノヴァのダメージ +70%。エネルギー消費 −20。',
    // Bosses and sectors
    'THE NOTARY': '公証人', 'Enforcer of the Pact': '契約の執行者', '“Every promise has a price.”': '「すべての約束には代償がある。」',
    'THE CHOIR': '聖歌隊', 'The Silent Choir': '沈黙の聖歌隊', '“In the silence, I will hear your heartbeat.”': '「静寂の中で、お前の鼓動を聞こう。」',
    'THE SOVEREIGN': '君主', 'The Last King': '最後の王', '“The world is a pact. What will you keep?”': '「世界は契約だ。何を守る？」',
    'Faded Signatures': '色あせた署名', 'Silent Cathedral': '静寂の大聖堂', 'Kingless Dawn': '王なき夜明け',
    'VERDIGRIS BASTION': '緑青の砦', 'Where every promise becomes a weapon.': 'すべての約束が武器となる場所。', 'Verdigris / pale alloy / radial ramparts': '緑青／淡い合金／放射状の城壁',
    'VIOLET FOUNDRY': '紫の鋳造所', 'A machine that learned to sing.': '歌うことを学んだ機械。', 'Amethyst / black chrome / ribbed gantries': '紫水晶／黒クローム／リブ状のガントリー',
    'CROWN OF ASH': '灰の王冠', 'Even a king can be a prisoner.': '王でさえ囚人になりうる。', 'Amber / obsidian / monumental terraces': '琥珀／黒曜石／巨大な段丘',
    'TIDAL ARCHIVE': '潮汐アーカイブ', 'The sea keeps what the sky forgets.': '海は空が忘れたものを保つ。', 'Glacier blue / pearl / submerged vaults': '氷河青／真珠／水没した保管庫',
    'PRISM ORCHARD': 'プリズム果樹園', 'Light grows where the world was broken.': '世界が壊れた場所で光が育つ。', 'Rose quartz / ivory / split crystalline arcs': 'ローズクォーツ／象牙／分岐する結晶弧',
    'THE UNWRITTEN SKY': '未記の空', 'The final signature is yours.': '最後の署名は、あなたのものだ。', 'Solar white / indigo / orbital cathedrals': '太陽白／藍／軌道上の大聖堂',
    'The Notary remembers every shot. It offers you terms because the first pilot who refuses them becomes a warning.': '公証人はすべての射撃を記憶する。条件を示すのは、最初に拒んだパイロットが警告となったからだ。',
    'The Choir was built to agree. Now its voices disagree only on how you should fall.': '聖歌隊は同意するために造られた。今や声が食い違うのは、あなたの倒れ方だけだ。',
    'The Sovereign guards a crown no one wears. Beyond its throne, three forbidden constellations wait.': '君主は誰も戴かない王冠を守る。その玉座の彼方で、禁じられた三つの星座が待つ。',
    'A leviathan carries the archive on its back. The oldest record is a pilot who returned every bullet.': 'リヴァイアサンが背にアーカイブを載せている。最古の記録は、すべての弾を返したパイロットだ。',
    'The Weaver cultivates futures in glass. Every reflected shot is a future it did not predict.': '織り手は硝子の中で未来を育てる。反射された弾はすべて、予測できなかった未来だ。',
    'The final guardian has no name. It exists only to ask whether a promise matters when nobody can enforce it.': '最後の守護者に名はない。誰も強制できない約束に意味があるか、それだけを問う。',
    'THE LEVIATHAN': 'リヴァイアサン', 'Keeper of the Flood': '氾濫の番人', '“All debts return with the tide.”': '「すべての負債は潮とともに還る。」',
    'THE WEAVER': '織り手', 'Gardener of Futures': '未来の庭師', '“You may choose your path. Not its ending.”': '「道は選べる。結末は選べない。」',
    'THE UNWRITTEN': '未記', 'The Last Clause': '最後の条項', '“Write the law that ends me.”': '「私を終わらせる法を書け。」',
    // Expansion choices
    'VANGUARD': 'ヴァンガード', 'Precision / balanced': '精密／バランス', 'Standard hull. Begin with Phase Rail: +20% shot damage and piercing.': '標準耐久。フェーズレールで開始：弾のダメージと貫通 +20%。',
    'WRAITH': 'レイス', 'Counterplay / mobility': '対策／機動性', '2 less maximum hull. Dash recovers 25% faster. Begin with Mirror Engine.': '最大耐久力 −2。ダッシュの回復が25%高速。ミラーエンジンで開始。',
    'BASTION': 'バスティオン', 'Escort / survivability': '護衛／生存性', '2 more maximum hull. Dash recovers 20% slower. Begin with one Orbital.': '最大耐久力 +2。ダッシュの回復が20%低速。オービタル1個で開始。',
    'Thread of Tomorrow': '明日の糸', 'Every friendly projectile gains one extra pierce.': '味方の弾丸が追加で1体貫通。', 'Storm Capacitor': '嵐のコンデンサー', 'Energy gain +20%. Receive 20 energy now.': 'エネルギー獲得量 +20%。今すぐエネルギーを20獲得。',
    'Unbroken Heart': '不屈の心', 'Once this run, a lethal hit restores 3 hull instead.': 'このランで1度だけ、致命傷を受けると耐久力3で復帰。', 'Judgment Drive': '審判ドライブ', 'Gain a Razor Drive stack: dash through enemies to deal damage.': 'レイザードライブを1スタック獲得：敵をダッシュで貫きダメージ。',
    'The Other You': 'もう一人のあなた', 'Gain an Echo Wing stack. A delayed wingman repeats your shots.': 'エコーウィングを1スタック獲得。遅れて僚機が射撃を繰り返す。', 'Mercy Lens': '慈悲のレンズ', 'Enemy projectile speed -8%, including boss volleys.': '敵弾の速度 −8%。ボスの斉射も含む。',
    'Borrowed Sunrise': '借り物の夜明け', 'Nova costs 15 less energy, down to a minimum of 35.': 'ノヴァの消費エネルギー −15、最小35。', 'Little Witness': '小さな証人', 'Gain an Orbital stack. It auto-targets nearby enemies.': 'オービタルを1スタック獲得。近くの敵を自動照準。',
    'THE QUIET WAY': '静かな道', 'RECOVER': '回復', 'Restore 2 hull. Fewer enemies, lower salvage. No new hazards.': '耐久力を2回復。敵とサルベージが少ない。新たな危険なし。', 'Safer passage / fewer credits': '安全な通路／少ないクレジット',
    'THE FORGOTTEN WAY': '忘れられた道', 'SALVAGE': 'サルベージ', 'Enter a debris corridor. 30 credits now; collect drifting salvage.': '残骸回廊へ入る。今すぐ30クレジット、漂うサルベージを回収。', 'Standard threat / bonus salvage': '標準の脅威／追加サルベージ',
    'THE BROKEN WAY': '壊れた道', 'ELITE': 'エリート', 'More enemies. Elite units have 40% more hull. +60 credits at the boss.': '敵が増加。エリート機は耐久力 +40%。ボス撃破時に +60クレジット。', 'High threat / greater reward': '高い脅威／大きな報酬',
    'Measured pressure': '計測された圧力', 'Mixed formations, standard arrival windows.': '混成編成、標準の到着間隔。', 'Pursuit lane': '追跡レーン', 'More mobile enemies. Arrivals remain capped.': '機動性の高い敵が増加。到着数の上限は維持。', 'Crossfire lattice': '十字砲火の格子', 'More turrets and prisms. Extra spacing between arrivals.': '砲塔とプリズムが増加。到着間隔が拡大。',
    // Hangar, loadout, choice and route screen authored copy
    '6 SECTORS / 18 ENCOUNTERS': '6セクター / 18遭遇', 'EXPEDITION': '遠征', 'Branching passages, salvage and relics. The complete new campaign.': '分岐する航路、サルベージ、遺物。完全新作キャンペーン。',
    '6 BOSSES / NO WARM-UP': '6ボス / ウォームアップなし', 'BOSS GAUNTLET': 'ボス・ガントレット', 'A boss-only run. Start with additional firepower and full Nova energy.': 'ボスのみの出撃。追加火力と満タンのノヴァエネルギーで開始。',
    '3 SECTORS / ORIGINAL RULES': '3セクター / オリジナルルール', 'CLASSIC PACT': 'クラシック契約', 'The original compact campaign. No airframe bonuses, routes or relics.': '元祖コンパクトキャンペーン。機体ボーナス、航路、遺物なし。',
    'Six sectors. Six bosses. One life. Defeat a boss to restore 2 hull. Fall, and start again.': '6セクター。6体のボス。命はひとつ。ボスを倒すと耐久力が2回復する。倒れたら、最初からやり直す。',
    '“Every promise has a price.” Choose the terms your enemy must accept.': '「すべての約束には代償がある。」敵に受け入れさせる条件を選べ。',
    '＋ Enemy bullet speed −30%': '＋ 敵弾の速度 −30%', '＋ Reflected damage ×2.2': '＋ 反射ダメージ ×2.2', '＋ All enemy hull −30%': '＋ 全敵の耐久力 −30%',
    'I agree to send my text, seed, sector and play counters to this site and OpenAI for a pact proposal. Microphone audio goes to GPT-Live-1 only after Start voice. AI voice is generated. Sign, Back, revoking consent or a timeout stops it.': '契約提案のため、テキスト、シード、セクター、プレイ集計値をこのサイトとOpenAIへ送信することに同意します。マイク音声は「音声を開始」の後にのみGPT-Live-1へ送られます。AI音声が生成されます。署名、戻る、同意の撤回、またはタイムアウトで停止します。',
    'Slow your bullets. Send as many as you like.': '弾丸を遅くしろ。好きなだけ撃て。', 'Your own bullets will end you.': '己の弾が、お前を終わらせる。', 'Drop your armor. I will drop mine.': '装甲を捨てろ。私も捨てよう。',
    'Negotiate this sector’s offered pacts by voice or text. Review the fixed benefit and price, then Sign.': 'このセクターで提示された契約を音声またはテキストで交渉します。固定された利益と代償を確認してから署名してください。',
    'Make this run yours.': 'この出撃を自分のものに。', 'Purchase a relic or repair the hull, then return to your next choice.': '遺物を購入するか機体を修理して、次の選択へ戻ります。', 'No uncollected relics in this sector.': 'このセクターに未回収の遺物はありません。', 'Back to selection': '選択へ戻る',
    // Result headings are inserted with innerHTML and therefore arrive as
    // separate text nodes around the authored <br> elements.
    'A promise.': '約束。', 'A new dawn.': '新しい夜明け。', 'No chains.': '鎖はない。', 'No masters.': '主もいない。',
    'Scarred.': '傷ついても。', 'Still flying.': '飛び続ける。', 'One more run.': 'もう一度。', 'One step further.': 'あと一歩。',
    'Your word.': 'あなたの言葉。', 'Your victory.': 'あなたの勝利。', 'The pact broke.': '契約は破られた。', 'You did not.': 'あなたは屈しなかった。', 'A new pact.': '新しい契約。', 'Another chance.': 'もう一度の機会。',
    // Desktop and touch choice descriptions combine each authored quote with
    // a fixed hint; retain the exact composed strings for text-node lookup.
    '“Every promise has a price.” Choose the terms your enemy must accept.': '「すべての約束には代償がある。」敵に受け入れさせる条件を選べ。',
    '“Every promise has a price.” Weigh the benefit against the price.': '「すべての約束には代償がある。」利益と代償を秤にかけろ。',
    '“In the silence, I will hear your heartbeat.” Choose the terms your enemy must accept.': '「静寂の中で、お前の鼓動を聞こう。」敵に受け入れさせる条件を選べ。',
    '“In the silence, I will hear your heartbeat.” Weigh the benefit against the price.': '「静寂の中で、お前の鼓動を聞こう。」利益と代償を秤にかけろ。',
    '“The world is a pact. What will you keep?” Choose the terms your enemy must accept.': '「世界は契約だ。何を守る？」敵に受け入れさせる条件を選べ。',
    '“The world is a pact. What will you keep?” Weigh the benefit against the price.': '「世界は契約だ。何を守る？」利益と代償を秤にかけろ。',
    // Living Covenant and adaptive authored text
    'Every promise needs a price.': 'すべての約束には代償がある。', 'I remember a broken signature.': '破られた署名を覚えている。', 'I counted ${Math.round(r.telemetry.parries)} reflected shots.': '反射した弾を${Math.round(r.telemetry.parries)}発、数えた。', ' Read the binding clauses below. Sign only what you intend to keep.': ' 以下の拘束条項を読め。守るつもりのものだけに署名しろ。',
    'Dash through magenta lasers.': 'マゼンタのレーザーをダッシュで通過。', 'Enemy bullet speed −28%': '敵弾の速度 −28%', 'Reflected damage ×1.8': '反射ダメージ ×1.8', 'Your gun damage −35%': '自機の射撃ダメージ −35%', 'Two additional turrets every 9 seconds (maximum 4 adds)': '9秒ごとに砲塔を2基追加（追加は最大4基）', 'Incoming damage ×2': '受けるダメージ ×2', 'Boss attack countdowns run 25% faster': 'ボスの攻撃カウントダウンが25%高速', 'Sanctuary stops bullets, not lasers or enemy bodies.': '聖域は弾丸を止めるが、レーザーと敵の体は止めない。',
    'The encounter stays at its current pace.': '遭遇は現在のペースを維持する。', 'LOCAL RULES hold because adaptive analysis is unavailable; authored difficulty remains unchanged.': '適応分析が利用できないため、ローカルルールで維持。定義済み難易度は変更しない。',
    // Music titles and locations
    'Before the First Signature': '最初の署名前', 'Ready the Wings': '翼を整える', 'Terms in the Quiet': '静寂の条件', 'Foundry Pulse': '鋳造所の鼓動', 'Crown of Dawn': '夜明けの王冠', 'Tidal Memory': '潮汐の記憶', 'Roseglass Run': 'ローズグラス・ラン', 'Unwritten Horizon': '未記の水平線', 'Final Clause': '最後の条項', 'Dissonant Engine': '不協和のエンジン', 'Crownfall': '王冠墜落', 'Undertow': '引き潮', 'Threadbreaker': '糸を断つ者', 'The Last Signature': '最後の署名', 'A Sky Unbound': '解き放たれた空', 'Ink in the Rain': '雨中のインク', 'Main menu': 'メインメニュー', 'Hangar / loadout': '格納庫／ロードアウト', 'Pacts / route / intelligence': '契約／ルート／情報', 'Victory': '勝利', 'Run lost': 'ラン失敗'
  });
});
