import { getUser, logout, requireAuth } from './api.js';
import { qs } from './utils.js';

export function mountLogoutButton(){
  const btn = qs('#btn-logout');
  if(btn){
    btn.addEventListener('click', async ()=>{
      await logout();
      window.location.href = 'login.html';
    });
  }
}

export function mountAdminButton(){
  const u = getUser();
  const btn = qs('#btn-admin');
  if (u && u.isadmin && btn) btn.classList.remove('d-none');
}

export function mountAuthGuard(){
  requireAuth('login.html');
}

export function requireAdminGuard(redirect='annuaire.html'){
  const u = getUser();
  if(!u || !u.isadmin) window.location.href = redirect;
}

export function currentUser(){ return getUser(); }
