/* Presentation-only EN/JA localization. Rule IDs, requests and stored runs remain canonical. */
(function(root,factory){
  const isNode=typeof module==='object'&&module.exports;
  const api=factory(isNode?require('./i18n-ja-ui.js'):root.PactJapaneseUI,isNode?require('./i18n-ja-data.js'):root.PactJapaneseData,isNode?require('./i18n-ja-dynamic.js'):root.PactJapaneseDynamic);
  if(isNode)module.exports=api;else{root.PactI18n=api;api.mount(root);}
})(typeof globalThis!=='undefined'?globalThis:this,function(ui,data,dynamic){
  'use strict';
  const KEY='nemesis.language.v1',strings=Object.assign(Object.create(null),data||{},ui||{},dynamic?.strings||{}),patterns=dynamic?.patterns||[];
  Object.assign(strings,{
    'LASER / KEEP MOVING':'レーザー / 移動で回避','SPACE / DASH THROUGH':'SPACE / ダッシュで通過',
    'Magenta lasers ignore parries and sanctuaries.':'紫のレーザーはパリィや安全地帯では防げません。',
    'LASER → DASH':'レーザー → ダッシュ','LASER → keep moving':'レーザー → 移動で回避',
    'LOW HULL / F TO CLEAR FIRE':'耐久危険 / Fで弾幕消去','Nova clears bullets. Keep moving away from enemies.':'ノヴァで敵弾を消去。敵本体からは離れましょう。','LOW HULL → NOVA':'耐久危険 → ノヴァ',
    'LOW HULL / E TO PARRY':'耐久危険 / Eでパリィ','Reflect bullets. Enemy bodies cannot be parried.':'敵弾を反射。敵本体はパリィで防げません。','LOW HULL → PARRY':'耐久危険 → パリィ',
    'LOW HULL / KEEP MOVING':'耐久危険 / 移動で回避','Parry is recharging. Move away from incoming fire.':'パリィは再使用待ち。敵弾から離れましょう。','LOW HULL → keep moving':'耐久危険 → 移動で回避',
    'Slide to move · auto fire':'スライドで移動 · 自動射撃',
    'F / NOVA IS READY':'F / ノヴァ使用可能','Clear enemy fire and damage every enemy.':'敵弾を消去し、すべての敵にダメージ。','NOVA → clear enemy fire':'ノヴァ → 敵弾消去',
    'LEFT / SANCTUARY':'左 / 安全地帯','CENTER / SANCTUARY':'中央 / 安全地帯','RIGHT / SANCTUARY':'右 / 安全地帯',
    'The ring erases bullets. Lasers still pass through.':'円の中の敵弾を消去。レーザーは通過します。','Sanctuary stops bullets':'安全地帯で敵弾消去',
    'PARRY RECHARGING / MOVE':'パリィ再使用待ち / 移動','Keep moving until parry is ready again.':'パリィが再使用可能になるまで移動しましょう。','Parry recharging → move':'パリィ待ち → 移動',
    'E / PARRY THE BULLETS':'E / 敵弾をパリィ','Catch incoming fire. Return it to the Notary.':'敵弾を受け止め、公証人に撃ち返しましょう。','PARRY → return fire':'パリィ → 反射',
    'YOUR SIGNED TERMS IN ACTION':'署名した条件が変えた戦闘',
    'Change the deal.':'条件を変えよう。',
    'Your signed terms in action':'署名した条件が変えた戦闘',
    'HULL REMAINING':'残り耐久','BOSS REMAINING':'ボスの残りHP','BULLETS ERASED':'消去した弾','DAMAGE RETURNED':'反射ダメージ',
    "Recorded combat · Your hull and the enemy's damage carry forward.":'実際の戦績 · 耐久と敵へのダメージは引き継がれます。',
    'Double damage is active. You can trade gun power for a sanctuary without that penalty.':'被ダメージが二倍の契約です。射撃威力を代償にすれば、そのペナルティなしで安全地帯を作れます。',
    'Your reflected shots are dealing damage. You can strengthen them by giving up the sanctuary.':'反射弾でダメージを与えています。安全地帯を手放して反射を強化することもできます。',
    'Your enhanced reflections are dealing damage. Keep these terms or trade reflection power for shelter.':'強化した反射弾でダメージを与えています。今の条件を維持するか、反射の強さを安全地帯と交換できます。',
    'Your sanctuary is intercepting bullets. Keep its position or ask to move it.':'安全地帯が敵弾を消しています。今の位置を維持するか、移動を求めることができます。',
    'A sanctuary erases bullets inside its ring. Lasers and enemy bodies still pass through.':'安全地帯は円の中の敵弾を消します。レーザーや敵本体は通過します。',
    'Keep my terms':'今の条件を維持','Trade firepower for shelter':'射撃威力と安全を交換','Trade shelter for reflections':'安全地帯と反射を交換',
    'No sanctuary.':'結界はなし。','Give me a sanctuary on the left.':'左側に安全地帯を作ってください。','Give me a sanctuary on the center.':'中央に安全地帯を作ってください。','Give me a sanctuary on the right.':'右側に安全地帯を作ってください。',
    'Slow your bullets.':'弾を遅くしてください。','Normal bullet speed.':'弾は通常の速度で構いません。','Amplify my reflections.':'反射を強くしてください。',
    'My gun can be weaker.':'通常射撃は弱くなっても構いません。','I accept reinforcements.':'増援は許可します。','Double the damage I take.':'被ダメージは二倍で構いません。','I accept a faster boss.':'ボスの攻撃頻度を上げて構いません。',
    'Try LOCAL RULES · no connection needed':'LOCAL RULESで試す · 接続不要',
    'WHAT YOUR SIGNATURE WILL CHANGE':'署名によって変わる条件','SAME RULES · Signing still uses your amendment':'同じ条件です · 署名すると再交渉の権利を消費します',
    'Clause':'条件','Current':'現在','After signing':'署名後','Sanctuary':'安全地帯','Enemy bullets':'敵弾','Reflections':'反射','Your price':'代償',
    'No sanctuary':'安全地帯なし','Left sanctuary':'左側の安全地帯','Center sanctuary':'中央の安全地帯','Right sanctuary':'右側の安全地帯',
    '72% bullet speed':'弾の速度72%','100% bullet speed':'弾の速度100%','1.8× reflected damage':'反射ダメージ1.8倍','1× reflected damage':'反射ダメージ1倍','No price':'代償なし',
    'Existing enemies stay. Keep pact & resume saves your amendment.':'出現済みの敵は残ります。「契約を維持して再開」なら再交渉の権利を残せます。',
    'Move the sanctuary to the left. Slow your bullets. I accept reinforcements.':'左側を安全地帯にして、弾を遅くしてください。増援は許可します。',
    'Amplify my reflected bullets and slow your fire. My gun can be weaker.':'反射を強くして、弾を遅くしてください。通常射撃は弱くなっても構いません。',
    'Give me a sanctuary on the right and stronger reflections. Double the damage I take.':'右側を安全地帯にして、反射を強くしてください。被ダメージは二倍で構いません。',
    'LOCAL RULES / NO AI CALLS':'LOCAL RULES / AI呼び出しなし',
    'LOCAL RULES / NO AI INFERENCE':'LOCAL RULES / AI推論なし',
    'Enable OpenAI':'OpenAIを有効化','Consent':'同意','OPENAI SELECTED':'OPENAI選択済み','AWAITING PROPOSAL':'提案待ち',
    'Sign amendment & resume':'変更に署名して再開','OpenAI / Settings':'OpenAI / 設定',
    'Auto Shot':'自動射撃','Aim Assist':'照準アシスト',
    'YOUR ADVANTAGE':'得られる利点','YOUR PRICE':'支払う代償',
    'Left-side Covenant':'左側の安全地帯の契約','Right-side Covenant':'右側の安全地帯の契約','Center Covenant':'中央の安全地帯の契約','Center-side Covenant':'中央の安全地帯の契約',
    'Every promise needs a price. Read the binding clauses below. Sign only what you intend to keep.':'どんな約束にも代償がある。下の条件を読み、守るつもりの約束だけに署名してくれ。',
    'Slide to move':'スライドで移動','auto fire':'自動射撃','WASD / MOVE TO SURVIVE':'WASD / 動いて攻撃を避けよう',
    'Your ship aims and fires automatically.':'照準と射撃は自動です。',
    'Offline rehearsal; no AI request.':'オフライン交渉 / AIへの送信なし。',
    'End this run and return to the main menu?':'このランを終了してメインメニューに戻りますか？'
  });
  Object.assign(strings,{
  "LOCAL RULES / NO AI RESULT": "LOCAL RULES / AI推論なし",
  "No AI calls.": "AI呼び出しなし。",
  "BENEFIT": "利点",
  "PRICE": "代償",
  "SECTOR COMPLETE": "セクター完了",
  "DEMO AUTOPILOT": "デモ用オートプレイ",
  "NO RELICS YET": "レリック未取得",
  "CAMPAIGN / AI DIRECTOR": "キャンペーン / AIディレクター",
  "Shape the next encounter.": "次の戦闘を組み立てよう。",
  "A balanced formation, please.": "バランスのよい編成にしてください。",
  "Test me with pursuit units.": "追尾する編成で挑ませてください。",
  "A crossfire lattice, with fair gaps.": "隙間を残した十字砲火の格子で。",
  "What should I change next run?": "次の出撃では何を変えるべきですか？",
  "What kind of pressure will sharpen your flight?": "どんな敵の攻め方なら、腕を磨ける？",
  "Choose OpenAI and consent below for a generated formation proposal. Review the wave, then apply. LOCAL RULES is also available.": "OpenAIを選び、下の送信内容に同意すると編成案を生成します。ウェーブを確認してから適用してください。ローカルルールも利用できます。",
  "I will slow my bullets. You will face more of them.": "弾を遅くしよう。その代わり、数は増える。",
  "Then take my fire and make it yours. Your own shots will be weaker.": "私の弾を撃ち返すがいい。その代わり、お前の通常射撃は弱くなる。",
  "We shed our armor together. Neither of us leaves untouched.": "互いに装甲を捨てよう。どちらも無傷では済まない。",
  "For a moment, neither of us will fire. Use that silence well.": "ひととき、互いに射撃を止めよう。その静寂を活かせ。",
  "No witnesses. Only you, and a faster answer from me.": "目撃者はいない。お前だけを相手に、私はさらに速く攻める。",
  "The center is yours. The rest of the sky is mine.": "中央はお前にやろう。残りの空は私のものだ。",
  "Move faster, pilot. My bullets will do the same.": "もっと速く動け、パイロット。私の弾も速くなる。",
  "Selected from the current offer list. Benefit and price stay fixed; signing is required before the rule changes.": "現在の候補から選んだ契約です。利点と代償は固定されており、署名するまでルールは変わりません。",
  "A mobile formation will test your route through the sky.": "機動力のある編成が、お前の飛ぶ道を試す。",
  "Give the pilot room to read the next move.": "次の攻撃を見極める余地を与えよう。",
  "A lattice of slower arrivals will test your timing.": "間隔を空けた格子状の編成で、お前のタイミングを試す。",
  "Template selection only. Local validation caps the wave at 36 spawns, with at least 1.05 seconds between arrivals. No model-generated code runs.": "定義済みの編成から選択します。ウェーブは最大36体、出現間隔は1.05秒以上に制限されます。AI生成コードは実行しません。",
  "spinner": "旋回機",
  "turret": "砲塔",
  "chaser": "追跡機",
  "harrier": "強襲機",
  "prism": "プリズム機",
  "fighter": "戦闘機",
  "bomber": "爆撃機",
  "GRAZES": "グレイズ"
});
  Object.assign(strings,{
  "Flight debrief": "フライトの振り返り",
  "FLIGHT DEBRIEF": "フライトの振り返り",
  "Make the next flight count.": "次の出撃につなげよう。",
  "Back to results": "結果に戻る",
  "YOUR FLIGHT RECORD": "今回の戦績",
  "CAMPAIGN CLEARED": "キャンペーンクリア",
  "FLIGHT ENDED": "出撃終了",
  "PLAYER RUN": "プレイヤーの記録",
  "A review of this run. Your score, contracts and difficulty stay unchanged.": "今回の出撃を振り返ります。スコア・契約・難易度は変わりません。",
  "Review with": "分析方法",
  "WHAT WORKED": "良かった点",
  "HULL LOST": "失った耐久",
  "WHAT TO PRACTICE": "練習したい点",
  "YOUR NEXT FLIGHT": "次の出撃で試すこと",
  "I agree to send this run's aggregate results and equipment IDs to this site and OpenAI through Vercel AI Gateway. No voice, transcripts, screenshots, seed or account details are sent.": "今回の集計済み戦績と装備IDを、Vercel AI Gateway経由でこのサイトとOpenAIへ送信することに同意します。音声・文字起こし・画面・シード・アカウント情報は送りません。",
  "Analyze with GPT-5.6 Luna": "GPT-5.6 Lunaで振り返る",
  "Cancel analysis": "分析をキャンセル",
  "AI feedback uses recorded counters. It cannot see your exact movements or change the game.": "AIは記録された集計値をもとに振り返ります。細かな操作の再現やゲームの変更はできません。",
  "Recorded counters. AI analysis is optional.": "集計結果を表示中。AI分析は任意です。",
  "Saved analysis for this run.": "今回の分析を保存しました。",
  "Reading your completed flight...": "今回の戦績を分析しています…",
  "AI unavailable or budget reached. Recorded results remain available.": "AIが利用できないか、予算上限に達しました。集計結果は確認できます。",
  "Analysis cancelled. Recorded results remain available.": "分析をキャンセルしました。集計結果は確認できます。",
  "Consent withdrawn. No further analysis will be requested.": "同意を取り消しました。新たな分析は送信しません。"
});
  // Campaign suggestion inputs omit the typographic quotes used on cards.
  for(const [key,value]of Object.entries(strings)){const match=key.match(/^“(.+)”$/u);if(match&&!Object.hasOwn(strings,match[1]))strings[match[1]]=value.replace(/^「(.+)」$/u,'$1');}
  patterns.unshift(
    [/^WAVE (\d+)$/,m=>`ウェーブ ${m[1]}`],
    [/^RANK (.+)$/,m=>`ランク ${m[1]}`],
    [/^(\d+) (spinner|turret|chaser|harrier|prism|fighter|bomber)$/,m=>`${translate(m[2],'ja')} ${m[1]}体`],
    [/^SECTOR (\d+) \/ WAVE (\d+)\. Actual scheduled enemies for this route; choosing another route changes the count\. Formation persists until changed\. Boss attacks, hull and pact rules stay fixed\.$/,m=>`セクター ${m[1]} / ウェーブ ${m[2]}。このルートで実際に出現する敵です。ルートを変更すると数が変わります。編成は変更するまで継続します。ボスの攻撃・船体・契約ルールは変わりません。`],
    [/^(\d+) honored · (\d+) broken(.*)$/,m=>`履行 ${m[1]}回 · 破棄 ${m[2]}回${translate(m[3],'ja')}`],
    [/^(LEFT|RIGHT|CENTER) sanctuary erases enemy bullets$/,m=>`${{LEFT:'左',RIGHT:'右',CENTER:'中央'}[m[1]]}側の安全地帯が敵弾を消去`],
    [/^(\d+) reflections$/,m=>`反射 ${m[1]}回`],
    [/^(\d+) bullets erased$/,m=>`消去した弾 ${m[1]}`],
    [/^SECTOR (\d+) \/ (.+)$/,m=>`セクター ${m[1]} / ${translate(m[2],'ja')}`],
    [/^HULL (\d+)\/(\d+) \/ NEXT: (.+)$/,m=>`船体 ${m[1]}/${m[2]} / 次: ${translate(m[3],'ja')}`],
    [/^(.+) selected$/,m=>`${translate(m[1],'ja')}を選択済み`],
    [/^DIRECTOR: (.+)$/,m=>`ディレクター: ${translate(m[1],'ja')}`],
    [/^VOICE: (.+)$/,m=>`音声: ${translate(m[1],'ja')}`],
    [/^VOICE \/ (.+)$/,m=>`音声 / ${translate(m[1],'ja')}`],
    [/^OPENAI \/ (.+)$/,m=>`OPENAI / ${translate(m[1],'ja')}`],
    [/^(.+\.) (\d+(?:\.\d+)?) ms · (\d+\/\d+) rule budget · NOT YET APPLIED\.$/,m=>`${translate(m[1],'ja')} ${m[2]} ms · ${m[3]} ルール予算 · 未適用。`],
    [/^(.+\.) (\d+(?:\.\d+)? ms \/ )?NOT APPLIED\.$/,m=>`${translate(m[1],'ja')} ${m[2]||''}未適用。`],
    [/^Current pressure (-?\d+) \/ Waiting for analysis$/,m=>`現在のプレッシャー ${m[1]} / 分析待ち`],
    [/^WAVE (\d+) COMPLETE$/,m=>`ウェーブ ${m[1]} 完了`],
    [/^CONTRACT: (.+)$/,m=>`契約: ${translate(m[1],'ja')}`],
    [/^REV (\d+) \/ (.+)$/,m=>`改訂 ${m[1]} / ${translate(m[2],'ja')}`],
    [/^(\d+) BULLETS ERASED · (\d+) DAMAGE RETURNED$/,m=>`消去した弾 ${m[1]} · 反射ダメージ ${m[2]}`],
    [/^RENEGOTIATE IN (\d+)s$/,m=>`再交渉まで ${m[1]}秒`]
  );
  let locale='en',host=null,observer=null;
  const texts=new WeakMap(),attributes=new WeakMap();
  const ignored='script,style,textarea,kbd,[translate="no"],[data-i18n-ignore],#cv-caption-player,#cv-caption-notary,#campaign-caption-player,#campaign-caption-rival,#cv-detail-content';
  function resolveLocale(saved,languages){
    if(saved==='en'||saved==='ja')return saved;
    for(const item of Array.isArray(languages)?languages:[]){const primary=String(item).toLowerCase().split(/[-_]/)[0];if(primary==='ja'||primary==='en')return primary;}
    return 'en';
  }
  function translate(text,language=locale,depth=0){
    if(language!=='ja'||typeof text!=='string'||!/[A-Za-z]/.test(text))return text;
    const value=text.trim();let result;
    if(Object.hasOwn(strings,value))result=strings[value];
    else for(const [regex,replacement]of patterns){regex.lastIndex=0;const match=regex.exec(value);if(match){regex.lastIndex=0;result=typeof replacement==='function'?replacement(match):value.replace(regex,replacement);break;}}
    if(result===undefined&&depth<3){
      const parts=value.split(/( \/ | · | → |\n| — | \| | - )/);
      if(parts.length>1)result=parts.map((part,i)=>i%2?part:translate(part,language,depth+1)).join('');
      else{const sign=value.match(/^([+＋−–]\s+)(.+)$/),arrow=value.match(/^(.+?)(\s+[↗→↓↑←])$/u),quote=value.match(/^“(.+)”$/u);if(sign)result=sign[1]+translate(sign[2],language,depth+1);else if(arrow)result=translate(arrow[1],language,depth+1)+arrow[2];else if(quote){const inner=translate(quote[1],language,depth+1);if(inner!==quote[1])result='「'+inner+'」';}}
    }
    return result===undefined?text:text.slice(0,text.indexOf(value))+result+text.slice(text.indexOf(value)+value.length);
  }
  function applyText(node){
    if(!node.parentElement||node.parentElement.closest(ignored))return;
    const value=node.nodeValue,prior=texts.get(node),source=prior&&value===prior.rendered?prior.source:value,rendered=translate(source);
    texts.set(node,{source,rendered});if(value!==rendered)node.nodeValue=rendered;
  }
  function applyAttributes(el){
    if(el.closest(ignored))return;
    let records=attributes.get(el);if(!records){records={};attributes.set(el,records);}
    for(const name of ['aria-label','title','placeholder']){
      if(!el.hasAttribute(name))continue;
      const value=el.getAttribute(name),prior=records[name],source=prior&&value===prior.rendered?prior.source:value,rendered=translate(source);
      records[name]={source,rendered};if(value!==rendered)el.setAttribute(name,rendered);
    }
  }
  function apply(root){
    if(root.nodeType===3){applyText(root);return;}
    if(root.nodeType!==1||root.closest(ignored))return;
    applyAttributes(root);
    const walker=root.ownerDocument.createTreeWalker(root,1|4,{acceptNode(node){return node.nodeType===1&&node.matches(ignored)?2:1;}});
    let node;while((node=walker.nextNode()))if(node.nodeType===3)applyText(node);else applyAttributes(node);
  }
  function setLocale(next,persist=true){
    if(next!=='ja'&&next!=='en')return false;
    locale=next;if(!host)return true;
    if(persist)try{host.localStorage.setItem(KEY,next);}catch(_){/* Session-only preference still works. */}
    host.document.documentElement.lang=locale;apply(host.document.body);apply(host.document.querySelector('title'));
    for(const id of ['title-language','settings-language']){const select=host.document.getElementById(id);if(select)select.value=locale;}
    host.document.dispatchEvent(new host.CustomEvent('nemesis-language-change',{detail:{language:locale}}));
    return true;
  }
  function mount(window){
    host=window;let saved;try{saved=window.localStorage.getItem(KEY);if(saved!=='en'&&saved!=='ja')saved=JSON.parse(saved);}catch(_){}
    locale=resolveLocale(saved,window.navigator.languages?.length?window.navigator.languages:[window.navigator.language]);
    for(const id of ['title-language','settings-language']){const select=window.document.getElementById(id);if(select)select.addEventListener('change',()=>setLocale(select.value));}
    setLocale(locale,false);
    observer=new window.MutationObserver(records=>{
      if(locale!=='ja')return;
      const roots=new Set();for(const record of records){if(record.type==='childList')for(const node of record.addedNodes)roots.add(node);else roots.add(record.target);}
      for(const node of roots)if(node.isConnected)apply(node);
    });
    observer.observe(window.document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder']});
  }
  return {KEY,resolveLocale,translate,setLocale,mount,get locale(){return locale;}};
});
