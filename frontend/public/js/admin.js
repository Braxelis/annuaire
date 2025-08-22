import { requireAdminGuard } from './auth.js';
import { listAll, updateUser, createUser } from './api.js';
import { qs, setText } from './utils.js';

function empRow(u){
  return `<tr data-id="${u.matricule}">
    <td>${u.matricule||''}</td>
    <td><input class="form-control form-control-sm" name="nom" value="${u.nom||''}"></td>
    <td><input class="form-control form-control-sm" name="email" value="${u.email||''}"></td>
    <td><input class="form-control form-control-sm" name="telephoneqc" value="${u.telephoneqc||''}"></td>
    <td><input class="form-control form-control-sm" name="poste" value="${u.poste||''}"></td>
    <td><input class="form-control form-control-sm" name="statut" value="${u.statut||''}"></td>
    <td><input class="form-control form-control-sm" name="departement" value="${u.departement||''}"></td>
    <td><input class="form-control form-control-sm" name="service" value="${u.service||''}"></td>
    <td><input class="form-control form-control-sm" name="ville" value="${u.ville||''}"></td>
    <td><select name="isadmin" class="form-select form-select-sm">
          <option value="0" ${u.isadmin? '':'selected'}>Non</option>
          <option value="1" ${u.isadmin? 'selected':''}>Oui</option>
        </select></td>
    <td><input class="form-control form-control-sm" name="motdepasse" type="password" placeholder="nouveau..."></td>
    <td><button class="btn btn-sm btn-primary btn-save">Sauver</button></td>
  </tr>`;
}

export async function mountEmployees(){
  requireAdminGuard('annuaire.html');
  const tbody = qs('#emp-body'); const msg = qs('#emp-message');
  setText(msg, '');
  try{
    const { results } = await listAll(1000);
    tbody.innerHTML = (results||[]).map(empRow).join('');
    tbody.addEventListener('click', async (e)=>{
      const btn = e.target.closest('.btn-save'); if(!btn) return;
      const tr = btn.closest('tr'); const id = tr.dataset.id;
      const data = {};
      tr.querySelectorAll('input,select').forEach(el => {
        const v = el.type==='checkbox' ? (el.checked?1:0) : el.value;
        if (el.name === 'isadmin') data[el.name] = parseInt(v,10);
        else if (el.name === 'motdepasse' && !v) {} else data[el.name]=v;
      });
      btn.disabled = true;
      try{
        await updateUser(id, data);
        btn.classList.replace('btn-primary','btn-success'); btn.textContent='OK';
        setTimeout(()=>{ btn.classList.replace('btn-success','btn-primary'); btn.textContent='Sauver'; },1200);
      }catch(err){ setText(msg, err.message); }
      finally{ btn.disabled=false; }
    });
  }catch(err){ setText(msg, err.message); }
}

export function mountCreate(){
  requireAdminGuard('annuaire.html');
  const form = qs('#create-form'); const out = qs('#create-message');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault(); out.textContent='';
    const payload = {
      matricule: qs('#matricule').value.trim(),
      idsite: qs('#idsite').value.trim(),
      nom: qs('#nom').value.trim(),
      email: qs('#email').value.trim(),
      telephoneqc: qs('#telephoneqc').value.trim(),
      poste: qs('#poste').value.trim(),
      statut: qs('#statut').value.trim(),
      departement: qs('#departement').value.trim(),
      service: qs('#service').value.trim(),
      motdepasse: qs('#motdepasse').value.trim() || undefined,
      isadmin: qs('#isadmin').checked ? 1 : 0
    };
    try{
      const res = await createUser(payload);
      out.textContent = 'Employé créé: ' + res.matricule;
      form.reset();
    }catch(err){ out.textContent = err.message; }
  });
}
