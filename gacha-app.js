'use strict';
(()=>{
const KEY='creativeGachaStudio.extra.v1',LEGACY='creativeGachaStudio.v1';
const $=id=>document.getElementById(id),page=document.body.dataset.page,DATA=window.CG_DATA;
const GENERATORS=DATA.generators||{};
const labels={appearance:'外見ガチャ',pair:'ふたりガチャ',couple:'推しカプガチャ',moment:'描きたい瞬間'};
Object.entries(GENERATORS).forEach(([key,value])=>labels[key]=value.title);
const invitation=k=>k==='deep'?'あなたのキャラなら、どう答える？':k==='composition'?'あなたなら、どんな一枚にする？':['appearance','character','name'].includes(k)?'あなたなら、どんなキャラにする？':k==='world'?'あなたなら、どんな物語にする？':'あなたなら、どの瞬間を描く？';
let current=null,imageURL=null,imageFile=null,revision=0;
const valid=x=>x&&(['appearance','pair','couple'].includes(x.kind)||Object.hasOwn(GENERATORS,x.kind))&&Array.isArray(x.fields)&&x.fields.length===(x.kind==='appearance'?6:GENERATORS[x.kind]?Object.keys(GENERATORS[x.kind].fields).length:2)&&x.fields.every(f=>f&&typeof f.label==='string'&&typeof f.value==='string'&&f.value.length<500)&&(x.kind!=='name'||x.gender===undefined||['all','male','female'].includes(x.gender))&&(x.kind!=='name'||x.locale===undefined||['jp','en'].includes(x.locale))&&Array.isArray(x.names)&&x.names.length<=2&&x.names.every(n=>typeof n==='string'&&n.length<=40);
const fullName=x=>x.kind==='name'?(x.locale==='en'?[x.fields[1],x.fields[0]]:x.fields).map(f=>f.value.split('（')[0]).join(x.locale==='en'?'・':' '):'';
const legacyValid=x=>x&&['a1','a2','s'].every(k=>typeof x[k]==='string');
const signature=x=>JSON.stringify([x.kind,x.names,x.fields,x.kind==='name'?(x.locale||'jp'):null]);
function status(t){$('status').textContent=t;}
function read(key=KEY){try{const d=JSON.parse(localStorage.getItem(key)||'{}'),v=key===KEY?valid:legacyValid;return {favorites:Array.isArray(d.favorites)?d.favorites.filter(v).slice(0,100):[],history:Array.isArray(d.history)?d.history.filter(v).slice(0,20):[]};}catch{status('保存データを読み込めません。このブラウザの保存設定を確認してください。');return {favorites:[],history:[]};}}
function write(d,key=KEY){try{localStorage.setItem(key,JSON.stringify(d));return true;}catch{status('保存できませんでした。ページを閉じる前に投稿文をコピーしてください。');return false;}}
function pick(items,previous){const choices=items.filter(x=>x!==previous);return choices[Math.floor(Math.random()*choices.length)]||items[0];}
function kind(){return page==='fanfiction'?document.querySelector('[data-kind][aria-pressed="true"]').dataset.kind:page;}
function clearImage(){if(imageURL)URL.revokeObjectURL(imageURL);imageURL=null;imageFile=null;$('imagePanel').hidden=true;$('preview').removeAttribute('src');$('download').removeAttribute('href');}
function reset(){revision++;current=null;$('resultFields').replaceChildren();$('empty').hidden=false;for(const id of ['save','share'])$(id).disabled=true;$('shareOptions').hidden=true;$('share').setAttribute('aria-expanded','false');clearImage();status('');}
function text(){if(!current)return '';return ['🎲 '+labels[current.kind],current.kind==='name'?fullName(current):current.names.length?current.names.join(' × '):'',...current.fields.map(f=>f.label+'：'+f.value),'',invitation(current.kind),'#創作ガチャスタジオ'].filter((s,i)=>s||i>1).join('\n');}
function pageURL(){if(!/^https?:$/.test(location.protocol))return '';const url=new URL(location.href);url.hash='';url.search='';return url.href;}
function fullText(){return text()+(pageURL()?'\n'+pageURL():'');}
function render(){
 if(!current)return;
 $('empty').hidden=true;$('resultFields').replaceChildren();
 if(current.kind==='name'){const heading=document.createElement('p');heading.className='pair-names';heading.textContent=fullName(current);$('resultFields').append(heading);}
 if(current.names.length){const title=document.createElement('p');title.className='pair-names';title.textContent=current.names.join(' × ');$('resultFields').append(title);}
 current.fields.forEach(f=>{const box=document.createElement('div');box.className='field-card';const caption=document.createElement('span');caption.className='field-label';caption.textContent=f.label;const value=document.createElement('strong');value.textContent=f.value;box.append(caption,value);$('resultFields').append(box);});
 $('save').disabled=false;$('share').disabled=false;$('save').textContent=read().favorites.some(x=>signature(x)===signature(current))?'★ お気に入り保存済み':'☆ お気に入りに保存';
 const url=new URL('https://x.com/intent/tweet');url.searchParams.set('text',text());if(pageURL())url.searchParams.set('url',pageURL());$('shareX').href=url.href;
}
function draw(){
 const k=kind(),locks=[...document.querySelectorAll('[data-lock]')];
 if(current&&locks.every(x=>x.checked)){status('すべて固定されています。引き直したい項目の固定を外してください。');return;}
 const old=current,fields=[];
 if(k==='appearance'){Object.entries(DATA.appearance).forEach(([id,data],i)=>{fields.push({label:data.label,value:old&&$('lock-'+id).checked?old.fields[i].value:pick(data.items,old?.fields[i]?.value)});});}
 else if(k==='name'){const pool={...DATA.namePools[$('nameLocale').value]};if($('nameLocale').value==='jp'&&$('nameGender').value!=='all')pool.given=pool[$('nameGender').value];['surname','given'].forEach((id,i)=>fields.push({label:i===0?'苗字':'名前',value:old&&$('lock-'+id).checked?old.fields[i].value:pick(pool[id],old?.fields[i]?.value)}));}
 else if(GENERATORS[k]){Object.entries(GENERATORS[k].fields).forEach(([id,data],i)=>fields.push({label:data.label,value:old&&$('lock-'+id).checked?old.fields[i].value:pick(data.items,old?.fields[i]?.value)}));}
 else{const relations=k==='pair'?DATA.pairRelations:DATA.coupleRelations,scenes=k==='pair'?DATA.pairScenes:DATA.coupleScenes;fields.push({label:'関係性',value:old&&$('lock-relation').checked?old.fields[0].value:pick(relations,old?.fields[0]?.value)},{label:'シチュエーション',value:old&&$('lock-scene').checked?old.fields[1].value:pick(scenes,old?.fields[1]?.value)});}
 const names=k==='appearance'?[]:GENERATORS[k]?(GENERATORS[k].name?[$('nameA').value.trim()||GENERATORS[k].name]:[]):[$('nameA').value.trim()||'A',$('nameB').value.trim()||'B'];
 current={kind:k,names,fields,createdAt:Date.now(),...(k==='name'?{locale:$('nameLocale').value,gender:$('nameLocale').value==='jp'?$('nameGender').value:'all'}:{})};revision++;clearImage();status('');render();
 const data=read();data.history=[current,...data.history.filter(x=>signature(x)!==signature(current))].slice(0,20);write(data);
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
 ctx.font='28px '+font;ctx.fillText(invitation(snapshot.kind),600,y+22);ctx.fillStyle='#9b3f62';ctx.font='700 28px '+font;ctx.fillText('#創作ガチャスタジオ',600,y+76);ctx.font='22px '+font;ctx.fillText('cgshnc.github.io/Creative-gacha/',600,y+123);
 const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));if(token!==revision)return;clearImage();imageURL=URL.createObjectURL(blob);imageFile=new File([blob],'creative-gacha-'+snapshot.kind+'.png',{type:'image/png'});$('preview').src=imageURL;$('preview').alt=fullText();$('download').href=imageURL;$('download').download=imageFile.name;$('imagePanel').hidden=false;$('shareImage').hidden=!(navigator.canShare&&navigator.canShare({files:[imageFile]}));status('画像を作りました。保存した画像をXの投稿画面にも添付できます。');
 }catch{status('画像を作成できませんでした。投稿文のコピーをご利用ください。');}finally{$('makeImage').disabled=false;}
}
function restore(){if(!location.hash.startsWith('#restore='))return;try{const item=JSON.parse(decodeURIComponent(location.hash.slice(9)));if(!valid(item)||(page==='fanfiction'?!['pair','couple'].includes(item.kind):item.kind!==page))throw Error('Invalid');if(page==='fanfiction'){document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===item.kind)));$('nameA').value=item.names[0]||'';$('nameB').value=item.names[1]||'';}else if($('nameA')){$('nameA').value=item.names[0]||'';}if(page==='name'){$('nameLocale').value=item.locale||'jp';$('nameGender').value=item.gender||'all';$('nameGenderGroup').hidden=$('nameLocale').value!=='jp';}document.querySelectorAll('[data-lock]').forEach(x=>x.checked=false);current=item;revision++;clearImage();render();status('保存したお題を読み込みました。');window.history.replaceState(null,'',location.pathname+location.search);}catch{status('お題を読み込めませんでした。保存ページから開き直してください。');}}
function saved(){
 const data=read(),old=read(LEGACY);for(const id of ['favorites','history']){const root=$(id);root.replaceChildren();const items=[...data[id].map(x=>({record:x,legacy:false})),...old[id].map(x=>({record:x,legacy:true}))];if(!items.length){const p=document.createElement('p');p.textContent=id==='favorites'?'お気に入りはまだありません。各ガチャの☆ボタンで保存できます。':'履歴はまだありません。ガチャを引くとここに表示されます。';root.append(p);}
 items.forEach(({record:r,legacy})=>{const row=document.createElement('div');row.className='saved-item';const badge=document.createElement('span');badge.className='field-label';badge.textContent=legacy?labels.moment:labels[r.kind];const p=document.createElement('p');p.textContent=legacy?r.a1+' × '+r.a2+'｜'+r.s:[r.names.join(' × '),...r.fields.map(f=>f.label+'：'+f.value)].filter(Boolean).join('｜');const actions=document.createElement('div');actions.className='saved-actions';const open=document.createElement('a');open.textContent='このお題を使う';open.href=(legacy?'moment.html':['pair','couple'].includes(r.kind)?'fanfiction.html':r.kind+'.html')+'#restore='+encodeURIComponent(JSON.stringify(r));actions.append(open);if(id==='favorites'){const remove=document.createElement('button');remove.type='button';remove.textContent='保存を解除';remove.onclick=()=>{const key=legacy?LEGACY:KEY,d=read(key);d.favorites=d.favorites.filter(x=>legacy?!(x.a1===r.a1&&x.a2===r.a2&&x.s===r.s):signature(x)!==signature(r));if(write(d,key))status('お気に入りを解除しました。');saved();};actions.append(remove);}row.append(badge,p,actions);root.append(row);});}
}
if(page==='saved'){saved();window.addEventListener('storage',saved);window.addEventListener('pageshow',saved);return;}
$('draw').addEventListener('click',draw);$('save').addEventListener('click',()=>{if(!current)return;const d=read();if(d.favorites.some(x=>signature(x)===signature(current))){status('このお題は保存済みです。');return;}if(d.favorites.length>=100){status('お気に入りは100件までです。保存ページで不要なお題を解除してください。');return;}d.favorites.unshift(current);if(write(d)){render();status('お気に入りに保存しました。');}});
$('share').addEventListener('click',()=>{$('shareOptions').hidden=!$('shareOptions').hidden;$('share').setAttribute('aria-expanded',String(!$('shareOptions').hidden));});$('copy').addEventListener('click',copy);$('makeImage').addEventListener('click',makeImage);$('nativeShare').hidden=!navigator.share;$('nativeShare').addEventListener('click',async()=>{try{await navigator.share({title:'創作ガチャスタジオ',text:fullText()});}catch(e){if(e.name!=='AbortError')copy();}});$('shareImage').addEventListener('click',async()=>{if(!imageFile)return;try{await navigator.share({files:[imageFile],title:'創作ガチャスタジオ',text:fullText()});}catch(e){if(e.name!=='AbortError')status('画像を保存して、投稿画面で添付してください。');}});
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-kind]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));reset();}));for(const id of ['nameA','nameB'])if($(id))$(id).addEventListener('input',reset);
if($('nameLocale')){const changeNameOptions=()=>{$('nameGenderGroup').hidden=$('nameLocale').value!=='jp';document.querySelectorAll('[data-lock]').forEach(x=>x.checked=false);reset();};$('nameLocale').addEventListener('change',changeNameOptions);$('nameGender').addEventListener('change',changeNameOptions);}
restore();window.addEventListener('hashchange',restore);window.addEventListener('pageshow',()=>{if(current)render();});window.addEventListener('storage',()=>{if(current)render();});
})();
