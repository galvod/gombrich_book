(function(){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const by={};CHAPTERS.forEach(c=>by[c.n]=c);
  const total=CHAPTERS.length,ready=CHAPTERS.filter(c=>c.ready).length;
  let h=`<p class="muted small">Собрано глав: ${ready} из ${total}</p>`;
  ERAS.forEach(e=>{
    const list=e.n.map(n=>by[n]).filter(Boolean);
    h+=`<section class="era"><h2>${esc(e.t)} <small>главы ${e.n[0]}–${e.n[e.n.length-1]}</small></h2><div class="chgrid">`+
    list.map(c=>{
      const inner=`<span class="num">${c.n}</span><h3>${esc(c.t)}<span class="pill ${c.ready?"on":"off"}">${c.ready?"готово":"скоро"}</span></h3><span class="sub">${esc(c.s)}</span><p>${esc(c.d)}</p>`;
      return c.ready?`<a class="ch ready" href="${esc(c.page)}">${inner}</a>`:`<div class="ch soon">${inner}</div>`;
    }).join("")+`</div></section>`;
  });
  document.getElementById("eras").innerHTML=h;
})();
