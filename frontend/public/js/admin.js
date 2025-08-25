import { requireAdminGuard } from './auth.js';
import { listAll, updateUser, createUser, deleteUser } from './api.js';
import { qs, setText } from './utils.js';

function empRowView(u) {
  return `<tr data-id="${u.matricule}">
    <td>${u.matricule||''}</td>
    <td>${u.nom||''}</td>
    <td>${u.email||''}</td>
    <td>${u.telephoneqc||''}</td>
    <td>${u.poste||''}</td>
    <td>${u.statut||''}</td>
    <td>${u.departement||''}</td>
    <td>${u.service||''}</td>
    <td>${u.ville||''}</td>
    <td>${u.isadmin ? 'Oui' : 'Non'}</td>
    <td>-</td>
    <td>
      <button class="btn btn-sm btn-outline-primary btn-edit me-1">
        <i class="fa fa-edit"></i> Modifier
      </button>
      <button class="btn btn-sm btn-outline-danger btn-delete">
        <i class="fa fa-trash"></i> Supprimer
      </button>
    </td>
  </tr>`;
}

function empRowEdit(u) {
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
    <td>
      <select name="isadmin" class="form-select form-select-sm">
        <option value="0" ${u.isadmin ? '' : 'selected'}>Non</option>
        <option value="1" ${u.isadmin ? 'selected' : ''}>Oui</option>
      </select>
    </td>
    <td><input class="form-control form-control-sm" name="motdepasse" type="password" placeholder="nouveau..."></td>
    <td>
      <button class="btn btn-sm btn-success btn-save me-1">
        <i class="fa fa-check"></i> Sauver
      </button>
      <button class="btn btn-sm btn-secondary btn-cancel">
        <i class="fa fa-times"></i> Annuler
      </button>
    </td>
  </tr>`;
}

async function handleDelete(matricule, tr) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.')) {
    return;
  }

  try {
    await deleteUser(matricule);
    tr.remove();
    setText(qs('#emp-message'), 'Employé supprimé avec succès');
    setTimeout(() => setText(qs('#emp-message'), ''), 3000);
  } catch (err) {
    setText(qs('#emp-message'), 'Erreur lors de la suppression: ' + err.message);
  }
}

async function handleSave(tr, id) {
  const data = {};
  tr.querySelectorAll('input,select').forEach(el => {
    const v = el.type === 'checkbox' ? (el.checked ? 1 : 0) : el.value;
    if (el.name === 'isadmin') {
      data[el.name] = parseInt(v, 10);
    } else if (el.name === 'motdepasse' && !v) {
      // Skip empty password
    } else {
      data[el.name] = v;
    }
  });

  const saveBtn = tr.querySelector('.btn-save');
  saveBtn.disabled = true;
  
  try {
    await updateUser(id, data);
    // Reload the employee list to show updated data
    await loadEmployees();
    setText(qs('#emp-message'), 'Employé modifié avec succès');
    setTimeout(() => setText(qs('#emp-message'), ''), 3000);
  } catch (err) {
    setText(qs('#emp-message'), 'Erreur lors de la modification: ' + err.message);
  } finally {
    saveBtn.disabled = false;
  }
}

async function loadEmployees() {
  const tbody = qs('#emp-body');
  const msg = qs('#emp-message');
  setText(msg, '');
  
  try {
    const { results } = await listAll(1000);
    tbody.innerHTML = (results || []).map(empRowView).join('');
    setupEventListeners();
  } catch (err) {
    setText(msg, err.message);
  }
}

function setupEventListeners() {
  const tbody = qs('#emp-body');
  
  tbody.addEventListener('click', async (e) => {
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    
    // Edit button
    if (e.target.closest('.btn-edit')) {
      const employeeData = await getEmployeeData(id);
      if (employeeData) {
        const editRow = empRowEdit(employeeData);
        tr.outerHTML = editRow;
        setupEventListeners();
      }
    }
    
    // Delete button
    if (e.target.closest('.btn-delete')) {
      handleDelete(id, tr);
    }
    
    // Save button
    if (e.target.closest('.btn-save')) {
      await handleSave(tr, id);
    }
    
    // Cancel button
    if (e.target.closest('.btn-cancel')) {
      await loadEmployees(); // Reload to show view mode
    }
  });
}

async function getEmployeeData(matricule) {
  try {
    const { results } = await listAll(1000);
    return results.find(emp => emp.matricule === matricule);
  } catch (err) {
    setText(qs('#emp-message'), 'Erreur lors du chargement des données: ' + err.message);
    return null;
  }
}

export async function mountEmployees() {
  requireAdminGuard('annuaire.html');
  await loadEmployees();
}

export function mountCreate() {
  requireAdminGuard('annuaire.html');
  const form = qs('#create-form');
  const out = qs('#create-message');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    out.textContent = '';
    
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
    
    try {
      const res = await createUser(payload);
      out.textContent = 'Employé créé: ' + res.matricule;
      form.reset();
      // Reload employee list if we're on the employees page
      if (window.location.pathname.includes('employes.html')) {
        await loadEmployees();
      }
    } catch (err) {
      out.textContent = err.message;
    }
  });
}
