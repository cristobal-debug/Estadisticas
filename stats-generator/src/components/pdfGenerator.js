/**
 * PDF Report Generator — v3 Premium
 * ─────────────────────────────────────────────────────────────────────────────
 * Palette research: 2025-2026 dark-dashboard best practices
 *   Base:        Deep cosmic navy   #080C14  (richer than pure black)
 *   Asemafor:    Emerald mint       #10E8A0  (nature, growth, environment)
 *   Innovariego: Electric sapphire  #3B8BFF  (water, precision, trust)
 *   Econegocios: Amber gold         #F5A623  (value, business, warmth)
 *   Delta+:      Vivid green        #00D68F
 *   Delta-:      Coral red          #FF4D6A
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in replacement: same exports, same data schema.
 */

const W = 297  // A4 landscape mm
const H = 210

// ─── MASTER PALETTE ───────────────────────────────────────────────────────────
const C = {
  bg:       '#080C14',
  surface:  '#0D1526',
  surface2: '#132035',
  surface3: '#1A2A44',
  text:     '#EEF2FF',
  muted:    '#526280',
  border:   '#1C2F4A',
  emerald:  '#10E8A0',
  sapphire: '#3B8BFF',
  amber:    '#F5A623',
  positive: '#00D68F',
  negative: '#FF4D6A',
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
function rgb(h)      { return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)] }
function fc(doc, h)  { doc.setFillColor(...rgb(h)) }
function tc(doc, h)  { doc.setTextColor(...rgb(h)) }
function dc(doc, h)  { doc.setDrawColor(...rgb(h)) }
function num(v)      { return Number(v) || 0 }
function fmt(v) {
  const n = num(v)
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`
  if (n >= 10000)   return `${(n/1000).toFixed(0)}k`
  if (n >= 1000)    return `${(n/1000).toFixed(1)}k`
  return n.toLocaleString('es-CL')
}

// ─── BASE PRIMITIVES ──────────────────────────────────────────────────────────

function bgPage(doc) {
  fc(doc, C.bg)
  doc.rect(0, 0, W, H, 'F')
  fc(doc, C.border)
  for (let x = 16; x < W; x += 20)
    for (let y = 16; y < H; y += 20)
      doc.circle(x, y, 0.35, 'F')
}

function pageHeader(doc, brandName, accent, weekLabel, sectionLabel) {
  fc(doc, C.surface)
  doc.rect(0, 0, W, 27, 'F')
  fc(doc, accent)
  doc.rect(0, 0, 5, 27, 'F')
  fc(doc, accent)
  doc.rect(5, 0, W - 5, 1.5, 'F')

  tc(doc, accent)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(brandName.toUpperCase(), 13, 12)

  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text((sectionLabel || 'ESTADÍSTICAS').toUpperCase(), 13, 22)

  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('ESTADÍSTICAS WEB Y REDES SOCIALES', W / 2, 14, { align: 'center' })

  tc(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.text(weekLabel || '', W - 10, 11, { align: 'right' })

  dc(doc, accent)
  doc.setLineWidth(0.5)
  doc.line(0, 27, W, 27)
}

function pageFooter(doc, leftText, rightText, pageNum, totalPages) {
  dc(doc, C.border)
  doc.setLineWidth(0.25)
  doc.line(8, H - 11, W - 8, H - 11)
  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  if (leftText)  doc.text(leftText, 10, H - 5)
  if (pageNum !== undefined) {
    const lbl = totalPages ? `${pageNum}  /  ${totalPages}` : String(pageNum)
    doc.text(lbl, W / 2, H - 5, { align: 'center' })
  }
  if (rightText) doc.text(rightText, W - 10, H - 5, { align: 'right' })
}

function panel(doc, x, y, w, h) {
  fc(doc, C.surface)
  dc(doc, C.border)
  doc.setLineWidth(0.2)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')
}

function sectionBar(doc, x, y, w, label, accent) {
  fc(doc, C.surface2)
  doc.roundedRect(x, y, w, 8.5, 1, 1, 'F')
  fc(doc, accent)
  doc.rect(x, y, 3.5, 8.5, 'F')
  tc(doc, accent)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text(label.toUpperCase(), x + 8, y + 6)
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
function kpiCard(doc, x, y, w, h, title, value, prevValue, accent) {
  panel(doc, x, y, w, h)
  fc(doc, accent)
  doc.roundedRect(x, y, w, 3.5, 1, 1, 'F')

  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text(title.toUpperCase(), x + w / 2, y + 12, { align: 'center' })

  const curr = num(value)
  const prev = num(prevValue)
  tc(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.text(fmt(curr), x + w / 2, y + h - 14, { align: 'center' })

  const delta  = curr - prev
  const pct    = prev > 0 ? Math.round((delta / prev) * 100) : null
  const isUp   = delta >= 0
  const dColor = prev === 0 ? C.muted : (isUp ? C.positive : C.negative)
  const arrow  = isUp ? '▲' : '▼'
  const sign   = delta >= 0 ? '+' : ''
  const pctTxt = pct !== null ? `  (${sign}${pct}%)` : ''
  const dtxt   = `${arrow}  ${sign}${fmt(delta)}${pctTxt}`

  const bdgW = Math.min(w - 10, 70)
  fc(doc, C.surface2)
  doc.roundedRect(x + (w - bdgW) / 2, y + h - 11, bdgW, 8, 3, 3, 'F')
  tc(doc, dColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text(dtxt, x + w / 2, y + h - 5.5, { align: 'center' })

  if (prev > 0) {
    tc(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.text(`sem. anterior: ${fmt(prev)}`, x + w / 2, y + h - 0.5, { align: 'center' })
  }
}

// ─── VERTICAL BAR CHART ───────────────────────────────────────────────────────
function barChart(doc, x, y, w, h, data, accent) {
  if (!data?.length) return
  const maxVal = Math.max(...data.map(d => num(d.value)), 1)
  const chartH = h - 14
  const baseY  = y + chartH

  for (let i = 1; i <= 4; i++) {
    const gy = baseY - (chartH / 4) * i
    dc(doc, C.border)
    doc.setLineWidth(0.12)
    doc.line(x, gy, x + w, gy)
    tc(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4)
    doc.text(fmt(Math.round((maxVal / 4) * i)), x - 1, gy + 1.2, { align: 'right' })
  }

  dc(doc, C.surface3)
  doc.setLineWidth(0.4)
  doc.line(x, baseY, x + w, baseY)

  const gutter = 2.5
  const barW   = (w - gutter * (data.length - 1)) / data.length
  let bx = x

  data.forEach(item => {
    const v  = num(item.value)
    const bh = Math.max(v > 0 ? 0.5 : 0, (v / maxVal) * chartH)
    const by = baseY - bh
    fc(doc, accent)
    if (bh > 0) doc.roundedRect(bx, by, barW, bh, 0.8, 0.8, 'F')
    if (v > 0) {
      tc(doc, C.text)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(4.5)
      doc.text(fmt(v), bx + barW / 2, by - 1.5, { align: 'center' })
    }
    tc(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.8)
    const lbl = (item.label || '').length > 11 ? item.label.slice(0, 11) + '…' : (item.label || '')
    doc.text(lbl, bx + barW / 2, baseY + 6, { align: 'center' })
    bx += barW + gutter
  })
}

// ─── HORIZONTAL BAR CHART ─────────────────────────────────────────────────────
function hBarChart(doc, x, y, w, h, data, accent) {
  if (!data?.length) return
  const maxVal  = Math.max(...data.map(d => num(d.value)), 1)
  const LABEL_W = 60
  const barArea = w - LABEL_W - 14
  const rowH    = h / data.length

  data.forEach((item, i) => {
    const v  = num(item.value)
    const bw = (v / maxVal) * barArea
    const by = y + i * rowH

    fc(doc, i % 2 === 0 ? C.surface2 : C.surface)
    doc.rect(x, by, w, rowH, 'F')

    fc(doc, C.surface3)
    doc.roundedRect(x + LABEL_W, by + 2, barArea, rowH - 4, 1, 1, 'F')

    if (bw > 0) {
      fc(doc, accent)
      doc.roundedRect(x + LABEL_W, by + 2, bw, rowH - 4, 1, 1, 'F')
    }

    tc(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.2)
    const lbl = (item.label || '').length > 34 ? item.label.slice(0, 34) + '…' : (item.label || '')
    doc.text(lbl, x + LABEL_W - 2, by + rowH / 2 + 1.8, { align: 'right' })

    tc(doc, C.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.2)
    doc.text(fmt(v), x + LABEL_W + bw + 2.5, by + rowH / 2 + 1.8)
  })
}

// ─── MINI PERCENT BAR ─────────────────────────────────────────────────────────
function pctBar(doc, x, y, w, h, pct, accent) {
  fc(doc, C.surface3)
  doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F')
  const fw = Math.max(h, (num(pct) / 100) * w)
  fc(doc, accent)
  doc.roundedRect(x, y, fw, h, h / 2, h / 2, 'F')
}

// ─── TOP POSTS ────────────────────────────────────────────────────────────────
function topPostsRow(doc, x, y, w, h, posts, accent) {
  if (!posts?.length) return
  const count  = posts.length
  const gutter = 4
  const cardW  = (w - gutter * (count - 1)) / count

  posts.forEach((post, i) => {
    const px = x + i * (cardW + gutter)
    fc(doc, C.surface2); dc(doc, C.border); doc.setLineWidth(0.2)
    doc.roundedRect(px, y, cardW, h, 2, 2, 'FD')

    fc(doc, accent)
    doc.roundedRect(px + 4, y + 4, 11, 7.5, 1.5, 1.5, 'F')
    tc(doc, C.bg)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5)
    doc.text(`#${i + 1}`, px + 9.5, y + 9.5, { align: 'center' })

    tc(doc, C.muted)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text('VISUALIZACIONES', px + cardW / 2, y + 16, { align: 'center' })

    const v = num(post.vistas)
    tc(doc, C.text)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(21)
    doc.text(fmt(v), px + cardW / 2, y + h - 14, { align: 'center' })

    fc(doc, accent)
    doc.roundedRect(px, y + h - 8, cardW, 8, 1, 1, 'F')
    tc(doc, C.bg)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(5.5)
    doc.text(post.fecha || '—', px + cardW / 2, y + h - 2.5, { align: 'center' })
  })
}

// ─── COVER ────────────────────────────────────────────────────────────────────
export function buildCoverPage(doc, weekLabel) {
  fc(doc, C.bg)
  doc.rect(0, 0, W, H, 'F')

  dc(doc, C.border)
  doc.setLineWidth(0.15)
  for (let i = 0; i < 18; i++) doc.line(W - i * 18, 0, W, i * 13)

  const SH = 9; const SW = W / 3
  const clients = [
    { name: 'ASEMAFOR',    color: C.emerald  },
    { name: 'INNOVARIEGO', color: C.sapphire },
    { name: 'ECONEGOCIOS', color: C.amber    },
  ]
  clients.forEach((cl, i) => {
    fc(doc, cl.color)
    doc.rect(SW * i, H - SH, SW, SH, 'F')
    tc(doc, C.bg)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(6.5)
    doc.text(cl.name, SW * i + SW / 2, H - SH + 6, { align: 'center' })
  })

  const CW = 178; const CH = 90; const CX = W / 2; const CY = H / 2
  fc(doc, C.surface)
  doc.roundedRect(CX - CW / 2, CY - CH / 2, CW, CH, 4, 4, 'F')

  const stripeW = CW / 3
  clients.forEach((cl, i) => {
    fc(doc, cl.color)
    const rx = CX - CW / 2 + stripeW * i
    if (i === 0) doc.roundedRect(rx, CY - CH / 2, stripeW, 3.5, 2, 0, 'F')
    else if (i === 2) doc.roundedRect(rx, CY - CH / 2, stripeW, 3.5, 0, 2, 'F')
    else doc.rect(rx, CY - CH / 2, stripeW, 3.5, 'F')
  })

  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8)
  doc.text('INFORME DE ESTADÍSTICAS DIGITALES', CX, CY - CH / 2 + 17, { align: 'center' })

  tc(doc, C.text)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text('REPORTE SEMANAL', CX, CY - CH / 2 + 35, { align: 'center' })

  dc(doc, C.border); doc.setLineWidth(0.5)
  doc.line(CX - 52, CY - CH / 2 + 41, CX + 52, CY - CH / 2 + 41)

  tc(doc, C.emerald)
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11)
  doc.text(weekLabel || '', CX, CY - CH / 2 + 53, { align: 'center' })

  tc(doc, C.muted)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5)
  doc.text('Asemafor  ·  Innovariego  ·  Econegocios', CX, CY - CH / 2 + 65, { align: 'center' })

  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  tc(doc, C.muted); doc.setFontSize(6)
  doc.text(`Generado el ${today}`, CX, CY - CH / 2 + 77, { align: 'center' })
}

// ─── SHARED WEB PAGE ──────────────────────────────────────────────────────────
function buildWebPage(doc, brandName, accent, accent2, data, weekLabel, pageNum, domain) {
  bgPage(doc)
  pageHeader(doc, brandName, accent, weekLabel, 'WEB ANALYTICS')

  const TY = 30; const FULL = 281; const GAP = 4

  // Row 1: KPI | Period | Dispositivos
  const R1H = 44; const KPI_W = 70

  kpiCard(doc, 8, TY, KPI_W, R1H, 'Visitantes Web',
    data.web.visitantes, data.web.visitantesSP, accent)

  panel(doc, 8 + KPI_W + GAP, TY, 66, R1H)
  sectionBar(doc, 8 + KPI_W + GAP, TY, 66, 'Período analizado', accent)
  tc(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5)
  doc.text('Semana:', 8 + KPI_W + GAP + 6, TY + 18)
  tc(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
  doc.text(doc.splitTextToSize(weekLabel || '', 58), 8 + KPI_W + GAP + 6, TY + 27)

  const dX = 8 + KPI_W + GAP + 66 + GAP; const dW = 8 + FULL - dX
  panel(doc, dX, TY, dW, R1H)
  sectionBar(doc, dX, TY, dW, 'Dispositivos', accent)
  barChart(doc, dX + 2, TY + 9, dW - 4, R1H - 11, [
    { label: 'Smartphone', value: data.web.dispositivos.smartphone || 0 },
    { label: 'Desktop',    value: data.web.dispositivos.desktop    || 0 },
    { label: 'Tablet',     value: data.web.dispositivos.tablet     || 0 },
    { label: 'Phablet',    value: data.web.dispositivos.phablet    || 0 },
  ], accent2)

  // Row 2: Países | Fuentes
  const R2Y = TY + R1H + GAP; const R2H = 68; const half = (FULL - GAP) / 2

  panel(doc, 8, R2Y, half, R2H)
  sectionBar(doc, 8, R2Y, half, 'Visitantes por País', accent)
  barChart(doc, 10, R2Y + 9, half - 4, R2H - 11,
    data.web.paises.map(p => ({ label: p.nombre, value: p.porcentaje ?? p.valor ?? 0 })), accent)

  panel(doc, 8 + half + GAP, R2Y, half, R2H)
  sectionBar(doc, 8 + half + GAP, R2Y, half, 'Fuentes de Tráfico', accent)
  barChart(doc, 8 + half + GAP + 2, R2Y + 9, half - 4, R2H - 11,
    data.web.fuentes.map(f => ({ label: f.nombre, value: f.valor || 0 })), accent2)

  // Row 3: Páginas
  const R3Y = R2Y + R2H + GAP; const R3H = H - R3Y - 14
  panel(doc, 8, R3Y, FULL, R3H)
  sectionBar(doc, 8, R3Y, FULL, 'Páginas más Visitadas', accent)
  hBarChart(doc, 9, R3Y + 9, FULL - 2, R3H - 9,
    data.web.paginasVisitadas.map(p => ({ label: p.nombre, value: p.visitas || 0 })), accent)

  pageFooter(doc, domain, 'WEB ANALYTICS', pageNum, 7)
}

// ─── SHARED IG PAGE ───────────────────────────────────────────────────────────
function buildIGPage(doc, brandName, accent, data, weekLabel, pageNum, handle, kpi3Override) {
  bgPage(doc)
  pageHeader(doc, brandName, accent, weekLabel, 'INSTAGRAM ANALYTICS')

  const ig = data.instagram; const TY = 30; const GAP = 4; const FULL = 281
  const R1H = 47; const KW = (FULL - GAP * 2) / 3

  const kpis = [
    { title: 'Visualizaciones',    v: ig.visualizaciones,   p: ig.visualizacionesSP   },
    { title: 'Cuentas Alcanzadas', v: ig.cuentasAlcanzadas, p: ig.cuentasAlcanzadasSP },
    kpi3Override || { title: 'Interacciones', v: ig.interacciones, p: ig.interaccionesSP },
  ]
  kpis.forEach((k, i) => kpiCard(doc, 8 + i * (KW + GAP), TY, KW, R1H, k.title, k.v, k.p, accent))

  // Row 2
  const R2Y = TY + R1H + GAP; const R2H = 56; const COL = (FULL - GAP * 2) / 3

  // Audiencia
  panel(doc, 8, R2Y, COL, R2H)
  sectionBar(doc, 8, R2Y, COL, 'Audiencia', accent)
  let ay = R2Y + 14
  ;[
    { lbl: 'Seguidores',    pct: ig.seguidoresPct   || 0, val: ig.seguidores   || 0, prev: ig.seguidoresSP   || 0 },
    { lbl: 'No seguidores', pct: ig.noSeguidoresPct || 0 },
  ].forEach(row => {
    tc(doc, C.muted);  doc.setFont('helvetica', 'normal'); doc.setFontSize(6);   doc.text(row.lbl, 14, ay)
    tc(doc, C.text);   doc.setFont('helvetica', 'bold');   doc.setFontSize(11);  doc.text(`${row.pct}%`, 14, ay + 9)
    pctBar(doc, 44, ay + 3.5, COL - 50, 4.5, row.pct, accent)
    if (row.prev !== undefined) {
      tc(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5)
      doc.text(`Total: ${fmt(row.val)}  (sp: ${fmt(row.prev)})`, 14, ay + 18)
    }
    ay += 22
  })

  // Alcance
  const alX = 8 + COL + GAP
  panel(doc, alX, R2Y, COL, R2H)
  sectionBar(doc, alX, R2Y, COL, 'Alcance por Tipo', accent)
  let alcY = R2Y + 14
  ;[
    { lbl: 'Publicaciones', pct: ig.publicacionesPct || 0 },
    { lbl: 'Reels',         pct: ig.reelPct          || 0 },
  ].forEach(row => {
    tc(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6);   doc.text(row.lbl, alX + 6, alcY)
    tc(doc, C.text);  doc.setFont('helvetica', 'bold');   doc.setFontSize(11);  doc.text(`${row.pct}%`, alX + 6, alcY + 9)
    pctBar(doc, alX + 36, alcY + 3.5, COL - 42, 4.5, row.pct, accent)
    alcY += 22
  })

  // Visitas perfil
  const vpX = 8 + (COL + GAP) * 2
  panel(doc, vpX, R2Y, COL, R2H)
  sectionBar(doc, vpX, R2Y, COL, 'Visitas al Perfil', accent)
  const vp = num(ig.visitasPerfil); const vpPrev = num(ig.visitasPerfilSP)
  tc(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text(fmt(vp), vpX + COL / 2, R2Y + 40, { align: 'center' })
  const vpD = vp - vpPrev
  const vpColor = vpPrev === 0 ? C.muted : (vpD >= 0 ? C.positive : C.negative)
  tc(doc, vpColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  doc.text(`${vpD >= 0 ? '▲' : '▼'}  ${vpD >= 0 ? '+' : ''}${fmt(vpD)} vs sem. anterior`,
    vpX + COL / 2, R2Y + 50, { align: 'center' })

  // Top posts
  const TPY = R2Y + R2H + GAP; const TPH = H - TPY - 14
  panel(doc, 8, TPY, FULL, TPH)
  sectionBar(doc, 8, TPY, FULL, 'Publicaciones más Vistas', accent)
  topPostsRow(doc, 12, TPY + 9, FULL - 8, TPH - 10, ig.topPosts || [], accent)

  pageFooter(doc, `INSTAGRAM · ${handle}`, 'IG ANALYTICS', pageNum, 7)
}

// ─── PUBLIC EXPORTS ───────────────────────────────────────────────────────────

export function buildAsemaforWebPage(doc, data, weekLabel) {
  buildWebPage(doc, 'Asemafor', C.emerald, C.sapphire, data, weekLabel, 2, 'asemafor.cl')
}

export function buildAsemaforIGPage(doc, data, weekLabel) {
  buildIGPage(doc, 'Asemafor', C.emerald, data, weekLabel, 3, '@asemafor')
}

export function buildInnovariegoWebPage(doc, data, weekLabel) {
  buildWebPage(doc, 'Innovariego', C.sapphire, C.emerald, data, weekLabel, 4, 'innovariego.cl')
}

export function buildInnovariegoIGPage(doc, data, weekLabel) {
  buildIGPage(doc, 'Innovariego', C.sapphire, data, weekLabel, 5, '@innovariego')
}

export function buildEconegociosIGPage(doc, data, weekLabel) {
  buildIGPage(doc, 'Econegocios', C.amber, data, weekLabel, 6, '@econegocios',
    { title: 'Cuentas Alcanzadas', v: data.instagram.cuentasAlcanzadas, p: 0 })
}

// ─── MAIN ENTRY ───────────────────────────────────────────────────────────────
export async function generatePDF(stats) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const weekLabel = stats.semana || `${stats.fechaInicio || ''} – ${stats.fechaFin || ''}`

  buildCoverPage(doc, weekLabel)
  doc.addPage(); buildAsemaforWebPage(doc,    stats.asemafor,    weekLabel)
  doc.addPage(); buildAsemaforIGPage(doc,     stats.asemafor,    weekLabel)
  doc.addPage(); buildInnovariegoWebPage(doc, stats.innovariego, weekLabel)
  doc.addPage(); buildInnovariegoIGPage(doc,  stats.innovariego, weekLabel)
  doc.addPage(); buildEconegociosIGPage(doc,  stats.econegocios, weekLabel)

  const fileName = `estadisticas-${(weekLabel || 'semana').replace(/[\s/\\]/g, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}
