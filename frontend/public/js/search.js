import { searchPersonnel } from "./api.js";
import { qs, setText, badgeStatut } from "./utils.js";
import { mountLogoutButton, mountAdminButton, mountAuthGuard } from "./auth.js";

function row(item) {
  return `<tr>
    <td><span class="badge text-bg-light">${item.matricule || ""}</span></td>
    <td>${item.nom || ""}</td>
    <td>${item.email || ""}</td>
    <td>${item.telephoneqc || ""}</td>
    <td>${item.poste || ""}</td>
    <td>${badgeStatut(item.statut || "")}</td>
    <td>${item.departement || ""}</td>
    <td>${item.service || ""}</td>
    <td>${item.ville || ""}</td>
    <td><a class="link-row" href="fiche.html?matricule=${encodeURIComponent(
      item.matricule
    )}"><i class="fa fa-eye"></i> Voir</a></td>
  </tr>`;
}

function card(item) {
  return `
    <div class="col">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="card-title mb-3">${item.nom || ""}</h5>
            <span class="badge text-bg-light">${item.matricule || ""}</span>
          </div>
          <p class="card-text mb-1">
            <i class="fa fa-envelope text-muted"></i> ${item.email || ""}
          </p>
          <p class="card-text mb-1">
            <i class="fa fa-phone text-muted"></i> ${item.telephoneqc || ""}
          </p>
          <p class="card-text">
            <i class="fa fa-building text-muted"></i> ${item.departement || ""}
          </p>
          <a href="fiche.html?matricule=${encodeURIComponent(item.matricule)}" 
             class="btn btn-sm btn-outline-primary">
            <i class="fa fa-eye"></i> Voir détails
          </a>
        </div>
      </div>
    </div>`;
}

let totalResults = 0;
const ITEMS_PER_PAGE = 25; // 5x5 grid

async function doSearch() {
  const filters = {
    nom: qs("#nom").value.trim(),
    matricule: qs("#matricule").value.trim(),
    email: qs("#email").value.trim(),
    poste: qs("#poste").value.trim(),
    statut: qs("#statut").value.trim(),
    departement: qs("#departement").value.trim(),
    service: qs("#service").value.trim(),
    ville: qs("#ville").value.trim(),
    limit: ITEMS_PER_PAGE,
    offset: parseInt(qs("#offset").value) || 0,
  };

  const grid = qs("#results-grid");
  const msg = qs("#search-message");
  const prevBtn = qs("#prev-page");
  const nextBtn = qs("#next-page");

  grid.innerHTML = "";
  setText(msg, "");

  try {
    const searchResults = await searchPersonnel(filters);
    const results = searchResults.results || [];
    totalResults = searchResults.total || results.length;

    if (!results.length) {
      setText(msg, "Aucun résultat.");
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    grid.innerHTML = results.map(card).join("");

    // Update pagination
    const currentOffset = parseInt(filters.offset);
    prevBtn.disabled = currentOffset === 0;
    nextBtn.disabled = currentOffset + ITEMS_PER_PAGE >= totalResults;
  } catch (e) {
    console.error("Search error:", e);
    setText(msg, `Erreur de recherche: ${e.message}`);
  }
}

function handlePagination() {
  const prevBtn = qs("#prev-page");
  const nextBtn = qs("#next-page");
  const offsetInput = qs("#offset");

  prevBtn.addEventListener("click", () => {
    const currentOffset = parseInt(offsetInput.value) || 0;
    if (currentOffset > 0) {
      offsetInput.value = Math.max(0, currentOffset - ITEMS_PER_PAGE);
      doSearch();
    }
  });

  nextBtn.addEventListener("click", () => {
    const currentOffset = parseInt(offsetInput.value) || 0;
    if (currentOffset + ITEMS_PER_PAGE < totalResults) {
      offsetInput.value = currentOffset + ITEMS_PER_PAGE;
      doSearch();
    }
  });
}

function toggleAdvancedSearch() {
  const advancedFields = qs("#advanced-search-fields");
  const advancedBtn = qs("#btn-advanced-search");
  
  if (advancedFields.classList.contains("d-none")) {
    advancedFields.classList.remove("d-none");
    advancedBtn.innerHTML = '<i class="fa fa-times"></i> Masquer recherche avancée';
    advancedBtn.classList.replace("btn-outline-secondary", "btn-outline-primary");
  } else {
    advancedFields.classList.add("d-none");
    advancedBtn.innerHTML = '<i class="fa fa-gear"></i> Recherche avancée';
    advancedBtn.classList.replace("btn-outline-primary", "btn-outline-secondary");
  }
}

export function mountSearchPage() {
  mountAuthGuard();
  mountLogoutButton();
  mountAdminButton();
  const form = qs("#search-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    qs("#offset").value = 0; // Reset pagination on new search
    doSearch();
  });
  
  // Add advanced search toggle functionality
  const advancedBtn = qs("#btn-advanced-search");
  advancedBtn.addEventListener("click", toggleAdvancedSearch);
  
  handlePagination();
  doSearch();
}
