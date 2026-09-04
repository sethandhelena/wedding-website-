document.addEventListener('DOMContentLoaded', function () {
  applyCachedPageImages();
  initCountdown();
  initNavigation();
  initReveal();
  initRsvp();
  initRegistry();
  initJournal();
  initFeaturedJournal();
  initHomeJournal();
  initJournalPost();
  initEditablePageContent();
  initMap();
});

function initCountdown(){
  const countdown=document.getElementById('countdown'); if(!countdown)return;
  const target=new Date(countdown.dataset.date).getTime();
  function update(){const distance=target-Date.now();const els=['days','hours','minutes','seconds'].map(id=>document.getElementById(id));if(els.some(x=>!x))return;if(distance<=0){['000','00','00','00'].forEach((v,i)=>els[i].textContent=v);return}const d=Math.floor(distance/86400000),h=Math.floor((distance%86400000)/3600000),m=Math.floor((distance%3600000)/60000),s=Math.floor((distance%60000)/1000);els[0].textContent=String(d).padStart(3,'0');els[1].textContent=String(h).padStart(2,'0');els[2].textContent=String(m).padStart(2,'0');els[3].textContent=String(s).padStart(2,'0')}
  update();setInterval(update,1000);
}

function initNavigation(){const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.nav');if(!toggle||!nav)return;toggle.addEventListener('click',()=>{nav.classList.toggle('open');toggle.setAttribute('aria-expanded',nav.classList.contains('open')?'true':'false')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}))}

function initReveal(){const els=document.querySelectorAll('.reveal');if('IntersectionObserver'in window&&els.length){const ob=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ob.unobserve(e.target)}}),{threshold:.12});els.forEach(e=>ob.observe(e))}else els.forEach(e=>e.classList.add('visible'))}

function initRsvp(){
  const form=document.getElementById('rsvpForm'); if(!form)return;
  const msg=document.getElementById('formMessage');
  const intro=document.querySelector('.rsvp-page-intro p:last-child');
  const guestsWrap=form.querySelector('[data-household-guests]');
  const guestCountSelect=form.querySelector('select[name="guests"]');
  const primaryNameInput=form.querySelector('input[name="name"]');

  if(intro&&intro.textContent.includes('static preview')){
    intro.textContent='Enter one household email, then include everyone in your party — adults and children — below.';
  }

  function showRsvpNotice(type,text){
    if(msg){
      msg.textContent=text;
      msg.className='form-message rsvp-message '+type;
      msg.setAttribute('role', type==='success' ? 'status' : 'alert');
    }

    let notice=document.getElementById('rsvpSuccessNotice');
    if(!notice){
      notice=document.createElement('div');
      notice.id='rsvpSuccessNotice';
      notice.className='rsvp-success-notice';
      notice.setAttribute('role','status');
      notice.setAttribute('aria-live','polite');
      notice.innerHTML='<div class="rsvp-success-icon">✓</div><div><strong>RSVP Submitted</strong><p>Thank you! Your RSVP has been successfully submitted.</p></div><button type="button" class="rsvp-success-close" aria-label="Close confirmation">×</button>';
      document.body.appendChild(notice);
      notice.querySelector('.rsvp-success-close').addEventListener('click',()=>notice.classList.remove('show'));
    }

    if(type==='success'){
      notice.querySelector('p').textContent=text;
      notice.classList.add('show');
      setTimeout(()=>notice.classList.remove('show'),8000);
    }
  }

  function guestCardMarkup(index){
    const isPrimary=index===0;
    const n=index+1;

    return `
      <section class="household-guest-card" data-household-guest="${index}">
        <div class="household-guest-card-head">
          <span class="household-guest-number">${isPrimary?'Primary Guest':`Guest ${n}`}</span>
          ${isPrimary?'<small>Uses the name entered above</small>':''}
        </div>

        ${isPrimary
          ? `<input type="hidden" name="household_guest_${n}_name" data-household-name="${index}">`
          : `<label>Guest Name
              <input type="text" name="household_guest_${n}_name" data-household-name="${index}" placeholder="First and last name">
            </label>`
        }

        <div class="household-guest-row">
          <label>Guest Type
            <select name="household_guest_${n}_type" data-household-type="${index}">
              <option value="Adult" selected>Adult</option>
              <option value="Child">Child</option>
            </select>
          </label>

          <fieldset class="household-meal-fieldset">
            <legend>Meal Choice</legend>
            <div class="household-meal-options">
              ${['Chicken','Beef','Vegetarian'].map(meal=>`
                <label class="household-meal-choice">
                  <input type="radio" name="household_guest_${n}_meal" value="${meal}" data-household-meal="${index}">
                  <span>${meal}</span>
                </label>`).join('')}
            </div>
          </fieldset>
        </div>
      </section>`;
  }

  function syncPrimaryGuestName(){
    const hidden=form.querySelector('[data-household-name="0"]');
    if(hidden)hidden.value=(primaryNameInput?.value||'').trim();
  }

  function renderHouseholdGuests(){
    if(!guestsWrap||!guestCountSelect)return;
    const count=Math.max(1,Math.min(6,Number(guestCountSelect.value||1)));
    const existing={};

    guestsWrap.querySelectorAll('[data-household-guest]').forEach(card=>{
      const idx=Number(card.dataset.householdGuest);
      existing[idx]={
        name:card.querySelector('[data-household-name]')?.value||'',
        type:card.querySelector('[data-household-type]')?.value||'Adult',
        meal:card.querySelector('[data-household-meal]:checked')?.value||''
      };
    });

    guestsWrap.innerHTML=Array.from({length:count},(_,i)=>guestCardMarkup(i)).join('');

    for(let i=0;i<count;i++){
      const prior=existing[i];
      const card=guestsWrap.querySelector(`[data-household-guest="${i}"]`);
      const name=card?.querySelector('[data-household-name]');
      const type=card?.querySelector('[data-household-type]');
      if(prior){
        if(name && i!==0)name.value=prior.name||'';
        if(type)type.value=prior.type||'Adult';
        if(prior.meal){
          const meal=Array.from(card.querySelectorAll('[data-household-meal]')).find(el=>el.value===prior.meal);
          if(meal)meal.checked=true;
        }
      }
    }

    syncPrimaryGuestName();
  }

  function attendanceIsAccepted(){
    return form.querySelector('input[name="attendance"]:checked')?.value==='Joyfully accepts';
  }

  function setHouseholdRequiredState(){
    const accepted=attendanceIsAccepted();
    guestsWrap?.querySelectorAll('[data-household-guest]').forEach((card,index)=>{
      const name=card.querySelector('[data-household-name]');
      const meals=card.querySelectorAll('[data-household-meal]');
      if(name && index>0)name.required=accepted;
      meals.forEach(meal=>meal.required=accepted);
    });
  }

  guestCountSelect?.addEventListener('change',()=>{
    renderHouseholdGuests();
    setHouseholdRequiredState();
  });

  primaryNameInput?.addEventListener('input',syncPrimaryGuestName);

  form.querySelectorAll('input[name="attendance"]').forEach(input=>{
    input.addEventListener('change',setHouseholdRequiredState);
  });

  renderHouseholdGuests();
  setHouseholdRequiredState();

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    syncPrimaryGuestName();
    setHouseholdRequiredState();

    if(!form.reportValidity())return;

    const submit=form.querySelector('[type="submit"]');
    const old=submit.textContent;
    submit.disabled=true;
    submit.textContent='Sending…';
    if(msg){msg.textContent='';msg.className='form-message';}

    try{
      const formData=new FormData(form);
      const body=Object.fromEntries(formData.entries());
      const count=Math.max(1,Math.min(6,Number(formData.get('guests')||1)));
      const accepted=body.attendance==='Joyfully accepts';
      const household=[];

      for(let i=0;i<count;i++){
        const n=i+1;
        const name=i===0
          ? String(body.name||'').trim()
          : String(formData.get(`household_guest_${n}_name`)||'').trim();
        const type=String(formData.get(`household_guest_${n}_type`)||'Adult');
        const meal=String(formData.get(`household_guest_${n}_meal`)||'');

        if(accepted && (!name || !meal)){
          throw new Error(`Please complete the name and meal choice for Guest ${n}.`);
        }

        household.push({name,type,meal});
      }

      body.guests=count;
      body.meal=accepted
        ? household.map(g=>`${g.name}${g.type==='Child'?' (Child)':''} — ${g.meal}`).join('; ')
        : '';

      const originalNote=String(formData.get('message')||'').trim();
      const householdLines=household.map((g,i)=>
        `${i+1}. ${g.name} | ${g.type}${g.meal?` | ${g.meal}`:''}`
      );

      body.message=`HOUSEHOLD RSVP\n${householdLines.join('\n')}${originalNote?`\n\nNOTE\n${originalNote}`:''}`;

      Object.keys(body).forEach(key=>{
        if(/^household_guest_\d+_/.test(key))delete body[key];
      });

      const res=await fetch('/api/rsvp',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(body)
      });

      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Unable to submit RSVP.');

      const successText=data.message||'Thank you! Your household RSVP has been successfully submitted.';
      form.reset();
      if(guestCountSelect)guestCountSelect.value='1';
      renderHouseholdGuests();
      setHouseholdRequiredState();
      showRsvpNotice('success',successText);
      if(msg)msg.scrollIntoView({behavior:'smooth',block:'center'});
    }catch(err){
      showRsvpNotice('error',err.message||'Unable to submit RSVP. Please try again.');
      if(msg)msg.scrollIntoView({behavior:'smooth',block:'center'});
    }finally{
      submit.disabled=false;
      submit.textContent=old;
    }
  });
}

async function initRegistry(){
  const grid=document.querySelector('.registry-items-grid'); if(!grid)return;

  const pathname=location.pathname.toLowerCase();
  let store='';
  if(pathname.includes('target-registry'))store='target';
  else if(pathname.includes('crate-barrel-registry'))store='crate';
  else if(pathname.includes('honeymoon-registry'))store='honeymoon';

  const cacheKey=`wedding-registry:${store||'all'}`;
  let items=[];

  try{
    const cached=JSON.parse(localStorage.getItem(cacheKey)||'[]');
    if(Array.isArray(cached) && cached.length){
      items=cached;
      renderRegistryItems(grid,items,!!store);
    }
  }catch{}

  try{
    const res=await fetch('/api/registry'+(store?`?store=${encodeURIComponent(store)}`:''),{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw new Error();

    const freshItems=data.items||[];
    if(freshItems.length){
      const previousJson=stableJson(items);
      const freshJson=stableJson(freshItems);

      items=freshItems;

      // Only rebuild the registry DOM when something actually changed.
      if(previousJson!==freshJson){
        renderRegistryItems(grid,items,!!store);
      }

      try{localStorage.setItem(cacheKey,freshJson);}catch{}
    }
  }catch{
    if(!items.length){
      items=Array.from(grid.querySelectorAll('.gift-card')).map((el,i)=>({
        el,index:i,store:el.dataset.store,status:el.dataset.status
      }));
    }
  }

  grid.classList.remove('registry-data-loading');

  if(store)return;

  const buttons=Array.from(document.querySelectorAll('.registry-filter'));
  const more=document.getElementById('registryLoadMore');
  let expanded=false,active='all';

  function apply(){
    const cards=Array.from(grid.querySelectorAll('.gift-card'));
    cards.forEach((card,i)=>{
      const match=active==='all'||card.dataset.store===active||(active==='available'&&card.dataset.status==='available');
      const visible=match&&(expanded||i<6||active!=='all');
      card.hidden=!visible;
      card.style.display=visible?'':'none';
    });
    if(more){
      more.textContent=expanded?'Show Fewer Registry Items':'Browse More Registry Items';
      more.setAttribute('aria-expanded',expanded?'true':'false');
    }
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click',()=>{
      active=btn.dataset.filter||'all';
      buttons.forEach(b=>{
        const yes=b===btn;
        b.classList.toggle('active',yes);
        b.setAttribute('aria-pressed',yes?'true':'false');
      });
      if(active!=='all')expanded=true;
      apply();
    });
  });

  if(more)more.addEventListener('click',()=>{
    expanded=!expanded;
    if(!expanded&&active!=='all'){
      active='all';
      buttons.forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'));
    }
    apply();
  });

  apply();
}

function renderRegistryItems(grid,items,showAll){
  grid.innerHTML=items.map((item,i)=>{const extra=!showAll&&i>=6?' registry-extra':'';const freshItemImage=item.image_url?freshManagedImageUrl(item.image_url):'';const imageStyle=freshItemImage?` style="background-image:url('${escapeAttr(freshItemImage)}')"`:'';const imageClass=escapeAttr(item.image_class||'');const label=item.featured?'Most Wanted':item.status==='purchased'?'Purchased':'Available';const labelClass=item.featured?' wanted':item.status==='purchased'?' purchased-label':'';const action=item.status==='purchased'?'<span class="btn gift-btn disabled">Purchased</span>':`<a class="btn gift-btn" href="${escapeAttr(item.gift_url||'#')}"${externalAttrs(item.gift_url)}>${item.store==='honeymoon'?'Contribute':'View Gift'}</a>`;return `<article class="gift-card${extra}${item.status==='purchased'?' purchased':''}" data-store="${escapeAttr(item.store)}" data-status="${escapeAttr(item.status)}"><div class="gift-image ${imageClass}"${imageStyle}></div><div class="gift-content"><div class="gift-meta"><span>${escapeHtml(storeLabel(item.store))}</span><span class="gift-status${labelClass}">${escapeHtml(label)}</span></div><h3>${escapeHtml(item.title)}</h3><p class="gift-price">${escapeHtml(item.price||'')}</p><p>${escapeHtml(item.description||'')}</p>${action}</div></article>`}).join('')
}




function initActiveNavigation(){
  const path=location.pathname.toLowerCase();
  const current=(path.split('/').pop()||'index.html').split('?')[0].split('#')[0];

  let active=current;
  if(active==='journal-post.html') active='journal.html';

  document.querySelectorAll('.site-header nav a, .site-header .nav a').forEach(link=>{
    const raw=(link.getAttribute('href')||'').toLowerCase();
    const href=raw.split('?')[0].split('#')[0].split('/').pop();

    const isActive=href===active;

    link.classList.toggle('active-page',isActive);

    if(isActive){
      link.setAttribute('aria-current','page');
      link.style.borderBottom='2px solid currentColor';
      link.style.paddingBottom='6px';
    }else{
      link.removeAttribute('aria-current');
      link.style.removeProperty('border-bottom');
      link.style.removeProperty('padding-bottom');
    }
  });
}

function getCachedPageImages(page){
  try{
    return JSON.parse(localStorage.getItem(`wedding-page-images:${page}`)||'{}');
  }catch{
    return {};
  }
}

function setCachedPageImages(page,content){
  try{
    const images={};
    document.querySelectorAll('[data-content-bg]').forEach(el=>{
      const key=el.dataset.contentBg;
      const url=content?.[key];
      if(url)images[key]=url;
    });
    localStorage.setItem(`wedding-page-images:${page}`,JSON.stringify(images));
  }catch{}
}

function applyCachedPageImages(){
  const page=document.body?.dataset?.page;
  if(!page)return;

  const cached=getCachedPageImages(page);
  document.querySelectorAll('[data-content-bg]').forEach(el=>{
    const key=el.dataset.contentBg;
    const url=cached[key];
    if(!url)return;

    const safeUrl=String(url).replace(/"/g,'%22');
    el.style.setProperty('background-image',`url("${safeUrl}")`,'important');
    markPageImageApplied(el,url);
    el.classList.add('admin-image-ready');
  });
}

function pageImageUrlAlreadyApplied(el,url){
  const current=String(el.dataset.currentImageUrl||'').trim();
  return current && current===String(url||'').trim();
}

function markPageImageApplied(el,url){
  el.dataset.currentImageUrl=String(url||'').trim();
}

function stableJson(value){
  try{return JSON.stringify(value||[])}catch{return ''}
}

function freshManagedImageUrl(url){
  // Use the saved image URL exactly as stored.
  // This allows the browser to cache images normally for much faster repeat loads.
  // When Admin saves a newly uploaded image with a new URL, the browser will fetch that new file.
  return String(url||'').trim();
}

function loadEditableBackground(el,url){
  el.classList.remove('admin-image-ready');
  el.style.setProperty('background-image','none','important');

  const requestedUrl=freshManagedImageUrl(url);
  const image=new Image();
  image.decoding='async';

  image.onload=()=>{
    const safeUrl=String(requestedUrl).replace(/"/g,'%22');
    el.style.setProperty('background-image',`url("${safeUrl}")`,'important');
    requestAnimationFrame(()=>el.classList.add('admin-image-ready'));
  };

  image.onerror=()=>{
    // Fall back only if the current saved image genuinely cannot be loaded.
    el.style.removeProperty('background-image');
    el.classList.add('admin-image-ready');
  };

  image.src=requestedUrl;
}

async function initEditablePageContent(){
  const page=document.body.dataset.page;
  if(!page)return;

  try{
    const res=await fetch(`/api/pages/${encodeURIComponent(page)}`,{cache:'no-store'});
    const data=await res.json();
    if(!res.ok || !data.content)return;

    const content=data.content;

    document.querySelectorAll('[data-content]').forEach(el=>{
      const key=el.dataset.content;
      if(!(key in content))return;
      const value=content[key]??'';
      const mode=el.dataset.contentMode||'text';
      if(mode==='multiline'){
        el.innerHTML=escapeHtml(value).replace(/\n/g,'<br>');
      }else{
        el.textContent=value;
      }
    });

    document.querySelectorAll('[data-content-href]').forEach(el=>{
      const key=el.dataset.contentHref;
      if(content[key])el.setAttribute('href',content[key]);
    });

    document.querySelectorAll('[data-content-bg]').forEach(el=>{
      const key=el.dataset.contentBg;
      const url=content[key]||'';

      if(!url){
        el.classList.add('admin-image-ready');
        return;
      }

      // If the same saved image is already visible, leave it completely untouched.
      // This avoids unnecessary repaints and tiny flashes on refresh/navigation.
      if(pageImageUrlAlreadyApplied(el,url)){
        el.classList.add('admin-image-ready');
        return;
      }

      const requestedUrl=freshManagedImageUrl(url);
      const image=new Image();
      image.decoding='async';

      image.onload=()=>{
        const safeUrl=String(requestedUrl).replace(/"/g,'%22');

        // Keep the existing image visible until the replacement is fully decoded.
        requestAnimationFrame(()=>{
          el.style.setProperty('background-image',`url("${safeUrl}")`,'important');
          markPageImageApplied(el,url);
          el.classList.add('admin-image-ready');
        });
      };

      image.src=requestedUrl;
    });

    setCachedPageImages(page,content);
  }catch{}
}

async function initJournal(){
  const grid=document.querySelector('.post-grid.full'); if(!grid)return;
  let posts=[];

  try{
    const res=await fetch('/api/journal',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw new Error();

    const dbPosts=data.posts||[];
    posts=[...dbPosts];

    const hasPlacesToStay=posts.some(p=>
      String(p.title||'').trim().toLowerCase()==='places to stay near willmar'
    );

    if(!hasPlacesToStay)posts.push(PLACES_TO_STAY_POST);

    const featuredId=dbPosts[0]?.id;
    const latestPosts=posts.filter(p=>String(p.id)!==String(featuredId));

    if(latestPosts.length){
      grid.innerHTML=latestPosts.map((p,i)=>{
        const extra=i>=6;
        if(p.slug==='places-to-stay-near-willmar'){
          return journalCardMarkup(p,extra,' places-to-stay-card')
            .replace(
              `journal-post.html?id=${encodeURIComponent(p.id)}`,
              'journal-post.html?slug=places-to-stay-near-willmar'
            );
        }
        return journalCardMarkup(p,extra);
      }).join('');
    }else{
      grid.innerHTML='';
    }
  }catch{}

  const button=document.getElementById('journalLoadMore');
  if(!button)return;
  let expanded=false;

  function render(){
    document.querySelectorAll('.journal-extra').forEach(p=>{
      p.hidden=!expanded;
      p.style.display=expanded?'':'none';
    });
    button.textContent=expanded?'Show Fewer Journals':'View More Journals';
    button.setAttribute('aria-expanded',expanded?'true':'false');
  }

  button.addEventListener('click',()=>{
    expanded=!expanded;
    render();
  });

  render();
}

/* Static Journal article: Places to Stay Near Willmar */
const PLACES_TO_STAY_POST = {"id": "places-to-stay-near-willmar", "slug": "places-to-stay-near-willmar", "title": "Places to Stay Near Willmar", "category": "Travel", "post_date": "September 2, 2026", "excerpt": "A few hotel and vacation-rental recommendations to help make your wedding weekend in Willmar comfortable, convenient, and easy to plan.", "image_url": "/assets/places-to-stay-willmar-hotel-hero.jpg", "image_class": "", "content": "There isn’t a required hotel block for our wedding. We wanted everyone to have the flexibility to choose the stay that works best for their plans and budget, so we gathered a few nearby options to make planning your weekend a little easier."};

async function initFeaturedJournal(){
  const image=document.getElementById('featuredJournalImage');
  const meta=document.getElementById('featuredJournalMeta');
  const title=document.getElementById('featuredJournalTitle');
  const excerpt=document.getElementById('featuredJournalExcerpt');
  const link=document.getElementById('featuredJournalLink');

  if(!image)return;

  try{
    const res=await fetch('/api/journal?limit=1',{cache:'no-store'});
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Could not load featured post.');

    const p=(data.posts||[])[0];
    if(!p)return;

    const nextMeta=[p.post_date,p.category].filter(Boolean).join(' · ');
    const nextHref=`journal-post.html?id=${encodeURIComponent(p.id)}`;

    // Update text without rebuilding the section.
    if(meta && meta.textContent!==nextMeta)meta.textContent=nextMeta;
    if(title && title.textContent!==(p.title||''))title.textContent=p.title||'';
    if(excerpt && excerpt.textContent!==(p.excerpt||''))excerpt.textContent=p.excerpt||'';
    if(link && link.getAttribute('href')!==nextHref)link.href=nextHref;

    if(p.image_url){
      const nextUrl=String(p.image_url);
      const currentUrl=String(image.dataset.currentFeaturedImage||'');

      // If the current image is already correct, leave it completely untouched.
      if(currentUrl!==nextUrl){
        const preload=new Image();
        preload.decoding='async';

        preload.onload=()=>{
          const safeUrl=nextUrl.replace(/"/g,'%22');
          requestAnimationFrame(()=>{
            image.style.setProperty(
              'background-image',
              `url("${safeUrl}")`,
              'important'
            );
            image.dataset.currentFeaturedImage=nextUrl;
            image.classList.add('admin-image-ready');
          });
        };

        preload.src=nextUrl;
      }
    }else{
      // Only clear it if the CURRENT featured post genuinely has no image.
      image.style.removeProperty('background-image');
      image.dataset.currentFeaturedImage='';
      image.classList.add('admin-image-ready');
    }

    try{
      localStorage.setItem('wedding-featured-journal',JSON.stringify({
        image_url:p.image_url||'',
        meta:nextMeta,
        title:p.title||'',
        excerpt:p.excerpt||'',
        href:nextHref
      }));
    }catch{}
  }catch(err){
    console.error('Featured journal failed to load',err);
  }
}

async function initHomeJournal(){
  const grid=document.getElementById('homeJournalGrid');
  if(!grid)return;
  try{
    const res=await fetch('/api/journal?limit=3');
    const data=await res.json();
    if(!res.ok)throw new Error();
    const posts=data.posts||[];
    if(posts.length){
      grid.innerHTML=posts.map(p=>journalCardMarkup(p,false,'')).join('');
    }
  }catch{}
}

function journalCardMarkup(p,extra=false,extraClass=''){
  const cls=`post-card${extra?' journal-extra':''}${extraClass}`;
  const imageStyle=p.image_url?` style="background-image:url('${escapeAttr(p.image_url)}')"`:'';
  return `<article class="${cls}">
    <div class="post-image ${escapeAttr(p.image_class||'')}"${imageStyle}></div>
    <div class="post-content">
      <p class="post-date">${escapeHtml([p.post_date,p.category].filter(Boolean).join(' · '))}</p>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.excerpt||'')}</p>
      <a href="journal-post.html?id=${encodeURIComponent(p.id)}">Read More</a>
    </div>
  </article>`;
}

async function initJournalPost(){
  const container=document.getElementById('journalPost');
  if(!container)return;

  const params=new URLSearchParams(location.search);
  const slug=params.get('slug');
  const id=params.get('id');

  let p=null;

  if(slug==='places-to-stay-near-willmar'){
    p=PLACES_TO_STAY_POST;
    try{
      const listingRes=await fetch('/api/journal?limit=100',{cache:'no-store'});
      const listingData=await listingRes.json();
      if(listingRes.ok){
        const match=(listingData.posts||[]).find(post=>
          String(post.title||'').trim().toLowerCase()==='places to stay near willmar'
        );
        if(match?.id){
          const postRes=await fetch(`/api/journal?id=${encodeURIComponent(match.id)}`,{cache:'no-store'});
          const postData=await postRes.json();
          if(postRes.ok && postData.post)p=postData.post;
        }
      }
    }catch{}
  }else{
    if(!id){
      container.innerHTML='<div class="journal-post-error"><h1>Journal Post Not Found</h1><p>Please return to the journal and choose a post.</p></div>';
      return;
    }

    try{
      const res=await fetch(`/api/journal?id=${encodeURIComponent(id)}`);
      const data=await res.json();
      if(!res.ok || !data.post)throw new Error(data.error||'Journal post not found.');
      p=data.post;
    }catch(err){
      container.innerHTML=`<div class="journal-post-error"><h1>Journal Post Not Found</h1><p>${escapeHtml(err.message||'This post is unavailable.')}</p></div>`;
      return;
    }
  }

  try{
    document.title=`${p.title} | Seth & Helena`;

    const imageStyle=p.image_url?` style="background-image:url('${escapeAttr(p.image_url)}')"`:'';
    const content=formatJournalContent(p.content||p.excerpt||'');

    const placesToStayGallery = (p.slug==='places-to-stay-near-willmar' || String(p.title||'').trim().toLowerCase()==='places to stay near willmar') ? `
      <div class="stay-journal-gallery">
        <article class="stay-journal-card">
          <img src="assets/stay-hotel-1.jpg" alt="Best Western Plus Willmar hotel" class="stay-journal-card-image">
          <div class="stay-journal-card-copy">
            <p class="eyebrow">Hotel</p>
            <h2>Best Western Plus Willmar</h2>
            <p class="stay-journal-address">2100 Highway 12 E · Willmar, MN</p>
            <p>A convenient full-service option in Willmar with complimentary breakfast, an indoor pool and whirlpool, free Wi-Fi, and on-site dining.</p>
            <ul class="stay-journal-features">
              <li>Complimentary breakfast</li>
              <li>Indoor pool & whirlpool</li>
              <li>Free Wi-Fi</li>
              <li>On-site dining</li>
            </ul>
            <a class="stay-journal-link" href="https://www.bestwestern.com/en_US/book/hotels-in-willmar/best-western-plus-willmar/propertyCode.24139.html" target="_blank" rel="noopener">View Hotel & Availability →</a>
          </div>
        </article>

        <article class="stay-journal-card">
          <img src="assets/stay-hotel-2.jpg" alt="Holiday Inn Express and Suites Willmar hotel" class="stay-journal-card-image">
          <div class="stay-journal-card-copy">
            <p class="eyebrow">Hotel</p>
            <h2>Holiday Inn Express &amp; Suites Willmar</h2>
            <p class="stay-journal-address">250 23rd Street SE · Willmar, MN</p>
            <p>A comfortable and convenient option with complimentary breakfast, an indoor pool, free Wi-Fi, a fitness center, and easy access around Willmar.</p>
            <ul class="stay-journal-features">
              <li>Complimentary breakfast</li>
              <li>Indoor pool</li>
              <li>Fitness center</li>
              <li>Free Wi-Fi & parking</li>
            </ul>
            <a class="stay-journal-link" href="https://www.ihg.com/holidayinnexpress/hotels/us/en/willmar/stcwm/hoteldetail" target="_blank" rel="noopener">View Hotel & Availability →</a>
          </div>
        </article>

        <article class="stay-journal-card">
          <img src="assets/stay-rental.jpg" alt="Comfortable vacation rental near Willmar" class="stay-journal-card-image">
          <div class="stay-journal-card-copy">
            <p class="eyebrow">Vacation Rentals</p>
            <h2>Airbnb &amp; Vacation Rentals</h2>
            <p>For families, couples traveling together, or groups who would like a little more space, vacation rentals can be a great alternative to a hotel.</p>
            <ul class="stay-journal-features">
              <li>More room for families or groups</li>
              <li>Homes, cabins & lakeside stays</li>
              <li>Options around Willmar, Spicer & New London</li>
            </ul>
            <a class="stay-journal-link" href="https://www.airbnb.com/willmar-mn/stays" target="_blank" rel="noopener">Browse Vacation Rentals →</a>
          </div>
        </article>
      </div>

      <aside class="stay-journal-note">
        <h2>A Quick Note</h2>
        <p>Availability and rates can change, especially around weekends and events, so we recommend booking early and checking each property directly for the most current details.</p>
      </aside>

      <p class="stay-journal-closing">We hope these recommendations make planning your stay a little easier. We’re so grateful you’re making the trip to celebrate with us, and we can’t wait to see you in Willmar.</p>
      <p class="signature">Seth &amp; Helena</p>
    ` : '';

    container.innerHTML=`
      <article class="journal-post-article">
        <div class="journal-post-hero post-image ${escapeAttr(p.image_class||'')}"${imageStyle}></div>
        <div class="journal-post-content">
          <p class="eyebrow">Wedding Journal</p>
          <p class="post-date">${escapeHtml([p.post_date,p.category].filter(Boolean).join(' · '))}</p>
          <h1>${escapeHtml(p.title)}</h1>
          ${p.excerpt?`<p class="journal-post-lead">${escapeHtml(p.excerpt)}</p>`:''}
          <div class="journal-post-body">${content}</div>
          ${placesToStayGallery}
        </div>
      </article>`;
  }catch(err){
    container.innerHTML=`<div class="journal-post-error"><h1>Journal Post Not Found</h1><p>${escapeHtml(err.message||'This post is unavailable.')}</p></div>`;
  }
}

function formatJournalContent(value){
  const text=String(value||'').trim();
  if(!text)return '';
  return text
    .split(/\n\s*\n/)
    .map(block=>{
      const safe=escapeHtml(block)
        .replace(/(https:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')
        .replace(/\n/g,'<br>');
      return `<p>${safe}</p>`;
    })
    .join('');
}

function initMap(){document.querySelectorAll('.stonewall-map-toggle').forEach(toggle=>toggle.addEventListener('click',e=>{e.preventDefault();const card=toggle.closest('.detail-card')||toggle.parentElement,panel=card?.querySelector('.stonewall-map-panel');if(!panel)return;const open=panel.hasAttribute('hidden');document.querySelectorAll('.stonewall-map-panel').forEach(p=>p.setAttribute('hidden',''));if(open){panel.removeAttribute('hidden');toggle.setAttribute('aria-expanded','true');panel.scrollIntoView({behavior:'smooth',block:'nearest'})}else{panel.setAttribute('hidden','');toggle.setAttribute('aria-expanded','false')}}));document.querySelectorAll('.stonewall-map-close').forEach(button=>button.addEventListener('click',()=>{const panel=button.closest('.stonewall-map-panel');if(!panel)return;panel.setAttribute('hidden','');const toggle=panel.closest('.detail-card')?.querySelector('.stonewall-map-toggle');if(toggle){toggle.setAttribute('aria-expanded','false');toggle.focus()}}))}

function storeLabel(s){return s==='crate'?'Crate & Barrel':s==='honeymoon'?'Honeymoon Fund':'Target'}
function externalAttrs(url){return url&&/^https?:/i.test(url)?' target="_blank" rel="noopener"':''}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}

// RSVP children select is included automatically through FormData submission.




/* RSVP meal preference limit based on guest count */
function updateMealPreferenceLimit(form) {
  const choices = Array.from(
    form.querySelectorAll('.meal-preferences input[type="checkbox"][name="meal"]')
  );
  if (!choices.length) return;

  const guestSelect = form.querySelector('select[name="guests"]');
  const guestCount = guestSelect ? Math.max(1, parseInt(guestSelect.value || '1', 10)) : 1;
  const maxMeals = Math.min(guestCount, 2);

  const checked = choices.filter(choice => choice.checked);

  /* If guest count is reduced, keep only the first allowed selections. */
  if (checked.length > maxMeals) {
    checked.slice(maxMeals).forEach(choice => {
      choice.checked = false;
    });
  }

  const selectedCount = choices.filter(choice => choice.checked).length;

  choices.forEach(choice => {
    choice.disabled = selectedCount >= maxMeals && !choice.checked;
  });

  const help = form.querySelector('.meal-preferences .meal-help');
  if (help) {
    help.textContent = maxMeals === 1 ? 'Choose one' : 'Choose up to two';
  }
}

document.addEventListener('change', function (event) {
  if (
    event.target.matches('.meal-preferences input[type="checkbox"][name="meal"]') ||
    event.target.matches('select[name="guests"]')
  ) {
    const form = event.target.closest('form');
    if (form) updateMealPreferenceLimit(form);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form').forEach(updateMealPreferenceLimit);

  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('reset', function () {
      setTimeout(() => updateMealPreferenceLimit(form), 0);
    });
  });
});


/* Link Wedding Things to Do directly to Places to Visit Near Willmar */
async function initWillmarGuideLink(){
  const link=document.getElementById('willmarGuideLink');
  if(!link)return;
  try{
    const res=await fetch('/api/journal?limit=50');
    const data=await res.json();
    if(!res.ok)return;
    const post=(data.posts||[]).find(p=>
      String(p.title||'').trim().toLowerCase()==='places to visit near willmar'
    );
    if(post?.id){
      link.href=`journal-post.html?id=${encodeURIComponent(post.id)}`;
    }
  }catch{}
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initWillmarGuideLink);
}else{
  initWillmarGuideLink();
}
/* Add Places to Stay article to Journal listing */

/* Add Places to Stay article to Journal listing */
function addPlacesToStayJournalCard(){
  const grid=document.querySelector('.journal-grid');
  if(!grid || document.getElementById('placesToStayJournalCard'))return;

  const article=document.createElement('article');
  article.className='post-card';
  article.id='placesToStayJournalCard';
  article.innerHTML=`
    <div class="post-image" style="background-image:url('${PLACES_TO_STAY_POST.image_url}')"></div>
    <div class="post-content">
      <p class="post-date">${escapeHtml([PLACES_TO_STAY_POST.post_date,PLACES_TO_STAY_POST.category].join(' · '))}</p>
      <h3>${escapeHtml(PLACES_TO_STAY_POST.title)}</h3>
      <p>${escapeHtml(PLACES_TO_STAY_POST.excerpt)}</p>
      <a href="journal-post.html?slug=places-to-stay-near-willmar">Read More</a>
    </div>`;
  grid.appendChild(article);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>setTimeout(addPlacesToStayJournalCard,350));
}else{
  setTimeout(addPlacesToStayJournalCard,350);
}
