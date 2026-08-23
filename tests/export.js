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

  // ------------------------------------------------------------------
  // Photographs must survive a backup and restore at full print size.
  //
  // This is the path that matters most: a cleared browser is meant to
  // cost nothing, and a restore that quietly brought photographs back as
  // thumbnails would look like it worked while making every one of them
  // useless for the calendar they were taken for.
  // ------------------------------------------------------------------
  console.log('\n-- photographs through a backup --');
  const before = await p.evaluate(async () => {
    const photos = await import('/js/photos.js');
    const owner = localStorage.getItem('braw_session_v1');
    const c = document.createElement('canvas');
    c.width = 2400; c.height = 1800;
    const x = c.getContext('2d');
    for (let i = 0; i < 150; i++) {
      x.fillStyle = 'hsl(' + (i * 13 % 360) + ',60%,45%)';
      x.fillRect((i * 61) % 2400, (i * 37) % 1800, 300, 300);
    }
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.85));
    const rec = await photos.addPhoto(owner, { tripId: 'trip-x', poiId: 'iona' },
      new File([blob], 'a.jpg', { type: 'image/jpeg' }));
    return { id: rec.id, w: rec.w, count: (await photos.allPhotos(owner)).length };
  });
  console.log('stored one photograph at', before.w + 'px');

  const [dl2] = await Promise.all([p.waitForEvent('download'), p.locator('#dl-backup').click()]);
  await dl2.saveAs('/tmp/out-backup2.json');
  const bk2 = JSON.parse(fs.readFileSync('/tmp/out-backup2.json', 'utf8'));
  const inFile = (bk2.photos || []).find(x => x.id === before.id);
  console.log('  photos in file:', (bk2.photos || []).length,
    '| carries a print copy:', Boolean(inFile && inFile.full),
    '| full is larger than thumb:', Boolean(inFile && inFile.full.length > inFile.thumb.length));

  // Empty the local store, then restore from the file. Deleting the
  // whole database would be closer to "cleared the browser", but
  // deleteDatabase blocks while any connection is open and the app holds
  // one for its lifetime — so it would hang here rather than test
  // anything. Removing every record reaches the same starting point.
  const wiped = await p.evaluate(async () => {
    const photos = await import('/js/photos.js');
    const owner = localStorage.getItem('braw_session_v1');
    for (const rec of await photos.allPhotos(owner)) await photos.deletePhoto(rec.id);
    return (await photos.allPhotos(owner)).length;
  });
  console.log('  photographs on the device after wiping:', wiped);

  await p.evaluate(()=>document.querySelector('.nav-btn[data-view="profile"]').click());
  await p.waitForTimeout(500);
  await p.setInputFiles('#restore-input', '/tmp/out-backup2.json');
  await p.waitForTimeout(3000);

  const after = await p.evaluate(async () => {
    const photos = await import('/js/photos.js');
    const owner = localStorage.getItem('braw_session_v1');
    const all = await photos.allPhotos(owner);
    const one = all[0];
    return {
      count: all.length,
      w: one?.w,
      tripId: one?.tripId,
      grade: one ? photos.printGrade(one, 297) : null,
      owner: one?.owner === owner,
    };
  });
  console.log('  after restoring:',
    JSON.stringify({ recovered: after.count, px: after.w, journey: after.tripId,
      printsAtA4: after.grade, filedToThisAccount: after.owner }));
  if (after.count !== 1 || after.w !== before.w || after.grade !== 'good' || !after.owner) {
    console.log('  !! a photograph did not come back intact');
    process.exitCode = 1;
  } else {
    console.log('  the photograph came back at full print resolution, on its journey');
  }

  console.log('\nERRORS:', errs.length?errs:'none');
  await b.close();
})();
