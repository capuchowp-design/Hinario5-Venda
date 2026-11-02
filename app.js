(function () {
  'use strict';
  var C = window.CONFIG, H = window.HINOS, A = window.AMOSTRAS;
  var $ = function (id) { return document.getElementById(id); };
  var brl = function (v) { return v.toFixed(2).replace('.', ','); };
  var pad = function (n) { return String(n).padStart(3, '0'); };
  var titulo = function (n) { return H[n] || ('Hino ' + pad(n)); };
  var KEY = 'hinario5_carrinho_v1';
  var cart = [];

  /* ---------- textos de preço ---------- */
  document.querySelectorAll('[data-total]').forEach(function (e) { e.textContent = C.totalHinos; });
  document.querySelectorAll('[data-preco-completo]').forEach(function (e) { e.textContent = brl(C.precoCompleto); });
  document.querySelectorAll('[data-preco-avulso]').forEach(function (e) { e.textContent = brl(C.precoAvulso); });
  var cheio = C.totalHinos * C.precoAvulso;
  var por = (C.precoCompleto / C.totalHinos);
  $('ecoTexto').textContent = cheio > C.precoCompleto
    ? 'Sai a R$ ' + brl(por) + ' por hino · economia de R$ ' + brl(cheio - C.precoCompleto) + ' frente aos avulsos'
    : '';
  $('pixChave').textContent = C.pix.chave;
  $('pixNome').textContent = C.pix.nome ? 'Favorecido: ' + C.pix.nome : '';

  /* ---------- toast ---------- */
  var tt;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { t.hidden = true; }, 2200);
  }

  /* ---------- amostras ---------- */
  var car = $('carrossel');
  A.forEach(function (a) {
    var b = document.createElement('button');
    b.className = 'amostra'; b.type = 'button';
    var src = 'img/previas/amostra-' + pad(a.n) + '.jpg';
    b.innerHTML =
      '<div class="thumb"><img loading="lazy" src="' + src + '" alt="Prévia da partitura do hino ' + pad(a.n) + '"></div>' +
      '<div class="meta"><span class="num">HINO ' + pad(a.n) + '</span><h4></h4>' +
      '<div class="tags"><span>' + a.compasso + '</span><span>♩ = ' + a.bpm + '</span><span>' + a.pags + (a.pags > 1 ? ' páginas' : ' página') + '</span></div></div>';
    b.querySelector('h4').textContent = titulo(a.n);
    b.addEventListener('click', function () { abrirLb(src, pad(a.n) + ' – ' + titulo(a.n)); });
    car.appendChild(b);
  });

  var lb = $('lightbox');
  function abrirLb(src, cap) {
    $('lbImg').src = src; $('lbImg').alt = 'Amostra ampliada: ' + cap; $('lbCap').textContent = cap;
    lb.hidden = false; document.body.style.overflow = 'hidden'; $('lbClose').focus();
  }
  function fecharLb() { lb.hidden = true; document.body.style.overflow = ''; }
  $('lbClose').addEventListener('click', fecharLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) fecharLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') fecharLb(); });

  /* ---------- carrinho ---------- */
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(function (n) { return n >= 1 && n <= C.totalHinos; }); } catch (e) { cart = []; }
  function salvar() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }

  function render() {
    cart.sort(function (a, b) { return a - b; });
    var ul = $('chips'); ul.innerHTML = '';
    cart.forEach(function (n) {
      var li = document.createElement('li'); li.className = 'chip';
      li.innerHTML = '<span><b>' + pad(n) + '</b></span><button type="button" aria-label="Remover hino ' + pad(n) + '">×</button>';
      li.querySelector('span').appendChild(document.createTextNode(' ' + titulo(n)));
      li.querySelector('button').addEventListener('click', function () { remover(n); });
      ul.appendChild(li);
    });
    var q = cart.length, total = q * C.precoAvulso;
    $('vazio').hidden = q > 0;
    $('totalBox').hidden = q === 0;
    $('qtd').textContent = q;
    $('total').textContent = brl(total);
    $('btnPedido').disabled = q === 0;
    $('btnLimpar').hidden = q === 0;
    var up = $('upsell');
    if (q > 0 && total >= C.precoCompleto) {
      up.hidden = false;
      up.textContent = 'Seus hinos já custam mais que a coleção completa. Levando tudo você paga R$ ' + brl(C.precoCompleto) + ' e ganha os ' + C.totalHinos + ' hinos.';
    } else if (q > 0 && total >= C.precoCompleto * 0.7) {
      up.hidden = false;
      up.textContent = 'Faltam só R$ ' + brl(C.precoCompleto - total) + ' para o valor da coleção completa, com todos os ' + C.totalHinos + ' hinos.';
    } else { up.hidden = true; }
    salvar();
  }
  function adicionar(n) {
    if (!(n >= 1 && n <= C.totalHinos)) return erro('Digite um número de 1 a ' + C.totalHinos + '.');
    if (cart.indexOf(n) !== -1) return erro('O hino ' + pad(n) + ' já está na sua lista.');
    cart.push(n); erro(''); render(); fecharResultados();
    $('busca').value = ''; toast('Hino ' + pad(n) + ' adicionado');
  }
  function remover(n) { cart = cart.filter(function (x) { return x !== n; }); render(); }
  function erro(m) { var e = $('erroBusca'); e.textContent = m; e.hidden = !m; }

  /* ---------- busca ---------- */
  var res = $('resultados'), inp = $('busca');
  function fecharResultados() { res.hidden = true; res.innerHTML = ''; }
  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function sugerir() {
    erro('');
    var v = inp.value.trim(); res.innerHTML = '';
    if (!v) return fecharResultados();
    var itens = [];
    if (/^\d+$/.test(v)) {
      var n = parseInt(v, 10);
      if (n >= 1 && n <= C.totalHinos) itens.push(n);
    } else {
      var q = norm(v);
      Object.keys(H).forEach(function (k) { if (norm(H[k]).indexOf(q) !== -1) itens.push(+k); });
    }
    if (!itens.length) {
      var li = document.createElement('li');
      li.textContent = /^\d+$/.test(v) ? 'Número fora da lista (1 a ' + C.totalHinos + ')' : 'Nenhum título encontrado. Digite o número do hino.';
      li.style.cursor = 'default'; res.appendChild(li); res.hidden = false; return;
    }
    itens.forEach(function (n) {
      var li = document.createElement('li'); li.tabIndex = 0; li.setAttribute('role', 'option');
      li.innerHTML = '<b>' + pad(n) + '</b>'; li.appendChild(document.createTextNode(titulo(n)));
      var add = function () { adicionar(n); };
      li.addEventListener('click', add);
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter') add(); });
      res.appendChild(li);
    });
    res.hidden = false;
  }
  inp.addEventListener('input', sugerir);
  inp.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); $('btnAdd').click(); }
  });
  $('btnAdd').addEventListener('click', function () {
    var v = inp.value.trim();
    if (/^\d+$/.test(v)) return adicionar(parseInt(v, 10));
    var q = norm(v), achou = Object.keys(H).filter(function (k) { return norm(H[k]).indexOf(q) !== -1; });
    if (v && achou.length === 1) return adicionar(+achou[0]);
    if (!v) return erro('Digite o número ou o nome do hino.');
    sugerir();
  });
  $('btnLimpar').addEventListener('click', function () { cart = []; render(); });

  /* ---------- pedido por WhatsApp ---------- */
  function zap(texto) {
    window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
  }
  $('btnCompleto').addEventListener('click', function () {
    zap('Olá! Quero a *coleção completa* do Hinário nº 5 em Fingerstyle (' + C.totalHinos + ' hinos) por R$ ' + brl(C.precoCompleto) + '.\nPode me passar os dados para o pagamento via Pix?');
  });
  $('btnPedido').addEventListener('click', function () {
    var linhas = cart.map(function (n) { return '• ' + pad(n) + ' – ' + titulo(n); }).join('\n');
    zap('Olá! Quero comprar ' + cart.length + ' hino(s) do Hinário nº 5 em Fingerstyle:\n\n' + linhas +
      '\n\nTotal: R$ ' + brl(cart.length * C.precoAvulso) + '\nPode me passar os dados para o pagamento via Pix?');
  });
  $('btnCopiar').addEventListener('click', function () {
    var t = C.pix.chave;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { toast('Chave Pix copiada'); }, function () { toast('Copie manualmente a chave'); });
    } else {
      var r = document.createRange(); r.selectNodeContents($('pixChave'));
      var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Selecionada: toque em copiar');
    }
  });

  /* ---------- aparecer ao rolar + botão flutuante ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); }); }

  var fab = $('fab'), compra = $('comprar');
  function fabCheck() {
    var r = compra.getBoundingClientRect();
    fab.hidden = !(window.scrollY > 500 && (r.top > innerHeight * .9 || r.bottom < 0));
  }
  addEventListener('scroll', fabCheck, { passive: true }); fabCheck();

  /* ---------- instalar (PWA) ---------- */
  var promptInstall;
  addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); promptInstall = e; $('btnInstalar').hidden = false;
  });
  $('btnInstalar').addEventListener('click', function () {
    if (!promptInstall) return;
    promptInstall.prompt(); promptInstall.userChoice.then(function () { promptInstall = null; $('btnInstalar').hidden = true; });
  });
  addEventListener('appinstalled', function () { $('btnInstalar').hidden = true; });

  if ('serviceWorker' in navigator) {
    addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }

  render();
})();
