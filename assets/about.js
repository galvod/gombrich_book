(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cp=n=>"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(n.replace(/ /g,"_"));
const cu=(n,w)=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(n.replace(/ /g,"_"))+"?width="+w;
const fig=m=>`<figure class="fig"><img loading="lazy" src="images/about/${esc(m.f)}" data-c="${esc(m.c)}" data-s="0" alt="${esc(m.cap)}"><figcaption>${esc(m.cap)}. ${esc(m.by)}, ${esc(m.lic)}. <a href="${cp(m.c)}" target="_blank" rel="noopener">Файл на Commons</a></figcaption></figure>`;
document.addEventListener("error",e=>{const t=e.target;if(!t||t.tagName!=="IMG"||!t.dataset.c)return;
 if(t.dataset.s==="0"){t.dataset.s="1";t.src=cu(t.dataset.c,900);}
 else if(t.dataset.s==="1"){t.dataset.s="2";const d=document.createElement("div");d.className="nofile";d.innerHTML='Картинка не загрузилась. <a href="'+cp(t.dataset.c)+'" target="_blank" rel="noopener">Открыть на Commons</a>';t.replaceWith(d);}
},true);
const A=ABOUT;const nd=s=>String(s).replace(/\.\s*$/,"");
document.getElementById("ab-lead").textContent="Кто написал книгу, как она появилась и сколько читателей нашла за 70 с лишним лет.";
document.getElementById("ab").innerHTML=`
<section class="wide-sec"><h2>Автор</h2>
<p>Эрнст Ханс Йозеф Гомбрих (1909–2001), историк искусства, родился в Вене, с 1936 года жил в Лондоне, где работал в Институте Варбурга и был его директором. Из его книг лучше всего известны «История искусства», детская «Краткая всемирная история» и научные работы об искусстве и восприятии.</p>
<div class="scroll"><table class="ctx"><tbody>${A.life.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(nd(r[1]))}</td></tr>`).join("")}</tbody></table></div></section>
<section class="wide-sec"><h2>Фотографии</h2><p class="small muted" style="margin:0 0 8px">Листай ленту вбок, нажми на фото, чтобы открыть его крупно.</p><div class="strip">${A.photos.map((p,i)=>`<button type="button" class="sp" data-i="${i}"><img loading="lazy" src="images/about/${esc(p.f)}" data-c="${esc(p.c)}" data-s="0" alt="${esc(p.cap)}"><span>${esc(p.cap)}</span></button>`).join("")}</div></section>
<section class="wide-sec"><h2>Как писалась книга</h2>${A.story.map(t=>`<p>${esc(t)}</p>`).join("")}</section>
<section class="wide-sec"><h2>Издания, языки, тираж</h2>
<div class="scroll"><table><tbody>${A.facts.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(nd(r[1]))}</td></tr>`).join("")}</tbody></table></div></section>
<section class="wide-sec"><h2>Обложки</h2><div class="covers">
<figure class="cov">${fig(A.cover).replace('<figure class="fig">','').replace('</figure>','')}</figure>
${A.covers.map(c=>`<figure class="cov"><img loading="lazy" src="images/about/${esc(c.loc)}" alt="${esc(c.t)}"><figcaption><b>${esc(c.lang)}</b>. ${esc(c.pub)}</figcaption></figure>`).join("")}
</div>
<p class="small muted">Английская обложка с Wikimedia Commons, русская сфотографирована автором сайта с собственного экземпляра. Права на оформление обложек принадлежат издательствам.</p></section>
<section class="wide-sec"><h2>Другие книги автора</h2><ul>${A.more.map(r=>`<li><b>${esc(r[0])}</b>, ${esc(r[1])}</li>`).join("")}</ul></section>
<section class="wide-sec"><h2>Источники</h2><ul>${A.links.map(l=>`<li><a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a></li>`).join("")}</ul></section>`;

/* лента фотографий и просмотр крупно */
const lb=document.createElement("div");lb.className="lb";lb.hidden=true;lb.innerHTML='<button type="button" class="lbx" aria-label="Закрыть">×</button><button type="button" class="lbp" aria-label="Назад">‹</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" class="lbn" aria-label="Вперёд">›</button>';
document.body.appendChild(lb);
let cur=0;const li=lb.querySelector("img"),lc=lb.querySelector("figcaption");
function show(i){cur=(i+A.photos.length)%A.photos.length;const p=A.photos[cur];li.dataset.s="0";li.dataset.c=p.c;li.src="images/about/"+p.f;li.alt=p.cap;lc.innerHTML=esc(p.cap)+". "+esc(p.by)+", "+esc(p.lic)+'. <a href="'+cp(p.c)+'" target="_blank" rel="noopener">Файл на Commons</a>';}
function open(i){show(i);lb.hidden=false;document.body.style.overflow="hidden";}
function close(){lb.hidden=true;document.body.style.overflow="";}
document.querySelectorAll(".sp").forEach(b=>b.addEventListener("click",()=>open(+b.dataset.i)));
lb.querySelector(".lbx").addEventListener("click",close);lb.querySelector(".lbp").addEventListener("click",()=>show(cur-1));lb.querySelector(".lbn").addEventListener("click",()=>show(cur+1));
lb.addEventListener("click",e=>{if(e.target===lb)close();});
document.addEventListener("keydown",e=>{if(lb.hidden)return;if(e.key==="Escape")close();else if(e.key==="ArrowLeft")show(cur-1);else if(e.key==="ArrowRight")show(cur+1);});
})();
