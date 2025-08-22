import { requireAdminGuard } from './auth.js';
import { listAll } from './api.js';
import { qs } from './utils.js';

function countBy(arr, key){
  const m = new Map();
  arr.forEach(x=>{ const k=(x[key]||'Inconnu'); m.set(k, (m.get(k)||0)+1); });
  return Array.from(m.entries()).sort((a,b)=> b[1]-a[1]);
}

function card(title, value, icon){
  return `<div class="col-md-4">
    <div class="card p-3">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="small text-muted">${title}</div>
          <div class="h3 mb-0">${value}</div>
        </div>
        <i class="fa ${icon} fa-2x text-success"></i>
      </div>
    </div>
  </div>`;
}

function pills(list){
  return list.map(([k,v])=> `<div class="col-md-3">
    <div class="d-flex justify-content-between align-items-center border rounded p-2">
      <span>${k}</span><span class="badge text-bg-light">${v}</span>
    </div>
  </div>`).join('');
}

export async function mountStats(){
  requireAdminGuard('annuaire.html');
  const { results=[] } = await listAll(2000);
  const total = results.length;
  const parVille = countBy(results, 'ville');
  const parDept  = countBy(results, 'departement');
  const stagiaires = results.filter(x=>(x.statut||'').toLowerCase().includes('stag')).length;
  const admins = results.filter(x=>x.isadmin).length;

  qs('#stats-cards').innerHTML = [
    card('Total employés', total, 'fa-users'),
    card('Stagiaires', stagiaires, 'fa-user-graduate'),
    card('Admins', admins, 'fa-user-shield')
  ].join('');

  qs('#stats-ville').innerHTML = pills(parVille.slice(0,12));
  qs('#stats-dept').innerHTML  = pills(parDept.slice(0,12));
}
