'use strict';
(()=>{
const KEY='creativeGachaStudio.extra.v1',LEGACY='creativeGachaStudio.v1';
const $=id=>document.getElementById(id),page=document.body.dataset.page,DATA=window.CG_DATA;
const GENERATORS=DATA.generators||{};
const labels={appearance:'外見ガチャ',pair:'保存した二人のお題（旧版）',couple:'推しカプガチャ',relationship:'関係性・シチュエーションガチャ',moment:'カップリングガチャ'};
Object.entries(GENERATORS).forEach(([key,value])=>labels[key]=value.title);
labels.solo='推し単体ガチャ（旧お題）';
labels.resonance='描きたい瞬間ガチャ（旧お題）';
const invitation=k=>k==='moment'?'あなたは、どんなふたりに惹かれる？':k==='resonance'?'あなたは、どこに心が動いた？':k==='deep'?'あなたのキャラなら、どう答える？':['composition','couple-composition'].includes(k)?'あなたなら、どんな一枚にする？':['appearance','character','name','face','fantasy','two-elements','moment'].includes(k)?'あなたなら、どんなキャラにする？':['world','relationship'].includes(k)?'あなたなら、どんな物語にする？':'あなたなら、どの瞬間を描く？';
let current=null,imageURL=null,imageFile=null,revision=0;
const valid=x=>x&&(['appearance','pair','couple','relationship'].includes(x.kind)||Object.hasOwn(GENERATORS,x.kind))&&Array.isArray(x.fields)&&x.fields.length===(x.kind==='appearance'?6:GENERATORS[x.kind]?Object.keys(GENERATORS[x.kind].fields).length:2)&&x.fields.every(f=>f&&typeof f.label==='string'&&typeof f.value==='string'&&f.value.length<500)&&(x.kind!=='name'||x.gender===undefined||['all','male','female'].includes(x.gender))&&(x.kind!=='name'||x.locale===undefined||['jp','en'].includes(x.locale))&&Array.isArray(x.names)&&x.names.length<=2&&x.names.every(n=>typeof n==='string'&&n.length<=40);
const fullName=x=>x.kind==='name'?(x.locale==='en'?[x.fields[1],x.fields[0]]:x.fields).map(f=>f.value.split('（')[0]).join(x.locale==='en'?'・':' '):'';
const legacyValid=x=>x&&['a1','a2','s'].every(k=>typeof x[k]==='string');
const signature=x=>JSON.stringify([x.kind,x.names,x.fields,x.kind==='name'?(x.locale||'jp'):null]);
function normalizeRecord(x){
 if(x&&['couple','pair'].includes(x.kind)&&Array.isArray(x.fields)&&x.fields.length===2)return {...x,kind:'relationship',legacyNames:x.names,names:[]};
 if(x&&x.kind==='relationship'&&Array.isArray(x.names)&&x.names.length)return {...x,legacyNames:x.names,names:[]};
 if(x&&Array.isArray(x.fields)&&x.fields.every(f=>f&&typeof f.value==='string'&&f.value.length<500)){
  const f=x.fields,free='自由に設定',make=v=>Object.values(GENERATORS.moment.fields).map((field,i)=>({label:field.label,value:v[i]}));let v;
  if(x.kind==='moment'&&f.length===5&&!(typeof f[0].label==='string'&&f[0].label.includes('キャラA')))v=[f[0].value,free,f[1].value,free,f[2].value,[f[3].value,f[4].value].filter(t=>t!==free).join('／')||free];
  if(x.kind==='two-elements'&&f.length===2)v=[f[0].value,f[1].value,free,free,free,free];
  if(x.kind==='resonance'&&f.length===4)v=[free,f[0].value,free,free,f[1].value,f[2].value+'／'+f[3].value];
  if(x.kind==='moment'&&f.length===6)v=f.slice(0,5).map(t=>t.value);
  if(v)return {...x,kind:'moment',legacyFields:x.legacyFields||f,fields:make(v)};
 }

 if(x&&((x.kind==='face'&&Array.isArray(x.fields)&&x.fields.length===8)||(x.kind==='fantasy'&&Array.isArray(x.fields)&&x.fields.length===7))&&x.fields.every(f=>f&&typeof f.label==='string'&&typeof f.value==='string'&&f.value.length<500)){
  const indices=x.kind==='face'?[0,1,2,3,6,7]:[0,1,2,3,4,5];
  return {...x,legacyFields:x.legacyFields||x.fields,fields:indices.map(i=>x.fields[i])};
 }

 if(x&&x.kind==='manga'&&Array.isArray(x.fields)&&x.fields.length===4&&x.fields.every(f=>f&&typeof f.label==='string')){return {...x,fields:x.fields.map((f,i)=>({...f,label:['場所','出来事','感情','セリフのヒント'][i]}))};}
 if(x&&x.kind==='solo'&&Array.isArray(x.fields)&&x.fields.length===4&&x.fields.every(f=>f&&typeof f.label==='string'&&typeof f.value==='string'&&f.value.length<500)){
  return {...x,legacyFields:x.fields,fields:[x.fields[1],x.fields[2]]};
 }
 return x;
}
function status(t){$('status').textContent=t;}
function read(key=KEY){try{const d=JSON.parse(localStorage.getItem(key)||'{}'),v=key===KEY?valid:legacyValid;return {favorites:Array.isArray(d.favorites)?d.favorites.map(x=>key===KEY?normalizeRecord(x):x).filter(v).slice(0,100):[],history:Array.isArray(d.history)?d.history.map(x=>key===KEY?normalizeRecord(x):x).filter(v).slice(0,20):[]};}catch{status('保存データを読み込めません。このブラウザの保存設定を確認してください。');return {favorites:[],history:[]};}}
function write(d,key=KEY){try{localStorage.setItem(key,JSON.stringify(d));return true;}catch{status('保存できませんでした。ページを閉じる前に投稿文をコピーしてください。');return false;}}
const recentPicks=new WeakMap();
function pick(items,previous){
 const recent=recentPicks.get(items)||[],limit=Math.min(10,Math.max(0,items.length-2));
 let choices=items.filter(x=>x!==previous&&!recent.includes(x));
 if(!choices.length)choices=items.filter(x=>x!==previous);
 const value=choices[Math.floor(Math.random()*choices.length)]||items[0];
 recentPicks.set(items,[value,...recent.filter(x=>x!==value)].slice(0,limit));return value;
}
function faceHair(old){
 const frontLocked=!!old&&$('lock-bangs').checked,backLocked=!!old&&$('lock-backhair').checked;
 const wasWhole=!!old&&old.fields[1].value.startsWith('一体型：');
 const whole=frontLocked||backLocked?wasWhole:Math.random()<0.16;
 if(whole){
  const style=(frontLocked||backLocked)?old.fields[1].value:'一体型：'+pick(DATA.faceWholeHair,wasWhole?old.fields[1].value.slice(4):undefined);
  return [style,style];
 }
 return [frontLocked?old.fields[1].value:pick(GENERATORS.face.fields.bangs.items,old?.fields[1]?.value),backLocked?old.fields[2].value:pick(GENERATORS.face.fields.backhair.items,old?.fields[2]?.value)];
}
function kind(){return page==='fanfiction'?'couple':page;}
function clearImage(){if(imageURL)URL.revokeObjectURL(imageURL);imageURL=null;imageFile=null;$('imagePanel').hidden=true;$('preview').removeAttribute('src');$('download').removeAttribute('href');}
function reset(){revision++;current=null;$('resultFields').replaceChildren();$('empty').hidden=false;for(const id of ['save','share'])$(id).disabled=true;$('shareOptions').hidden=true;$('share').setAttribute('aria-expanded','false');clearImage();status('');}
function text(){if(!current)return '';return ['🎲 '+labels[current.kind],current.kind==='name'?fullName(current):current.names.length?current.names.join(' × '):'',...current.fields.map(f=>f.label+'：'+f.value),'',invitation(current.kind),'#創作ガチャスタジオ'].filter((s,i)=>s||i>1).join('\n');}
function pageURL(){if(!/^https?:$/.test(location.protocol))return '';const path=location.pathname.replace(/^\/Creative-gacha\//,'/').replace(/index\.html$/,'').replace(/\.html$/,'');return 'https://creative-gs.com'+path;}
function fullText(){return text()+(pageURL()?'\n'+pageURL():'');}
function render(){
 if(!current)return;
 $('empty').hidden=true;$('resultFields').replaceChildren();
 if(current.kind==='name'){const heading=document.createElement('p');heading.className='pair-names';heading.textContent=fullName(current);$('resultFields').append(heading);}
 if(current.names.length){const title=document.createElement('p');title.className='pair-names';title.textContent=current.names.join(' × ');$('resultFields').append(title);}
 const groups=[];if(current.kind==='moment'){['キャラA','キャラB'].forEach(label=>{const group=document.createElement('section');group.className='moment-character';const title=document.createElement('h2');title.textContent=label;group.append(title);groups.push(group);$('resultFields').append(group);});}
 current.fields.forEach((f,i)=>{const box=document.createElement('div');box.className='field-card'+(f.value.length>18?' field-wide':'');const caption=document.createElement('span');caption.className='field-label';caption.textContent=f.label;const value=document.createElement('strong');value.textContent=f.value;box.append(caption,value);(current.kind==='moment'&&i<4?groups[Math.floor(i/2)]:$('resultFields')).append(box);});
 $('save').disabled=false;$('share').disabled=false;$('save').textContent=read().favorites.some(x=>signature(x)===signature(current))?'★ お気に入り保存済み':'☆ お気に入りに保存';
 const url=new URL('https://x.com/intent/tweet');url.searchParams.set('text',text());if(pageURL())url.searchParams.set('url',pageURL());$('shareX').href=url.href;
}
function draw(){
 const k=kind(),locks=[...document.querySelectorAll('[data-lock]')];
 if(current&&locks.every(x=>x.checked)){status('すべて固定されています。引き直したい項目の固定を外してください。');return;}
 const old=current,fields=[];
 if(k==='appearance'){Object.entries(DATA.appearance).forEach(([id,data],i)=>{fields.push({label:data.label,value:old&&$('lock-'+id).checked?old.fields[i].value:pick(data.items,old?.fields[i]?.value)});});}
 else if(k==='name'){const pool={...DATA.namePools[$('nameLocale').value]};if($('nameLocale').value==='jp'&&$('nameGender').value!=='all')pool.given=pool[$('nameGender').value];['surname','given'].forEach((id,i)=>fields.push({label:i===0?'苗字':'名前',value:old&&$('lock-'+id).checked?old.fields[i].value:pick(pool[id],old?.fields[i]?.value)}));}
 else if(k==='face'){
  const hair=faceHair(old);
  Object.entries(GENERATORS.face.fields).forEach(([id,data],i)=>fields.push({label:data.label,value:i===1?hair[0]:i===2?hair[1]:old&&$('lock-'+id).checked?old.fields[i].value:pick(data.items,old?.fields[i]?.value)}));
 }
 else if(GENERATORS[k]){Object.entries(GENERATORS[k].fields).forEach(([id,data],i)=>fields.push({label:data.label,value:old&&$('lock-'+id).checked?old.fields[i].value:pick(data.items,old?.fields[i]?.value)}));}
 else{const relations=DATA.coupleRelations,scenes=DATA.coupleScenes;fields.push({label:'関係性',value:old&&$('lock-relation').checked?old.fields[0].value:pick(relations,old?.fields[0]?.value)},{label:'シチュエーション',value:old&&$('lock-scene').checked?old.fields[1].value:pick(scenes,old?.fields[1]?.value)});}
 const names=['appearance','relationship'].includes(k)?[]:GENERATORS[k]?(GENERATORS[k].name?[$('nameA').value.trim()||GENERATORS[k].name]:[]):[$('nameA').value.trim()||'A',$('nameB').value.trim()||'B'];
 current={kind:k,names,fields,createdAt:Date.now(),...(k==='name'?{locale:$('nameLocale').value,gender:$('nameLocale').value==='jp'?$('nameGender').value:'all'}:{})};revision++;clearImage();status('');render();
 const data=read();data.history=[current,...data.history.filter(x=>signature(x)!==signature(current))].slice(0,20);write(data);
 try{window.CGAnalytics?.draw(k);}catch{/* 解析の失敗でガチャを停止させない。 */}
}
async function copy(){try{await navigator.clipboard.writeText(fullText());status('結果・ハッシュタグ・URLをコピーしました。');}catch{window.prompt('コピーして投稿画面に貼り付けてください',fullText());}}
function wrap(ctx,t,width){const out=[];let line='';for(const c of t){if(ctx.measureText(line+c).width>width&&line){out.push(line);line=c;}else line+=c;}if(line)out.push(line);return out;}
async function makeImage(){
 if(!current)return;const token=revision,snapshot=current;$('makeImage').disabled=true;
 try{if(document.fonts?.ready)await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1200;let ctx=canvas.getContext('2d');if(!ctx)throw Error('Canvas');const font='"Hiragino Kaku Gothic ProN","Yu Gothic",sans-serif';ctx.font='700 42px '+font;
 const nameLines=snapshot.kind==='name'?wrap(ctx,fullName(snapshot),1000):snapshot.names.length?wrap(ctx,snapshot.names.join(' × '),1000):[];
 const blocks=snapshot.fields.map(f=>({label:f.label,lines:wrap(ctx,f.value,990)}));
 canvas.height=330+nameLines.length*62+blocks.reduce((sum,b)=>sum+90+b.lines.length*58,0)+150;ctx=canvas.getContext('2d');ctx.fillStyle='#fff3f6';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#9b3f62';ctx.fillRect(0,0,1200,14);ctx.textBaseline='top';ctx.textAlign='center';ctx.fillStyle='#55283b';ctx.font='700 44px '+font;ctx.fillText('創作ガチャスタジオ',600,55);ctx.font='28px '+font;ctx.fillText(labels[snapshot.kind],600,120);let y=185;ctx.font='700 42px '+font;for(const line of nameLines){ctx.fillText(line,600,y);y+=62;}y+=15;
 for(const b of blocks){const h=70+b.lines.length*58;ctx.fillStyle='#fff';ctx.fillRect(65,y,1070,h);ctx.fillStyle='#784358';ctx.font='26px '+font;ctx.fillText(b.label,600,y+16);ctx.font='700 42px '+font;ctx.fillStyle='#55283b';b.lines.forEach((line,i)=>ctx.fillText(line,600,y+56+i*58));y+=h+20;}
 ctx.font='28px '+font;ctx.fillText(invitation(snapshot.kind),600,y+22);ctx.fillStyle='#9b3f62';ctx.font='700 28px '+font;ctx.fillText('#創作ガチャスタジオ',600,y+76);ctx.font='22px '+font;ctx.fillText('creative-gs.com/',600,y+123);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));if(token!==revision)return;clearImage();imageURL=URL.createObjectURL(blob);imageFile=new File([blob],'creative-gacha-'+snapshot.kind+'.png',{type:'image/png'});$('preview').src=imageURL;$('preview').alt=fullText();$('download').href=imageURL;$('download').download=imageFile.name;$('imagePanel').hidden=false;$('shareImage').hidden=!(navigator.canShare&&navigator.canShare({files:[imageFile]}));status('画像を作りました。保存した画像をXの投稿画面にも添付できます。');
 }catch{status('画像を作成できませんでした。投稿文のコピーをご利用ください。');}finally{$('makeImage').disabled=false;}
}
function restore(){if(!location.hash.startsWith('#restore='))return;try{let item=normalizeRecord(JSON.parse(decodeURIComponent(location.hash.slice(9))));
 if(page==='moment'){
  const make=values=>Object.values(GENERATORS.moment.fields).map((f,i)=>({label:f.label,value:values[i]}));
  if(legacyValid(item))item={kind:'moment',names:[],fields:make([item.a1,'自由に設定',item.a2,'自由に設定','自由に設定',item.s]),createdAt:item.createdAt||Date.now()};
 }
if(!valid(item)||(page==='fanfiction'?!['pair','couple'].includes(item.kind):item.kind!==page))throw Error('Invalid');if(page==='fanfiction'&&$('nameA')&&$('nameB')){$('nameA').value=item.names[0]||'';$('nameB').value=item.names[1]||'';}else if($('nameA')){$('nameA').value=item.names[0]||'';}if(page==='name'){$('nameLocale').value=item.locale||'jp';$('nameGender').value=item.gender||'all';$('nameGenderGroup').hidden=$('nameLocale').value!=='jp';}document.querySelectorAll('[data-lock]').forEach(x=>x.checked=false);if(item.kind==='face'){item.fields[1].label='前髪';if(item.fields[1].value.startsWith('一体型：'))item.fields[2].value=item.fields[1].value;}current=item;revision++;clearImage();render();status('保存したお題を読み込みました。');window.history.replaceState(null,'',location.pathname+location.search);}catch{status('お題を読み込めませんでした。保存ページから開き直してください。');}}
function saved(){
 const data=read(),old=read(LEGACY);for(const id of ['favorites','history']){const root=$(id);root.replaceChildren();const items=[...data[id].map(x=>({record:x,legacy:false})),...old[id].map(x=>({record:x,legacy:true}))];if(!items.length){const p=document.createElement('p');p.textContent=id==='favorites'?'お気に入りはまだありません。各ガチャの☆ボタンで保存できます。':'履歴はまだありません。ガチャを引くとここに表示されます。';root.append(p);}
 items.forEach(({record:r,legacy})=>{const row=document.createElement('div');row.className='saved-item';const badge=document.createElement('span');badge.className='field-label';badge.textContent=legacy?labels.moment:labels[r.kind];const p=document.createElement('p');p.textContent=legacy?r.a1+' × '+r.a2+'｜'+r.s:[(r.legacyNames||r.names).join(' × '),...(r.legacyFields||r.fields).map(f=>f.label+'：'+f.value)].filter(Boolean).join('｜');const actions=document.createElement('div');actions.className='saved-actions';const open=document.createElement('a');open.textContent='このお題を使う';open.href=(legacy||r.kind==='resonance'?'moment.html':['pair','couple'].includes(r.kind)?'relationship.html':r.kind+'.html')+'#restore='+encodeURIComponent(JSON.stringify(r));if(r.kind!=='solo')actions.append(open);if(id==='favorites'){const remove=document.createElement('button');remove.type='button';remove.textContent='保存を解除';remove.onclick=()=>{const key=legacy?LEGACY:KEY,d=read(key);d.favorites=d.favorites.filter(x=>legacy?!(x.a1===r.a1&&x.a2===r.a2&&x.s===r.s):signature(x)!==signature(r));if(write(d,key))status('お気に入りを解除しました。');saved();};actions.append(remove);}row.append(badge,p,actions);root.append(row);});}
}
function setupTransfer(){
 const box=document.createElement('section');box.className='card';
 box.innerHTML='<h2>保存データの引き継ぎ</h2><p>旧サイトで書き出したデータをコピーし、新サイトのこの欄へ貼り付けて読み込めます。データはサーバーへ送信しません。</p><button type="button" id="exportSaved">データを書き出す</button><p><label for="transferData">引き継ぎデータ</label><textarea id="transferData" rows="4" style="width:100%;box-sizing:border-box" spellcheck="false"></textarea></p><button type="button" id="importSaved">データを読み込む</button><p class="small-note">既存のお題を残して追加します。各保存枠の上限を超える場合は読み込みを中止します。</p>';
 document.querySelector('main').append(box);
 $('exportSaved').onclick=()=>{try{const data={};for(const key of [KEY,LEGACY])data[key]=read(key);$('transferData').value=JSON.stringify({format:'creative-gacha-backup-v1',data});$('transferData').focus();$('transferData').select();status('データを書き出しました。欄内をすべてコピーして、新サイトの同じ欄へ貼り付けてください。');}catch{status('書き出せませんでした。ブラウザの保存設定をご確認ください。');}};
 $('importSaved').onclick=()=>{try{
 const raw=$('transferData').value;if(raw.length>2000000)throw Error();const pack=JSON.parse(raw);if(pack.format!=='creative-gacha-backup-v1'||!pack.data)throw Error();
 const updates=[];for(const key of [KEY,LEGACY]){const incoming=pack.data[key];if(!incoming||!Array.isArray(incoming.favorites)||!Array.isArray(incoming.history))throw Error();const old=read(key),merged={};for(const field of ['favorites','history']){const vals=incoming[field].map(x=>key===KEY?normalizeRecord(x):x);if(!vals.every(key===KEY?valid:legacyValid))throw Error();const seen=new Set();merged[field]=[...old[field],...vals].filter(x=>{const s=key===KEY?signature(x):JSON.stringify([x.a1,x.a2,x.s]);if(seen.has(s))return false;seen.add(s);return true;});if(merged[field].length>(field==='favorites'?100:20)){status('保存枠の上限を超えるため読み込みを中止しました。既存データは変更していません。');return;}}updates.push([key,JSON.stringify(merged)]);}
 const before=updates.map(([key])=>[key,localStorage.getItem(key)]);try{updates.forEach(([key,val])=>localStorage.setItem(key,val));}catch(err){before.forEach(([key,val])=>val===null?localStorage.removeItem(key):localStorage.setItem(key,val));throw err;}saved();status('保存データを読み込みました。お気に入りと履歴をご確認ください。');
 }catch{status('データを読み込めませんでした。書き出したデータをすべて貼り付け、ブラウザの保存設定もご確認ください。');}};
}
if(page==='saved'){saved();setupTransfer();window.addEventListener('storage',saved);window.addEventListener('pageshow',saved);return;}
$('draw').addEventListener('click',draw);$('save').addEventListener('click',()=>{if(!current)return;const d=read();if(d.favorites.some(x=>signature(x)===signature(current))){status('このお題は保存済みです。');return;}if(d.favorites.length>=100){status('お気に入りは100件までです。保存ページで不要なお題を解除してください。');return;}d.favorites.unshift(current);if(write(d)){render();status('お気に入りに保存しました。');}});
$('share').addEventListener('click',()=>{$('shareOptions').hidden=!$('shareOptions').hidden;$('share').setAttribute('aria-expanded',String(!$('shareOptions').hidden));});$('copy').addEventListener('click',copy);$('makeImage').addEventListener('click',makeImage);$('nativeShare').hidden=!navigator.share;$('nativeShare').addEventListener('click',async()=>{try{await navigator.share({title:'創作ガチャスタジオ',text:fullText()});}catch(e){if(e.name!=='AbortError')copy();}});$('shareImage').addEventListener('click',async()=>{if(!imageFile)return;try{await navigator.share({files:[imageFile],title:'創作ガチャスタジオ',text:fullText()});}catch(e){if(e.name!=='AbortError')status('画像を保存して、投稿画面で添付してください。');}});
for(const id of ['nameA','nameB'])if($(id))$(id).addEventListener('input',reset);
if($('nameLocale')){const changeNameOptions=()=>{$('nameGenderGroup').hidden=$('nameLocale').value!=='jp';document.querySelectorAll('[data-lock]').forEach(x=>x.checked=false);reset();};$('nameLocale').addEventListener('change',changeNameOptions);$('nameGender').addEventListener('change',changeNameOptions);}
if(page==='face'){
 for(const id of ['bangs','backhair'])$('lock-'+id).addEventListener('change',()=>{
  if(current&&current.fields[1].value.startsWith('一体型：')){
   $('lock-bangs').checked=$('lock-'+id).checked;$('lock-backhair').checked=$('lock-'+id).checked;
   render();
  }
 });
}
restore();window.addEventListener('hashchange',restore);window.addEventListener('pageshow',()=>{if(current)render();});window.addEventListener('storage',()=>{if(current)render();});
})();
