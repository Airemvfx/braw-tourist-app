const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const lum = ([r,g,b]) => { const f=v=>{v/=255;return v<=0.03928?v/12.92:((v+0.055)/1.055)**2.4;};
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio=(a,b)=>{const[x,y]=[lum(a),lum(b)].sort((p,q)=>q-p);return (x+0.05)/(y+0.05);};
const parse=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);

// ---------------------------------------------------------------------
// Text over a photograph.
//
// The bgOf() walk above composites backgroundColor up the ancestor
// chain, which is right for text on a surface and fiction for text on a
// picture: a gradient scrim is a background-IMAGE, so the walk reads
// through it as transparent and reports the card colour underneath.
// That is a confident wrong answer, which is worse than no answer.
//
// So measure what is actually on the screen. Hide the text, photograph
// the box it sat in, and take the WORST pixel under it — not the mean,
// because a caption is unreadable if any part of it is, and a bright
// sky in one corner is exactly how that happens.
// ---------------------------------------------------------------------
async function worstBehind(page, sel) {
  const fg = await page.evaluate(s => {
    const el = document.querySelector(s);
    return el ? getComputedStyle(el).color : null;
  }, sel);
  if (!fg) return null;

  // Inject by hand rather than through addStyleTag, which takes no id —
  // so the rules could not be removed again and simply piled up. The
  // second theme then read its colour through an earlier run's
  // transparency, got rgba(0,0,0,0), and measured white text as black.
  const hide = async on => page.evaluate(([s, on]) => {
    document.getElementById('contrast-probe')?.remove();
    if (!on) return;
    const st = document.createElement('style');
    st.id = 'contrast-probe';
    st.textContent = `${s}, ${s} * { color: transparent !important; text-shadow: none !important; }`;
    document.head.appendChild(st);
  }, [sel, on]);

  await hide(true);
  const box = await page.locator(sel).first().boundingBox();
  if (!box || box.width < 2 || box.height < 2) { await hide(false); return null; }
  const shot = (await page.screenshot({ clip: box })).toString('base64');
  await hide(false);

  const px = await page.evaluate(async b64 => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const d = c.getContext('2d').getImageData(0, 0, img.width, img.height).data;
    const out = [];
    for (let i = 0; i < d.length; i += 4) out.push([d[i], d[i + 1], d[i + 2]]);
    return out;
  }, shot);

  let worst = Infinity, at = null;
  for (const p of px) {
    const r = ratio(parse(fg), p);
    if (r < worst) { worst = r; at = p; }
  }
  return { fg, worst, at };
}

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

  // ---- the scrim, against the worst thing a photograph can be ----
  //
  // Injected rather than waited for: this measures the PRIMITIVE, not
  // whichever picture happens to be on screen. A pure white frame is the
  // brightest a photograph can get, so if white caption text clears AA
  // over that, it clears it over every real photograph too.
  let photoFails = 0;
  for (const theme of ['dark', 'light']) {
    await p.evaluate(m => document.querySelector(`.app-foot [data-theme-mode="${m}"]`).click(), theme);
    await p.waitForTimeout(300);
    await p.evaluate(() => {
      document.getElementById('scrim-probe')?.remove();
      const white = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
      const box = document.createElement('div');
      box.id = 'scrim-probe';
      box.style.cssText = 'position:fixed;left:20px;top:20px;width:320px;z-index:99999';
      box.innerHTML = `
        <div class="media">
          <img class="media-img is-loaded" src="${white}" alt="">
          <div class="media-scrim"></div>
          <div class="media-caption">
            <span class="mc-title">Probe title</span>
            <span class="mc-sub">Probe subtitle line</span>
          </div>
          <div class="media-credit">Author · CC BY-SA 4.0</div>
        </div>`;
      document.body.appendChild(box);
    });
    await p.waitForTimeout(250);
    console.log(`\n--- ${theme}: white photograph under the scrim ---`);
    for (const sel of ['#scrim-probe .mc-title', '#scrim-probe .mc-sub', '#scrim-probe .media-credit']) {
      const r = await worstBehind(p, sel);
      if (!r) { console.log(`  (absent) ${sel}`); continue; }
      const ok = r.worst >= 4.5;
      if (!ok) photoFails++;
      console.log(`  ${r.worst.toFixed(2).padStart(5)}:1  ${ok ? 'AA  ' : 'FAIL'}  ${sel.replace('#scrim-probe ', '')}`
        + `  (worst pixel rgb(${r.at.join(', ')}))`);
    }
    await p.evaluate(() => document.getElementById('scrim-probe')?.remove());
  }

  await b.close();
  if (photoFails) {
    console.log(`\n${photoFails} text-over-photograph check(s) below AA — the scrim is too thin.`);
    process.exit(1);
  }
  console.log('\ntext over photography: all good');
})();
