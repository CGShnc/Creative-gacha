'use strict';
// ガチャの種類のみを送信。集計結果は公開しません。
window.CG_COUNTER_CONFIG = { endpoint: 'https://script.google.com/macros/s/AKfycbzEoeCZIHN633yvp21VehpdzTjmCENhx42buLoego8xuVMJyuGOXEcTaU_wun0V0RRZNQ/exec' };
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
