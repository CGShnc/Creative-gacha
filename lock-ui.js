'use strict';
(()=>{
 const inputs=[...document.querySelectorAll('.locks input[type="checkbox"]')];
 if(!inputs.length)return;
 const legacy=!!document.getElementById('gachaBtn');
 const root=document.getElementById(legacy?'tags':'resultFields');
 const scene=document.getElementById('result');
 const guidance=document.getElementById('lockGuidance');
 const names=inputs.map(input=>input.parentElement.textContent.trim().replace(/を固定$/,''));
 function sync(){
  const cards=legacy?[...root.querySelectorAll('.character-card'),...(scene.querySelector('.scene')&&root.children.length?[scene]:[])]:[...root.querySelectorAll('.field-card')];
  const ready=cards.length===inputs.length;
  inputs.forEach((input,i)=>{
   input.disabled=!ready;
   if(!ready)input.checked=false;
   input.parentElement.classList.toggle('is-locked',input.checked);
   input.setAttribute('aria-label',names[i]+'を固定');
   const card=cards[i];if(!card)return;
   card.classList.toggle('is-locked',input.checked);
   let button=card.querySelector('.field-lock');
   if(!button){button=document.createElement('button');button.type='button';button.className='field-lock';button.addEventListener('click',()=>{input.checked=!input.checked;input.dispatchEvent(new Event('change',{bubbles:true}));});card.append(button);}
   button.textContent=input.checked?'🔒 固定中':'🔓 固定する';
   button.setAttribute('aria-pressed',String(input.checked));
   button.setAttribute('aria-label',names[i]+(input.checked?'の固定を解除':'を固定する'));
  });
  const count=inputs.filter(x=>x.checked).length;
  guidance.textContent=!ready?'まずはガチャを回して、気になる要素を見つけよう。':count===inputs.length?'すべて固定中です。引き直したい要素の固定を解除してください。':count?'固定した要素はそのまま。ほかの要素を引き直します。':'気に入った要素が出たら、固定してもう一度。';
 }
 inputs.forEach(x=>x.addEventListener('change',sync));
 new MutationObserver(sync).observe(root,{childList:true});
 if(legacy)new MutationObserver(sync).observe(scene,{childList:true});
 sync();
})();
