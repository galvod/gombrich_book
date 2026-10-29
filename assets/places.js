(function(){
  const $=s=>document.querySelector(s);
  const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const KEY="gombrich-wishlist";
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch(e){return{};}};
  const save=w=>{try{localStorage.setItem(KEY,JSON.stringify(w));}catch(e){}};
  const gm=(en,city)=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(en+", "+city);
  let map=null,layer=null;
  function text(items){
    const by={};items.forEach(i=>{(by[i.city+", "+i.cn]=by[i.city+", "+i.cn]||[]).push(i);});
    return "Мои места: Гомбрих, История искусства\n\n"+Object.keys(by).sort().map(c=>c+"\n"+by[c].map(i=>"  • "+i.name+(i.en&&i.en!==i.ven?" ("+i.en+")":"")+"\n    "+i.v+" ("+i.ven+")"+(i.what?"; "+i.what.toLowerCase():"")+"\n    "+gm(i.ven,i.city)).join("\n")).join("\n\n")+"\n";
  }
  function draw(){
    const w=load(),items=Object.values(w);
    const list=$("#mplist"),mp=$("#mpmap");
    if(!items.length){mp.hidden=true;list.innerHTML='<p class="muted">Пока пусто. Открой карточку работы или здания в любой главе и нажми «Хочу увидеть».</p>';return;}
    const by={};items.forEach(i=>{const k=i.city+", "+i.cn;(by[k]=by[k]||[]).push(i);});
    list.innerHTML=Object.keys(by).sort().map(c=>`<h3 class="mp-city">${esc(c)}</h3>`+by[c].map(i=>`<div class="mp-item"><h4>${esc(i.name)}</h4>${i.en&&i.en!==i.ven?`<span class="names">${esc(i.en)}</span>`:""}<p class="small" style="margin:4px 0"><b>${esc(i.v)}</b> (${esc(i.ven)})${i.what?`<br><span class="muted">${esc(i.what)}</span>`:""}</p>${i.note?`<p class="small muted">${esc(i.note)}</p>`:""}<div class="links"><a class="lk" href="${gm(i.ven,i.city)}" target="_blank" rel="noopener">Google Карты</a>${i.site?`<a class="lk" href="${esc(i.site)}" target="_blank" rel="noopener">Сайт</a>`:""}<a class="lk" href="chapter-${i.ch}.html">Глава ${i.ch}</a><button type="button" class="lk" data-del="${esc(i.id)}" style="cursor:pointer">Убрать</button></div></div>`).join("")).join("");
    list.insertAdjacentHTML("beforeend",'<p class="small muted" style="margin-top:20px">Данные о местах проверены в октябре 2026. Экспозиции меняются, перед поездкой проверь на сайте музея.</p>');
    if(window.L){
      mp.hidden=false;
      if(!map){map=L.map("mpmap");L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© участники OpenStreetMap"}).addTo(map);}
      if(layer)layer.remove();layer=L.layerGroup().addTo(map);
      const seen={},pts=[];
      items.forEach(i=>{const k=i.lat+","+i.lng;(seen[k]=seen[k]||{i,names:[]}).names.push(i.name);});
      Object.values(seen).forEach(({i,names})=>{pts.push([i.lat,i.lng]);L.marker([i.lat,i.lng]).addTo(layer).bindPopup("<b>"+esc(i.v)+"</b><br>"+names.map(esc).join("<br>"));});
      map.fitBounds(pts,{padding:[30,30],maxZoom:12});
      setTimeout(()=>map.invalidateSize(),50);
    }
  }
  const msg=t=>{const m=$("#mpmsg");m.textContent=t;setTimeout(()=>{m.textContent="";},3000);};
  document.addEventListener("click",e=>{
    const d=e.target.closest("[data-del]");if(d){const w=load();delete w[d.dataset.del];save(w);draw();return;}
    if(e.target.id==="mpsave"){const items=Object.values(load());if(!items.length){msg("Список пуст");return;}
      const b=new Blob([text(items)],{type:"text/plain;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="moi-mesta.txt";document.body.appendChild(a);a.click();a.remove();msg("Файл сохранён");}
    if(e.target.id==="mpcopy"){const items=Object.values(load());if(!items.length){msg("Список пуст");return;}
      const t=text(items);(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>msg("Скопировано"),()=>{const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand("copy");msg("Скопировано");}catch(x){msg("Не получилось скопировать");}ta.remove();});}
  });
  draw();
})();
