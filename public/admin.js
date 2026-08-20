const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
let registryItems=[]; let journalPosts=[]; let pageContent={}; let activePage='story';


const PAGE_SCHEMAS={
  story:{label:'Our Story',file:'story.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro','textarea'],['hero_image_url','Hero image URL','url']]],
    ['How We Met',[['met_eyebrow','Eyebrow'],['met_title','Heading'],['met_p1','Paragraph 1','textarea'],['met_p2','Paragraph 2','textarea'],['story_image_url','Story image URL','url']]],
    ['Timeline',[['timeline_eyebrow','Eyebrow'],['timeline_title','Heading'],['timeline_1_year','Item 1 year'],['timeline_1_title','Item 1 title'],['timeline_1_text','Item 1 text','textarea'],['timeline_2_year','Item 2 year'],['timeline_2_title','Item 2 title'],['timeline_2_text','Item 2 text','textarea'],['timeline_3_year','Item 3 year'],['timeline_3_title','Item 3 title'],['timeline_3_text','Item 3 text','textarea'],['timeline_4_year','Item 4 year'],['timeline_4_title','Item 4 title'],['timeline_4_text','Item 4 text','textarea'],['timeline_5_year','Item 5 year'],['timeline_5_title','Item 5 title'],['timeline_5_text','Item 5 text','textarea']]],
    ['Proposal',[['proposal_eyebrow','Eyebrow'],['proposal_title','Heading'],['proposal_p1','Paragraph 1','textarea'],['proposal_p2','Paragraph 2','textarea'],['proposal_image_url','Proposal image URL','url']]],
    ['Favorite Moments',[['moments_eyebrow','Eyebrow'],['moments_title','Heading']]],
    ['Call to Action',[['cta_eyebrow','Eyebrow'],['cta_title','Heading'],['cta_text','Text','textarea'],['cta_button','Button label'],['cta_link','Button link']]]
  ]},
  wedding:{label:'Wedding',file:'wedding.html',sections:[
    ['Hero',[['hero_eyebrow','Date / eyebrow'],['hero_title','Page title'],['hero_intro','Venue line'],['hero_image_url','Hero image URL','url']]],
    ['Details',[['details_eyebrow','Eyebrow'],['details_title','Heading'],['details_intro','Intro','textarea']]],
    ['Ceremony',[['ceremony_title','Title'],['ceremony_time','Time'],['ceremony_location','Location','textarea']]],
    ['Reception',[['reception_title','Title'],['reception_time','Time'],['reception_text','Details','textarea']]],
    ['Attire',[['attire_title','Title'],['attire_name','Dress code'],['attire_text','Details','textarea']]],
    ['Schedule',[['schedule_eyebrow','Eyebrow'],['schedule_title','Heading']]],
    ['Travel',[['travel_eyebrow','Eyebrow'],['travel_title','Heading'],['hotel_title','Hotel title'],['hotel_text','Hotel text','textarea'],['hotel_button','Hotel button'],['hotel_link','Hotel link'],['directions_title','Directions title'],['directions_text','Directions text','textarea'],['directions_button','Directions button'],['directions_link','Directions link'],['things_title','Things to do title'],['things_text','Things to do text','textarea'],['things_button','Things to do button'],['things_link','Things to do link']]],
    ['FAQ',[['faq_eyebrow','Eyebrow'],['faq_title','Heading'],['faq1_q','Question 1'],['faq1_a','Answer 1','textarea'],['faq2_q','Question 2'],['faq2_a','Answer 2','textarea'],['faq3_q','Question 3'],['faq3_a','Answer 3','textarea'],['faq4_q','Question 4'],['faq4_a','Answer 4','textarea']]],
    ['Call to Action',[['cta_eyebrow','Eyebrow'],['cta_title','Heading'],['cta_text','Text'],['cta_button','Button label'],['cta_link','Button link']]]
  ]},
  rsvp:{label:'RSVP',file:'rsvp.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','RSVP deadline'],['hero_image_url','Hero image URL','url']]],
    ['Form Introduction',[['intro_eyebrow','Eyebrow'],['intro_title','Heading'],['intro_text','Instructions','textarea']]],
    ['Help Section',[['help_eyebrow','Eyebrow'],['help_title','Heading'],['help_text','Text','textarea'],['help_button','Button label'],['help_link','Button link']]]
  ]},
  registry:{label:'Registry',file:'registry.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro'],['hero_image_url','Hero image URL','url']]],
    ['Introduction',[['intro_eyebrow','Eyebrow'],['intro_title','Heading'],['intro_text','Text','textarea']]],
    ['Store Registries',[['stores_eyebrow','Eyebrow'],['stores_title','Heading']]],
    ['Thank You',[['thanks_eyebrow','Eyebrow'],['thanks_title','Heading'],['thanks_text','Text','textarea']]]
  ]},
  journal:{label:'Journal',file:'journal.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro','textarea'],['hero_image_url','Hero image URL','url']]],
    ['Posts Section',[['latest_eyebrow','Eyebrow'],['latest_title','Heading']]],
    ['Call to Action',[['cta_eyebrow','Eyebrow'],['cta_title','Heading'],['cta_text','Text','textarea'],['cta_button','Button label'],['cta_link','Button link']]]
  ]}
};

async function loadPages(){
  const d=await api('/api/admin/pages');
  pageContent=Object.fromEntries((d.items||[]).map(i=>[i.slug,i.content||{}]));
  $('#pagePicker').innerHTML=Object.entries(PAGE_SCHEMAS).map(([slug,s])=>`<button type="button" class="page-pick${slug===activePage?' active':''}" data-page-pick="${slug}"><strong>${escapeHtml(s.label)}</strong><span>${escapeHtml(s.file)}</span></button>`).join('');
  $$('[data-page-pick]').forEach(b=>b.onclick=()=>renderPageEditor(b.dataset.pagePick));
  renderPageEditor(activePage);
}

function renderPageEditor(slug){
  activePage=slug;
  const schema=PAGE_SCHEMAS[slug];
  const values=pageContent[slug]||{};
  $$('.page-pick').forEach(b=>b.classList.toggle('active',b.dataset.pagePick===slug));
  $('#pageEditorTitle').textContent=schema.label;
  $('#pagePreviewLink').href=schema.file;
  $('#pageFields').innerHTML=schema.sections.map(([section,fields])=>`
    <fieldset class="page-fieldset">
      <legend>${escapeHtml(section)}</legend>
      <div class="grid-two">
        ${fields.map(([key,label,type='text'])=>{
          const v=values[key]??'';
          const wide=type==='textarea'?' class="full-field"':'';
          return type==='textarea'
            ? `<label${wide}>${escapeHtml(label)}<textarea name="${escapeAttr(key)}" rows="4">${escapeHtml(v)}</textarea></label>`
            : `<label>${escapeHtml(label)}<input name="${escapeAttr(key)}" type="${type==='url'?'url':'text'}" value="${escapeAttr(v)}"></label>`;
        }).join('')}
      </div>
    </fieldset>`).join('');
  $('#pageMessage').textContent='';
}

async function savePageContent(e){
  e.preventDefault();
  const msg=$('#pageMessage');
  msg.textContent='Saving…';
  const content=Object.fromEntries(new FormData(e.currentTarget).entries());
  try{
    await api(`/api/admin/pages/${activePage}`,{method:'PUT',body:{content}});
    pageContent[activePage]=content;
    msg.textContent='Page saved. Changes are live.';
  }catch(err){
    msg.textContent=err.message;
  }
}


document.addEventListener('DOMContentLoaded', async () => {
  $('#loginForm').addEventListener('submit', login);
  $('#logoutButton').addEventListener('click', logout);
  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
  $('#newRegistryButton').addEventListener('click',()=>editRegistry());
  $('#fetchRegistryDetails').addEventListener('click',fetchRegistryDetails);
  $('#cancelRegistry').addEventListener('click',()=>$('#registryForm').hidden=true);
  $('#registryForm').addEventListener('submit',saveRegistry);
  $('#newJournalButton').addEventListener('click',()=>editJournal());
  $('#cancelJournal').addEventListener('click',()=>$('#journalForm').hidden=true);
  $('#journalForm').addEventListener('submit',saveJournal);
  $('#pageContentForm').addEventListener('submit',savePageContent);
  const session=await api('/api/admin/session');
  if(session?.authenticated) showDashboard();
});

async function api(url, options={}){
  const opts={credentials:'same-origin',...options};
  if(opts.body && typeof opts.body !== 'string'){opts.headers={...(opts.headers||{}),'content-type':'application/json'};opts.body=JSON.stringify(opts.body)}
  const res=await fetch(url,opts); const type=res.headers.get('content-type')||''; const data=type.includes('json')?await res.json():await res.text();
  if(!res.ok){throw new Error(data?.error||'Request failed')}; return data;
}
async function login(e){e.preventDefault();const msg=$('#loginMessage');msg.textContent='Signing in…';try{await api('/api/admin/login',{method:'POST',body:{password:$('#adminPassword').value}});$('#adminPassword').value='';msg.textContent='';showDashboard()}catch(err){msg.textContent=err.message}}
async function logout(){await api('/api/admin/logout',{method:'POST'});location.reload()}
async function showDashboard(){ $('#loginView').hidden=true; $('#dashboardView').hidden=false; await Promise.all([loadStats(),loadRsvps(),loadRegistry(),loadJournal(),loadPages()]); }
function openTab(name){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${name}`))}
async function loadStats(){const d=await api('/api/admin/stats');const s=d.stats;$('#stats').innerHTML=[['RSVP responses',s.rsvps],['Attending guests',s.attendingGuests],['Registry items',s.registryItems],['Journal posts',s.journalPosts]].map(([l,v])=>`<div class="stat"><strong>${escapeHtml(v)}</strong><span>${escapeHtml(l)}</span></div>`).join('')}
async function loadRsvps(){
  const d=await api('/api/admin/rsvps');
  $('#rsvpRows').innerHTML=d.items.map(r=>`<tr>
    <td><strong>${escapeHtml(r.name)}</strong><br>${escapeHtml(r.dietary||'')} ${r.message?`<br><small>${escapeHtml(r.message)}</small>`:''}</td>
    <td>${escapeHtml(r.attendance)}</td>
    <td>${escapeHtml(r.guests)}</td>
    <td>${escapeHtml(r.meal||'')}</td>
    <td><a href="mailto:${escapeAttr(r.email)}">${escapeHtml(r.email)}</a></td>
    <td>${escapeHtml(r.created_at)}</td>
    <td><button type="button" class="danger rsvp-delete" data-delete-rsvp="${r.id}">Delete</button></td>
  </tr>`).join('');
  $$('[data-delete-rsvp]').forEach(b=>b.onclick=()=>deleteRsvp(b.dataset.deleteRsvp,b.closest('tr')));
}

async function deleteRsvp(id,row){
  if(!confirm('Delete this RSVP permanently? This cannot be undone.')) return;
  const button=row?.querySelector('[data-delete-rsvp]');
  if(button){button.disabled=true;button.textContent='Deleting…';}
  try{
    await api(`/api/admin/rsvps/${id}`,{method:'DELETE'});
    if(row) row.remove();
    await loadStats();
  }catch(err){
    alert(err.message||'Unable to delete RSVP.');
    if(button){button.disabled=false;button.textContent='Delete';}
  }
}
async function loadRegistry(){const d=await api('/api/admin/registry');registryItems=d.items;$('#registryList').innerHTML=registryItems.map(i=>`<article class="admin-item"><div><p class="eyebrow">${escapeHtml(storeLabel(i.store))} · ${escapeHtml(i.status)}</p><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.price||'')} ${i.featured?'· Most Wanted':''}</p><p>${escapeHtml(i.description||'')}</p></div><div class="item-actions"><button type="button" data-edit-registry="${i.id}" class="secondary">Edit</button><button type="button" data-delete-registry="${i.id}" class="danger">Delete</button></div></article>`).join('');$$('[data-edit-registry]').forEach(b=>b.onclick=()=>editRegistry(registryItems.find(i=>i.id==b.dataset.editRegistry)));$$('[data-delete-registry]').forEach(b=>b.onclick=()=>deleteRegistry(b.dataset.deleteRegistry))}

async function fetchRegistryDetails(){
  const url=$('#registryImportUrl').value.trim();
  const msg=$('#registryImportMessage');
  const button=$('#fetchRegistryDetails');
  if(!url){msg.textContent='Paste a retailer item URL first.';return;}
  msg.textContent='Fetching item details…';
  button.disabled=true;
  try{
    const data=await api('/api/admin/registry/import',{method:'POST',body:{url}});
    const item=data.item||{};
    const form=$('#registryForm');
    if(item.store) form.elements.store.value=item.store;
    if(item.title) form.elements.title.value=item.title;
    if(item.price) form.elements.price.value=item.price;
    if(item.description) form.elements.description.value=item.description;
    if(item.image_url) form.elements.image_url.value=item.image_url;
    if(item.gift_url) form.elements.gift_url.value=item.gift_url;
    msg.textContent=data.warning || 'Item details loaded. Review them, then click Save Item.';
  }catch(err){
    msg.textContent=err.message || 'Could not fetch this retailer page. You can still enter the details manually.';
  }finally{
    button.disabled=false;
  }
}

function editRegistry(item=null){const f=$('#registryForm');f.reset();f.hidden=false;$('#registryImportUrl').value=item?.gift_url||'';$('#registryImportMessage').textContent='';f.id.value=item?.id||'';['store','status','title','price','description','image_class','image_url','gift_url','sort_order'].forEach(k=>{if(f.elements[k])f.elements[k].value=item?.[k]??(k==='sort_order'?0:'')});f.featured.checked=!!item?.featured;f.scrollIntoView({behavior:'smooth',block:'start'})}
async function saveRegistry(e){e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());data.featured=f.featured.checked;data.sort_order=Number(data.sort_order||0);try{const id=f.id.value;await api(id?`/api/admin/registry/${id}`:'/api/admin/registry',{method:id?'PUT':'POST',body:data});$('#registryMessage').textContent='Saved.';f.hidden=true;await Promise.all([loadRegistry(),loadStats()])}catch(err){$('#registryMessage').textContent=err.message}}
async function deleteRegistry(id){if(!confirm('Delete this registry item?'))return;await api(`/api/admin/registry/${id}`,{method:'DELETE'});await Promise.all([loadRegistry(),loadStats()])}
async function loadJournal(){const d=await api('/api/admin/journal');journalPosts=d.items;$('#journalList').innerHTML=journalPosts.map(i=>`<article class="admin-item"><div><p class="eyebrow">${escapeHtml(i.category||'Journal')} · ${i.published?'Published':'Draft'}</p><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.post_date||'')}</p><p>${escapeHtml(i.excerpt||'')}</p></div><div class="item-actions"><button type="button" data-edit-journal="${i.id}" class="secondary">Edit</button><button type="button" data-delete-journal="${i.id}" class="danger">Delete</button></div></article>`).join('');$$('[data-edit-journal]').forEach(b=>b.onclick=()=>editJournal(journalPosts.find(i=>i.id==b.dataset.editJournal)));$$('[data-delete-journal]').forEach(b=>b.onclick=()=>deleteJournal(b.dataset.deleteJournal))}
function editJournal(item=null){const f=$('#journalForm');f.reset();f.hidden=false;f.id.value=item?.id||'';['title','category','post_date','excerpt','content','image_class','image_url','sort_order'].forEach(k=>{if(f.elements[k])f.elements[k].value=item?.[k]??(k==='sort_order'?0:'')});f.published.checked=item?!!item.published:true;f.scrollIntoView({behavior:'smooth',block:'start'})}
async function saveJournal(e){e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());data.published=f.published.checked;data.sort_order=Number(data.sort_order||0);try{const id=f.id.value;await api(id?`/api/admin/journal/${id}`:'/api/admin/journal',{method:id?'PUT':'POST',body:data});$('#journalMessage').textContent='Saved.';f.hidden=true;await Promise.all([loadJournal(),loadStats()])}catch(err){$('#journalMessage').textContent=err.message}}
async function deleteJournal(id){if(!confirm('Delete this journal post?'))return;await api(`/api/admin/journal/${id}`,{method:'DELETE'});await Promise.all([loadJournal(),loadStats()])}
function storeLabel(s){return s==='crate'?'Crate & Barrel':s==='honeymoon'?'Honeymoon Fund':'Target'}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}
