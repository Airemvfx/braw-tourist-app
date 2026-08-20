const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const lum = ([r,g,b]) => { const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);};
const parse=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const p=await(await b.newContext()).newPage();
  await p.setViewportSize({width:390,height:844});
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:15000});
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="build"]').click());
  await p.waitForTimeout(500);
  await p.evaluate(()=>document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(300);
  for (const id of ['glencoe','talisker','dunnottar']) {
    await p.evaluate(x=>document.querySelector(`[data-bd-add="${x}"]`)?.click(),id);
    await p.waitForTimeout(200);
  }
  for (const theme of ['light','dark']) {
    await p.evaluate(m=>document.querySelector(`.app-foot [data-theme-mode="${m}"]`).click(),theme);
    await p.waitForTimeout(400);
    await p.evaluate(()=>document.querySelector('.nav-btn[data-view="plan"]').click());
    await p.waitForTimeout(300);
    const pre=await p.evaluate(()=>{
      const g=s=>{const e=document.querySelector(s);return e?getComputedStyle(e).color:null;};
      return {planHint:g('.plan-hint'),chipsLabel:g('.chips-label'),faint:getComputedStyle(document.documentElement).getPropertyValue('--text-faint')};
    });
    console.log('  pre-existing tokens:',JSON.stringify(pre));
    await p.evaluate(()=>document.querySelector('.nav-btn[data-view="build"]').click());
    await p.waitForTimeout(300);
    await p.evaluate(()=>document.querySelector('.bd-tab[data-bd-tab="route"]').click());
    await p.waitForTimeout(250);
    const picks=await p.evaluate(()=>{
      // Composite every translucent layer down onto the opaque one beneath,
      // or a 4.5%-alpha wash reads as solid black and the numbers are fiction.
      const rgba=s=>{const n=(s.match(/[\d.]+/g)||[]).map(Number);
        return n.length>=4?n.slice(0,4):[...n.slice(0,3),1];};
      const bgOf=el=>{
        const stack=[];let n=el;
        while(n){const c=getComputedStyle(n).backgroundColor;
          if(c&&c!=='transparent'){const v=rgba(c);if(v[3]>0)stack.push(v);}
          n=n.parentElement;}
        stack.push([255,255,255,1]);            // canvas below everything
        let out=stack[stack.length-1].slice(0,3);
        for(let i=stack.length-2;i>=0;i--){const[r,g,bb,a]=stack[i];
          out=[r*a+out[0]*(1-a),g*a+out[1]*(1-a),bb*a+out[2]*(1-a)];}
        return `rgb(${out.map(x=>Math.round(x)).join(', ')})`;};
      const sels=['.map-key li','.bd-maphint','.bdt-val','.bdt-label','.bd-breakdown','.bd-maphint','.bd-flabel','.bd-segb',
        '.bd-segb.active','.bd-tab.active','.bd-leg','.bd-rowname b','.bd-rowname i','.bd-btitle',
        '.bd-kit b','.bd-kit i','.bd-adv b','.bd-adv p','.bd-add','.bd-icon'];
      return sels.map(s=>{const el=document.querySelector(s);if(!el)return null;
        return {s,fg:getComputedStyle(el).color,bg:bgOf(el)};}).filter(Boolean);
    });
    console.log(`\n--- ${theme} ---`);
    for(const a of picks){const r=ratio(parse(a.fg),parse(a.bg));
      console.log(`  ${r.toFixed(2).padStart(5)}:1  ${r>=4.5?'AA  ':r>=3?'AA-lg':'FAIL'}  ${a.s}`);}
    // candidate dot vs land
    const map=await p.evaluate(()=>{
      const cs=getComputedStyle(document.documentElement);
      const hex=h=>{h=h.trim().replace('#','');
        return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(', ');};
      return {
        dot: getComputedStyle(document.querySelector('#view-build .cand-dot')).stroke,
        land: 'rgb('+hex(cs.getPropertyValue('--mt-land'))+')',
        forest: 'rgb('+hex(cs.getPropertyValue('--mt-forest'))+')',
        farm: 'rgb('+hex(cs.getPropertyValue('--mt-farm'))+')',
        water: 'rgb('+hex(cs.getPropertyValue('--mt-water'))+')',
        built: 'rgb('+hex(cs.getPropertyValue('--mt-built'))+')',
      };
    });
    console.log(`  ${ratio(parse(map.dot),parse(map.land)).toFixed(2)}:1  candidate dot vs base land`);
    for (const k of ['forest','farm','water','built'])
      console.log(`  ${ratio(parse(map[k]),parse(map.land)).toFixed(2)}:1  ${k} vs base land (needs to be TELLABLE, not readable)`);
  }
  await b.close();
})();
