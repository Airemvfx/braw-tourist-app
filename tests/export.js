const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args:['--no-sandbox','--disable-setuid-sandbox','--ignore-certificate-errors']});
  const errs=[]; const ctx=await b.newContext({acceptDownloads:true});
  const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/CONNECTION_RESET/.test(m.text()))errs.push('CONSOLE: '+m.text());});
  await p.setViewportSize({width:390,height:844});
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(()=>!document.getElementById('auth-screen').hidden,{timeout:20000});
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(400);
  await p.locator('.trip-card').first().click(); await p.waitForTimeout(900);

  // GPX
  const [gpxDl] = await Promise.all([p.waitForEvent('download'), p.locator('#dl-gpx').click()]);
  const gpxPath = '/tmp/out.gpx'; await gpxDl.saveAs(gpxPath);
  const fs=require('fs'); const gpx=fs.readFileSync(gpxPath,'utf8');
  console.log('GPX  file:', gpxDl.suggestedFilename());
  console.log('     bytes:', gpx.length, '| wpts:', (gpx.match(/<wpt /g)||[]).length,
              '| rtepts:', (gpx.match(/<rtept /g)||[]).length,
              '| declares gpx 1.1:', /gpx version="1.1"/.test(gpx));
  console.log('     first waypoint:', (gpx.match(/<name>([^<]+)<\/name>/g)||[]).slice(0,3).join(' '));

  // GeoJSON
  const [gjDl] = await Promise.all([p.waitForEvent('download'), p.locator('#dl-geojson').click()]);
  await gjDl.saveAs('/tmp/out.geojson');
  const gj=JSON.parse(fs.readFileSync('/tmp/out.geojson','utf8'));
  console.log('GEO  file:', gjDl.suggestedFilename(), '| features:', gj.features.length,
              '| line pts:', gj.features[0].geometry.coordinates.length);

  // ferry banner present on an island quest?
  console.log('\nferry banner on this quest:', await p.evaluate(()=>
    document.querySelector('.ferry-banner')?.textContent.trim() || '(none — no crossing on this route)'));

  // backup
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="profile"]').click());
  await p.waitForTimeout(500);
  const [bkDl] = await Promise.all([p.waitForEvent('download'), p.locator('#dl-backup').click()]);
  await bkDl.saveAs('/tmp/out-backup.json');
  const bk=JSON.parse(fs.readFileSync('/tmp/out-backup.json','utf8'));
  console.log('\nBACKUP file:', bkDl.suggestedFilename());
  console.log('     format:', bk.format, 'v'+bk.version, '| trips:', bk.profile.trips.length,
              '| xp:', bk.profile.xp, '| achievements:', bk.profile.achievements.length,
              '| photos:', Object.keys(bk.photos).length);

  // now wreck the profile, then restore from that file
  await p.evaluate(()=>{
    const k=localStorage.getItem('braw_session_v1');
    const u=JSON.parse(localStorage.getItem('braw_users_v1'));
    u[k].trips=[]; u[k].xp=0; u[k].achievements=[];
    localStorage.setItem('braw_users_v1', JSON.stringify(u));
  });
  await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(()=>document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="profile"]').click());
  await p.waitForTimeout(500);
  console.log('\nafter wiping:', await p.evaluate(()=>({
    trips: JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].trips.length,
    xp: JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].xp,
  })).then(JSON.stringify));

  p.on('dialog', d=>d.accept());
  await p.setInputFiles('#restore-input', '/tmp/out-backup.json');
  await p.waitForTimeout(2500);
  console.log('after restore:', await p.evaluate(()=>({
    trips: JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].trips.length,
    xp: JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].xp,
  })).then(JSON.stringify));

  // a bad file must fail loudly and change nothing
  fs.writeFileSync('/tmp/bad.json','{"nope":1}');
  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="profile"]').click());
  await p.waitForTimeout(400);
  await p.setInputFiles('#restore-input', '/tmp/bad.json');
  await p.waitForTimeout(1200);
  console.log('after a junk file:', await p.evaluate(()=>({
    trips: JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].trips.length,
    toast: document.querySelector('.toast')?.textContent.trim() || '(none)',
  })).then(JSON.stringify));

  console.log('\nERRORS:', errs.length?errs:'none');
  await b.close();
})();
