const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const p=await(await b.newContext()).newPage();
  for (const w of [320,390]) {
    await p.setViewportSize({width:w,height:844});
    await p.goto('http://localhost:8099/');
    // A previous pass leaves a session behind, so the auth screen never
    // reappears and the wait below times out. Start each width clean.
    await p.evaluate(()=>localStorage.clear());
    await p.reload();
    await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:15000});
    await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
    await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
    const r=await p.evaluate(()=>{
      const nav=document.querySelector('.hdr-nav');
      const out={scrollW:nav.scrollWidth,clientW:nav.clientWidth,tabs:[]};
      nav.scrollLeft=0;
      for(const b of nav.querySelectorAll('.nav-btn')){
        b.scrollIntoView({block:'nearest',inline:'nearest'});
        const nb=nav.getBoundingClientRect(),bb=b.getBoundingClientRect();
        out.tabs.push({t:b.textContent.trim(),
          reachable:bb.left>=nb.left-1&&bb.right<=nb.right+1});
      }
      return out;
    });
    console.log(`${w}px:`, JSON.stringify(r));
  }
  await b.close();
})();
