import V from '../src/covenant.js';

// Constrain cross-field arithmetic before generation. The public contract format
// and final validator stay unchanged; prose never grants additional benefits.
export const MODEL_FORMAT='living_covenant_rules_v2';
export const ruleSetId=({zone,speed,reflection,price})=>`zone=${zone},speed=${speed},reflection=${reflection},price=${price}`;
const rules=new Map();
for(const zone of V.ZONES)for(const speed of V.SPEEDS)for(const reflection of V.REFLECTS)for(const price of V.PRICES){
  const clauses={zone,speed,reflection,price};
  if(V.budget(clauses).valid)rules.set(ruleSetId(clauses),Object.freeze(clauses));
}
const keys=['version','ruleSet','title','line','rationale'];
export function modelSchema(){
  const str=maxLength=>({type:'string',minLength:1,maxLength});
  return {type:'object',additionalProperties:false,required:keys,properties:{version:{type:'integer',enum:[1]},ruleSet:{type:'string',enum:[...rules.keys()]},title:str(48),line:str(240),rationale:str(360)}};
}
export function decodeModelContract(value){
  if(!value||Object.getPrototypeOf(value)!==Object.prototype||Object.keys(value).length!==keys.length||Object.keys(value).some(key=>!keys.includes(key)))throw Error('Invalid model contract shape');
  const clauses=rules.get(value.ruleSet);
  if(!clauses)throw Error('Unsupported model rule set');
  return V.validateSpec({version:value.version,title:value.title,...clauses,line:value.line,rationale:value.rationale});
}
