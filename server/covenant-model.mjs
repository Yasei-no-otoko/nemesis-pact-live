import V from '../src/covenant.js';

// Constrain cross-field arithmetic before generation. The public contract format
// and final validator stay unchanged; prose never grants additional benefits.
export const MODEL_FORMAT='living_covenant_rules_v3';
export const ruleSetId=({zone,speed,reflection,price})=>`zone=${zone},speed=${speed},reflection=${reflection},price=${price}`;
const rules=new Map();
for(const zone of V.ZONES)for(const speed of V.SPEEDS)for(const reflection of V.REFLECTS)for(const price of V.PRICES){
  const clauses={zone,speed,reflection,price};
  if(V.budget(clauses).valid)rules.set(ruleSetId(clauses),Object.freeze(clauses));
}
const keys=['version','ruleSet','title','line','rationale'];
// Only constrain clear self-corrections. Negated/ambiguous clauses are left to
// the model and visible review; a mere mention of a direction is not authority.
export function explicitCorrectionZone(prompt=''){
  const markers=[...prompt.matchAll(/やっぱり|やはり|いや[、,\s]*|(?:左|右|中央)(?:側)?(?:ではなく|じゃなく)|\b(?:actually|instead|rather|i mean|correction)\b/gi)];
  // A complete clause revoking the sanctuary is a location correction to none.
  // Restrict only direct commands, not mentions, negation or hypothetical edits.
  const clauses=[...prompt.matchAll(/[^。.!?;、,\n]+/gu)];
  for(let n=clauses.length-1;n>=0;n--){
    const clause=clauses[n],text=clause[0].trim().replace(/^(?:やっぱり|やはり|actually|instead)\s*/iu,'').split(/その代わり|\band (?:instead )?/iu)[0].trim();
    const removal=/^(?:結界|安全(?:地帯)?|保護)(?:は|を)?(?:撤回(?:して(?:ください)?|する|します)?|なし(?:にして(?:ください)?)?|不要)$/u.test(text)||/^(?:please\s+)?(?:(?:remove|withdraw|revoke|cancel)\s+(?:the\s+)?(?:sanctuary|safe zone|circle)|no\s+(?:sanctuary|safe zone|circle))(?:\s+please)?$/iu.test(text);
    if(!removal||/[?？]/u.test(prompt[clause.index+clause[0].length]||''))continue;
    const replacement=clause[0].search(/その代わり|\band (?:instead )?/iu);
    const later=(replacement<0?'':clause[0].slice(replacement))+prompt.slice(clause.index+clause[0].length);
    if(/左|右|中央|\b(?:left|right|center|centre|keep|restore)\b|やめ|戻|残|撤回しない/iu.test(later))break;
    return 'none';
  }
  if(!markers.length)return null;
  const last=markers[markers.length-1],tail=prompt.slice(last.index+last[0].length).replace(/^[、,\s:]+/u,'').split(/[。.!?;、,\n]/u)[0];
  if(/\b(?:not|never|no|don['’]?t|without)\b|しない|ではない|じゃない|いらない|不要|やめ/u.test(tail.toLowerCase()))return null;
  const locations=[...tail.matchAll(/\bleft\b|\bright\b|\bcent(?:er|re)\b|左|右|中央/gi)];
  if(locations.length!==1)return null;
  const bare=/^(?:the |only )?(?:left|right|center|centre)(?: side)?(?: please)?\s*$|^(?:左|右|中央)(?:側)?\s*$/iu.test(tail);
  const directive=/\b(?:move|put|make|change|keep|protect|safe|sanctuary|zone)\b|(?:左|右|中央)(?:側)?(?:に(?:して|変え|変更|移)|を(?:安全|守|保護))/iu.test(tail);
  if(!bare&&!directive)return null;
  const word=locations[0][0].toLowerCase();return /left|左/u.test(word)?'left':/right|右/u.test(word)?'right':'center';
}
export function modelSchema(request){
  const str=maxLength=>({type:'string',minLength:1,maxLength});
  const zone=explicitCorrectionZone(request?.prompt),offered=[...rules].filter(([,clauses])=>!zone||clauses.zone===zone).map(([id])=>id);
  return {type:'object',additionalProperties:false,required:keys,properties:{version:{type:'integer',enum:[1]},ruleSet:{type:'string',enum:offered},title:str(48),line:str(240),rationale:str(360)}};
}
export function decodeModelContract(value,request){
  if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).length!==keys.length||Object.keys(value).some(key=>!keys.includes(key)))throw Error('Invalid model contract shape');
  const clauses=rules.get(value.ruleSet);
  if(!clauses)throw Error('Unsupported model rule set');
  const zone=explicitCorrectionZone(request?.prompt);
  if(zone&&clauses.zone!==zone)throw Error('Model ignored explicit location correction');
  return V.validateSpec({version:value.version,title:value.title,...clauses,line:value.line,rationale:value.rationale});
}
