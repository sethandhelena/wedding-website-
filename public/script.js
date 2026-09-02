document.addEventListener('DOMContentLoaded', function () {
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
  if(intro&&intro.textContent.includes('static preview')) intro.textContent='Enter your information below to let us know whether you’ll be celebrating with us. Your response will be securely saved for Seth & Helena.';

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

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const submit=form.querySelector('[type="submit"]');
    const old=submit.textContent;
    submit.disabled=true;
    submit.textContent='Sending…';
    if(msg){msg.textContent='';msg.className='form-message';}
    try{
      const formData=new FormData(form);
      const body=Object.fromEntries(formData.entries());
      const meals=formData.getAll('meal').filter(Boolean);
      body.meal=meals.join(', ');
      const res=await fetch('/api/rsvp',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify(body)
      });
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||'Unable to submit RSVP.');

      const successText=data.message||'Thank you! Your RSVP has been successfully submitted.';
      form.reset();
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
  let store=''; if(pathname.includes('target-registry'))store='target';else if(pathname.includes('crate-barrel-registry'))store='crate';else if(pathname.includes('honeymoon-registry'))store='honeymoon';
  let items=[];
  try{const res=await fetch('/api/registry'+(store?`?store=${encodeURIComponent(store)}`:''));const data=await res.json();if(!res.ok)throw new Error();items=data.items||[];if(items.length)renderRegistryItems(grid,items,!!store)}catch{items=Array.from(grid.querySelectorAll('.gift-card')).map((el,i)=>({el,index:i,store:el.dataset.store,status:el.dataset.status}))}

  if(store)return;
  const buttons=Array.from(document.querySelectorAll('.registry-filter')); const more=document.getElementById('registryLoadMore'); let expanded=false,active='all';
  function apply(){const cards=Array.from(grid.querySelectorAll('.gift-card'));cards.forEach((card,i)=>{const match=active==='all'||card.dataset.store===active||(active==='available'&&card.dataset.status==='available');const visible=match&&(expanded||i<6||active!=='all');card.hidden=!visible;card.style.display=visible?'':'none'});if(more){more.textContent=expanded?'Show Fewer Registry Items':'Browse More Registry Items';more.setAttribute('aria-expanded',expanded?'true':'false')}}
  buttons.forEach(btn=>{btn.addEventListener('click',()=>{active=btn.dataset.filter||'all';buttons.forEach(b=>{const yes=b===btn;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',yes?'true':'false')});if(active!=='all')expanded=true;apply()})});
  if(more)more.addEventListener('click',()=>{expanded=!expanded;if(!expanded&&active!=='all'){active='all';buttons.forEach(b=>b.classList.toggle('active',b.dataset.filter==='all'))}apply()});
  apply();
}

function renderRegistryItems(grid,items,showAll){
  grid.innerHTML=items.map((item,i)=>{const extra=!showAll&&i>=6?' registry-extra':'';const imageStyle=item.image_url?` style="background-image:url('${escapeAttr(item.image_url)}')"`:'';const imageClass=escapeAttr(item.image_class||'');const label=item.featured?'Most Wanted':item.status==='purchased'?'Purchased':'Available';const labelClass=item.featured?' wanted':item.status==='purchased'?' purchased-label':'';const action=item.status==='purchased'?'<span class="btn gift-btn disabled">Purchased</span>':`<a class="btn gift-btn" href="${escapeAttr(item.gift_url||'#')}"${externalAttrs(item.gift_url)}>${item.store==='honeymoon'?'Contribute':'View Gift'}</a>`;return `<article class="gift-card${extra}${item.status==='purchased'?' purchased':''}" data-store="${escapeAttr(item.store)}" data-status="${escapeAttr(item.status)}"><div class="gift-image ${imageClass}"${imageStyle}></div><div class="gift-content"><div class="gift-meta"><span>${escapeHtml(storeLabel(item.store))}</span><span class="gift-status${labelClass}">${escapeHtml(label)}</span></div><h3>${escapeHtml(item.title)}</h3><p class="gift-price">${escapeHtml(item.price||'')}</p><p>${escapeHtml(item.description||'')}</p>${action}</div></article>`}).join('')
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

function loadEditableBackground(el,url){
  el.classList.remove('admin-image-ready');
  el.style.setProperty('background-image','none','important');

  const image=new Image();
  image.decoding='async';

  image.onload=()=>{
    const safeUrl=String(url).replace(/"/g,'%22');
    el.style.setProperty('background-image',`url("${safeUrl}")`,'important');
    requestAnimationFrame(()=>el.classList.add('admin-image-ready'));
  };

  image.onerror=()=>{
    el.style.setProperty('background-image','none','important');
    el.classList.add('admin-image-ready');
  };

  image.src=url;
}

async function initEditablePageContent(){
  const page=document.body.dataset.page;
  if(!page)return;
  try{
    const res=await fetch(`/api/pages/${encodeURIComponent(page)}`);
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
      if(url){
        loadEditableBackground(el,url);
      }else{
        // No Admin replacement is saved, so use the site's original placeholder image.
        el.style.removeProperty('background-image');
        el.classList.add('admin-image-ready');
      }
    });
  }catch{}
}

async function initJournal(){
  const grid=document.querySelector('.post-grid.full'); if(!grid)return;
  let posts=[];
  try{
    const res=await fetch('/api/journal');
    const data=await res.json();
    if(!res.ok)throw new Error();
    posts=data.posts||[];
    // The newest published post is featured above, so do not repeat it here.
    const latestPosts=posts.slice(1);
    if(latestPosts.length){
      grid.innerHTML=latestPosts.map((p,i)=>journalCardMarkup(p,i>=6)).join('');
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
  button.addEventListener('click',()=>{expanded=!expanded;render()});
  render();
}



/* Static Journal article: Places to Stay Near Willmar */
const PLACES_TO_STAY_POST = {"id": "places-to-stay-near-willmar", "slug": "places-to-stay-near-willmar", "title": "Places to Stay Near Willmar", "category": "Travel", "post_date": "September 2, 2026", "excerpt": "A few hotel and vacation-rental recommendations to help make your wedding weekend in Willmar comfortable and easy.", "image_url": "/assets/places-to-stay-willmar-hotel-hero.jpg", "image_class": "", "content": "There isn’t a required hotel block for our wedding. We wanted everyone to have the flexibility to choose the stay that works best for their plans and budget, so we gathered a few nearby options to make planning your weekend a little easier.\n\nBest Western Plus Willmar\n\nBest Western Plus Willmar is a convenient full-service option in Willmar. It offers complimentary breakfast, an indoor pool and whirlpool, free Wi-Fi, and on-site dining. It’s a practical option for guests who want hotel amenities and an easy home base for the wedding weekend.\n\n2100 Highway 12 E, Willmar, MN 56201\n\nView hotel and availability:\nhttps://www.bestwestern.com/en_US/book/hotels-in-willmar/best-western-plus-willmar/propertyCode.24139.html\n\nHoliday Inn Express & Suites Willmar\n\nHoliday Inn Express & Suites Willmar is another comfortable choice. Guests can enjoy complimentary breakfast, an indoor pool, Wi-Fi, a fitness center, and convenient access around Willmar.\n\n250 23rd Street SE, Willmar, MN 56201\n\nView hotel and availability:\nhttps://www.ihg.com/holidayinnexpress/hotels/us/en/willmar/stcwm/hoteldetail\n\nAirbnb & Vacation Rentals\n\nFor families, couples traveling together, or groups who would like a little more space, a vacation rental can be a great alternative to a hotel. Willmar and the surrounding Spicer and New London area have homes, cabins, and lakeside stays that may work well for a longer wedding weekend.\n\nBrowse Willmar-area rentals:\nhttps://www.airbnb.com/willmar-mn/stays\n\nA Quick Note\n\nAvailability and rates can change, especially around weekends and events, so we recommend booking early and checking each property directly for the most current details.\n\nWe hope these recommendations make planning your stay a little easier. We’re so grateful you’re making the trip to celebrate with us, and we can’t wait to see you in Willmar.\n\nWith love,\nSeth & Helena"};

async function initFeaturedJournal(){
  const section=document.getElementById('featuredJournalStory');
  if(!section)return;

  try{
    const res=await fetch('/api/journal?limit=1');
    const data=await res.json();
    if(!res.ok)throw new Error(data.error||'Could not load featured post.');

    const p=(data.posts||[])[0];
    if(!p)return;

    const image=document.getElementById('featuredJournalImage');
    const meta=document.getElementById('featuredJournalMeta');
    const title=document.getElementById('featuredJournalTitle');
    const excerpt=document.getElementById('featuredJournalExcerpt');
    const link=document.getElementById('featuredJournalLink');

    if(image){
      // Remove any previous placeholder/image class that could override the latest post.
      [...image.classList].forEach(cls=>{
        if(/^journal-|^post-image-|^featured-image-/.test(cls)) image.classList.remove(cls);
      });

      if(p.image_url){
        loadEditableBackground(image,p.image_url);
      }else{
        image.style.removeProperty('background-image');
        if(p.image_class){
          String(p.image_class).split(/\s+/).filter(Boolean).forEach(cls=>image.classList.add(cls));
        }
        image.classList.add('admin-image-ready');
      }
    }

    if(meta)meta.textContent=[p.post_date,p.category].filter(Boolean).join(' · ');
    if(title)title.textContent=p.title||'';
    if(excerpt)excerpt.textContent=p.excerpt||'';
    if(link)link.href=`journal-post.html?id=${encodeURIComponent(p.id)}`;
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

    container.innerHTML=`
      <article class="journal-post-article">
        <div class="journal-post-hero post-image ${escapeAttr(p.image_class||'')}"${imageStyle}></div>
        <div class="journal-post-content">
          <p class="eyebrow">Wedding Journal</p>
          <p class="post-date">${escapeHtml([p.post_date,p.category].filter(Boolean).join(' · '))}</p>
          <h1>${escapeHtml(p.title)}</h1>
          ${p.excerpt?`<p class="journal-post-lead">${escapeHtml(p.excerpt)}</p>`:''}
          <div class="journal-post-body">${content}</div>
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
