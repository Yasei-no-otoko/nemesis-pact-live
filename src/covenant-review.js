/* Recorded combat -> readable decisions. Authored guidance, never an AI response. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./covenant.js'));
  else root.PactCovenantReview=factory(root.PactCovenant);
})(typeof globalThis!=='undefined'?globalThis:this,function(V){'use strict';
  const number=n=>Number.isFinite(n)?Math.max(0,n):0;
  const zoneNames={none:'No sanctuary',left:'Left sanctuary',center:'Center sanctuary',right:'Right sanctuary'};
  function laserCue(player){
    const ready=player.dashCd<=0;
    return {kind:'laser',action:ready?'SPACE / DASH THROUGH':'LASER / KEEP MOVING',detail:'Magenta lasers ignore parries and sanctuaries.',touchHint:ready?'LASER → DASH':'LASER → keep moving',canvas:ready?'LASER / DASH THROUGH':'LASER / KEEP MOVING'};
  }
  // One priority order for keyboard and touch; never recommend a cooling ability.
  function combatCue(world){
    const p=world.p,boss=world.enemies.find(e=>e.type==='boss'&&e.hp>0);
    if(world.lasers.length||boss?.intent?.kind==='laser')return laserCue(p);
    const nova=p.energy>=world.novaCost(),critical=p.hp<=2;
    if(critical){
      if(nova)return {kind:'critical',action:'LOW HULL / F TO CLEAR FIRE',detail:'Nova clears bullets. Keep moving away from enemies.',touchHint:'LOW HULL → NOVA'};
      if(p.parryCd<=0)return {kind:'critical',action:'LOW HULL / E TO PARRY',detail:'Reflect bullets. Enemy bodies cannot be parried.',touchHint:'LOW HULL → PARRY'};
      return {kind:'critical',action:'LOW HULL / KEEP MOVING',detail:'Parry is recharging. Move away from incoming fire.',touchHint:'LOW HULL → keep moving'};
    }
    if(world.time<5)return {kind:'guide',action:'WASD / MOVE TO SURVIVE',detail:'Your ship aims and fires automatically.',touchHint:'Slide to move · auto fire'};
    if(nova)return {kind:'nova',action:'F / NOVA IS READY',detail:'Clear enemy fire and damage every enemy.',touchHint:'NOVA → clear enemy fire'};
    if(world.spec&&world.spec.zone!=='none'&&!world.broken&&world.time<12)return {kind:'guide',action:world.spec.zone.toUpperCase()+' / SANCTUARY',detail:'The ring erases bullets. Lasers still pass through.',touchHint:'Sanctuary stops bullets'};
    if(p.parryCd>0)return {kind:'guide',action:'PARRY RECHARGING / MOVE',detail:'Keep moving until parry is ready again.',touchHint:'Parry recharging → move'};
    return {kind:'guide',action:'E / PARRY THE BULLETS',detail:'Catch incoming fire. Return it to the Notary.',touchHint:'PARRY → return fire'};
  }
  function compare(previous,proposed){
    const next=V.validateSpec(proposed),old=previous?V.validateSpec(previous):null;
    const values=s=>({zone:s?zoneNames[s.zone]:zoneNames.none,speed:s?.speed==='slow'?'72% bullet speed':'100% bullet speed',reflection:s?.reflection==='charged'?'1.8× reflected damage':'1× reflected damage',price:s?V.describe(s).price:'No price'});
    const before=values(old),after=values(next);
    return [['zone','Sanctuary'],['speed','Enemy bullets'],['reflection','Reflections'],['price','Your price']].map(([key,label])=>({key,label,before:before[key],after:after[key],changed:before[key]!==after[key]}));
  }
  function promptFor(raw){
    const s=V.validateSpec(raw),parts=[];
    parts.push(s.zone==='none'?'No sanctuary.':`Give me a sanctuary on the ${s.zone}.`);
    parts.push(s.speed==='slow'?'Slow your bullets.':'Normal bullet speed.');
    parts.push(s.reflection==='charged'?'Amplify my reflections.':'');
    parts.push({weaker_gun:'My gun can be weaker.',reinforcements:'I accept reinforcements.',fragile:'Double the damage I take.',haste:'I accept a faster boss.'}[s.price]);
    return parts.filter(Boolean).join(' ');
  }
  function briefing(world){
    if(!world?.spec||world.mode!=='first-contact')return null;
    const s=V.validateSpec(world.spec),last=world.receipts?.at(-1),at=last?.snapshot||{};
    const delta=key=>Math.max(0,number(V.telemetry(world)[key])-number(at[key]));
    const boss=world.enemies?.find(e=>e.type==='boss'&&e.hp>0);
    const shielded=delta('shielded'),returned=delta('reflectedDamage'),lost=delta('damageTaken');
    const side=s.zone==='none'?'center':s.zone;
    const choices=[
      {id:'keep',label:'Keep my terms',prompt:promptFor(s)},
      {id:'shelter',label:'Trade firepower for shelter',prompt:`Give me a sanctuary on the ${side}. Normal bullet speed. My gun can be weaker.`},
      {id:'reflect',label:'Trade shelter for reflections',prompt:'No sanctuary. Slow your bullets. Amplify my reflections. My gun can be weaker.'}
    ];
    const recommendation=s.price==='fragile'&&lost>0?'shelter':returned>0?(s.reflection==='charged'?'keep':'reflect'):shielded>0?'keep':'shelter';
    const observation=s.price==='fragile'&&lost>0?'Double damage is active. You can trade gun power for a sanctuary without that penalty.':returned>0?(s.reflection==='charged'?'Your enhanced reflections are dealing damage. Keep these terms or trade reflection power for shelter.':'Your reflected shots are dealing damage. You can strengthen them by giving up the sanctuary.'):shielded>0?'Your sanctuary is intercepting bullets. Keep its position or ask to move it.':'A sanctuary erases bullets inside its ring. Lasers and enemy bodies still pass through.';
    return {seconds:Math.round(delta('seconds')*10)/10,hull:number(world.p?.hp),maxHull:number(world.p?.maxHp),bossRemaining:boss?Math.ceil(number(boss.hp)/Math.max(1,number(boss.maxHp))*100):0,shielded,returned:Math.round(returned),lost,observation,choices,recommendation};
  }
  return {compare,promptFor,briefing,combatCue,laserCue};
});
