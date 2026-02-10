import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
            tailwindcss(),
            VitePWA({
      registerType: 'autoUpdate', // Atualiza o app sozinho quando você sobe versão nova
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Arquivos estáticos
      manifest: {
        name: 'Onyx Finance', // Nome completo
        short_name: 'Onyx', // Nome que fica embaixo do ícone no celular
        description: 'Seu gerenciador financeiro pessoal',
        theme_color: '#ffffff', // Cor da barra de status do celular
        background_color: '#ffffff', // Cor de fundo enquanto carrega
        display: 'standalone', // <--- ISSO TIRA A BARRA DO NAVEGADOR (Fica parecendo app nativo)
        scope: '/',
        start_url: '/',
        orientation: 'portrait', // Trava em pé (opcional)
        icons: [
          {
            src: 'android-chrome-192x192.png', // Você precisa criar esse arquivo (ver Passo 3)
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png', // Você precisa criar esse arquivo (ver Passo 3)
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Importante pro Android (ícone redondinho)
          }
        ]
      }
    })
  ],
})
