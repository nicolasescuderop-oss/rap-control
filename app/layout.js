import './globals.css'

export const metadata = {
  title: 'Rock al Patio — Centro de Control',
  description: 'Gestión interna del equipo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
