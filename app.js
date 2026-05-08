// ===== Configuration =====
const MENU_JSON = 'data/menu.json';

const CATEGORY_ICONS = {
  'المقبلات': '🥗',
  'الأطباق الرئيسية': '🍲',
  'السندويتشات': '🥙',
  'البرجر': '🍔',
  'البيتزا': '🍕',
  'الباستا': '🍝',
  'السلطات': '🥬',
  'المشروبات': '🥤',
  'الحلويات': '🍰',
  'الإفطار': '🍳',
  'وجبات الأطفال': '🍽️',
  'الأطباق الخاصة': '⭐'
};

let allItems = [];
let allCategories = [];
let currentCategory = 'all';

// ===== Fetch Menu Data =====
async function fetchMenu() {
  const loading = document.getElementById('loadingState');
  const grid = document.getElementById('menuGrid');

  try {
    const res = await fetch(`${MENU_JSON}?t=${Date.now()}`);
    if (!res.ok) throw new Error('Failed to load menu data');
    const data = await res.json();

    allCategories = data.categories || [];
    allItems = data.items || [];

    loading.style.display = 'none';
    init();
  } catch (err) {
    console.error('خطأ في تحميل القائمة:', err);
    loading.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>تعذر تحميل القائمة</h3>
        <p>تأكد من وجود ملف data/menu.json وسلامة صيغته.</p>
      </div>
    `;
  }
}

// ===== Initialize =====
function init() {
  buildCategoryTabs();
  buildCategoryCards();
  renderMenu();
  setupSearch();
  setupNavScroll();
  setupMobileNav();
  setupBackToTop();
}

// ===== Category Tabs =====
function buildCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  container.innerHTML = '<button class="tab active" data-category="all" role="tab" aria-selected="true">الكل</button>';

  allCategories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.category = cat;
    btn.textContent = cat;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.addEventListener('click', () => switchCategory(cat));
    container.appendChild(btn);
  });
}

function switchCategory(cat) {
  currentCategory = cat;

  document.querySelectorAll('.tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });

  const activeTab = cat === 'all'
    ? document.querySelector('.tab[data-category="all"]')
    : document.querySelector(`.tab[data-category="${cat}"]`);

  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
  }

  renderMenu(document.getElementById('searchInput').value.trim());
}

// ===== Render Menu Cards =====
function renderMenu(searchTerm = '') {
  const grid = document.getElementById('menuGrid');
  const noResults = document.getElementById('noResults');
  grid.innerHTML = '';

  let items = allItems.filter(i => i.available !== false);

  if (currentCategory !== 'all') {
    items = items.filter(i => i.category === currentCategory);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(term) ||
      i.description.toLowerCase().includes(term) ||
      i.category.toLowerCase().includes(term)
    );
  }

  if (items.length === 0) {
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    card.style.animationDelay = `${index * 0.04}s`;

    const badge = getBadge(item);
    const tagsHTML = (item.tags || []).slice(0, 2).map(t =>
      `<span class="card-tag">${t}</span>`
    ).join('');

    const imgSrc = item.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23f0ebe5%22 width=%22400%22 height=%22300%22/><text fill=%22%23bbb%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22>صورة الطبق</text></svg>';

    card.innerHTML = `
      <div class="card-image">
        <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%23f0ebe5%22 width=%22400%22 height=%22300%22/><text fill=%22%23bbb%22 font-family=%22sans-serif%22 font-size=%2220%22 text-anchor=%22middle%22 x=%22200%22 y=%22150%22>صورة الطبق</text></svg>'">
        ${badge ? `<span class="card-badge ${badge.type}">${badge.label}</span>` : ''}
      </div>
      <div class="card-body">
        <h3 class="card-name">${item.name}</h3>
        <p class="card-desc">${item.description}</p>
        <div class="card-footer">
          <span class="card-price">${item.price.toFixed(2)}</span>
          <div class="card-tags">${tagsHTML}</div>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// ===== Badge Logic =====
function getBadge(item) {
  if (item.tags && item.tags.includes('best-seller')) return { type: 'hot', label: 'الأكثر مبيعاً' };
  if (item.tags && item.tags.includes('popular')) return { type: 'featured', label: 'شائع' };
  if (item.tags && item.tags.includes('chef-special')) return { type: 'featured', label: 'خاص' };
  if (item.tags && item.tags.includes('new')) return { type: 'new', label: 'جديد' };
  if (item.tags && item.tags.includes('spicy')) return { type: 'spicy', label: 'حار' };
  return null;
}

// ===== Category Cards =====
function buildCategoryCards() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = '';

  allCategories.forEach(cat => {
    const count = allItems.filter(i => i.category === cat && i.available !== false).length;
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
      <div class="category-icon">${CATEGORY_ICONS[cat] || '🍽️'}</div>
      <h3 class="category-name">${cat}</h3>
      <p class="category-count">${count} صنف</p>
    `;
    card.addEventListener('click', () => {
      document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
      switchCategory(cat);
    });
    grid.appendChild(card);
  });
}

// ===== Search =====
function setupSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  let debounce;

  input.addEventListener('input', () => {
    clearTimeout(debounce);
    const val = input.value.trim();
    clearBtn.style.display = val ? 'flex' : 'none';
    debounce = setTimeout(() => renderMenu(val), 200);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    renderMenu();
    input.focus();
  });

  document.getElementById('clearSearch')?.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    renderMenu();
  });
}

// ===== Navbar Scroll Effect =====
function setupNavScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ===== Mobile Nav =====
function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ===== Back to Top =====
function setupBackToTop() {
  const btn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== Start =====
document.addEventListener('DOMContentLoaded', fetchMenu);
