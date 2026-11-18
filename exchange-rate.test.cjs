const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('id="fxmode" type="checkbox"'),'Auto checkbox exists');
const code=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const storage=new Map();let calls=0,day='2026-11-18',failure=false,pending=null;
function load(){
 const els={};
 for(const m of html.matchAll(/<input\b([^>]+)>|<select\b([^>]+)>([\s\S]*?)<\/select>/g)){
  const attrs=m[1]||m[2],id=attrs.match(/id="([^"]+)"/)?.[1];if(!id)continue;
  const options=[...(m[3]||'').matchAll(/<option value="([^"]+)"/g)].map(m=>({value:m[1]}));
  els[id]={value:attrs.match(/value="([^"]+)"/)?.[1]||options[0]?.value||'',checked:/\bchecked\b/.test(attrs),tagName:m[1]?'INPUT':'SELECT',options,events:{},addEventListener(type,fn){this.events[type]=fn}};
 }
 for(const id of ['results','error','difference-heading','fxstatus'])els[id]={replaceChildren(){this.innerHTML=''}};
 const FakeDate=class extends Date{constructor(){super(day+'T12:00:00')}};
 const ctx={Date:FakeDate,AbortSignal,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},fetch:async()=>{calls++;if(pending)await pending;if(failure)throw Error('offline');return {ok:true,json:async()=>({date:day,sgd:{myr:3.45}})}},document:{getElementById:id=>els[id],querySelectorAll:()=>Object.values(els).filter(el=>el.events)}};
 vm.createContext(ctx);vm.runInContext(code,ctx);
 return {els,change(id,value){if(id==='fxmode')els[id].checked=value==='auto';else els[id].value=value;return els[id].events.input();}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
 let p=load();await flush();assert.equal(calls,1,'New visits default to Auto');assert.equal(p.els.fxmode.checked,true);assert.equal(p.els.fx.disabled,true);
 p.change('fxmode','manual');storage.clear();calls=0;storage.set('causeway-salary-inputs-v1',JSON.stringify({fxmode:'manual'}));
 p=load();assert.equal(calls,0,'Saved Manual preference never fetches');
 p.change('fx','3 + .2');p.change('sg','9000');assert.equal(calls,0);
 await p.change('fxmode','auto');await flush();assert.equal(calls,1);assert.equal(p.els.fx.value,'3.45');assert.equal(p.els.fx.disabled,true);assert.equal(p.els.fxstatus.textContent,'Rate as of 2026-11-18');
 p.change('fxmode','manual');assert.equal(p.els.fx.value,'3 + .2');assert.equal(p.els.fx.disabled,false);assert.equal(p.els.fxstatus.textContent,'');
 await p.change('fxmode','auto');assert.equal(calls,1,'Same-day toggle uses cache');
 p=load();await flush();assert.equal(calls,1,'Refresh uses stored cache');assert.equal(p.els.fx.value,'3.45');
 day='2026-11-19';p.change('fxmode','manual');p.change('sg','9100');assert.equal(calls,1,'No background fetch at day rollover');
 await p.change('fxmode','auto');await flush();assert.equal(calls,2,'New day fetches on Auto selection');
 day='2026-11-20';p.change('fxmode','manual');failure=true;await p.change('fxmode','auto');await flush();assert.equal(p.els.fxmode.checked,false);assert.equal(p.els.fx.value,'3 + .2');assert.equal(p.els.fx.disabled,false);assert.ok(p.els.fxstatus.textContent.includes('Couldn’t'));
 failure=false;day='2026-11-21';let release;pending=new Promise(r=>release=r);p.change('fxmode','auto');p.change('fxmode','manual');p.change('fx','3.1');release();await flush();await flush();assert.equal(p.els.fx.value,'3.1','Late response cannot overwrite manual input');
 console.log('Auto-rate checks passed: lazy fetch, daily cache, refresh, manual restoration, failure and late response.');
})().catch(e=>{console.error(e);process.exitCode=1});
