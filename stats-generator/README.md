# 📊 Stats Generator — Asemafor / Innovariego / Econegocios

Aplicación web para generar reportes PDF semanales de estadísticas de sitios web e Instagram.

## 🚀 Deploy en Vercel

1. Sube este repo a GitHub
2. Ve a vercel.com → New Project → importa el repo
3. Framework: **Vite**
4. Build command: `npm run build`
5. Output dir: `dist`
6. ¡Deploy!

## 💻 Desarrollo local

```bash
npm install
npm run dev
```

## 📋 Cómo usar

1. Abre la app
2. Entra a "General" → pon el nombre/fechas de la semana
3. Ve a cada sección (Asemafor, Innovariego, Econegocios)
4. Ingresa los datos que sacas de Google Analytics e Instagram
5. Presiona **"Generar PDF"** → se descarga el reporte listo

## 🤖 Automatización futura (opcional)

Ver la pestaña **"📡 Auto-datos"** dentro de la app para instrucciones de:
- Instagram Basic Display API
- Google Analytics Data API v1
- Serverless functions en Vercel

## 🗂️ Estructura

```
src/
  App.jsx                    — UI principal
  data/defaultStats.js       — Estructura de datos
  components/
    FormFields.jsx           — Componentes de inputs reutilizables
    AsemaforForm.jsx         — Formulario Asemafor
    InnovariegoForm.jsx      — Formulario Innovariego
    EconegociosForm.jsx      — Formulario Econegocios
    pdfGenerator.js          — Generador PDF con jsPDF
```

## 📦 Stack

- React + Vite
- jsPDF (generación de PDF sin servidor)
- Tailwind CSS
- Vercel (hosting)
