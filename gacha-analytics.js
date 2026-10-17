'use strict';
// 非公開の集計先を作成した後、そのウェブアプリURLを設定します。
window.CG_COUNTER_CONFIG = { endpoint: '' };
(()=>{
  const kinds=new Set(['appearance','character','face','fantasy','name','deep','relationship','moment','manga','world','composition','solo','couple','couple-composition']);
  function draw(kind){
    const endpoint=window.CG_COUNTER_CONFIG.endpoint;
    if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint)||!kinds.has(kind))return;
    if(location.hostname!=='cgshnc.github.io'||!location.pathname.startsWith('/Creative-gacha/'))return;
    try{
      fetch(endpoint,{
        method:'POST',mode:'no-cors',credentials:'omit',referrerPolicy:'no-referrer',
        headers:{'Content-Type':'text/plain;charset=UTF-8'},
        body:JSON.stringify({kind}),keepalive:true
      }).catch(()=>{});
    }catch{/* 集計先の障害でガチャを止めない。重複を避けるため自動再送しない。 */}
  }
  window.CGAnalytics=Object.freeze({draw});
})();
