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
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="plan"]').click());
  await p.waitForTimeout(400);
  for (const q of ['whisky','kayaks and castles','skiing','a week seeing the best of scotland']) {
    await p.fill('#plan-input', q);
    await p.evaluate(()=>document.getElementById('plan-go').click());
    await p.waitForTimeout(3300);
    const r = await p.evaluate(()=>({
      title: document.querySelector('#plan-result .trip-title').textContent.trim(),
      pills: [...document.querySelectorAll('#plan-result .pill')].map(x=>x.textContent.trim()),
      stops: [...document.querySelectorAll('#plan-result .sl-name')].map(x=>x.textContent.trim()),
      days: document.querySelectorAll('#plan-result .day-block').length,
      curved: (document.querySelector('#plan-result .map-route')?.getAttribute('d').match(/L/g)||[]).length,
    }));
    console.log(`\n"${q}"`);
    console.log('  ', r.title, '|', r.days, 'days |', r.stops.length, 'stops | route pts:', r.curved);
    console.log('   pills:', r.pills.join(' · '));
    console.log('   ', r.stops.join(' · '));
  }
  console.log('\nERRORS:', errs.length?errs:'none');
  await b.close();
})();
