const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
let registryItems=[]; let journalPosts=[];

document.addEventListener('DOMContentLoaded', async () => {
  $('#loginForm').addEventListener('submit', login);
  $('#logoutButton').addEventListener('click', logout);
  $$('.tab').forEach(btn=>btn.addEventListener('click',()=>openTab(btn.dataset.tab)));
  $('#newRegistryButton').addEventListener('click',()=>editRegistry());
  $('#cancelRegistry').addEventListener('click',()=>$('#registryForm').hidden=true);
  $('#registryForm').addEventListener('submit',saveRegistry);
  $('#newJournalButton').addEventListener('click',()=>editJournal());
  $('#cancelJournal').addEventListener('click',()=>$('#journalForm').hidden=true);
  $('#journalForm').addEventListener('submit',saveJournal);
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
async function showDashboard(){ $('#loginView').hidden=true; $('#dashboardView').hidden=false; await Promise.all([loadStats(),loadRsvps(),loadRegistry(),loadJournal()]); }
function openTab(name){$$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));$$('.panel').forEach(p=>p.classList.toggle('active',p.id===`panel-${name}`))}
async function loadStats(){const d=await api('/api/admin/stats');const s=d.stats;$('#stats').innerHTML=[['RSVP responses',s.rsvps],['Attending guests',s.attendingGuests],['Registry items',s.registryItems],['Journal posts',s.journalPosts]].map(([l,v])=>`<div class="stat"><strong>${escapeHtml(v)}</strong><span>${escapeHtml(l)}</span></div>`).join('')}
async function loadRsvps(){const d=await api('/api/admin/rsvps');$('#rsvpRows').innerHTML=d.items.map(r=>`<tr><td><strong>${escapeHtml(r.name)}</strong><br>${escapeHtml(r.dietary||'')} ${r.message?`<br><small>${escapeHtml(r.message)}</small>`:''}</td><td>${escapeHtml(r.attendance)}</td><td>${escapeHtml(r.guests)}</td><td>${escapeHtml(r.meal||'')}</td><td><a href="mailto:${escapeAttr(r.email)}">${escapeHtml(r.email)}</a></td><td>${escapeHtml(r.created_at)}</td></tr>`).join('')}
async function loadRegistry(){const d=await api('/api/admin/registry');registryItems=d.items;$('#registryList').innerHTML=registryItems.map(i=>`<article class="admin-item"><div><p class="eyebrow">${escapeHtml(storeLabel(i.store))} · ${escapeHtml(i.status)}</p><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.price||'')} ${i.featured?'· Most Wanted':''}</p><p>${escapeHtml(i.description||'')}</p></div><div class="item-actions"><button type="button" data-edit-registry="${i.id}" class="secondary">Edit</button><button type="button" data-delete-registry="${i.id}" class="danger">Delete</button></div></article>`).join('');$$('[data-edit-registry]').forEach(b=>b.onclick=()=>editRegistry(registryItems.find(i=>i.id==b.dataset.editRegistry)));$$('[data-delete-registry]').forEach(b=>b.onclick=()=>deleteRegistry(b.dataset.deleteRegistry))}
function editRegistry(item=null){const f=$('#registryForm');f.reset();f.hidden=false;f.id.value=item?.id||'';['store','status','title','price','description','image_class','image_url','gift_url','sort_order'].forEach(k=>{if(f.elements[k])f.elements[k].value=item?.[k]??(k==='sort_order'?0:'')});f.featured.checked=!!item?.featured;f.scrollIntoView({behavior:'smooth',block:'start'})}
async function saveRegistry(e){e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());data.featured=f.featured.checked;data.sort_order=Number(data.sort_order||0);try{const id=f.id.value;await api(id?`/api/admin/registry/${id}`:'/api/admin/registry',{method:id?'PUT':'POST',body:data});$('#registryMessage').textContent='Saved.';f.hidden=true;await Promise.all([loadRegistry(),loadStats()])}catch(err){$('#registryMessage').textContent=err.message}}
async function deleteRegistry(id){if(!confirm('Delete this registry item?'))return;await api(`/api/admin/registry/${id}`,{method:'DELETE'});await Promise.all([loadRegistry(),loadStats()])}
async function loadJournal(){const d=await api('/api/admin/journal');journalPosts=d.items;$('#journalList').innerHTML=journalPosts.map(i=>`<article class="admin-item"><div><p class="eyebrow">${escapeHtml(i.category||'Journal')} · ${i.published?'Published':'Draft'}</p><h3>${escapeHtml(i.title)}</h3><p>${escapeHtml(i.post_date||'')}</p><p>${escapeHtml(i.excerpt||'')}</p></div><div class="item-actions"><button type="button" data-edit-journal="${i.id}" class="secondary">Edit</button><button type="button" data-delete-journal="${i.id}" class="danger">Delete</button></div></article>`).join('');$$('[data-edit-journal]').forEach(b=>b.onclick=()=>editJournal(journalPosts.find(i=>i.id==b.dataset.editJournal)));$$('[data-delete-journal]').forEach(b=>b.onclick=()=>deleteJournal(b.dataset.deleteJournal))}
function editJournal(item=null){const f=$('#journalForm');f.reset();f.hidden=false;f.id.value=item?.id||'';['title','category','post_date','excerpt','content','image_class','image_url','sort_order'].forEach(k=>{if(f.elements[k])f.elements[k].value=item?.[k]??(k==='sort_order'?0:'')});f.published.checked=item?!!item.published:true;f.scrollIntoView({behavior:'smooth',block:'start'})}
async function saveJournal(e){e.preventDefault();const f=e.currentTarget;const data=Object.fromEntries(new FormData(f).entries());data.published=f.published.checked;data.sort_order=Number(data.sort_order||0);try{const id=f.id.value;await api(id?`/api/admin/journal/${id}`:'/api/admin/journal',{method:id?'PUT':'POST',body:data});$('#journalMessage').textContent='Saved.';f.hidden=true;await Promise.all([loadJournal(),loadStats()])}catch(err){$('#journalMessage').textContent=err.message}}
async function deleteJournal(id){if(!confirm('Delete this journal post?'))return;await api(`/api/admin/journal/${id}`,{method:'DELETE'});await Promise.all([loadJournal(),loadStats()])}
function storeLabel(s){return s==='crate'?'Crate & Barrel':s==='honeymoon'?'Honeymoon Fund':'Target'}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function escapeAttr(v){return escapeHtml(v).replace(/`/g,'&#96;')}
