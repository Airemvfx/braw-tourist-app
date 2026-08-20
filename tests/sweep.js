const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const errs=[]; const p=await(await b.newContext()).newPage();
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  await p.setViewportSize({width:390,height:844});
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:15000});
  await p.waitForTimeout(1200);
  await p.screenshot({path:'/tmp/sw-landing.png'});
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  for (const v of ['plan','trips','badges','play','leaderboard','profile']) {
    await p.evaluate(x=>document.querySelector(`.nav-btn[data-view="${x}"]`).click(),v);
    await p.waitForTimeout(600);
    await p.screenshot({path:`/tmp/sw-${v}.png`});
  }
  // trip detail from the list
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(400);
  await p.locator('.trip-card').first().click();
  await p.waitForTimeout(900);
  await p.screenshot({path:'/tmp/sw-trip.png'});
  console.log('ERRORS:',errs.length?errs:'none');
  await b.close();
})();
