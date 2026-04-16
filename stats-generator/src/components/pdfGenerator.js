/**
 * PDF Report Generator — v2 Professional
 * Dark cinematic theme · jsPDF · A4 Landscape
 * Drop-in replacement: same exports, same data schema.
 */

const W = 297  // A4 landscape width mm
const H = 210  // A4 landscape height mm

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#0d0f14',
  surface:  '#161922',
  surface2: '#1c2030',
  surface3: '#222840',
  cyan:     '#00e5cc',
  cyan2:    '#40c4ff',
  magenta:  '#e040fb',
  green:    '#4caf50',
  text:     '#e8eaf0',
  muted:    '#616a8a',
  border:   '#252a3a',
  positive: '#00c896',
  negative: '#ff5252',
}

// ─── COLOR UTILS ──────────────────────────────────────────────────────────────
function rgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}
function fill(doc, hex)  { doc.setFillColor(...rgb(hex)) }
function txt(doc, hex)   { doc.setTextColor(...rgb(hex)) }
function draw(doc, hex)  { doc.setDrawColor(...rgb(hex)) }

// Blend a hex color toward black at a given ratio (0=original, 1=black)
function darken(hex, ratio) {
  const [r,g,b] = rgb(hex)
  return [Math.round(r*(1-ratio)), Math.round(g*(1-ratio)), Math.round(b*(1-ratio))]
}

// ─── BASE PRIMITIVES ──────────────────────────────────────────────────────────

function bgPage(doc) {
  fill(doc, C.bg)
  doc.rect(0, 0, W, H, 'F')

  // Subtle dot-grid pattern
  draw(doc, C.border)
  doc.setLineWidth(0.08)
  for (let x = 15; x < W; x += 18) {
    for (let y = 15; y < H; y += 18) {
      doc.circle(x, y, 0.4, 'F') // tiny filled dot, not circle stroke
    }
  }
}

/**
 * Page header bar (height = 26mm from top)
 */
function pageHeader(doc, brandName, brandColor, weekLabel, sectionLabel) {
  fill(doc, C.surface)
  doc.rect(0, 0, W, 26, 'F')

  // Left accent bar
  fill(doc, brandColor)
  doc.rect(0, 0, 5, 26, 'F')

  // Brand name
  txt(doc, brandColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(brandName.toUpperCase(), 13, 11)

  // Section label below brand
  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text(sectionLabel || 'INFORME DE ESTADÍSTICAS', 13, 21)

  // Center: report type
  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('ESTADÍSTICAS WEB Y REDES SOCIALES', W / 2, 14, { align: 'center' })

  // Right: week label
  txt(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.text(weekLabel || '', W - 10, 11, { align: 'right' })
  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)

  // Bottom separator with accent bleed
  draw(doc, brandColor)
  doc.setLineWidth(0.6)
  doc.line(0, 26, W, 26)
}

/**
 * Page footer (bottom 10mm)
 */
function pageFooter(doc, leftText, rightText, pageNum, totalPages) {
  draw(doc, C.border)
  doc.setLineWidth(0.3)
  doc.line(8, H - 10, W - 8, H - 10)

  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)

  if (leftText)  doc.text(leftText, 10, H - 4.5)
  if (pageNum !== undefined) {
    const label = totalPages ? `— ${pageNum} / ${totalPages} —` : `— ${pageNum} —`
    doc.text(label, W / 2, H - 4.5, { align: 'center' })
  }
  if (rightText) doc.text(rightText, W - 10, H - 4.5, { align: 'right' })
}

/**
 * Panel card (background container)
 */
function panel(doc, x, y, w, h) {
  fill(doc, C.surface)
  draw(doc, C.border)
  doc.setLineWidth(0.25)
  doc.roundedRect(x, y, w, h, 2, 2, 'FD')
}

/**
 * Section title bar inside a panel
 */
function sectionBar(doc, x, y, w, title, accentColor) {
  fill(doc, C.surface2)
  doc.roundedRect(x, y, w, 8, 1, 1, 'F')

  // Left accent rect
  fill(doc, accentColor)
  doc.rect(x, y, 3, 8, 'F')

  txt(doc, accentColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text(title.toUpperCase(), x + 7, y + 5.5)
}

// ─── KPI CARD ─────────────────────────────────────────────────────────────────
/**
 * Full-featured KPI card with accent top bar, large value, and delta badge.
 * @param {object} doc
 * @param {number} x, y, w, h
 * @param {string} title
 * @param {number|string} value     Current period value
 * @param {number|string} prevValue Previous period value (for delta)
 * @param {string} accentColor
 */
function kpiCard(doc, x, y, w, h, title, value, prevValue, accentColor) {
  panel(doc, x, y, w, h)

  // Top accent stripe
  fill(doc, accentColor)
  doc.roundedRect(x, y, w, 3.5, 1, 1, 'F')

  // Title
  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text(title.toUpperCase(), x + w / 2, y + 11, { align: 'center' })

  // Main value
  const curr = Number(value) || 0
  const prev = Number(prevValue) || 0
  txt(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.text(curr.toLocaleString('es-CL'), x + w / 2, y + h - 13, { align: 'center' })

  // Delta badge
  const delta   = curr - prev
  const pct     = prev > 0 ? Math.round((delta / prev) * 100) : 0
  const isUp    = delta >= 0
  const dColor  = prev === 0 ? C.muted : (isUp ? C.positive : C.negative)
  const arrow   = isUp ? '▲' : '▼'
  const sign    = delta >= 0 ? '+' : ''
  const deltaTxt = `${arrow}  ${sign}${delta.toLocaleString('es-CL')}  (${sign}${pct}%)`

  // Badge background
  const badgeW = Math.min(w - 10, 68)
  const bx = x + (w - badgeW) / 2
  fill(doc, C.surface2)
  doc.roundedRect(bx, y + h - 10, badgeW, 7, 3, 3, 'F')

  txt(doc, dColor)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.text(deltaTxt, x + w / 2, y + h - 4.8, { align: 'center' })

  // "vs sem. anterior" sublabel
  if (prev > 0) {
    txt(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.2)
    doc.text(`sem. anterior: ${prev.toLocaleString('es-CL')}`, x + w / 2, y + h - 0.5, { align: 'center' })
  }
}

// ─── BAR CHART (VERTICAL) ─────────────────────────────────────────────────────
function barChart(doc, x, y, w, h, data, color) {
  if (!data || data.length === 0) return
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1)
  const chartH = h - 14   // reserve bottom for labels
  const chartTop = y
  const baseY = chartTop + chartH

  // Horizontal grid lines (4 levels)
  const gridCount = 4
  for (let i = 1; i <= gridCount; i++) {
    const gy = baseY - (chartH / gridCount) * i
    draw(doc, C.border)
    doc.setLineWidth(0.15)
    doc.line(x, gy, x + w, gy)
    const gridVal = Math.round((maxVal / gridCount) * i)
    txt(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4)
    doc.text(gridVal >= 1000 ? `${(gridVal/1000).toFixed(1)}k` : String(gridVal), x - 1, gy + 1, { align: 'right' })
  }

  // Baseline
  draw(doc, C.muted)
  doc.setLineWidth(0.3)
  doc.line(x, baseY, x + w, baseY)

  const gutter = 2.5
  const totalGutters = (data.length - 1) * gutter
  const barW = (w - totalGutters) / data.length
  let bx = x

  data.forEach(d => {
    const val = Number(d.value) || 0
    const barH = (val / maxVal) * chartH
    const by = baseY - barH

    // Bar
    fill(doc, color)
    doc.roundedRect(bx, by, barW, barH, 0.8, 0.8, 'F')

    // Slightly lighter top cap
    const capH = Math.min(barH, 2.5)
    doc.setFillColor(...darken(color, -0.15 < 0 ? 0 : -0.15))
    fill(doc, color) // reset, jsPDF doesn't support lighten easily

    // Value label above bar
    if (val > 0) {
      txt(doc, C.text)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(4.5)
      const valLabel = val >= 1000 ? `${(val/1000).toFixed(1)}k` : String(val)
      doc.text(valLabel, bx + barW / 2, by - 1.2, { align: 'center' })
    }

    // X-axis label
    txt(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.8)
    const lbl = d.label.length > 10 ? d.label.slice(0, 10) + '…' : d.label
    doc.text(lbl, bx + barW / 2, baseY + 5.5, { align: 'center' })

    bx += barW + gutter
  })
}

// ─── HORIZONTAL BAR CHART ─────────────────────────────────────────────────────
function hBarChart(doc, x, y, w, h, data, color) {
  if (!data || data.length === 0) return
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 1)
  const labelW = 58
  const barAreaW = w - labelW - 12
  const rowH = h / data.length

  data.forEach((d, i) => {
    const val = Number(d.value) || 0
    const barW = (val / maxVal) * barAreaW
    const by = y + i * rowH

    // Alternating row bg
    fill(doc, i % 2 === 0 ? C.surface2 : C.surface)
    doc.rect(x, by, w, rowH, 'F')

    // Bar
    fill(doc, color)
    const BAR_PAD = 1.5
    doc.roundedRect(x + labelW, by + BAR_PAD, barW, rowH - BAR_PAD * 2, 0.6, 0.6, 'F')

    // Label
    txt(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.2)
    const lbl = d.label.length > 32 ? d.label.slice(0, 32) + '…' : d.label
    doc.text(lbl, x + labelW - 2, by + rowH / 2 + 1.8, { align: 'right' })

    // Value
    txt(doc, C.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.2)
    const valLabel = val >= 1000 ? `${(val/1000).toFixed(1)}k` : String(val)
    doc.text(valLabel, x + labelW + barW + 2, by + rowH / 2 + 1.8)
  })
}

// ─── TOP POSTS ROW ────────────────────────────────────────────────────────────
function topPostsRow(doc, x, y, w, h, posts, accentColor) {
  if (!posts || posts.length === 0) return
  const count = posts.length
  const gutter = 4
  const cardW = (w - gutter * (count - 1)) / count

  posts.forEach((post, i) => {
    const px = x + i * (cardW + gutter)

    fill(doc, C.surface2)
    draw(doc, C.border)
    doc.setLineWidth(0.2)
    doc.roundedRect(px, y, cardW, h, 2, 2, 'FD')

    // Rank badge
    fill(doc, accentColor)
    doc.roundedRect(px + 4, y + 4, 10, 7, 1, 1, 'F')
    txt(doc, '#0a0e14')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.text(`#${i + 1}`, px + 9, y + 9.5, { align: 'center' })

    // Views label
    txt(doc, C.muted)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.text('VISUALIZACIONES', px + cardW / 2, y + 14, { align: 'center' })

    // Views number
    const views = Number(post.vistas) || 0
    txt(doc, C.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.text(views >= 1000 ? `${(views/1000).toFixed(1)}k` : String(views), px + cardW / 2, y + h - 14, { align: 'center' })

    // Accent bottom stripe
    fill(doc, accentColor)
    doc.roundedRect(px, y + h - 3.5, cardW, 3.5, 1, 1, 'F')

    // Date in stripe
    txt(doc, '#0a0e14')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(5.5)
    doc.text(post.fecha || '—', px + cardW / 2, y + h - 0.5, { align: 'center' })
  })
}

// ─── COVER PAGE ───────────────────────────────────────────────────────────────
export function buildCoverPage(doc, weekLabel) {
  fill(doc, C.bg)
  doc.rect(0, 0, W, H, 'F')

  // Decorative diagonal lines top-right corner
  draw(doc, C.border)
  doc.setLineWidth(0.15)
  for (let i = 0; i < 16; i++) {
    doc.line(W - i * 20, 0, W, i * 14)
  }

  // Client color strips at bottom (3 stripes)
  const SH = 8
  const SW = W / 3
  fill(doc, C.cyan);   doc.rect(0,      H - SH, SW,  SH, 'F')
  fill(doc, C.cyan2);  doc.rect(SW,     H - SH, SW,  SH, 'F')
  fill(doc, C.green);  doc.rect(SW * 2, H - SH, SW,  SH, 'F')

  const clients = ['ASEMAFOR', 'INNOVARIEGO', 'ECONEGOCIOS']
  const cColors  = ['#0a0e14', '#0a0e14', '#0a0e14']
  clients.forEach((name, i) => {
    txt(doc, cColors[i])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.text(name, SW * i + SW / 2, H - SH + 5.5, { align: 'center' })
  })

  // Central card
  const CX = W / 2
  const CY = H / 2
  const CW = 176
  const CH = 86
  fill(doc, C.surface)
  doc.roundedRect(CX - CW / 2, CY - CH / 2, CW, CH, 4, 4, 'F')

  // Top accent
  fill(doc, C.cyan)
  doc.roundedRect(CX - CW / 2, CY - CH / 2, CW, 4, 2, 2, 'F')

  // Overprint subtle left glow
  fill(doc, C.surface2)
  doc.roundedRect(CX - CW / 2, CY - CH / 2 + 4, 4, CH - 4, 0, 0, 'F')

  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('INFORME DE ESTADÍSTICAS DIGITALES', CX, CY - CH / 2 + 16, { align: 'center' })

  txt(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.text('REPORTE SEMANAL', CX, CY - CH / 2 + 34, { align: 'center' })

  // Divider
  draw(doc, C.border)
  doc.setLineWidth(0.5)
  doc.line(CX - 46, CY - CH / 2 + 40, CX + 46, CY - CH / 2 + 40)

  txt(doc, C.cyan)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(weekLabel || '', CX, CY - CH / 2 + 52, { align: 'center' })

  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.text('Asemafor · Innovariego · Econegocios', CX, CY - CH / 2 + 64, { align: 'center' })

  // Generated date
  const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  txt(doc, C.muted)
  doc.setFontSize(6)
  doc.text(`Generado el ${today}`, CX, CY - CH / 2 + 76, { align: 'center' })
}

// ─── ASEMAFOR WEB ─────────────────────────────────────────────────────────────
export function buildAsemaforWebPage(doc, data, weekLabel) {
  bgPage(doc)
  pageHeader(doc, 'Asemafor', C.cyan, weekLabel, 'WEB ANALYTICS')

  const TY = 30  // top of content area
  const ROW1_H = 44
  const ROW2_Y = TY + ROW1_H + 4
  const ROW2_H = 66
  const ROW3_Y = ROW2_Y + ROW2_H + 4
  const ROW3_H = H - ROW3_Y - 14

  // ── ROW 1: KPI + Period info + Dispositivos
  kpiCard(doc, 8, TY, 72, ROW1_H, 'Visitantes Web',
    data.web.visitantes, data.web.visitantesSP, C.cyan)

  // Period info card (simple)
  panel(doc, 84, TY, 68, ROW1_H)
  sectionBar(doc, 84, TY, 68, 'Período', C.cyan)
  txt(doc, C.muted)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.text('Semana analizada:', 90, TY + 18)
  txt(doc, C.text)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  // Wrap weekLabel if long
  const wlLines = doc.splitTextToSize(weekLabel || '', 60)
  doc.text(wlLines, 90, TY + 26)

  // Dispositivos card
  panel(doc, 156, TY, 133, ROW1_H)
  sectionBar(doc, 156, TY, 133, 'Dispositivos', C.cyan)
  const dispData = [
    { label: 'Smartphone', value: data.web.dispositivos.smartphone || 0 },
    { label: 'Desktop',    value: data.web.dispositivos.desktop    || 0 },
    { label: 'Tablet',     value: data.web.dispositivos.tablet     || 0 },
    { label: 'Phablet',    value: data.web.dispositivos.phablet    || 0 },
  ]
  barChart(doc, 158, TY + 9, 129, ROW1_H - 11, dispData, C.cyan2)

  // ── ROW 2: Países + Fuentes
  panel(doc, 8, ROW2_Y, 136, ROW2_H)
  sectionBar(doc, 8, ROW2_Y, 136, 'Visitantes por País (%)', C.cyan)
  const paisData = data.web.paises.map(p => ({
    label: p.nombre,
    value: p.porcentaje ?? p.valor ?? 0
  }))
  barChart(doc, 10, ROW2_Y + 9, 132, ROW2_H - 11, paisData, C.cyan)

  panel(doc, 148, ROW2_Y, 141, ROW2_H)
  sectionBar(doc, 148, ROW2_Y, 141, 'Fuentes de Tráfico', C.cyan)
  const fuentesData = data.web.fuentes.map(f => ({ label: f.nombre, value: f.valor || 0 }))
  barChart(doc, 150, ROW2_Y + 9, 137, ROW2_H - 11, fuentesData, C.cyan2)

  // ── ROW 3: Páginas visitadas
  panel(doc, 8, ROW3_Y, 281, ROW3_H)
  sectionBar(doc, 8, ROW3_Y, 281, 'Páginas más Visitadas', C.magenta)
  const pagData = data.web.paginasVisitadas.map(p => ({ label: p.nombre, value: p.visitas || 0 }))
  hBarChart(doc, 9, ROW3_Y + 8, 279, ROW3_H - 8, pagData, C.magenta)

  pageFooter(doc, 'asemafor.cl', 'WEB ANALYTICS', 2, 7)
}

// ─── ASEMAFOR IG ──────────────────────────────────────────────────────────────
export function buildAsemaforIGPage(doc, data, weekLabel) {
  bgPage(doc)
  pageHeader(doc, 'Asemafor', C.cyan, weekLabel, 'INSTAGRAM ANALYTICS')

  const ig = data.instagram
  const TY = 30
  const KPI_H = 46
  const KPI_W = (281 - 8) / 3  // ≈ 91mm each

  // ── KPI Row
  kpiCard(doc, 8,                  TY, KPI_W, KPI_H, 'Visualizaciones',    ig.visualizaciones,    ig.visualizacionesSP,    C.magenta)
  kpiCard(doc, 8 + KPI_W + 4,      TY, KPI_W, KPI_H, 'Cuentas Alcanzadas', ig.cuentasAlcanzadas,  ig.cuentasAlcanzadasSP,  C.magenta)
  kpiCard(doc, 8 + (KPI_W + 4) * 2, TY, KPI_W, KPI_H, 'Interacciones',    ig.interacciones,      ig.interaccionesSP,      C.magenta)

  // ── Middle row
  const ROW2_Y = TY + KPI_H + 5
  const ROW2_H = 54

  // Audiencia
  panel(doc, 8, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 8, ROW2_Y, 90, 'Audiencia', C.magenta)
  const audItems = [
    { label: 'Seguidores',     pct: ig.seguidoresPct    || 0, val: ig.seguidores    || 0, prev: ig.seguidoresSP    || 0 },
    { label: 'No seguidores',  pct: ig.noSeguidoresPct  || 0 },
  ]
  let ay = ROW2_Y + 13
  audItems.forEach(item => {
    txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text(item.label, 14, ay)
    txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(`${item.pct}%`, 14, ay + 8)
    // Mini bar
    const barFullW = 60
    fill(doc, C.border); doc.rect(42, ay + 2, barFullW, 4, 'F')
    fill(doc, C.magenta); doc.roundedRect(42, ay + 2, (item.pct / 100) * barFullW, 4, 1, 1, 'F')
    if (item.prev !== undefined) {
      txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5)
      doc.text(`Total: ${item.val} (sp: ${item.prev})`, 14, ay + 17)
    }
    ay += 20
  })

  // Alcance por tipo
  panel(doc, 102, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 102, ROW2_Y, 90, 'Alcance por Tipo', C.magenta)
  const alcData = [
    { label: 'Publicaciones', value: ig.publicacionesPct || 0 },
    { label: 'Reels',         value: ig.reelPct          || 0 },
  ]
  let alY = ROW2_Y + 13
  alcData.forEach(item => {
    txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text(item.label, 108, alY)
    txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(`${item.value}%`, 108, alY + 8)
    const barFullW = 60
    fill(doc, C.border); doc.rect(136, alY + 2, barFullW, 4, 'F')
    fill(doc, C.cyan); doc.roundedRect(136, alY + 2, (item.value / 100) * barFullW, 4, 1, 1, 'F')
    alY += 20
  })

  // Visitas al perfil
  panel(doc, 196, ROW2_Y, 93, ROW2_H)
  sectionBar(doc, 196, ROW2_Y, 93, 'Visitas al Perfil', C.magenta)
  const vp = Number(ig.visitasPerfil) || 0
  const vpPrev = Number(ig.visitasPerfilSP) || 0
  txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text(vp.toLocaleString('es-CL'), 242, ROW2_Y + 35, { align: 'center' })
  const vpDelta = vp - vpPrev
  const vpColor = vpDelta >= 0 ? C.positive : C.negative
  txt(doc, vpColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  doc.text(`${vpDelta >= 0 ? '▲' : '▼'} ${vpDelta >= 0 ? '+' : ''}${vpDelta} vs sem. anterior`, 242, ROW2_Y + 44, { align: 'center' })

  // ── Top posts
  const TP_Y = ROW2_Y + ROW2_H + 5
  const TP_H = H - TP_Y - 14
  panel(doc, 8, TP_Y, 281, TP_H)
  sectionBar(doc, 8, TP_Y, 281, 'Publicaciones más Vistas', C.magenta)
  topPostsRow(doc, 12, TP_Y + 9, 273, TP_H - 10, ig.topPosts || [], C.magenta)

  pageFooter(doc, 'INSTAGRAM · @asemafor', 'IG ANALYTICS', 3, 7)
}

// ─── INNOVARIEGO WEB ──────────────────────────────────────────────────────────
export function buildInnovariegoWebPage(doc, data, weekLabel) {
  bgPage(doc)
  pageHeader(doc, 'Innovariego', C.cyan2, weekLabel, 'WEB ANALYTICS')

  const TY = 30
  const ROW1_H = 44
  const ROW2_Y = TY + ROW1_H + 4
  const ROW2_H = 66
  const ROW3_Y = ROW2_Y + ROW2_H + 4
  const ROW3_H = H - ROW3_Y - 14

  kpiCard(doc, 8, TY, 72, ROW1_H, 'Visitantes Web',
    data.web.visitantes, data.web.visitantesSP, C.cyan2)

  panel(doc, 84, TY, 68, ROW1_H)
  sectionBar(doc, 84, TY, 68, 'Período', C.cyan2)
  txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(8)
  const wlLines2 = doc.splitTextToSize(weekLabel || '', 60)
  doc.text(wlLines2, 90, TY + 26)

  panel(doc, 156, TY, 133, ROW1_H)
  sectionBar(doc, 156, TY, 133, 'Dispositivos', C.cyan2)
  const dispData = [
    { label: 'Smartphone', value: data.web.dispositivos.smartphone || 0 },
    { label: 'Desktop',    value: data.web.dispositivos.desktop    || 0 },
    { label: 'Tablet',     value: data.web.dispositivos.tablet     || 0 },
    { label: 'Phablet',    value: data.web.dispositivos.phablet    || 0 },
  ]
  barChart(doc, 158, TY + 9, 129, ROW1_H - 11, dispData, C.cyan2)

  panel(doc, 8, ROW2_Y, 136, ROW2_H)
  sectionBar(doc, 8, ROW2_Y, 136, 'Visitantes por País', C.cyan2)
  const paisData = data.web.paises.map(p => ({ label: p.nombre, value: p.valor || 0 }))
  barChart(doc, 10, ROW2_Y + 9, 132, ROW2_H - 11, paisData, C.cyan2)

  panel(doc, 148, ROW2_Y, 141, ROW2_H)
  sectionBar(doc, 148, ROW2_Y, 141, 'Fuentes de Tráfico', C.cyan2)
  const fuentesData = data.web.fuentes.map(f => ({ label: f.nombre, value: f.valor || 0 }))
  barChart(doc, 150, ROW2_Y + 9, 137, ROW2_H - 11, fuentesData, C.cyan)

  panel(doc, 8, ROW3_Y, 281, ROW3_H)
  sectionBar(doc, 8, ROW3_Y, 281, 'Páginas más Visitadas', C.cyan2)
  const pagData = data.web.paginasVisitadas.map(p => ({ label: p.nombre, value: p.visitas || 0 }))
  hBarChart(doc, 9, ROW3_Y + 8, 279, ROW3_H - 8, pagData, C.cyan2)

  pageFooter(doc, 'innovariego.cl', 'WEB ANALYTICS', 4, 7)
}

// ─── INNOVARIEGO IG ───────────────────────────────────────────────────────────
export function buildInnovariegoIGPage(doc, data, weekLabel) {
  bgPage(doc)
  pageHeader(doc, 'Innovariego', C.cyan2, weekLabel, 'INSTAGRAM ANALYTICS')

  const ig = data.instagram
  const TY = 30
  const KPI_H = 46
  const KPI_W = (281 - 8) / 3

  kpiCard(doc, 8,                   TY, KPI_W, KPI_H, 'Visualizaciones',    ig.visualizaciones,   ig.visualizacionesSP,   C.cyan2)
  kpiCard(doc, 8 + KPI_W + 4,       TY, KPI_W, KPI_H, 'Cuentas Alcanzadas', ig.cuentasAlcanzadas, ig.cuentasAlcanzadasSP, C.cyan2)
  kpiCard(doc, 8 + (KPI_W + 4) * 2, TY, KPI_W, KPI_H, 'Interacciones',      ig.interacciones,     ig.interaccionesSP,     C.cyan2)

  const ROW2_Y = TY + KPI_H + 5
  const ROW2_H = 54

  panel(doc, 8, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 8, ROW2_Y, 90, 'Audiencia', C.cyan2)
  let ay = ROW2_Y + 13
  const audItems = [
    { label: 'Seguidores',    pct: ig.seguidoresPct   || 0, val: ig.seguidores || 0, prev: ig.seguidoresSP || 0 },
    { label: 'No seguidores', pct: ig.noSeguidoresPct || 0 },
  ]
  audItems.forEach(item => {
    txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text(item.label, 14, ay)
    txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(`${item.pct}%`, 14, ay + 8)
    fill(doc, C.border); doc.rect(42, ay + 2, 50, 4, 'F')
    fill(doc, C.cyan2); doc.roundedRect(42, ay + 2, (item.pct / 100) * 50, 4, 1, 1, 'F')
    if (item.prev !== undefined) {
      txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(5.5)
      doc.text(`Total: ${item.val} (sp: ${item.prev})`, 14, ay + 17)
    }
    ay += 20
  })

  panel(doc, 102, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 102, ROW2_Y, 90, 'Alcance por Tipo', C.cyan2)
  let alY = ROW2_Y + 13
  const alcData = [
    { label: 'Publicaciones', value: ig.publicacionesPct || 0 },
    { label: 'Reels',         value: ig.reelPct          || 0 },
  ]
  alcData.forEach(item => {
    txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text(item.label, 108, alY)
    txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(`${item.value}%`, 108, alY + 8)
    fill(doc, C.border); doc.rect(136, alY + 2, 50, 4, 'F')
    fill(doc, C.cyan); doc.roundedRect(136, alY + 2, (item.value / 100) * 50, 4, 1, 1, 'F')
    alY += 20
  })

  panel(doc, 196, ROW2_Y, 93, ROW2_H)
  sectionBar(doc, 196, ROW2_Y, 93, 'Visitas al Perfil', C.cyan2)
  const vp = Number(ig.visitasPerfil) || 0
  const vpPrev = Number(ig.visitasPerfilSP) || 0
  txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text(vp.toLocaleString('es-CL'), 242, ROW2_Y + 35, { align: 'center' })
  const vpDelta = vp - vpPrev
  const vpColor = vpDelta >= 0 ? C.positive : C.negative
  txt(doc, vpColor); doc.setFont('helvetica', 'bold'); doc.setFontSize(7)
  doc.text(`${vpDelta >= 0 ? '▲' : '▼'} ${vpDelta >= 0 ? '+' : ''}${vpDelta} vs sem. anterior`, 242, ROW2_Y + 44, { align: 'center' })

  const TP_Y = ROW2_Y + ROW2_H + 5
  const TP_H = H - TP_Y - 14
  panel(doc, 8, TP_Y, 281, TP_H)
  sectionBar(doc, 8, TP_Y, 281, 'Publicaciones más Vistas', C.cyan2)
  topPostsRow(doc, 12, TP_Y + 9, 273, TP_H - 10, ig.topPosts || [], C.cyan2)

  pageFooter(doc, 'INSTAGRAM · @innovariego', 'IG ANALYTICS', 5, 7)
}

// ─── ECONEGOCIOS IG ───────────────────────────────────────────────────────────
export function buildEconegociosIGPage(doc, data, weekLabel) {
  bgPage(doc)
  pageHeader(doc, 'Econegocios', C.green, weekLabel, 'INSTAGRAM ANALYTICS')

  const ig = data.instagram
  const TY = 30
  const KPI_H = 46
  const KPI_W = (281 - 8) / 3

  kpiCard(doc, 8,                   TY, KPI_W, KPI_H, 'Visualizaciones',    ig.visualizaciones,  ig.visualizacionesSP,  C.green)
  kpiCard(doc, 8 + KPI_W + 4,       TY, KPI_W, KPI_H, 'Interacciones',      ig.interacciones,    ig.interaccionesSP,    C.green)
  kpiCard(doc, 8 + (KPI_W + 4) * 2, TY, KPI_W, KPI_H, 'Cuentas Alcanzadas', ig.cuentasAlcanzadas, 0,                   C.green)

  const ROW2_Y = TY + KPI_H + 5
  const ROW2_H = 54

  panel(doc, 8, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 8, ROW2_Y, 90, 'Audiencia', C.green)
  let ay = ROW2_Y + 13
  const audItems = [
    { label: 'Seguidores',    pct: ig.seguidoresPct   || 0 },
    { label: 'No seguidores', pct: ig.noSeguidoresPct || 0 },
  ]
  audItems.forEach(item => {
    txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
    doc.text(item.label, 14, ay)
    txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
    doc.text(`${item.pct}%`, 14, ay + 8)
    fill(doc, C.border); doc.rect(42, ay + 2, 50, 4, 'F')
    fill(doc, C.green); doc.roundedRect(42, ay + 2, (item.pct / 100) * 50, 4, 1, 1, 'F')
    ay += 20
  })

  panel(doc, 102, ROW2_Y, 90, ROW2_H)
  sectionBar(doc, 102, ROW2_Y, 90, 'Alcance por Tipo', C.green)
  txt(doc, C.muted); doc.setFont('helvetica', 'normal'); doc.setFontSize(6)
  doc.text('Publicaciones', 108, ROW2_Y + 13)
  txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text(`${ig.publicacionesPct || 0}%`, 108, ROW2_Y + 21)
  fill(doc, C.border); doc.rect(136, ROW2_Y + 15, 50, 4, 'F')
  fill(doc, C.green); doc.roundedRect(136, ROW2_Y + 15, ((ig.publicacionesPct || 0) / 100) * 50, 4, 1, 1, 'F')

  panel(doc, 196, ROW2_Y, 93, ROW2_H)
  sectionBar(doc, 196, ROW2_Y, 93, 'Visitas al Perfil', C.green)
  const vp = Number(ig.visitasPerfil) || 0
  txt(doc, C.text); doc.setFont('helvetica', 'bold'); doc.setFontSize(26)
  doc.text(vp.toLocaleString('es-CL'), 242, ROW2_Y + 35, { align: 'center' })

  const TP_Y = ROW2_Y + ROW2_H + 5
  const TP_H = H - TP_Y - 14
  panel(doc, 8, TP_Y, 281, TP_H)
  sectionBar(doc, 8, TP_Y, 281, 'Publicaciones más Vistas', C.green)
  topPostsRow(doc, 12, TP_Y + 9, 273, TP_H - 10, ig.topPosts || [], C.green)

  pageFooter(doc, 'INSTAGRAM · @econegocios', 'IG ANALYTICS', 6, 7)
}

// ─── MAIN ENTRY ───────────────────────────────────────────────────────────────
export async function generatePDF(stats) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const weekLabel = stats.semana || `${stats.fechaInicio || ''} – ${stats.fechaFin || ''}`

  buildCoverPage(doc, weekLabel)

  doc.addPage(); buildAsemaforWebPage(doc, stats.asemafor, weekLabel)
  doc.addPage(); buildAsemaforIGPage(doc, stats.asemafor, weekLabel)
  doc.addPage(); buildInnovariegoWebPage(doc, stats.innovariego, weekLabel)
  doc.addPage(); buildInnovariegoIGPage(doc, stats.innovariego, weekLabel)
  doc.addPage(); buildEconegociosIGPage(doc, stats.econegocios, weekLabel)

  const fileName = `estadisticas-${(weekLabel || 'semana').replace(/[\s/\\]/g, '-').toLowerCase()}.pdf`
  doc.save(fileName)
}
