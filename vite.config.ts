import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',   // ← ici, c'est ok pour l'adresse IP
    port: 5173,
    strictPort: true,
    open: false,           // ← cette option empêche Vite d'ouvrir le navigateur automatiquement
  },
  root: './',             // ← cela garantit que Vite utilise la racine du dossier pour l'index.html
  build: {
    outDir: 'dist',       // ← pour la sortie du build, par défaut "dist"
    emptyOutDir: true,    // ← permet de nettoyer le dossier "dist" avant chaque build
  }
})
