const loginPage = document.getElementById('login-page');
const recipesPage = document.getElementById('recipes-page');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginFeedback = document.getElementById('login-feedback');
const userNameDisplay = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const recipesList = document.getElementById('recipes-list');
const showMoreBtn = document.getElementById('show-more-btn');
const recipesFeedback = document.getElementById('recipes-feedback');
const searchInput = document.getElementById('search-input');
const cuisineFilter = document.getElementById('cuisine-filter');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const loginBtn = document.getElementById('login-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');

let allRecipes = [];
let filtered = [];
let page = 0;
const PAGE_SIZE = 8;
let searchTimer = null;

function showPage(pageEl) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('visible'));
  pageEl.classList.add('visible');
}

function setFeedback(el, msg, isError = false) {
  el.textContent = msg;
  el.style.color = isError ? '#b91c1c' : 'inherit';
}

async function fetchRecipes() {
  try {
    setFeedback(recipesFeedback, 'Loading recipes...');
    const res = await fetch('https://dummyjson.com/recipes?limit=100');
    const data = await res.json();
    allRecipes = data.recipes;
    filtered = allRecipes;
    populateCuisineFilter();
    renderPage(true);
    setFeedback(recipesFeedback, '');
  } catch (err) {
    console.error(err);
    setFeedback(recipesFeedback, 'Gagal memuat recipes: ' + err.message, true);
  }
}

function populateCuisineFilter() {
  const cuisines = Array.from(new Set(allRecipes.map(r => r.cuisine).filter(Boolean))).sort();
  cuisineFilter.innerHTML = '<option value="">All</option>' +
    cuisines.map(c => `<option value="${c}">${c}</option>`).join('');
}

function createCard(recipe) {
  const div = document.createElement('div');
  div.className = 'card recipe';
  div.innerHTML = `
    <img src="${recipe.thumbnail || recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${recipe.name}">
    <div class="content">
      <h3>${recipe.name}</h3>
      <div class="meta">
        ${recipe.cookingTime ? recipe.cookingTime + ' mins' : ''} •
        ${recipe.difficulty || ''} • ${recipe.cuisine || ''}
        <span class="rating">${'⭐'.repeat(Math.round(recipe.rating || 0))}</span>
      </div>
      <div class="ingredients small">${(recipe.ingredients || []).slice(0, 4).join(', ')}${(recipe.ingredients || []).length > 4 ? '...' : ''}</div>
      <div style="margin-top:10px;text-align:right">
        <button data-id="${recipe.id}" class="view-btn">View Full Recipe</button>
      </div>
    </div>`;
  return div;
}

function renderPage(isReset = false) {
  if (isReset) { page = 0; recipesList.innerHTML = ''; }
  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  slice.forEach(r => recipesList.appendChild(createCard(r)));
  page++;
  showMoreBtn.style.display = filtered.length > page * PAGE_SIZE ? 'inline-block' : 'none';
  if (filtered.length === 0) recipesList.innerHTML = '<div class="card">Tidak ada resep</div>';
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const cuisine = cuisineFilter.value;
  filtered = allRecipes.filter(r => {
    if (cuisine && r.cuisine !== cuisine) return false;
    if (!q) return true;
    const inName = (r.name || '').toLowerCase().includes(q);
    const inCuisine = (r.cuisine || '').toLowerCase().includes(q);
    const inIngredients = (r.ingredients || []).join(' ').toLowerCase().includes(q);
    const inTags = (r.tags || []).join(' ').toLowerCase().includes(q);
    return inName || inCuisine || inIngredients || inTags;
  });
  renderPage(true);
}

function debounceSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(applyFilters, 400);
}

function showRecipeDetail(id) {
  const r = allRecipes.find(x => x.id == id);
  if (!r) return;

  // format bintang rating
  const stars = '⭐'.repeat(Math.round(r.rating || 0));

  // buat list ingredients dan instructions
  const ingredientsList = r.ingredients
    .map(i => `<li>${i}</li>`)
    .join('');
  const instructionsList = r.instructions
    .map((step, i) => `<li>${step}</li>`)
    .join('');

  // buat tags
  const tags = (r.tags || [])
    .map(tag => `<span class="tag">${tag}</span>`)
    .join(' ');

  modalContent.innerHTML = `
    <h2>${r.name}</h2>

    <div class="recipe-info">
      <img src="${r.image}" alt="${r.name}">
      <div class="stats">
        <div><b>Prep Time:</b> ${r.prepTimeMinutes} mins</div>
        <div><b>Cook Time:</b> ${r.cookTimeMinutes} mins</div>
        <div><b>Servings:</b> ${r.servings}</div>
        <div><b>Calories:</b> ${r.caloriesPerServing} cal/serving</div>
        <div><b>Difficulty:</b> ${r.difficulty}</div>
        <div><b>Cuisine:</b> ${r.cuisine}</div>
        <div><b>Rating:</b> ${stars} (${r.rating}) — ${r.reviewCount} reviews</div>
        <div><b>Tags:</b> ${tags}</div>
      </div>
    </div>

    <h3>Ingredients</h3>
    <ul>${ingredientsList}</ul>

    <h3>Instructions</h3>
    <ol>${instructionsList}</ol>
  `;

  modal.showModal();
}


modalClose.addEventListener('click', () => modal.close());
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('userFirstName');
    loginForm.reset();
    setFeedback(loginFeedback, '');
    showPage(loginPage);
});

searchInput.addEventListener('input', debounceSearch);
cuisineFilter.addEventListener('change', applyFilters);
showMoreBtn.addEventListener('click', () => renderPage(false));
recipesList.addEventListener('click', e => {
  if (e.target.classList.contains('view-btn')) {
    showRecipeDetail(e.target.dataset.id);
  }
});

// TAMBAHKAN FUNGSI BARU INI
async function handleLogin(e) {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        setFeedback(loginFeedback, 'Username dan password harus diisi.', true);
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    setFeedback(loginFeedback, '');

    try {
        const res = await fetch('https://dummyjson.com/users');
        if (!res.ok) throw new Error('Gagal mengambil data user.');
        
        const data = await res.json();
        const user = data.users.find(u => u.username === username);

        if (user && user.password === password) {
            setFeedback(loginFeedback, 'Login berhasil! Mengarahkan...', false);
            localStorage.setItem('userFirstName', user.firstName);
            setTimeout(() => {
                checkAuth();
            }, 1500);
        } else {
            throw new Error('Username atau password salah.');
        }
    } catch (err) {
        setFeedback(loginFeedback, err.message, true);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

loginForm.addEventListener('submit', handleLogin);

function checkAuth() {
    const userFirstName = localStorage.getItem('userFirstName');
    if (userFirstName) {
        userNameDisplay.textContent = `Hi, ${userFirstName}`;
        showPage(recipesPage);
        if (allRecipes.length === 0) {
            fetchRecipes();
        }
    } else {
        showPage(loginPage);
    }
}

document.addEventListener('DOMContentLoaded', checkAuth);

function toggleTheme() {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.textContent = '☀️';
    } else {
        localStorage.removeItem('theme');
        themeToggleBtn.textContent = '🌙';
    }
}

function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.textContent = '☀️';
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);
applyInitialTheme();
