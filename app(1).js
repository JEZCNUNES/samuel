(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = u => {try {const v = new URL(u); return ['https:', 'http:'].includes(v.protocol) ? v.href : '#';} catch {return '#';}};
  const safeImage = u => /^(assets|uploads)\/[a-zA-Z0-9_./-]+$/.test(u || '') && !u.includes('..') ? u : 'assets/estacao-vianopolis.jpg';
  const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const page = document.body.dataset.page;
  const mark = (white = false) => `<span class="brand-mark ${white ? 'white' : ''}"><img src="assets/${white ? 'logo-branca-original.png' : 'logo-original.png'}" alt="Samuel Cotrim" width="3000" height="3000"></span>`;
  $('[data-header]').innerHTML = `<header class="site-header"><div class="header-inner wrap"><a class="brand" href="index.html" aria-label="Samuel Cotrim, início">${mark()}</a><nav class="desktop-nav" aria-label="Principal"><a href="index.html" ${page === 'home' ? 'aria-current="page"' : ''}>Início</a><a href="trajetoria.html" ${page === 'trajectory' ? 'aria-current="page"' : ''}>Trajetória</a><a href="index.html#atuacao">Atuação</a><a href="amo.html" ${page === 'company' ? 'aria-current="page"' : ''}>AMO</a><a href="blog.html" ${['blog','article'].includes(page) ? 'aria-current="page"' : ''}>Blog</a></nav><a class="header-cta" href="blog.html">Acompanhe as notícias <span aria-hidden="true">↗</span></a><button class="menu-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="Menu para celular" hidden><a href="index.html">Início</a><a href="trajetoria.html" ${page === 'trajectory' ? 'aria-current="page"' : ''}>Trajetória</a><a href="index.html#atuacao">Atuação</a><a href="amo.html" ${page === 'company' ? 'aria-current="page"' : ''}>AMO</a><a href="blog.html">Blog e notícias</a></nav></header>`;
  $('[data-footer]').innerHTML = `<footer class="site-footer"><div class="footer-main wrap"><a class="brand" href="index.html">${mark(true)}</a><p>Uma história com Vianópolis.<br><span>Educação. Experiência. Vida pública.</span></p><div class="footer-nav"><a href="trajetoria.html" ${page === 'trajectory' ? 'aria-current="page"' : ''}>Trajetória</a><a href="blog.html">Blog</a><a href="amo.html">AMO</a><a href="fontes.html">Fontes e créditos ↗</a></div></div><div class="footer-bottom wrap"><span>Samuel Cotrim · Vianópolis, Goiás</span><span>Currículo, acervo e notícias</span>${document.body.hasAttribute('data-static') ? '' : '<a href="admin.html">Painel de notícias ↗</a>'}</div></footer>`;
  const menu = $('.menu-toggle');
  menu.addEventListener('click', () => {const expanded = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!expanded)); menu.setAttribute('aria-label', expanded ? 'Abrir menu' : 'Fechar menu'); $('#mobile-nav').hidden = expanded;});
  document.addEventListener('keydown', e => {if (e.key === 'Escape') {$('#mobile-nav').hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label','Abrir menu');}});
  $('#mobile-nav').addEventListener('click', e => {if(e.target.closest('a')) {$('#mobile-nav').hidden = true; menu.setAttribute('aria-expanded','false');}});
  const date = p => p.datePrecision === 'year' ? p.date.slice(0,4) : new Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'short', year:'numeric'}).format(new Date(p.date + 'T12:00:00')).replace(/\./g,'');
  const card = p => `<article class="news-card"><a class="card-image" href="materia.html?id=${encodeURIComponent(p.id)}" tabindex="-1" aria-hidden="true"><img src="${esc(safeImage(p.image))}" alt="" loading="eager" decoding="async" width="720" height="480"><span class="card-arrow" aria-hidden="true">↗</span></a><div class="card-content"><div class="card-meta"><span class="category">${esc(p.category)}</span><time datetime="${esc(p.datePrecision === 'year' ? p.date.slice(0,4) : p.date)}">${esc(date(p))}</time></div><h3><a href="materia.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3><p>${esc(p.excerpt)}</p><a class="read-more" href="materia.html?id=${encodeURIComponent(p.id)}" aria-label="Ler: ${esc(p.title)}">Ler matéria <span aria-hidden="true">↗</span></a></div></article>`;
  let posts = (window.SAMUEL_POSTS || []).filter(p => p.status === 'published');
  function renderHome() {const featured = posts.filter(p => p.featured).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))).slice(0,3); $('#home-news').innerHTML = (featured.length ? featured : posts.slice(0,3)).map(card).join('');}
  function renderBlog() {
    let category = new URLSearchParams(location.search).get('categoria') || 'Todos';
    let limit = 9;
    const categories = ['Todos', ...new Set(posts.map(p => p.category))];
    if(!categories.includes(category)) category = 'Todos';
    const renderFilters = () => {$('#category-filters').innerHTML = categories.map(c => `<button type="button" class="filter ${c === category ? 'active' : ''}" aria-pressed="${c === category}">${esc(c)}</button>`).join('');};
    const render = () => {
      const term = normalize($('#search').value.trim());
      const filtered = posts.filter(p => (category === 'Todos' || p.category === category) && normalize(p.title + ' ' + p.excerpt + ' ' + p.body).includes(term)).sort((a,b) => $('#sort').value === 'recent' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
      $('#blog-news').innerHTML = filtered.slice(0,limit).map(card).join('');
      $('#result-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'matéria encontrada' : 'matérias encontradas'}`;
      $('#empty-state').hidden = filtered.length > 0;
      $('#load-more').hidden = filtered.length <= limit;
    };
    renderFilters(); render();
    $('#category-filters').addEventListener('click', e => {if(!e.target.matches('button')) return; category = e.target.textContent; limit = 9; const url = new URL(location.href); category === 'Todos' ? url.searchParams.delete('categoria') : url.searchParams.set('categoria',category); history.replaceState({},'',url); renderFilters(); render();});
    $('#search').addEventListener('input', () => {limit = 9; render();});
    $('#sort').addEventListener('change', () => {limit = 9; render();});
    $('#load-more').addEventListener('click', () => {limit += 9; render();});
    $('#clear-filters').addEventListener('click', () => {category = 'Todos'; $('#search').value = ''; limit = 9; history.replaceState({},'',location.pathname); renderFilters(); render(); $('#search').focus();});
  }
  function renderArticle() {
    const id = new URLSearchParams(location.search).get('id');
    const p = posts.find(p => p.id === id);
    if (!p) {$('#article-content').innerHTML = '<div class="empty-state"><h1>Matéria não encontrada.</h1><p>Explore outras histórias no blog.</p><a class="button primary" href="blog.html">Ir para o blog ↗</a></div>'; return;}
    document.title = p.title + ' · Samuel Cotrim';
    const readTime = Math.max(1, Math.ceil(p.body.trim().split(/\s+/).length / 180));
    const blocks = p.body.split(/\n\s*\n/).map(t => t.startsWith('## ') ? `<h2>${esc(t.slice(3))}</h2>` : `<p>${esc(t).replace(/\n/g,'<br>')}</p>`).join('');
    $('#article-content').innerHTML = `<div class="article-top"><a class="back-link" href="blog.html">← Voltar para o blog</a><span>${esc(p.category)}</span></div><article><header class="article-heading"><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.title)}</h1><p class="article-excerpt">${esc(p.excerpt)}</p><div class="article-byline"><span>${p.seed ? 'Acervo de atuação pública' : esc(p.author || 'Redação')}</span><span>${p.seed ? 'Registro de ' : ''}${esc(date(p))}</span><span>${readTime} min de leitura</span></div></header><figure class="article-cover"><img src="${esc(safeImage(p.image))}" alt="${esc(p.imageAlt || p.title)}" width="1200" height="750"><figcaption>${esc(p.imageCredit || '')}</figcaption></figure><div class="article-layout"><aside class="article-aside"><span>COMPARTILHAR</span><button id="copy-link" class="share-button">Copiar link ↗</button><button id="print-article" class="share-button">Imprimir ↓</button><a href="blog.html">Mais histórias ↗</a></aside><div class="article-body">${blocks}<div class="article-sources"><h2>Fontes desta matéria</h2>${p.sources?.length ? `<ul>${p.sources.map(s => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a></li>`).join('')}</ul>` : '<p>Conteúdo publicado pela redação no painel local.</p>'}${p.seed ? '<p class="editorial-note">Texto elaborado para este site a partir dos registros indicados. A data de referência corresponde ao registro original.</p>' : ''}</div></div></div></article>`;
    $('#copy-link').addEventListener('click', async () => {const toast = $('#toast');try {await navigator.clipboard.writeText(location.href);toast.textContent = ['127.0.0.1','localhost'].includes(location.hostname) || location.protocol === 'file:' ? 'Link local copiado. Ele funciona somente neste computador.' : 'Link copiado.';}catch {toast.textContent = 'Copie o endereço pela barra do navegador. Este link é local.';}toast.hidden = false;setTimeout(() => {toast.hidden = true;},4500);});
    $('#print-article').addEventListener('click', () => window.print());
    const related = posts.filter(x => x.id !== p.id).sort((a,b) => Number(b.category === p.category) - Number(a.category === p.category)).slice(0,3);
    $('#related-news').innerHTML = related.map(card).join(''); $('#related-section').hidden = !related.length;
  }
  const render = () => {if(page === 'home') renderHome(); if(page === 'blog') renderBlog(); if(page === 'article') renderArticle();};
  render();
  if (['127.0.0.1', 'localhost'].includes(location.hostname) && !document.body.hasAttribute('data-static') && ['home','blog','article'].includes(page)) fetch('/api/posts', {cache:'no-store'}).then(r => r.ok ? r.json() : Promise.reject()).then(data => {posts = data; render();}).catch(() => {});
})();
