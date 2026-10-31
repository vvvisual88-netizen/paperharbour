(() => {
  const data = window.PAPER_HARBOUR;
  const $ = s => document.querySelector(s);
  const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = value => { try { const u = new URL(value, location.href); return value && ['https:', 'http:', 'file:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  // Only approved releases with HTTPS supported checkout destinations can show a purchase link.
  const canBuy = p => { try { const u = new URL(p.checkoutUrl); return p.releaseApproved === true && u.protocol === 'https:' && (['payhip.com', 'gumroad.com'].some(host => u.hostname === host || u.hostname.endsWith('.' + host))); } catch { return false; } };
  window.paperHarbourCanBuy = canBuy;
  let category = 'All titles';
  const categories = ['All titles', ...new Set(data.products.map(p => p.category))];
  $('#filters').innerHTML = categories.map(c => `<button type="button" aria-pressed="${c === category}" data-filter="${escape(c)}">${escape(c)}</button>`).join('');
  function render() {
    const query = $('#search').value.trim().toLowerCase();
    const products = data.products.filter(p => (category === 'All titles' || p.category === category) && [p.title,p.subtitle,p.description,p.category].join(' ').toLowerCase().includes(query));
    $('#count').textContent = `${products.length} ${products.length === 1 ? 'title' : 'titles'} on this shelf`;
    $('#empty').hidden = products.length > 0;
    $('#products').innerHTML = products.map(p => `<article class="product"><div class="cover-stage"><img src="${escape(p.cover)}" alt="${escape(p.title)} digital PDF cover" loading="lazy" width="400" height="566"></div><p class="product-meta">${escape(p.category)} / ${escape(p.format)}</p><h3>${escape(p.title)}</h3><p class="subtitle">${escape(p.subtitle)}</p><p class="product-description">${escape(p.description)}</p><span class="status">${escape(p.status)}</span><div class="product-bottom"><span>${escape(p.price || 'Price to be confirmed')}</span><div class="card-actions"><a class="text-link" href="#book/${encodeURIComponent(p.id)}">Explore this title</a>${canBuy(p)?`<a class="button card-buy" href="${escape(p.checkoutUrl)}" target="_blank" rel="noopener" aria-label="Buy ${escape(p.title)} on ${new URL(p.checkoutUrl).hostname.endsWith('gumroad.com') ? 'Gumroad' : 'Payhip'}">Buy now</a>`:''}</div></div></article>`).join('');
  }
  $('#filters').addEventListener('click', e => { const b=e.target.closest('button'); if(!b)return;category=b.dataset.filter;$('#filters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));render(); });
  $('#search').addEventListener('input',render);
  $('#reset').addEventListener('click',()=>{category='All titles';$('#search').value='';$('#filters').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));render();$('#search').focus();});
  const dialog = $('#detail'); let returnFocus;
  function closeDetail(){ if(dialog.open)dialog.close(); if(location.hash.startsWith('#book/'))history.replaceState(null,'','#collection'); if(returnFocus?.isConnected)returnFocus.focus(); }
  function route(){
    if(!location.hash.startsWith('#book/')){if(dialog.open)dialog.close();return;}
    const p=data.products.find(p=>`#book/${encodeURIComponent(p.id)}`===location.hash);if(!p){history.replaceState(null,'','#collection');return;}
    returnFocus=document.activeElement;
    $('#detail-content').innerHTML=`<div class="detail-grid"><img src="${escape(p.cover)}" alt="${escape(p.title)} digital PDF cover"><div><p class="eyebrow">${escape(p.category)}</p><h2 id="detail-title">${escape(p.title)}</h2><p class="subtitle">${escape(p.subtitle)}</p><span class="status">${escape(p.status)}</span><p>${escape(p.description)}</p><dl class="specs"><dt>Format</dt><dd>${escape(p.format)}</dd><dt>Language</dt><dd>${escape(p.language)}</dd><dt>For</dt><dd>${escape(p.players)}</dd></dl><h3>Inside the download</h3><ul>${p.contents.map(c=>`<li>${escape(c)}</li>`).join('')}</ul><p>${escape(p.notes)}</p>${p.price?`<p><strong>${escape(p.price)}</strong></p>`:''}<div class="detail-actions">${safeUrl(p.sampleUrl)?`<a class="text-link" href="${escape(safeUrl(p.sampleUrl))}" target="_blank" rel="noopener">${escape(p.sampleLabel)}</a>`:''}${canBuy(p)?`<a class="button" href="${escape(p.checkoutUrl)}" target="_blank" rel="noopener">Buy on ${new URL(p.checkoutUrl).hostname.endsWith('gumroad.com') ? 'Gumroad' : 'Payhip'}</a>`:`<button class="button" disabled>${p.releaseApproved ? 'Checkout coming soon' : 'In preparation — not yet for sale'}</button>`}</div></div></div>`;
    if(!dialog.open)dialog.showModal(); $('.close').focus();
  }
  $('.close').addEventListener('click',closeDetail);
  dialog.addEventListener('cancel',e=>{e.preventDefault();closeDetail();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDetail();}});
  window.addEventListener('hashchange',route);
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)){ $('#contact-copy').textContent='Questions about the books? Email Paper Harbour.';$('#contact-link').href=`mailto:${data.contactEmail}`;$('#contact-link').hidden=false;$('#contact-disabled').hidden=true; }
  render();route();
})();
