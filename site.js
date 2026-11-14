const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const articleUrl = (post) => `artykul.html?id=${post.id}`;
const dateLabel = (date) => new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));

function setupMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('#main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Otwórz menu' : 'Zamknij menu');
    nav.classList.toggle('open', !isOpen);
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
  });
}

function storyCard(post, index) {
  return `<article class="story-card"><a class="story-image" href="${articleUrl(post)}"><img src="${esc(post.image)}" alt="" loading="${index > 2 ? 'lazy' : 'eager'}"></a><div class="story-info"><span class="story-category">${esc(post.category)}</span><h3><a href="${articleUrl(post)}">${esc(post.title)}</a></h3><p>${esc(post.summary)}</p><div class="story-meta"><time datetime="${esc(post.date)}">${dateLabel(post.date)}</time><a href="${articleUrl(post)}" aria-label="Czytaj: ${esc(post.title)}">↗</a></div></div></article>`;
}

function renderHome(posts) {
  const feature = posts[0];
  $('#feature').innerHTML = `<a class="feature-image" href="${articleUrl(feature)}"><img src="${esc(feature.image)}" alt=""></a><div class="feature-content"><span class="feature-label">Temat tygodnia <span>↗</span></span><span class="story-category">${esc(feature.category)}</span><h2><a href="${articleUrl(feature)}">${esc(feature.title)}</a></h2><p>${esc(feature.summary)}</p><a class="feature-cta" href="${articleUrl(feature)}">Przeczytaj artykuł <span>↗</span></a></div>`;
  $('#lead-side-list').innerHTML = posts.slice(1, 4).map((post, index) => `<article class="side-story"><a href="${articleUrl(post)}" class="side-image"><img src="${esc(post.image)}" alt="" ${index ? 'loading="lazy"' : ''}></a><div><span class="story-category">${esc(post.category)}</span><h3><a href="${articleUrl(post)}">${esc(post.title)}</a></h3><time datetime="${esc(post.date)}">${dateLabel(post.date)}</time></div></article>`).join('');
  let activeFilter = 'all';
  let search = '';
  const cards = $('#story-grid');
  const renderCards = () => {
    const visible = posts.filter((post) => (activeFilter === 'all' || post.category === activeFilter || (activeFilter === 'Moto & technologia' && post.category === 'Technologia')) && `${post.title} ${post.category} ${post.summary}`.toLocaleLowerCase('pl').includes(search));
    cards.innerHTML = visible.map(storyCard).join('');
    $('#empty-state').hidden = visible.length !== 0;
  };
  renderCards();
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
    renderCards();
    $('#artykuly').scrollIntoView({ behavior: 'smooth' });
  }));
  const searchToggle = $('.search-toggle');
  const searchPanel = $('#search-form');
  searchToggle.addEventListener('click', () => {
    searchPanel.hidden = !searchPanel.hidden;
    searchToggle.setAttribute('aria-expanded', String(!searchPanel.hidden));
    if (!searchPanel.hidden) $('#search-input').focus();
  });
  searchPanel.addEventListener('submit', (event) => {
    event.preventDefault();
    search = $('#search-input').value.trim().toLocaleLowerCase('pl');
    activeFilter = 'all';
    document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === 'all'));
    renderCards();
    $('#artykuly').scrollIntoView({ behavior: 'smooth' });
  });
}

function renderArticle(posts) {
  const id = Number(new URLSearchParams(location.search).get('id')) || posts[0].id;
  const post = posts.find((item) => item.id === id) || posts[0];
  document.title = `${post.title} — Dzień Mężczyzny`;
  const body = post.body.map((block) => `<${block.type}>${esc(block.text)}</${block.type}>`).join('');
  const related = posts.filter((item) => item.id !== post.id).slice(0, 3);
  $('#article-root').innerHTML = `<div class="breadcrumb"><a href="./">Strona główna</a><span> / </span><a href="./#artykuly">Artykuły</a><span> / </span>${esc(post.category)}</div><div class="article-heading"><span class="story-category">${esc(post.category)}</span><h1>${esc(post.title)}</h1><p class="article-lead">${esc(post.summary)}</p><div class="article-meta"><time datetime="${esc(post.date)}">${dateLabel(post.date)}</time><span class="meta-dot">●</span><span>Dzień Mężczyzny</span></div></div><figure class="article-cover"><img src="${esc(post.image)}" alt=""><figcaption>Zdjęcie z oryginalnego artykułu w serwisie Dzień Mężczyzny</figcaption></figure><div class="article-layout"><div class="article-body">${body}<div class="article-source"><span class="kicker">Pełna publikacja</span><p>To podgląd nowego układu artykułu. Pełny tekst znajduje się w obecnym serwisie.</p><a href="${esc(post.source)}" target="_blank" rel="noopener noreferrer">Otwórz oryginalny artykuł <span>↗</span></a></div></div><aside class="article-aside"><span class="kicker">W tym magazynie</span><h2>Odkrywaj więcej.</h2><p>Wybierz temat, który Cię interesuje, i czytaj dalej.</p><a href="./#artykuly">Zobacz artykuły <span>↗</span></a></aside></div><section class="related-section"><div class="section-head"><div><span class="kicker">Czytaj dalej</span><h2>Może Cię zainteresować<span class="accent">.</span></h2></div></div><div class="story-grid">${related.map(storyCard).join('')}</div></section>`;
}

setupMenu();
fetch('content.json').then((response) => { if (!response.ok) throw Error('Nie udało się wczytać treści'); return response.json(); }).then((posts) => {
  if (document.body.dataset.page === 'home') renderHome(posts);
  else renderArticle(posts);
}).catch((error) => {
  const target = document.body.dataset.page === 'home' ? $('#story-grid') : $('#article-root');
  target.innerHTML = `<p class="load-error">${esc(error.message)}. <a href="https://www.dzienmezczyzny.pl/">Przejdź do obecnej strony ↗</a></p>`;
});
