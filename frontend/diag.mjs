import { chromium } from "playwright";
const API="http://localhost:3100", APP="http://localhost:3101";
const r=await fetch(`${API}/auth/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({identifier:"0791100201",password:"Doctor1!"})});
const d=await r.json();
let b; try{b=await chromium.launch({channel:"chrome"})}catch{b=await chromium.launch()}
const p=await b.newPage({viewport:{width:1680,height:900}});
await p.goto(`${APP}/`,{waitUntil:"domcontentloaded"});
await p.evaluate(({t,u})=>{sessionStorage.setItem("authToken",t);sessionStorage.setItem("currentUser",JSON.stringify(u))},{t:d.token,u:d.user});
await p.goto(`${APP}/doctor`,{waitUntil:"networkidle"});
await p.waitForTimeout(2000);
const info=await p.evaluate(()=>{
  const col=document.querySelector(".denty-rail-column");
  if(!col) return {found:false};
  const cs=getComputedStyle(col);
  const main=document.querySelector("main");
  return {found:true, position:cs.position, left:cs.left, right:cs.right,
    rect:JSON.stringify(col.getBoundingClientRect()),
    mainClass:main?main.className:"NO MAIN"};
});
console.log(JSON.stringify(info,null,2));
await b.close();
