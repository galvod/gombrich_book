const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const KEY="gombrich"+D.meta.n+"-v1";
let store={st:{},nt:{},qz:{}};
try{const r=localStorage.getItem(KEY);if(r)store=Object.assign(store,JSON.parse(r));}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store));}catch(e){}}
const ENT={};
D.people.forEach(p=>ENT[p.id]={k:"person",o:p});
D.works.forEach(w=>ENT[w.id]={k:"work",o:w});
D.terms.forEach(t=>ENT[t.id]={k:"term",o:t});
D.blocks.forEach((b,i)=>{b.id="b"+(i+1);ENT[b.id]={k:"block",o:b};});
const STAT=[["1","Прочитала"],["2","Повторила"],["3","Слабо помню"]];
const SHORT=D.short;
const KINDL={place:"Место",culture:"Народ или культура",deity:"Божество"};
const kindLab=o=>KINDL[o.kind]||(o.ext?"Только упомянут":"Герой главы");
const fmtY=y=>y<0?String(-y).replace(/\B(?=(\d{3})+(?!\d))/g,"\u00a0")+" до н. э.":String(y);
function title(id){const e=ENT[id];if(!e)return id;return e.o.name||e.o.title||e.o.t;}
function lane(id){const e=ENT[id];return e&&e.o.lane?"l-"+e.o.lane:"";}
function chip(id){return `<button class="chip e ${lane(id)}" data-open="${id}"><span class="dot ${lane(id)}"></span>${esc(SHORT[id]||title(id))}</button>`;}
function chips(ids){return ids&&ids.length?`<div class="chips">${ids.map(chip).join("")}</div>`:"";}
function statusHTML(id){return `<div class="status" data-for="${id}" role="group" aria-label="Мой статус">${STAT.map(([s,l])=>`<button type="button" data-st="${id}" data-s="${s}" aria-pressed="false">${l}</button>`).join("")}</div>`;}
function refreshStatus(){
  $$(".status").forEach(g=>{const id=g.dataset.for;$$("button",g).forEach(b=>{const on=store.st[id]===b.dataset.s;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on);});});
  const bar=$("#prog");if(bar){const n=D.blocks.length,c=[0,0,0,0];D.blocks.forEach(b=>c[+(store.st[b.id]||0)]++);
    bar.innerHTML=[1,2,3].map(s=>`<i class="s${s}" style="width:${c[s]/n*100}%"></i>`).join("");
    const t=$("#progt");if(t)t.textContent=`Отмечено ${n-c[0]} из ${n}: прочитано ${c[1]}, повторено ${c[2]}, слабо помню ${c[3]}`;}
}
function wikiLink(w){return "https://commons.wikimedia.org/w/index.php?search="+encodeURIComponent(w.find)+"&ns6=1&ns0=1";}
function linksOf(id){const out=[];D.edges.forEach(([a,b,t,n])=>{if(a===id)out.push([b,t,n]);else if(b===id)out.push([a,t,n]);});return out;}
function sheetBodyBase(id){
  const e=ENT[id];if(!e)return"";const o=e.o;let h="";
  if(e.k==="person"){
    h+=`<div class="lab">${kindLab(o)} · <span class="dot ${lane(id)}"></span>${LANES[o.lane]}</div><h2>${esc(o.name)}</h2><p class="muted">${esc(o.years)} · ${esc(o.role)}</p>`;
    if(o.ext)h+=`<p class="ext">Вне главы: даты и роль из справочников, в тексте только упоминание.</p>`;
    h+=`<p>${esc(o.sum)}</p><p class="small muted">В книге: ${esc(o.ref)}</p>`;
    if(o.note)h+=`<div class="note">${esc(o.note)}</div>`;
    if(o.works.length)h+=`<div class="lab">Работы из главы</div>${chips(o.works)}`;
    const L=linksOf(id);if(L.length)h+=`<div class="lab">Связи</div>`+L.map(([x,t,n])=>`<p class="small"><span class="tag">${esc(t)}</span> ${chip(x)}<br>${esc(n)}</p>`).join("");
    const T=D.terms.filter(t=>t.ties.includes(id)).map(t=>t.id);if(T.length)h+=`<div class="lab">Термины</div>${chips(T)}`;
  }else if(e.k==="work"){
    const au=o.a?chip(o.a):esc(o.authorText||"");
    h+=`<div class="lab">Работа · ил. ${esc(o.ill)}</div><h2>${esc(o.title)}</h2><p class="muted">${au} ${esc(o.year)}</p>`;
    h+=`<p class="small muted">${esc(o.tech)} · ${esc(o.place)}</p><p>${esc(o.see)}</p>`;
    if(o.authorNote)h+=`<p class="small muted">${esc(o.authorNote)}</p>`;
    h+=`<div class="note">Картинка есть в твоей книге: ил. ${esc(o.ill)}. Чтобы посмотреть свободное изображение, <a href="${wikiLink(o)}" target="_blank" rel="noopener">найди в Wikimedia Commons</a>.</div>`;
    if(o.ties.length)h+=`<div class="lab">Связано с</div>${chips(o.ties)}`;
  }else if(e.k==="term"){
    h+=`<div class="lab">Термин</div><h2>${esc(o.name)}</h2><p>${esc(o.def)}</p><div class="lab">В этой главе</div><p>${esc(o.ch)}</p>${chips(o.ties)}`;
  }else{
    h+=`<div class="lab">Раздел главы</div><h2>${esc(o.t)}</h2><p>${esc(o.s)}</p>${chips(o.e)}${chips(o.w)}`;
  }
  h+=`<div class="lab" style="margin-top:14px">Мой статус</div>${statusHTML(id)}<div class="lab" style="margin-top:14px">Моя заметка</div><textarea id="nt" data-id="${id}" placeholder="Что хочу запомнить или проверить" aria-label="Моя заметка">${esc(store.nt[id]||"")}</textarea>`;
  return h;
}
let lastFocus=null;
function openSheet(id){
  const s=$("#sheet");lastFocus=document.activeElement;
  s.innerHTML=`<button class="x" id="sx" aria-label="Закрыть">×</button>`+sheetBody(id);
  s.classList.add("on");s.setAttribute("aria-hidden","false");$("#shade").hidden=false;refreshStatus();refreshWish();s.scrollTop=0;$("#sx").focus();
}
function closeSheet(){$("#sheet").classList.remove("on");$("#sheet").setAttribute("aria-hidden","true");$("#shade").hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus();if(cur==="notes")render.notes();}
function openLightbox(img){
  const fig=img.closest("figure"),cap=fig&&fig.querySelector("figcaption");
  let lb=$("#lb");if(!lb){lb=document.createElement("div");lb.id="lb";lb.setAttribute("role","dialog");lb.setAttribute("aria-label","Увеличенная картинка");document.body.appendChild(lb);}
  lb.innerHTML=`<button class="x" id="lbx" aria-label="Закрыть">×</button><img alt="${esc(img.alt)}"><div class="lbcap">${cap?cap.innerHTML:""}</div>`;
  const big=lb.querySelector("img");const back=img.currentSrc||img.src;
  if(img.dataset.c){big.onerror=()=>{big.onerror=null;big.src=back;};big.src=cUrl(img.dataset.c,1600);}else big.src=back;
  lb.classList.add("on");$("#lbx").focus();
}
function closeLightbox(){const lb=$("#lb");if(lb)lb.classList.remove("on");}
document.addEventListener("click",e=>{
  if(e.target.closest("#lb")){if(!e.target.closest("a"))closeLightbox();return;}
  const wb=e.target.closest("[data-wish]");if(wb){const w=wishLoad(),i=wb.dataset.wish;if(w[i])delete w[i];else if(WISH[i])w[i]=WISH[i];wishSave(w);refreshWish();return;}
  const zb=e.target.closest("[data-zoom]");if(zb){const im=$("#sheet figure.fig img");if(im)openLightbox(im);return;}
  const fi=e.target.closest("figure.fig img");
  if(fi&&!fi.closest("[data-open]")){if(fi.closest("#sheet"))openLightbox(fi);else if(fi.dataset.k)openSheet("img:"+fi.dataset.k);else openLightbox(fi);return;}
  const o=e.target.closest("[data-open]");if(o){openSheet(o.dataset.open);return;}
  const s=e.target.closest("[data-st]");if(s){const id=s.dataset.st;store.st[id]=store.st[id]===s.dataset.s?"":s.dataset.s;if(!store.st[id])delete store.st[id];save();refreshStatus();return;}
  if(e.target.id==="sx"||e.target.id==="shade")closeSheet();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&$("#lb")&&$("#lb").classList.contains("on")){closeLightbox();return;}
  if(e.key==="Escape"&&$("#sheet").classList.contains("on"))closeSheet();
  if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("svg [data-open]")){e.preventDefault();openSheet(e.target.dataset.open);}
});
let nt_timer;
document.addEventListener("input",e=>{
  if(e.target.id==="nt"){clearTimeout(nt_timer);const id=e.target.dataset.id,v=e.target.value;nt_timer=setTimeout(()=>{if(v.trim())store.nt[id]=v;else delete store.nt[id];save();},300);}
});
/* вкладки */
const TABS=[["map","Карта главы"],["time","Лента времени"],["people","Люди"],["works","Работы"],["terms","Термины"],["graph","Связи"],["compare","Сравнение"],["themes","Темы"],["wide","Шире книги"],["quiz","Тренажёр"],["credits","Источники"],["notes","Мои отметки"]];
const render={};let cur="map",built={};
function buildTabs(){$("#tabs").innerHTML=TABS.map(([k,l])=>`<a href="#${k}" data-tab="${k}">${l}</a>`).join("");}
function show(k){
  if(!TABS.some(t=>t[0]===k)&&k!=="search")k="map";
  cur=k;$$(".view").forEach(v=>v.classList.toggle("on",v.id==="v-"+k));
  $$("#tabs a").forEach(a=>{if(a.dataset.tab===k)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current");});
  if(render[k])render[k]();refreshStatus();
}
window.addEventListener("hashchange",()=>{const k=location.hash.slice(1);if(k&&k!==cur){$("#q").value="";show(k);window.scrollTo(0,0);}});
/* поиск */
function norm(s){return String(s).toLowerCase().replace(/ё/g,"е");}
$("#q").addEventListener("input",e=>{
  const q=norm(e.target.value.trim());
  if(q.length<2){show(location.hash.slice(1)||"map");return;}
  const res=[];
  Object.keys(ENT).forEach(id=>{const x=ENT[id],o=x.o;const hay=norm([D.en[o.id],D.alt[o.id],o.name,o.title,o.t,o.sum,o.see,o.def,o.ch,o.s,o.ref,o.role,o.ill?("ил. "+o.ill+" ил "+o.ill+" "+o.ill):"",(o.tags||[]).join(" "),o.year,o.years,o.place,o.genre].filter(Boolean).join(" "));if(hay.includes(q))res.push(id);});
  const v=$("#v-search");
  v.innerHTML=`<h2>Поиск</h2><p class="muted">Найдено: ${res.length}</p>`+(res.length?`<div class="grid">${res.map(id=>cardFor(id)).join("")}</div>`:`<p>Ничего не нашлось. Попробуй фамилию, жанр («портрет») или номер иллюстрации.</p>`);
  show("search");
});
function portraitThumb(id){
  const k=D.personImg[id],m=k&&D.img[k];
  if(m)return `<img class="pth" loading="lazy" src="images/ch${D.meta.n}/${esc(m.f)}" data-c="${esc(m.c)}" data-w="300" data-s="0" alt="${esc(m.cap)}">`;
  if(ENT[id]&&ENT[id].o.kind)return "";
  return `<span class="pth none" title="${esc((D.noPortrait&&D.noPortrait[id])||"")}">нет портрета</span>`;
}
function cardFor(id){
  const e=ENT[id],o=e.o;
  if(e.k==="person")return `<button class="card btn pcard" data-open="${id}">${portraitThumb(id)}<h3>${esc(o.name)}</h3>${D.en[o.id]?`<span class="names">${esc(D.en[o.id])}</span>`:""}<span class="small muted yrs">${esc(o.years)}</span><span class="small muted">${esc(o.role)}</span><span class="lab pst"><span class="dot ${lane(id)}"></span>${kindLab(o)}</span></button>`;
  if(e.k==="work")return `<button class="card btn" data-open="${id}"><span class="lab"><span class="dot ${lane(id)}"></span>ил. ${esc(o.ill)} · ${esc(o.year)}</span>${D.workImg[id]?imgFig(D.workImg[id]).replace(/<figcaption>.*<\/figcaption>/,""):""}<h3>${esc(o.title)}</h3>${D.en[o.id]?`<span class="names">${esc(D.en[o.id])}</span>`:""}<span class="small muted">${esc(o.a?title(o.a):(o.authorText||""))}</span></button>`;
  if(e.k==="term")return `<button class="card btn" data-open="${id}"><span class="lab">Термин</span><h3>${esc(o.name)}</h3><span class="small muted">${esc(o.def)}</span></button>`;
  return `<button class="card btn" data-open="${id}"><span class="lab">Раздел главы</span><h3>${esc(o.t)}</h3><span class="small muted">${esc(o.s)}</span></button>`;
}
/* ссылки и картинки */
const WP=(lang,t)=>"https://"+lang+".wikipedia.org/wiki/"+encodeURIComponent(t.replace(/ /g,"_"));
const COM=q=>"https://commons.wikimedia.org/w/index.php?search="+encodeURIComponent(q)+"&ns6=1&ns0=1";
const GAC=q=>"https://artsandculture.google.com/search?q="+encodeURIComponent(q);
const cfile=n=>n.replace(/ /g,"_");
const cUrl=(n,w)=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(cfile(n))+(w?"?width="+w:"");
const cPage=n=>"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(cfile(n));
function imgFig(key,note){
  const m=D.img[key];if(!m)return"";
  return `<figure class="fig"><img loading="lazy" src="images/ch${D.meta.n}/${esc(m.f)}" data-c="${esc(m.c)}" data-k="${esc(key)}" data-s="0" alt="${esc(m.cap)}"><figcaption>${note?`<b>${esc(m.cap)}.</b> ${esc(note)}<br>`:esc(m.cap)+". "}${esc(m.by)}, ${esc(m.lic)}. <a href="${cPage(m.c)}" target="_blank" rel="noopener">Файл на Commons</a></figcaption></figure>`;
}
/* картинка не нашлась рядом: берём с Commons, а если и там нет, показываем заглушку */
document.addEventListener("error",e=>{
  const t=e.target;if(!t||t.tagName!=="IMG"||!t.dataset.c)return;
  if(t.dataset.s==="0"){t.dataset.s="1";t.src=cUrl(t.dataset.c,+t.dataset.w||900);}
  else if(t.dataset.s==="1"&&t.classList.contains("pth")){t.dataset.s="2";const d=document.createElement("span");d.className="pth none";d.textContent="нет портрета";t.replaceWith(d);}
  else if(t.dataset.s==="1"){t.dataset.s="2";const d=document.createElement("div");d.className="nofile";d.innerHTML='Картинка не загрузилась. <a href="'+cPage(t.dataset.c)+'" target="_blank" rel="noopener">Открыть на Commons</a>';t.replaceWith(d);}
},true);
function linkRow(id,extra){
  const L=[],w=D.wp[id],en=D.en[id],e=ENT[id];
  if(w){if(w[1])L.push(["Википедия RU",WP("ru",w[1])]);L.push(["Wikipedia EN",WP("en",w[0])]);}
  const q=(e&&e.o.find)||en||(e&&title(id));
  if(q){L.push(["Фото в Commons",COM(q)]);L.push(["Google Arts & Culture",GAC(en||q)]);}
  (D.site[id]||[]).forEach(x=>L.push(x));(extra||[]).forEach(x=>L.push(x));
  return L.length?`<div class="links">${L.map(([t,u])=>`<a class="lk" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</div>`:"";
}
function imageSheetBody(key){
  const m=D.img[key];if(!m)return"";
  const txt=(D.imgText&&D.imgText[key])||"";
  const works=Object.entries(D.workImg).filter(([w,k])=>k===key).map(([w])=>w);
  const blocks=Object.entries(D.blockImg).filter(([b,L])=>L.some(x=>x[0]===key)).map(([b])=>b);
  const ppl=[...new Set(works.map(w=>ENT[w]&&ENT[w].o.a).filter(Boolean))];
  let h=`<div class="lab">Картинка</div><h2>${esc(m.cap)}</h2>${imgFig(key)}<button type="button" class="zoombtn" data-zoom="1">Увеличить</button>`;
  h+=`<div class="lab" style="margin-top:14px">Что на картинке</div><p>${esc(txt||"Описание пока не написано.")}</p>`;
  if(works.length)h+=`<div class="lab">Работа из книги</div>${chips(works)}`;
  if(ppl.length)h+=`<div class="lab">Автор</div>${chips(ppl)}`;
  if(blocks.length)h+=`<div class="lab">Где встречается в главе</div>${chips(blocks)}`;
  const wk=D.where&&D.where[key]?key:works.find(w=>D.where&&D.where[w]);
  if(wk)h+=whereBlock(wk,works.length&&ENT[works[0]]?ENT[works[0]].o.title:m.cap,D.en[wk]);
  else h+=`<div class="lab">Где это сейчас</div><div class="where"><p class="small muted">Место хранения я пока не проверил. Найди его в каталоге музея или в поиске.</p><div class="links"><a class="lk" href="https://www.google.com/search?q=${encodeURIComponent((D.en[works[0]]||m.cap)+" museum collection")}" target="_blank" rel="noopener">Искать в Google</a></div></div>`;
  return h;
}
/* места и «Хочу увидеть»: общий список на все главы лежит в браузере под одним ключом */
const WKEY="gombrich-wishlist",WDATE="октябрь 2026";
function wishLoad(){try{return JSON.parse(localStorage.getItem(WKEY))||{};}catch(e){return{};}}
function wishSave(w){try{localStorage.setItem(WKEY,JSON.stringify(w));}catch(e){}}
const gmaps=q=>"https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(q);
const WISH={};
const KIND_TXT={"":"Оригинал сейчас здесь",bldg:"Здание находится здесь",print:"Оттиски гравюры хранятся здесь",copy:"Показанная версия здесь"};
function whereBlock(wid,name,en,label){
  label=label||"Где это сейчас";
  const r=D.where&&D.where[wid];if(!r)return"";
  const kind=r[1]||"",note=r[2]||"",v=r[0]?D.venues[r[0]]:null;
  if(!v)return `<div class="lab">${esc(label)}</div><div class="where"><p><b>Частная коллекция</b></p>${note?`<p class="small muted">${esc(note)}</p>`:""}</div>`;
  const id=D.meta.n+":"+wid;
  WISH[id]={id,ch:D.meta.n,name,en:en||"",what:KIND_TXT[kind]||"",v:v.n,ven:v.en,city:v.city,cn:v.cn,lat:v.lat,lng:v.lng,site:v.site,note};
  return `<div class="lab">${esc(label)}</div><div class="where"><p class="small muted" style="margin:0">${esc(KIND_TXT[kind]||"")}</p><p style="margin:2px 0"><b>${esc(v.n)}</b><span class="names">${esc(v.en)}</span>${esc(v.city)}, ${esc(v.cn)}</p>${note?`<p class="small muted">${esc(note)}</p>`:""}
  <div class="links"><a class="lk" href="${gmaps(v.en+", "+v.city)}" target="_blank" rel="noopener">Google Карты</a>${v.site?`<a class="lk" href="${esc(v.site)}" target="_blank" rel="noopener">Сайт</a>`:""}</div>
  <button type="button" class="wishbtn" data-wish="${esc(id)}" aria-pressed="false">Хочу увидеть</button>
  <p class="small muted" style="margin-top:6px">По данным на ${WDATE}. Экспозиции меняются, перед поездкой проверь на сайте.</p></div>`;
}
function personWhere(id,en){
  const o=ENT[id].o,k=D.personImg[id],W=D.where||{};let h="";
  if(k&&D.img[k]){
    const wk=W[k]?k:Object.entries(D.workImg||{}).filter(([w,i])=>i===k).map(x=>x[0]).find(w=>W[w]);
    const lab=o.kind?"Где это сейчас":"Где хранится портрет";
    if(wk)h+=whereBlock(wk,(o.kind?"":"Портрет: ")+o.name,en,lab);
    else h+=`<div class="lab">${lab}</div><div class="where"><p class="small muted">Место хранения я пока не проверил. Найди его в каталоге музея или в поиске.</p><div class="links"><a class="lk" href="https://www.google.com/search?q=${encodeURIComponent((en||o.name)+" portrait museum collection")}" target="_blank" rel="noopener">Искать в Google</a></div></div>`;
  }
  const seen={},rows=[];
  (o.works||[]).forEach(w=>{const r=W[w];if(!r||!r[0]||seen[r[0]])return;seen[r[0]]=1;const v=D.venues[r[0]];if(!v)return;const e=ENT[w];
    rows.push(`<li><b>${esc(v.n)}</b> <span class="muted small">${esc(v.city)}, ${esc(v.cn)}</span><br><span class="small">${esc(e?e.o.title:w)}</span><div class="links"><a class="lk" href="${gmaps(v.en+", "+v.city)}" target="_blank" rel="noopener">Google Карты</a>${venueWish(r[0],KIND_TXT[r[1]||""])}</div></li>`);});
  if(rows.length)h+=`<div class="lab">Работы на карте</div><ul class="small" style="padding-left:18px">${rows.join("")}</ul>`;
  return h;
}
function venueWish(vk,what){
  const v=D.venues[vk],id=D.meta.n+":v:"+vk;
  WISH[id]={id,ch:D.meta.n,name:v.n,en:v.en,what:what||"Место для поездки",v:v.n,ven:v.en,city:v.city,cn:v.cn,lat:v.lat,lng:v.lng,site:v.site,note:""};
  return `<button type="button" class="wishbtn" data-wish="${esc(id)}" aria-pressed="false">Хочу увидеть</button>`;
}
function refreshWish(){
  const w=wishLoad(),n=Object.keys(w).length;
  $$("[data-wish]").forEach(b=>{const on=!!w[b.dataset.wish];b.setAttribute("aria-pressed",on);b.textContent=on?"✓ Хочу увидеть":"Хочу увидеть";b.classList.toggle("on",on);});
  $$(".mylink").forEach(a=>a.textContent="Мои места"+(n?" ("+n+")":""));
}
function sheetBody(id){
  if(id.startsWith("img:"))return imageSheetBody(id.slice(4));
  let h=sheetBodyBase(id);const en=D.en[id],k=D.personImg[id]||D.workImg[id];
  const add=(en?`<span class="names">${esc(en)}</span>`:"")+(k?imgFig(k):"");
  h=h.replace("</h2>","</h2>"+add);
  const lr=linkRow(id),wh=ENT[id]&&(ENT[id].k==="work"||(ENT[id].k==="person"&&ENT[id].o.kind==="place"))?whereBlock(id,ENT[id].o.title||ENT[id].o.name,en):(ENT[id]&&ENT[id].k==="person"?personWhere(id,en):"");
  if(lr||wh)h=h.replace('<div class="lab" style="margin-top:14px">Мой статус',(lr?'<div class="lab">Посмотреть и прочитать</div>'+lr:"")+wh+'<div class="lab" style="margin-top:14px">Мой статус');
  return h;
}
render.wide=function(){
  const v=$("#v-wide");
  v.innerHTML=`<h2>Шире книги</h2><p class="lead">${esc(D.meta.wideLead)}</p>
  <div class="chips">${D.wide.map(s=>`<a class="chip" href="#wide-${s.id}" data-jump="wide-${s.id}">${esc(s.t.split(":")[0])}</a>`).join("")}<a class="chip" href="#wide-places" data-jump="wide-places">Куда поехать</a><a class="chip" href="#wide-ctx" data-jump="wide-ctx">Что вокруг</a></div>`+
  D.wide.map(s=>`<section class="wide-sec" id="wide-${s.id}"><h3>${esc(s.t)}</h3><p class="muted">${esc(s.lead)}</p><div class="gal">${s.items.map(it=>`<div class="card">${imgFig(it.img)}<b>${esc(it.t)}</b><span class="names">${esc(it.en)}</span><p class="small" style="margin:6px 0">${esc(it.n)}</p><div class="links">${it.wp[1]?`<a class="lk" href="${WP("ru",it.wp[1])}" target="_blank" rel="noopener">Википедия RU</a>`:""}<a class="lk" href="${WP("en",it.wp[0])}" target="_blank" rel="noopener">Wikipedia EN</a><a class="lk" href="${GAC(it.en)}" target="_blank" rel="noopener">Google Arts &amp; Culture</a>${(it.extra||[]).map(([t,u])=>`<a class="lk" href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a>`).join("")}</div></div>`).join("")}</div></section>`).join("")+
  `<section class="wide-sec" id="wide-places"><h3>Куда поехать и где смотреть оригиналы</h3><div class="scroll"><table><thead><tr><th>Место</th><th>Что там</th><th>Сайт</th><th></th></tr></thead><tbody>${D.places.map(p=>`<tr><td>${esc(p[0])}<span class="names">${esc(p[1])}</span></td><td>${esc(p[3])}</td><td><div class="links" style="margin:0"><a class="lk" href="${esc(p[2])}" target="_blank" rel="noopener">Сайт</a></div></td><td>${p[4]?venueWish(p[4]):""}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="wide-sec" id="wide-ctx"><h3>Что происходило вокруг</h3><p class="muted">Даты из справочников, в главе их нет.</p><div class="scroll"><table class="ctx"><tbody>${D.ctx.map(r=>`<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div></section>`;
  refreshWish();
  $$("[data-jump]",v).forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const t=document.getElementById(a.dataset.jump);if(t)t.scrollIntoView({behavior:"smooth",block:"start"});}));
};
render.credits=function(){
  const keys=Object.keys(D.img);
  $("#v-credits").innerHTML=`<h2>Источники изображений</h2><p class="muted">Все картинки с Wikimedia Commons. Работы старых мастеров находятся в общественном достоянии, фотографии используются на условиях указанных лицензий. Если картинка не открылась, нажми на ссылку файла.</p><div class="scroll"><table class="credits"><thead><tr><th>Что</th><th>Автор</th><th>Лицензия</th><th>Файл</th></tr></thead><tbody>${keys.map(k=>{const m=D.img[k];return `<tr><td>${esc(m.cap)}</td><td>${esc(m.by)}</td><td>${esc(m.lic)}</td><td><a href="${cPage(m.c)}" target="_blank" rel="noopener">Commons</a></td></tr>`;}).join("")}</tbody></table></div>`;
};
function blockIllus(id){
  const L=D.blockImg[id];if(!L||!L.length)return"";
  return `<div class="ills">${L.map(([k,n])=>imgFig(k,n)).join("")}</div>`;
}
function filterChips(id,opts,sel){return `<div class="chips" id="${id}">${opts.map(([k,l])=>`<button type="button" class="chip${k===sel?" on":""}" data-f="${k}">${l}</button>`).join("")}</div>`;}
function bindFilter(id,fn){$$("#"+id+" .chip").forEach(b=>b.addEventListener("click",()=>{$$("#"+id+" .chip").forEach(x=>x.classList.toggle("on",x===b));fn(b.dataset.f);}));}
const LANE_OPTS=[["all","Все"]].concat(Object.keys(LANES).map(k=>[k,`<span class="dot l-${k}"></span> ${D.laneShort[k]}`]));

render.map=function(){
  $("#v-map").innerHTML=`<div class="lab">Глава ${D.meta.n} · ${esc(D.meta.sub)}</div><h1>${esc(D.meta.title)}</h1>
  <p class="lead" style="margin-top:10px">${esc(D.idea)}</p>
  <div class="note"><b>Как пользоваться.</b> Читай главу в бумажной книге, а здесь проверяй имена и связи. Нажми на любое имя, работу или термин, чтобы открыть карточку, и отмечай, что прочитала, повторила или помнишь слабо.</div>
  <div class="card" style="margin-top:16px"><div class="lab">Мой прогресс по главе</div><div class="prog" id="prog" style="margin:8px 0"></div><div class="small muted" id="progt"></div></div>
  <h2 style="margin-top:28px">Как устроена глава</h2><p class="muted">Разделы идут в том порядке, в каком они встречаются в тексте.</p>
  <ol class="steps">${D.blocks.map((b,i)=>`<li class="step"><span class="n">${i+1}</span><div><h3><button type="button" class="steplink" data-open="${b.id}">${esc(b.t)}</button></h3><p class="small" style="margin:4px 0">${esc(b.s)} <button type="button" class="steplink more" data-open="${b.id}">Подробнее →</button></p>${chips(b.e.concat(b.w))}${blockIllus(b.id)}${statusHTML(b.id)}</div></li>`).join("")}</ol>
  <h2 style="margin-top:28px">Вопросы, с которыми удобно читать</h2>
  <div class="grid">${D.questions.map(([q,a])=>`<div class="card"><b>${esc(q)}</b><p class="small muted" style="margin:6px 0 0">${esc(a)}</p></div>`).join("")}</div>`;
};

render.time=function(){
  const v=$("#v-time");
  v.innerHTML=`<h2>Лента времени</h2><p class="muted">${esc(D.meta.time.lead||"Жизнь героев главы и тех, кто только упомянут. Цвет показывает страну, толстая полоса — герой главы, тонкая — только упомянут.")} Точки на строках: работы из главы. ${esc(D.meta.time.note)}</p>
  ${filterChips("tf",LANE_OPTS,"all")}<div class="chips"><label class="small"><input type="checkbox" id="tonly"> только герои главы, без упомянутых</label></div>
  <div class="scroll"><div id="tsvg"></div></div>
  <h3 style="margin-top:24px">События и даты из главы</h3>
  <p class="muted small">Знак ┆ рядом с годом означает, что эта дата отмечена пунктирной линией на графике.</p>
  <div class="scroll"><table><thead><tr><th>Год</th><th>Что</th><th>Заметка</th></tr></thead><tbody>${D.events.map(e=>`<tr><td>${fmtY(e.y)}${(D.meta.time.marks||[]).includes(e.y)?` <span class="small" style="color:var(--accent)" title="Эта дата отмечена пунктиром на графике">┆</span>`:""}</td><td><span class="dot l-${e.lane}"></span>${esc(e.t)}</td><td>${esc(e.n)}</td></tr>`).join("")}</tbody></table></div>`;
  let fl="all";const draw=()=>{
    const only=$("#tonly").checked;
    const P=D.people.filter(p=>p.kind!=="place"&&p.kind!=="deity"&&(fl==="all"||p.lane===fl)&&(!only||!p.ext)).sort((a,b)=>a.b-b.b);
    const X0=160,X1=980,Y0=D.meta.time.y0,Y1=D.meta.time.y1,rh=24,top=54,H=top+P.length*rh+16;
    const x=y=>X0+(Math.min(Math.max(y,Y0),Y1)-Y0)/(Y1-Y0)*(X1-X0);
    let s=`<svg viewBox="0 0 1000 ${H}" width="100%" style="min-width:820px" role="img" aria-label="Годы жизни героев главы">`;
    for(let y=D.meta.time.t0;y<=D.meta.time.y1;y+=D.meta.time.step)s+=`<line x1="${x(y)}" x2="${x(y)}" y1="${top-8}" y2="${H-10}" stroke="var(--line)"/><text x="${x(y)}" y="40" font-size="11" text-anchor="middle" class="g">${fmtY(y)}</text>`;
    D.meta.time.marks.forEach((y,mi,arr)=>{const lb=(D.meta.time.markLabels||{})[y]||String(y),xx=x(y),nx=arr[mi+1]!=null?x(arr[mi+1]):null,end=xx>700||(nx!=null&&nx-xx<300);s+=`<line x1="${xx}" x2="${xx}" y1="8" y2="${H-10}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="4 3"/><text x="${xx+(end?-5:5)}" y="18" font-size="11.5" font-weight="700" text-anchor="${end?"end":"start"}" fill="var(--accent)">${esc(lb)}</text>`;});
    P.forEach((p,i)=>{const cy=top+i*rh+rh/2,col=`var(--${p.lane})`;
      s+=`<g data-open="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)} ${esc(p.years)}" style="cursor:pointer"><rect x="0" y="${cy-rh/2}" width="1000" height="${rh}" fill="transparent"/><text x="152" y="${cy+4}" font-size="12" text-anchor="end"${p.ext?' class="g"':""}>${esc(SHORT[p.id]||p.name)}</text><rect x="${x(p.b)}" y="${cy-(p.ext?4:6)}" width="${Math.max(4,x(p.d)-x(p.b))}" height="${p.ext?8:12}" rx="4" fill="${col}" opacity=".9"/></g>`;
      D.works.filter(w=>w.a===p.id).forEach(w=>{const yr=w.yr!=null?w.yr:parseInt((w.year.match(/\d{4}/)||[0])[0]);if(yr)s+=`<circle cx="${x(yr)}" cy="${cy}" r="4.5" fill="var(--surface)" stroke="${col}" stroke-width="2.5" data-open="${w.id}" tabindex="0" role="button" aria-label="${esc(w.title)}" style="cursor:pointer"><title>ил. ${esc(w.ill)}: ${esc(w.title)}, ${esc(w.year)}</title></circle>`;});
    });
    $("#tsvg").innerHTML=s+"</svg>";
  };
  bindFilter("tf",f=>{fl=f;draw();});$("#tonly").addEventListener("change",draw);draw();
};

render.people=function(){
  const v=$("#v-people");
  v.innerHTML=`<h2>${esc(D.meta.peopleTitle||"Люди")}</h2><p class="muted">${esc(D.meta.peopleLead||"Герои главы и те, на кого она ссылается. Подпись «Только упомянут» значит, что человека нет в основном сюжете главы. Цвет точки показывает страну или школу, как на кнопках ниже.")}</p>${filterChips("pf",LANE_OPTS,"all")}<div class="chips"><label class="small"><input type="checkbox" id="ponly"> только герои главы</label></div><div class="grid" id="pg"></div>`;
  let fl="all";const draw=()=>{const only=$("#ponly").checked;$("#pg").innerHTML=D.people.filter(p=>(fl==="all"||p.lane===fl)&&(!only||!p.ext)).map(p=>cardFor(p.id)).join("");};
  bindFilter("pf",f=>{fl=f;draw();});$("#ponly").addEventListener("change",draw);draw();
};

render.works=function(){
  const tags=[...new Set(D.works.flatMap(w=>w.tags))].sort();
  $("#v-works").innerHTML=`<h2>Работы из главы</h2><p class="muted">Все иллюстрации главы по порядку. Номер «ил.» совпадает с номером в твоей книге.</p>${filterChips("wf",[["all","Все"]].concat(tags.map(t=>[t,t])),"all")}<div class="grid" id="wg"></div>`;
  let fl="all";const draw=()=>{$("#wg").innerHTML=D.works.filter(w=>fl==="all"||w.tags.includes(fl)).map(w=>cardFor(w.id)).join("");};
  bindFilter("wf",f=>{fl=f;draw();});draw();
};

render.terms=function(){
  $("#v-terms").innerHTML=`<h2>Термины</h2><p class="muted">Слова, которые встречаются в главе, и то, как они там работают.</p><div class="grid">${D.terms.map(t=>`<button class="card btn" data-open="${t.id}"><h3>${esc(t.name)}</h3><span class="small">${esc(t.def)}</span></button>`).join("")}</div>`;
};
const LANE_SHORT=D.laneShort;
const ETYPE={"влияние":["var(--accent)",""],"сравнение":["var(--fr)","6 4"],"соперники":["var(--bad)",""],"круг":["var(--muted)","2 4"]};
let gsel=null,gtype="all";
render.graph=function(){
  const v=$("#v-graph");
  if(!v.dataset.built){
    v.dataset.built="1";
    v.innerHTML=`<h2>Связи</h2><p class="muted">Слева направо время, сверху вниз страны. Нажми на имя, чтобы увидеть только его связи.</p>
    ${filterChips("gf",[["all","Все связи"]].concat(Object.keys(ETYPE).map(k=>[k,k])),"all")}
    <div class="row small" style="margin:4px 0 10px">${Object.entries(ETYPE).map(([k,[c,d]])=>`<span><svg width="30" height="8" aria-hidden="true"><line x1="0" x2="30" y1="4" y2="4" stroke="${c}" stroke-width="2.5" stroke-dasharray="${d}"/></svg> ${k}</span>`).join("")}</div>
    <div class="scroll"><div id="gsvg"></div></div><div id="glist" style="margin-top:18px"></div>`;
    bindFilter("gf",f=>{gtype=f;drawGraph();});
  }
  drawGraph();
};
function layoutGraph(){
  const X0=70,X1=930,Y0=D.meta.graph.y0,Y1=D.meta.graph.y1,xs=y=>X0+(y-Y0)/(Y1-Y0)*(X1-X0);
  const pos={},laneInfo={};let y=34;
  Object.keys(LANES).forEach(L=>{
    const P=D.people.filter(p=>p.lane===L).sort((a,b)=>a.gx-b.gx),rows=[];
    P.forEach(p=>{const w=(SHORT[p.id]||p.name).length*7.4+20,cx=xs(p.gx);let r=rows.findIndex(e=>cx-w/2>=e+8);if(r<0){r=rows.length;rows.push(-1e9);}rows[r]=cx+w/2;pos[p.id]={x:cx,r,w};});
    const n=Math.max(rows.length,1),h=n*32+26;laneInfo[L]={y,h};P.forEach(p=>{pos[p.id].y=y+22+pos[p.id].r*32;});y+=h;
  });
  return {pos,laneInfo,H:y+8,xs};
}
function drawGraph(){
  const {pos,laneInfo,H,xs}=layoutGraph();
  let s=`<svg viewBox="0 0 1000 ${H}" width="100%" style="min-width:860px" role="img" aria-label="Граф связей между героями главы">`;
  Object.keys(LANES).forEach((L,i)=>{const li=laneInfo[L];s+=`<rect x="0" y="${li.y}" width="1000" height="${li.h}" fill="var(--${L})" opacity="${i%2?.05:.09}"/><text x="8" y="${li.y+15}" font-size="11" font-weight="700" style="letter-spacing:.06em;text-transform:uppercase" fill="var(--${L})">${LANE_SHORT[L]}</text>`;});
  for(let yr=D.meta.graph.t0;yr<=D.meta.graph.y1;yr+=D.meta.graph.step)s+=`<line x1="${xs(yr)}" x2="${xs(yr)}" y1="24" y2="${H-6}" stroke="var(--line)" stroke-dasharray="2 4"/><text x="${xs(yr)}" y="14" font-size="11" text-anchor="middle" class="g">${fmtY(yr)}</text>`;
  const rel=(a,b)=>!gsel||a===gsel||b===gsel;
  D.edges.forEach(([a,b,t])=>{
    if(gtype!=="all"&&gtype!==t)return;const A=pos[a],B=pos[b];if(!A||!B)return;
    const mx=(A.x+B.x)/2,my=(A.y+B.y)/2,dx=B.x-A.x,dy=B.y-A.y,len=Math.hypot(dx,dy)||1,off=Math.min(40,len*.18);
    const cx=mx-dy/len*off,cy=my+dx/len*off,[col,dash]=ETYPE[t];
    s+=`<path d="M${A.x},${A.y} Q${cx},${cy} ${B.x},${B.y}" fill="none" stroke="${col}" stroke-width="${rel(a,b)&&gsel?2.6:1.6}" stroke-dasharray="${dash}" opacity="${rel(a,b)?(gsel?.95:.55):.07}"/>`;
  });
  D.people.forEach(p=>{const P=pos[p.id],lab=SHORT[p.id]||p.name,sel=gsel===p.id;
    const linked=!gsel||sel||D.edges.some(([a,b])=>(a===gsel&&b===p.id)||(b===gsel&&a===p.id));
    s+=`<g data-sel="${p.id}" tabindex="0" role="button" aria-label="${esc(p.name)}" style="cursor:pointer" opacity="${linked?1:.25}"><rect x="${P.x-P.w/2}" y="${P.y-12}" width="${P.w}" height="24" rx="12" fill="${sel?`var(--${p.lane})`:"var(--surface)"}" stroke="var(--${p.lane})" stroke-width="2"/><text x="${P.x}" y="${P.y+4}" font-size="12" font-weight="${p.ext?500:700}" text-anchor="middle" fill="${sel?"var(--surface)":"var(--ink)"}">${esc(lab)}</text></g>`;});
  $("#gsvg").innerHTML=s+"</svg>";
  $$("#gsvg [data-sel]").forEach(g=>{const f=()=>{gsel=gsel===g.dataset.sel?null:g.dataset.sel;drawGraph();};g.addEventListener("click",f);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();f();}});});
  const L=D.edges.filter(([a,b,t])=>(gtype==="all"||gtype===t)&&(!gsel||a===gsel||b===gsel));
  $("#glist").innerHTML=`<h3>${gsel?"Связи: "+esc(title(gsel)):"Все связи"} <span class="muted small">(${L.length})</span></h3>${gsel?`<p><button class="btn ghost" data-open="${gsel}">Открыть карточку</button> <button class="btn ghost" id="gclr">Показать все</button></p>`:""}<div class="scroll"><table><thead><tr><th>Кто</th><th>Тип</th><th>С кем</th><th>Что говорит глава</th></tr></thead><tbody>${L.map(([a,b,t,n])=>`<tr><td>${chip(a)}</td><td><span class="tag">${t}</span></td><td>${chip(b)}</td><td>${esc(n)}</td></tr>`).join("")}</tbody></table></div>`;
  const c=$("#gclr");if(c)c.addEventListener("click",()=>{gsel=null;drawGraph();});
}

let cmpSel="c1";
render.compare=function(){
  const v=$("#v-compare");const wopts=D.works.map(w=>`<option value="${w.id}">ил. ${esc(w.ill)}. ${esc(w.title)}</option>`).join("");
  v.innerHTML=`<h2>Сравнение рядом</h2><p class="muted">Готовые пары из главы и свободное сравнение двух работ.</p>
  <div class="chips" id="cf">${D.compares.map(c=>`<button type="button" class="chip${c.id===cmpSel?" on":""}" data-f="${c.id}">${esc(c.t)}</button>`).join("")}<button type="button" class="chip${cmpSel==="free"?" on":""}" data-f="free">Свои две работы</button></div>
  <div id="cbody"></div>`;
  const draw=()=>{
    const b=$("#cbody");
    if(cmpSel==="free"){
      b.innerHTML=`<div class="row" style="margin:10px 0"><select id="ca" aria-label="Первая работа">${wopts}</select><span class="muted">и</span><select id="cb" aria-label="Вторая работа">${wopts}</select></div><div id="ctab"></div>`;
      $("#ca").value=D.meta.cmp[0];$("#cb").value=D.meta.cmp[1];
      const f=()=>{const A=ENT[$("#ca").value].o,B=ENT[$("#cb").value].o;const nm=o=>o.a?title(o.a):(o.authorText||"");
        const rows=[["Автор",nm(A),nm(B)],["Год",A.year,B.year],["Жанр",A.genre,B.genre],["Техника",A.tech,B.tech],["Место",A.place,B.place],["Что смотреть",A.see,B.see]];
        $("#ctab").innerHTML=tableCmp("ил. "+A.ill+". "+A.title,"ил. "+B.ill+". "+B.title,rows);};
      $("#ca").addEventListener("change",f);$("#cb").addEventListener("change",f);f();
    }else{const c=D.compares.find(x=>x.id===cmpSel);b.innerHTML=`<h3 style="margin:14px 0 8px">${esc(c.t)}</h3>`+tableCmp(c.a,c.b,c.rows);}
  };
  bindFilter("cf",f=>{cmpSel=f;draw();});draw();
};
function tableCmp(a,b,rows){return `<div class="scroll"><table><thead><tr><th></th><th>${esc(a)}</th><th>${esc(b)}</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>`;}

render.themes=function(){
  $("#v-themes").innerHTML=`<h2>Сквозные темы</h2><p class="muted">Одна и та же идея в разных примерах главы. Хорошо работает как план для повторения.</p><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">${D.themes.map(t=>`<div class="card"><h3>${esc(t.t)}</h3><p class="small muted">${esc(t.q)}</p>${t.items.map(([id,txt])=>`<p class="small" style="margin:0 0 6px">${chip(id)} ${esc(txt)}</p>`).join("")}<div class="note small">${esc(t.more)}</div></div>`).join("")}</div>`;
};
let QZ={order:null,i:0,score:0,done:false,wrong:[]};
function qzStart(ids){QZ={order:ids||D.quiz.map((_,i)=>i),i:0,score:0,done:false,wrong:[]};}
render.quiz=function(){
  const v=$("#v-quiz");if(!QZ.order)qzStart();
  const last=store.qz&&store.qz.last!=null?`<p class="small muted">Прошлый результат: ${store.qz.last} из ${D.quiz.length}.</p>`:"";
  if(QZ.done){
    v.innerHTML=`<h2>Тренажёр</h2><div class="card"><h3>Результат: ${QZ.score} из ${QZ.order.length}</h3><p>${QZ.wrong.length?"Вернись к этим вопросам:":"Всё верно. Хорошо, что глава улеглась."}</p>${QZ.wrong.map(i=>`<p class="small">• ${esc(D.quiz[i].q)}<br><span class="muted">${esc(D.quiz[i].o[D.quiz[i].a])}</span></p>`).join("")}<div class="row"><button class="btn" id="qa">Пройти заново</button>${QZ.wrong.length?`<button class="btn ghost" id="qw">Повторить ошибки</button>`:""}</div></div>`;
    $("#qa").onclick=()=>{qzStart();render.quiz();};const w=$("#qw");if(w)w.onclick=()=>{qzStart(QZ.wrong.slice());render.quiz();};return;
  }
  const qi=QZ.order[QZ.i],q=D.quiz[qi];
  v.innerHTML=`<h2>Тренажёр</h2>${last}<div class="card"><div class="lab">Вопрос ${QZ.i+1} из ${QZ.order.length}</div><h3 style="margin:6px 0 10px">${esc(q.q)}</h3><div id="qo">${q.o.map((t,i)=>`<button class="opt" data-i="${i}">${esc(t)}</button>`).join("")}</div><div id="qe"></div></div>`;
  $$("#qo .opt").forEach(b=>b.addEventListener("click",()=>{
    if($("#qe").innerHTML)return;const i=+b.dataset.i,ok=i===q.a;
    $$("#qo .opt").forEach(x=>{if(+x.dataset.i===q.a)x.classList.add("ok");});if(!ok)b.classList.add("no");
    if(ok)QZ.score++;else QZ.wrong.push(qi);
    const lastQ=QZ.i===QZ.order.length-1;
    $("#qe").innerHTML=`<div class="note"><b>${ok?"Верно.":"Не совсем."}</b> ${esc(q.e)}</div><button class="btn" id="qn">${lastQ?"Показать результат":"Дальше"}</button>`;
    $("#qn").onclick=()=>{if(lastQ){QZ.done=true;if(QZ.order.length===D.quiz.length){store.qz=store.qz||{};store.qz.last=QZ.score;save();}}else QZ.i++;render.quiz();};
  }));
};

render.notes=function(){
  const v=$("#v-notes");
  const marked=Object.keys(ENT).filter(id=>store.st[id]||store.nt[id]);
  const grp=s=>marked.filter(id=>store.st[id]===s);
  const none=marked.filter(id=>!store.st[id]);
  const sec=(label,ids)=>ids.length?`<h3 style="margin:20px 0 6px">${label} <span class="muted small">(${ids.length})</span></h3><div class="grid">${ids.map(id=>`<button class="card btn" data-open="${id}"><span class="lab">${ENT[id].k==="block"?"Раздел главы":ENT[id].k==="work"?"Работа":ENT[id].k==="term"?"Термин":"Человек"}</span><h3>${esc(title(id))}</h3>${store.nt[id]?`<span class="small">${esc(store.nt[id])}</span>`:""}</button>`).join("")}</div>`:"";
  let txt="Глава "+D.meta.n+". "+D.meta.title+". Мои отметки\n";
  [["3","Слабо помню"],["1","Прочитала"],["2","Повторила"]].forEach(([s,l])=>{const ids=grp(s);if(ids.length)txt+="\n"+l+":\n"+ids.map(id=>"- "+title(id)+(store.nt[id]?": "+store.nt[id].replace(/\n/g," "):"")).join("\n")+"\n";});
  if(none.length)txt+="\nТолько заметки:\n"+none.map(id=>"- "+title(id)+": "+store.nt[id].replace(/\n/g," ")).join("\n")+"\n";
  v.innerHTML=`<h2>Мои отметки</h2><p class="muted">Здесь собирается всё, что ты отметила в карточках. Отметки хранятся только в этом браузере.</p>${marked.length?sec("Слабо помню",grp("3"))+sec("Прочитала",grp("1"))+sec("Повторила",grp("2"))+sec("Только заметки",none)+`<h3 style="margin:24px 0 6px">Скопировать список</h3><textarea id="ex" readonly aria-label="Список отметок" style="min-height:120px">${esc(txt)}</textarea><p><button class="btn" id="cp">Скопировать</button> <span class="small muted" id="cps"></span></p>`:`<div class="card"><p>Пока пусто. Открой любую карточку (имя, работу, термин) и поставь отметку или напиши заметку.</p></div>`}`;
  const cp=$("#cp");if(cp)cp.onclick=()=>{const t=$("#ex");const ok=()=>{$("#cps").textContent="Скопировано";};
    try{navigator.clipboard.writeText(t.value).then(ok,()=>{t.select();$("#cps").textContent="Выделено, нажми Ctrl+C";});}catch(e){t.select();$("#cps").textContent="Выделено, нажми Ctrl+C";}};
};

buildTabs();
(function init(){const k=location.hash.slice(1);show(TABS.some(t=>t[0]===k)?k:"map");})();
document.getElementById("q").placeholder=D.meta.search;
refreshWish();
