'use strict';
(()=>{
 if(location.hostname!=='cgshnc.github.io'||!location.pathname.startsWith('/Creative-gacha/'))return;
 const box=document.createElement('aside');box.setAttribute('aria-label','サイト移転のお知らせ');box.style.cssText='padding:12px 16px;background:#fff3f6;border-bottom:1px solid #d3bcc4;text-align:center;font-size:14px;line-height:1.7';
 const path=location.pathname.replace('/Creative-gacha/','/').replace(/index\.html$/,'').replace(/\.html$/,'');
 const link=document.createElement('a');link.href='https://creative-gs.com'+path+location.search+location.hash;link.textContent='新しいサイトを開く';
 box.append('創作ガチャスタジオは creative-gs.com に移転しました。 ',link,'。保存したお題は「保存したお題」のデータ引き継ぎから移せます。');document.body.prepend(box);
})();
