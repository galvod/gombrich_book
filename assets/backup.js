/* Резервная копия отметок: все данные сайта лежат в localStorage под ключами gombrich… */
(function(){
const box=document.getElementById("backup");if(!box)return;
const msg=t=>{box.querySelector(".bmsg").textContent=t;};
function keys(){const k=[];try{for(let i=0;i<localStorage.length;i++){const n=localStorage.key(i);if(n&&n.indexOf("gombrich")===0)k.push(n);}}catch(e){}return k;}
box.querySelector("[data-bk=save]").addEventListener("click",()=>{
  const data={};keys().forEach(k=>{try{data[k]=localStorage.getItem(k);}catch(e){}});
  if(!Object.keys(data).length){msg("Пока нечего сохранять: отметок ещё нет.");return;}
  const d=new Date(),p=n=>String(n).padStart(2,"0"),stamp=d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate());
  const blob=new Blob([JSON.stringify({app:"gombrich-site",v:1,date:d.toISOString(),data},null,1)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="gombrich-otmetki-"+stamp+".json";document.body.appendChild(a);a.click();a.remove();
  msg("Файл сохранён: "+Object.keys(data).length+" записей. Положи его в надёжное место.");
});
const inp=box.querySelector("input[type=file]");
box.querySelector("[data-bk=load]").addEventListener("click",()=>inp.click());
inp.addEventListener("change",()=>{
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const j=JSON.parse(r.result);
      if(!j||j.app!=="gombrich-site"||!j.data)throw new Error("не тот файл");
      let n=0;
      Object.keys(j.data).forEach(k=>{
        if(k.indexOf("gombrich")!==0)return;
        let v=j.data[k];
        if(k==="gombrich-wishlist"){try{const old=JSON.parse(localStorage.getItem(k))||{};v=JSON.stringify(Object.assign(old,JSON.parse(v)));}catch(e){}}
        localStorage.setItem(k,v);n++;
      });
      msg("Восстановлено записей: "+n+". Обнови страницы глав, чтобы увидеть отметки.");
    }catch(e){msg("Не получилось прочитать файл. Нужен файл, сохранённый этой кнопкой.");}
    inp.value="";
  };
  r.readAsText(f);
});
})();
