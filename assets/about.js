(function(){
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const cp=n=>"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(n.replace(/ /g,"_"));
const cu=(n,w)=>"https://commons.wikimedia.org/wiki/Special:FilePath/"+encodeURIComponent(n.replace(/ /g,"_"))+"?width="+w;
const fig=m=>`<figure class="fig"><img loading="lazy" src="images/about/${esc(m.f)}" data-c="${esc(m.c)}" data-s="0" alt="${esc(m.cap)}"><figcaption>${esc(m.cap)}. ${esc(m.by)}, ${esc(m.lic)}. <a href="${cp(m.c)}" target="_blank" rel="noopener">Файл на Commons</a></figcaption></figure>`;
document.addEventListener("error",e=>{const t=e.target;if(!t||t.tagName!=="IMG"||!t.dataset.c)return;
 if(t.dataset.s==="0"){t.dataset.s="1";t.src=cu(t.dataset.c,900);}
 else if(t.dataset.s==="1"){t.dataset.s="2";const d=document.createElement("div");d.className="nofile";d.innerHTML='Картинка не загрузилась. <a href="'+cp(t.dataset.c)+'" target="_blank" rel="noopener">Открыть на Commons</a>';t.replaceWith(d);}
},true);
const A=ABOUT;
document.getElementById("ab-lead").textContent="Кто написал книгу, как она появилась и сколько читателей нашла за 70 с лишним лет.";
document.getElementById("ab").innerHTML=`
<section class="wide-sec"><h2>Автор</h2>
<p>Эрнст Ханс Йозеф Гомбрих (1909–2001), историк искусства, родился в Вене, с 1936 года жил в Лондоне, где работал в Институте Варбурга и был его директором. Из его книг лучше всего известны «История искусства», детская «Краткая всемирная история» и научные работы об искусстве и восприятии.</p>
<div class="scroll"><table class="ctx"><tbody>${A.life.map(r=>`<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div></section>
<section class="wide-sec"><h2>Фотографии</h2><div class="gal">${A.photos.map(p=>`<div class="card">${fig(p)}</div>`).join("")}</div></section>
<section class="wide-sec"><h2>Как писалась книга</h2>${A.story.map(t=>`<p>${esc(t)}</p>`).join("")}</section>
<section class="wide-sec"><h2>Издания, языки, тираж</h2>
<div class="scroll"><table><tbody>${A.facts.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div></section>
<section class="wide-sec"><h2>Обложки на разных языках</h2><div class="covers">
<figure class="cov">${fig(A.cover).replace('<figure class="fig">','').replace('</figure>','')}</figure>
${A.covers.map(c=>`<figure class="cov"><img loading="lazy" src="https://covers.openlibrary.org/b/id/${c.id}-M.jpg" alt="${esc(c.t)}" onerror="this.parentNode.classList.add('miss');this.remove()"><figcaption><b>${esc(c.lang)}</b>. ${esc(c.t)}. ${esc(c.pub)}</figcaption></figure>`).join("")}
</div>
<p class="small muted">Английская обложка с Wikimedia Commons. Остальные подгружаются из каталога Open Library и показаны как библиографическая иллюстрация: права на изображения принадлежат издательствам.</p></section>
<section class="wide-sec"><h2>Другие книги автора</h2><ul>${A.more.map(r=>`<li><b>${esc(r[0])}</b>, ${esc(r[1])}</li>`).join("")}</ul></section>
<section class="wide-sec"><h2>Источники</h2><ul>${A.links.map(l=>`<li><a href="${esc(l[1])}" target="_blank" rel="noopener">${esc(l[0])}</a></li>`).join("")}</ul></section>`;
})();
