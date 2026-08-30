const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
let registryItems=[]; let journalPosts=[]; let pageContent={}; let activePage='story';


const PAGE_SCHEMAS={
  home:{label:'Home',file:'index.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Main heading'],['hero_intro','Date / location line'],['hero_button','View Wedding Details button'],['hero_link','Button link'],['hero_image_url','Hero image','image']]],
    ['Countdown',[['countdown_eyebrow','Eyebrow'],['countdown_title','Heading']]],
    ['Our Story',[['story_image_url','Our Story image','image'],['story_eyebrow','Eyebrow'],['story_title','Heading'],['story_text','Paragraph 1','textarea'],
      ['story_text_2','Paragraph 2','textarea'],
      ['story_signature','Signature'],['story_button','Read Our Story button'],['story_link','Button link']]],
    ['Wedding Day',[
      ['wedding_eyebrow','Eyebrow'],
      ['wedding_title','Heading'],
      ['wedding_text','Intro text','textarea'],

      ['ceremony_icon_url','Ceremony icon','image'],
      ['ceremony_title','Ceremony title'],
      ['ceremony_time','Ceremony time'],
      ['ceremony_location','Ceremony location','textarea'],
      ['ceremony_map_text','Map link text'],
      ['ceremony_map_link','Map link'],

      ['reception_icon_url','Reception icon','image'],
      ['reception_title','Reception title'],
      ['reception_time','Reception time'],
      ['reception_text','Reception text','textarea'],

      ['attire_icon_url','Attire icon','image'],
      ['attire_title','Attire title'],
      ['attire_type','Attire type'],
      ['attire_text','Attire text','textarea']
    ]],
    ['RSVP',[['rsvp_eyebrow','Eyebrow'],['rsvp_title','Heading'],['rsvp_text','Text','textarea'],['rsvp_button','RSVP button'],['rsvp_link','Button link']]],
    ['Registry',[['registry_image_url','Registry image','image'],['registry_eyebrow','Eyebrow'],['registry_title','Heading'],['registry_text','Text','textarea'],['registry_button','View Registry button'],['registry_link','Button link']]],
    ['Wedding Journal',[['journal_eyebrow','Eyebrow'],['journal_title','Heading'],['journal_button','View More Journals button'],['journal_link','Button link']]]
  ]},
  story:{label:'Our Story',file:'story.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro','textarea'],['hero_image_url','Hero image URL','image']]],
    ['How We Met',[['met_eyebrow','Eyebrow'],['met_title','Heading'],['met_p1','Paragraph 1','textarea'],['met_p2','Paragraph 2','textarea'],['story_image_url','Story image URL','image']]],
    ['Timeline',[['timeline_eyebrow','Eyebrow'],['timeline_title','Heading'],['timeline_1_year','Item 1 year'],['timeline_1_title','Item 1 title'],['timeline_1_text','Item 1 text','textarea'],['timeline_2_year','Item 2 year'],['timeline_2_title','Item 2 title'],['timeline_2_text','Item 2 text','textarea'],['timeline_3_year','Item 3 year'],['timeline_3_title','Item 3 title'],['timeline_3_text','Item 3 text','textarea'],['timeline_4_year','Item 4 year'],['timeline_4_title','Item 4 title'],['timeline_4_text','Item 4 text','textarea'],['timeline_5_year','Item 5 year'],['timeline_5_title','Item 5 title'],['timeline_5_text','Item 5 text','textarea']]],
    ['Proposal',[['proposal_eyebrow','Eyebrow'],['proposal_title','Heading'],['proposal_p1','Paragraph 1','textarea'],['proposal_p2','Paragraph 2','textarea'],['proposal_image_url','Proposal image URL','image']]],
    ['Favorite Moments',[
      ['moments_eyebrow','Eyebrow'],
      ['moments_title','Heading'],
      ['moment_1_image_url','Moment 1 image','image'],
      ['moment_1_label','Moment 1 label'],
      ['moment_2_image_url','Moment 2 image','image'],
      ['moment_2_label','Moment 2 label'],
      ['moment_3_image_url','Moment 3 image','image'],
      ['moment_3_label','Moment 3 label']
    ]],
    ['Call to Action',[['cta_eyebrow','Eyebrow'],['cta_title','Heading'],['cta_text','Text','textarea'],['cta_button','Button label'],['cta_link','Button link']]]
  ]},
  wedding:{label:'Wedding',file:'wedding.html',sections:[
    ['Hero',[['hero_eyebrow','Date / eyebrow'],['hero_title','Page title'],['hero_intro','Venue line'],['hero_image_url','Hero image URL','image']]],
    ['Details',[['details_eyebrow','Eyebrow'],['details_title','Heading'],['details_intro','Intro','textarea']]],
    ['Ceremony',[['ceremony_title','Title'],['ceremony_time','Time'],['ceremony_location','Location','textarea']]],
    ['Reception',[['reception_title','Title'],['reception_time','Time'],['reception_text','Details','textarea']]],
    ['Attire',[['attire_title','Title'],['attire_name','Dress code'],['attire_text','Details','textarea']]],
    ['Schedule',[
      ['schedule_eyebrow','Eyebrow'],
      ['schedule_title','Heading'],
      ['schedule_1_time','1. Time'],['schedule_1_event','1. Event'],
      ['schedule_2_time','2. Time'],['schedule_2_event','2. Event'],
      ['schedule_3_time','3. Time'],['schedule_3_event','3. Event'],
      ['schedule_4_time','4. Time'],['schedule_4_event','4. Event'],
      ['schedule_5_time','5. Time'],['schedule_5_event','5. Event'],
      ['schedule_6_time','6. Time'],['schedule_6_event','6. Event'],
      ['schedule_7_time','7. Time'],['schedule_7_event','7. Event'],
      ['schedule_8_time','8. Time'],['schedule_8_event','8. Event']
    ]],
    ['Travel',[['travel_eyebrow','Eyebrow'],['travel_title','Heading'],['hotel_title','Hotel title'],['hotel_text','Hotel text','textarea'],['hotel_button','Hotel button'],['hotel_link','Hotel link'],['directions_title','Directions title'],['directions_text','Directions text','textarea'],['directions_button','Directions button'],['directions_link','Directions link'],['things_title','Things to do title'],['things_text','Things to do text','textarea'],['things_button','Things to do button'],['things_link','Things to do link']]],
    ['FAQ',[['faq_eyebrow','Eyebrow'],['faq_title','Heading'],['faq1_q','Question 1'],['faq1_a','Answer 1','textarea'],['faq2_q','Question 2'],['faq2_a','Answer 2','textarea'],['faq3_q','Question 3'],['faq3_a','Answer 3','textarea'],['faq4_q','Question 4'],['faq4_a','Answer 4','textarea']]],
    ['Call to Action',[['cta_eyebrow','Eyebrow'],['cta_title','Heading'],['cta_text','Text'],['cta_button','Button label'],['cta_link','Button link']]]
  ]},
  rsvp:{label:'RSVP',file:'rsvp.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','RSVP deadline'],['hero_image_url','Hero image URL','image']]],
    ['Form Introduction',[['intro_eyebrow','Eyebrow'],['intro_title','Heading'],['intro_text','Instructions','textarea']]],
    ['RSVP Form',[
      ['form_name_label','Name label'],
      ['form_email_label','Email label'],
      ['form_attendance_label','Attendance label'],
      ['form_guests_label','Guests label'],
      ['form_meal_label','Meal label'],
      ['form_message_label','Message label']
    ]],
    ['Help Section',[['help_eyebrow','Eyebrow'],['help_title','Heading'],['help_text','Text','textarea'],['help_button','Button label'],['help_link','Button link']]]
  ]},
  registry:{label:'Registry',file:'registry.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro'],['hero_image_url','Hero image URL','image']]],
    ['Introduction',[['intro_eyebrow','Eyebrow'],['intro_title','Heading'],['intro_text','Text','textarea']]],
    ['Store Registries',[['stores_eyebrow','Eyebrow'],['stores_title','Heading']]],
    ['Thank You',[['thanks_eyebrow','Eyebrow'],['thanks_title','Heading'],['thanks_text','Text','textarea']]]
  ]},
  journal:{label:'Journal',file:'journal.html',sections:[
    ['Hero',[['hero_eyebrow','Eyebrow'],['hero_title','Page title'],['hero_intro','Intro','textarea'],['hero_image_url','Hero image URL','image']]],
    ['Posts Section',[
      ['latest_eyebrow','Eyebrow'],
      ['latest_title','Heading'],
      ['featured_note','Featured post behavior']
    ]],
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
  const values={...(pageContent[slug]||{})};
  if(slug==='journal' && !('featured_note' in values)){
    values.featured_note='Automatically uses the latest published Journal post. Edit that post under the Journal tab.';
  }

  if(slug==='home' && !('story_text_2' in values)){
    values.story_text_2='Now we can’t wait to begin our next chapter surrounded by the people who have supported and loved us along the way.';
  }

  if(slug==='home'){
    const weddingDayDefaults={
      wedding_eyebrow:'Wedding Day',
      wedding_title:'Celebrate With Us',
      wedding_text:'We’re so excited to have our favorite people together for an unforgettable day.',
      ceremony_icon_url:'',
      ceremony_title:'Ceremony',
      ceremony_time:'3:00 PM',
      ceremony_location:'Stonewall Farms\n3067 67th Ave NW\nWillmar, MN',
      ceremony_map_text:'View Map',
      ceremony_map_link:'#stonewall-map',
      reception_icon_url:'',
      reception_title:'Reception',
      reception_time:'5:30 PM',
      reception_text:'Reception to follow immediately after the ceremony.',
      attire_icon_url:'',
      attire_title:'Attire',
      attire_type:'Semi-Formal',
      attire_text:'Garden-inspired colors and comfortable dancing shoes encouraged.'
    };
    for(const [k,v] of Object.entries(weddingDayDefaults)){
      if(!(k in values)) values[k]=v;
    }
  }

  if(slug==='rsvp'){
    const rsvpDefaults={
      form_name_label:'Full Name',
      form_email_label:'Email Address',
      form_attendance_label:'Will You Be Attending?',
      form_guests_label:'Number of Guests',
      form_meal_label:'Meal Selection',
      form_message_label:'Message for the Couple'
    };
    for(const [k,v] of Object.entries(rsvpDefaults)){
      if(!(k in values)) values[k]=v;
    }
  }

  if(slug==='story'){
    const momentDefaults={
      moment_1_image_url:'',
      moment_1_label:'Weekend Adventures',
      moment_2_image_url:'',
      moment_2_label:'Engagement Season',
      moment_3_image_url:'',
      moment_3_label:'Home With Our People'
    };
    for(const [k,v] of Object.entries(momentDefaults)){
      if(!(k in values)) values[k]=v;
    }
  }

  if(slug==='wedding'){
    const scheduleDefaults={
      schedule_1_time:'2:30 PM',schedule_1_event:'Guests Begin Arriving',
      schedule_2_time:'3:00 PM',schedule_2_event:'Ceremony Begins',
      schedule_3_time:'3:45 PM',schedule_3_event:'Reception Begins',
      schedule_4_time:'5:00 PM',schedule_4_event:'Dinner & Toasts',
      schedule_5_time:'7:00 PM',schedule_5_event:'First Dance',
      schedule_6_time:'7:30 PM',schedule_6_event:'Dance Floor Opens',
      schedule_7_time:'10:30 PM',schedule_7_event:'Late-Night Snack',
      schedule_8_time:'11:30 PM',schedule_8_event:'Farewell'
    };
    for(const [k,v] of Object.entries(scheduleDefaults)){
      if(!(k in values)) values[k]=v;
    }
  }
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
          if(type==='textarea'){
            return `<label${wide}>${escapeHtml(label)}<textarea name="${escapeAttr(key)}" rows="4">${escapeHtml(v)}</textarea></label>`;
          }
          if(type==='image'){
            return `<label class="admin-image-field full-field">${escapeHtml(label)}
              <input name="${escapeAttr(key)}" type="hidden" value="${escapeAttr(v)}">
              <input type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" data-page-image="${escapeAttr(key)}">
              <span class="image-upload-help">Choose a PNG or JPG · max 10 MB</span>
              <span class="image-upload-status" data-upload-status="${escapeAttr(key)}"></span>
              <div class="admin-image-actions">
                <button type="button" class="secondary danger-light" data-delete-page-image="${escapeAttr(key)}" ${v?'':'hidden'}>Delete Image</button>
              </div>
              <img class="admin-image-preview" data-image-preview="${escapeAttr(key)}" src="${escapeAttr(v)}" alt="" ${v?'':'hidden'}>
            </label>`;
          }
          if(key==='featured_note'){
            return `<label class="full-field">${escapeHtml(label)}<input type="text" value="${escapeAttr(v)}" readonly></label>`;
          }
          return `<label>${escapeHtml(label)}<input name="${escapeAttr(key)}" type="${type==='url'?'url':'text'}" value="${escapeAttr(v)}"></label>`;
        }).join('')}
      </div>
    </fieldset>`).join('');
  $('#pageMessage').textContent='';
  $$('[data-page-image]').forEach(input=>input.addEventListener('change',()=>uploadPageImage(input)));
  $$('[data-delete-page-image]').forEach(button=>button.addEventListener('click',()=>deletePageImage(button)));
}


async function uploadImageFile(file,statusEl){
  if(!file)return '';
  if(!['image/png','image/jpeg'].includes(file.type)) throw new Error('Only PNG and JPG images are allowed.');
  if(file.size>10*1024*1024) throw new Error('Image must be 10 MB or smaller.');

  const form=new FormData();
  form.append('file',file);
  if(statusEl)statusEl.textContent='Uploading…';
  const data=await api('/api/admin/media',{method:'POST',body:form});
  if(statusEl)statusEl.textContent='Upload complete.';
  return data.url;
}

async function uploadPageImage(input){
  const key=input.dataset.pageImage;
  const status=$(`[data-upload-status="${key}"]`);
  const preview=$(`[data-image-preview="${key}"]`);
  const hidden=$(`#pageContentForm [name="${key}"]`);
  const file=input.files?.[0];
  if(!file)return;
  input.disabled=true;
  try{
    const url=await uploadImageFile(file,status);
    hidden.value=url;
    if(preview){preview.src=url;preview.hidden=false;}
    const deleteButton=$(`[data-delete-page-image="${key}"]`);
    if(deleteButton)deleteButton.hidden=false;
  }catch(err){
    if(status)status.textContent=err.message;
  }finally{
    input.disabled=false;
  }
}


function deletePageImage(button){
  const key=button.dataset.deletePageImage;
  const hidden=$(`#pageContentForm [name="${key}"]`);
  const preview=$(`[data-image-preview="${key}"]`);
  const status=$(`[data-upload-status="${key}"]`);
  const fileInput=$(`[data-page-image="${key}"]`);

  if(hidden)hidden.value='';
  if(preview){
    preview.src='';
    preview.hidden=true;
  }
  if(fileInput)fileInput.value='';
  if(status)status.textContent='Image removed. Click Save Page to apply.';
  button.hidden=true;
}

async function uploadJournalImage(){
  const input=$('#journalImageFile');
  const file=input.files?.[0];
  if(!file)return;
  const status=$('#journalImageUploadStatus');
  input.disabled=true;
  try{
    const url=await uploadImageFile(file,status);
    $('#journalForm [name="image_url"]').value=url;
    const preview=$('#journalImagePreview');
    preview.src=url;
    preview.hidden=false;
    $('#journalImageDelete').hidden=false;
  }catch(err){
    status.textContent=err.message;
  }finally{
    input.disabled=false;
  }
}


function deleteJournalImage(){
  const form=$('#journalForm');
  form.elements.image_url.value='';
  $('#journalImageFile').value='';
  const preview=$('#journalImagePreview');
  preview.src='';
  preview.hidden=true;
  $('#journalImageUploadStatus').textContent='Image removed. Click Save Post to apply.';
  $('#journalImageDelete').hidden=true;
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
  $('#journalImageFile').addEventListener('change',uploadJournalImage);
  $('#journalImageDelete').addEventListener('click',deleteJournalImage);
  $('#pageContentForm').addEventListener('submit',savePageContent);
  const session=await api('/api/admin/session');
  if(session?.authenticated) showDashboard();
});

async function api(url, options={}){
  const opts={credentials:'same-origin',...options};
  if(opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)){
    opts.headers={...(opts.headers||{}),'content-type':'application/json'};
    opts.body=JSON.stringify(opts.body);
  }
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
function editJournal(item=null){const f=$('#journalForm');f.reset();f.hidden=false;f.id.value=item?.id||'';['title','category','post_date','excerpt','content','image_class','image_url','sort_order'].forEach(k=>{if(f.elements[k])f.elements[k].value=item?.[k]??(k==='sort_order'?0:'')});f.published.checked=item?!!item.published:true;const imageUrl=f.elements.image_url.value||'';const preview=$('#journalImagePreview');preview.src=imageUrl;preview.hidden=!imageUrl;$('#journalImageFile').value='';$('#journalImageUploadStatus').textContent='';$('#journalImageDelete').hidden=!imageUrl;f.scrollIntoView({behavior:'smooth',block:'start'})}
async function saveJournal(e){e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());data.published=f.published.checked;data.sort_order=Number(data.sort_order||0);try{const id=f.id.value;await api(id?`/api/admin/journal/${id}`:'/api/admin/journal',{method:id?'PUT':'POST',body:data});$('#journalMessage').textContent='Saved.';f.hidden=true;await Promise.all([loadJournal(),loadStats()])}catch(err){$('#journalMessage').textContent=err.message}}
async function deleteJournal(id){if(!confirm('Delete this journal post?'))return;await api(`/api/admin/journal/${id}`,{method:'DELETE'});await Promise.all([loadJournal(),loadStats()])}
function storeLabel(s){return s==='crate'?'Crate & Barrel':s==='honeymoon'?'Honeymoon Fund':'Target'}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}
