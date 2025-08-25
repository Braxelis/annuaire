const API_BASE_URL =
  localStorage.getItem("ANNUIARE_API_BASE_URL") || "http://localhost:8000";
const TOKEN_KEY = "ANNUIARE_TOKEN",
  USER_KEY = "ANNUIARE_USER";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}
export function setUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch (e) {
    return null;
  }
}

async function api(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && getToken()) headers["Authorization"] = "Bearer " + getToken();
  const res = await fetch(API_BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Erreur API");
  return data;
}

export async function login(matricule, motdepasse) {
  const { token } = await api("/api/login", {
    method: "POST",
    body: { matricule, motdepasse },
    auth: false,
  });
  setToken(token);
  const me = await api("/api/me", { method: "GET" });
  setUser(me);
  return me;
}
export async function logout() {
  try {
    await api("/api/logout", { method: "POST" });
  } catch {}
  setToken(null);
  setUser(null);
}
export function requireAuth(redirect = "login.html") {
  if (!getToken()) window.location.href = redirect;
}
export function requireAdminGuard(redirect = "annuaire.html") {
  const u = getUser();
  if (!u || !u.isadmin) window.location.href = redirect;
}

export async function searchPersonnel(filters) {
  const qs = new URLSearchParams();

  // Separate search parameters
  if (filters.nom) {
    return api("/api/personnel?nom=" + encodeURIComponent(filters.nom));
  }
  if (filters.matricule) {
    return api(
      "/api/personnel?matricule=" + encodeURIComponent(filters.matricule)
    );
  }
  if (filters.email) {
    return api(
      "/api/personnel?email=" + encodeURIComponent(filters.email)
    );
  }

  // Other filters
  Object.entries(filters || {}).forEach(([k, v]) => {
    if (
      v !== undefined &&
      v !== null &&
      v !== "" &&
      !["nom", "matricule", "email"].includes(k)
    ) {
      qs.append(k, v);
    }
  });

  return api("/api/personnel" + (qs.toString() ? "?" + qs.toString() : ""));
}

export async function listAll(limit = 1000) {
  return searchPersonnel({ limit });
}

export async function createUser(payload) {
  return api("/api/personnel", { method: "POST", body: payload });
}

export async function updateUser(matricule, payload) {
  return api("/api/personnel/" + encodeURIComponent(matricule), {
    method: "PUT",
    body: payload,
  });
}

export async function deleteUser(matricule) {
  return api("/api/personnel/" + encodeURIComponent(matricule), {
    method: "DELETE",
  });
}

export async function getByMatricule(matricule) {
  const res = await searchPersonnel({ matricule, limit: 1 });
  const item = (res.results || [])[0];
  if (!item) throw new Error("Employé introuvable");
  return item;
}

export { API_BASE_URL };
