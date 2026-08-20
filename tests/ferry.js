const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const errs=[]; const p=await(await b.newContext()).newPage();
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.setViewportSize({width:390,height:844});
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:20000});
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="build"]').click());
  await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(300);
  for (const id of ['oban-distillery','tobermory','fingals-cave','culzean-castle','goatfell-arran']) {
    await p.evaluate(x=>document.querySelector(`[data-bd-add="${x}"]`)?.click(), id);
    await p.waitForTimeout(200);
  }
  await p.waitForTimeout(400);
  console.log('BUILDER with island stops:');
  const info = await p.evaluate(()=>({
    stats: [...document.querySelectorAll('.bd-tile')].map(t=>t.querySelector('.bdt-val').textContent.trim()),
    breakdown: document.querySelector('.bd-breakdown')?.textContent.trim().replace(/\s+/g,' '),
    ferryAdvisory: [...document.querySelectorAll('.bd-adv li')]
      .map(l=>l.textContent.replace(/\s+/g,' ').trim()).find(x=>/ferry|crossing|water/i.test(x)) || '(none)',
    legs: [...document.querySelectorAll('.bd-leg')].map(l=>l.textContent.trim()),
  }));
  console.log(JSON.stringify(info,null,1));
  await p.evaluate(()=>document.getElementById('bd-save').click());
  await p.waitForTimeout(1200);
  console.log('\nSAVED QUEST banner:', await p.evaluate(()=>
    document.querySelector('.ferry-banner')?.textContent.trim() || '(none)'));
  await p.locator('#view-trip').screenshot({path:'/tmp/ferry-quest.png'});
  console.log('ERRORS:', errs.length?errs:'none');
  await b.close();
})();
