const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const errs=[]; const p=await(await b.newContext({deviceScaleFactor:2})).newPage();
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE: '+m.text());});
  await p.setViewportSize({width:390,height:844});
  const t0=Date.now();
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:15000});
  await p.waitForTimeout(1500);
  console.log('sprite present:', await p.evaluate(()=>{
    const g=document.getElementById('braw-terrain');
    return g? {paths:g.querySelectorAll('path').length, uses:document.querySelectorAll('use[href="#braw-terrain"]').length} : null;
  }).then(JSON.stringify), `| landing ready ${Date.now()-t0}ms`);
  await p.locator('.showcase').screenshot({path:'/tmp/tr-showcase.png'});

  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(500);
  await p.locator('.trip-card').first().click(); await p.waitForTimeout(1000);
  console.log('trip map uses:', await p.evaluate(()=>document.querySelectorAll('#view-trip use').length));
  await p.locator('#view-trip .map-stage').screenshot({path:'/tmp/tr-trip-dark.png'});

  // builder: does a redraw stay cheap now the terrain is a sprite?
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="build"]').click());
  await p.waitForTimeout(700);
  await p.evaluate(()=>document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(300);
  const times=[];
  for (const id of ['edinburgh-castle','glencoe','old-man-storr','dunnottar','talisker']) {
    const t=await p.evaluate(x=>{const s=performance.now();
      document.querySelector(`[data-bd-add="${x}"]`).click(); return performance.now()-s;}, id);
    times.push(Math.round(t));
    await p.waitForTimeout(150);
  }
  console.log('builder add-stop redraw ms:', JSON.stringify(times));
  console.log('DOM size:', await p.evaluate(()=>document.documentElement.innerHTML.length), 'chars');
  await p.locator('#view-build .map-stage').screenshot({path:'/tmp/tr-build-dark.png'});

  await p.evaluate(()=>document.querySelector('.app-foot [data-theme-mode="light"]').click());
  await p.waitForTimeout(600);
  await p.locator('#view-build .map-stage').screenshot({path:'/tmp/tr-build-light.png'});
  console.log('ERRORS:', errs.length?errs:'none');
  await b.close();
})();
