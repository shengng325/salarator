const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('id="sgcurrency"'),'Singapore salary currency selector exists');
assert.ok(html.includes('id="mycurrency"'),'Malaysia salary currency selector exists');
const code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
let saved=null;
function load(){
 const defaults={sg:'8000',my:'20000',sgrelief:'0',myrelief:'0',fx:'4',mode:'progressive',period:'1',currency:'local',sgcurrency:'SGD',mycurrency:'MYR'};
 const options={mode:['progressive','rep'],period:['1','12'],currency:['local','SGD','MYR'],sgcurrency:['SGD','MYR'],mycurrency:['MYR','SGD']};
 const els=Object.fromEntries(Object.entries(defaults).map(([id,value])=>[id,{value,tagName:options[id]?'SELECT':'INPUT',options:(options[id]||[]).map(value=>({value})),checkValidity(){return Number.isFinite(Number(this.value))&&Number(this.value)>=(id==='fx'?0.0001:0)},addEventListener(_,fn){this.input=fn}}]));
 els['difference-heading']={};els.error={};els.results={replaceChildren(){this.innerHTML=''}};
 const ctx={localStorage:{getItem:()=>saved,setItem:(_,value)=>saved=value},document:{getElementById:id=>els[id],querySelectorAll:()=>Object.keys(defaults).map(id=>els[id])}};
 vm.runInNewContext(code,ctx);return els;
}
let page=load();const original=page.results.innerHTML;
assert.ok(page.results.innerHTML.includes('SG, +3,000<small>+60.0%</small>'));
page.my.value='5000';page.mycurrency.value='SGD';page.my.input();
assert.equal(page.results.innerHTML,original,'Malaysia SGD input gives same taxes and contributions as equivalent MYR salary');
page.sg.value='32000';page.sgcurrency.value='MYR';page.sg.input();
assert.equal(page.results.innerHTML,original,'Singapore MYR input gives same taxes and CPF as equivalent SGD salary');
page=load();assert.equal(page.mycurrency.value,'SGD');assert.equal(page.sgcurrency.value,'MYR');assert.equal(page.results.innerHTML,original);
page.fx.value='2';page.fx.input();assert.ok(page.results.innerHTML.includes('<td>RM 10,000.00<small>S$ 5,000.00</small></td>'));
page.currency.value='SGD';page.currency.input();assert.ok(page.results.innerHTML.includes('<td>S$ 5,000.00<small>RM 10,000.00</small></td>'));
page.period.value='12';page.period.input();assert.ok(page.results.innerHTML.includes('<td>S$ 60,000.00<small>RM 120,000.00</small></td>'));
console.log('UI logic checks passed: input currency equivalence, saved currencies, exchange rate, display currency and annual results.');
