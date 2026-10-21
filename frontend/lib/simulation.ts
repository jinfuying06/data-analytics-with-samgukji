export type Inputs = { surrender: boolean; wind: boolean; defense: number };
export const baseline: Inputs = {surrender:true,wind:true,defense:0};
export function simulate({surrender,wind,defense}:Inputs) {
 const clamp=(v:number)=>Math.max(0,Math.min(100,v));
 const fire=clamp(35+(surrender?30:0)+(wind?25:0)-defense*18);
 const fleetLoss=clamp(fire-12+(surrender?8:0));
 const retreat=clamp(20+Math.round(fleetLoss*.68));
 const allied=clamp(42+Math.round(fire*.5)-defense*4);
 const outcome=fire>=78?'연합군의 대승':fire>=55?'연합군의 우세':fire>=38?'승부를 알 수 없음':'조조군의 우세';
 return {fire,fleetLoss,retreat,allied,outcome};
}
