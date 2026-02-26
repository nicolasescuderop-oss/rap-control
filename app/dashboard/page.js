'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/'
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Rock <span className="text-red-500">al Patio</span></h1>
          <span className="text-gray-600 text-sm">Centro de Control</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold mb-2">Bienvenido 👋</h2>
        <p className="text-gray-400 mb-10">Este es el Centro de Control de Rock al Patio. Vamos construyendo.</p>

        {/* Cards de módulos próximos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { nombre: 'Mi Día', desc: 'Tus tareas y pendientes de hoy', emoji: '🏠', estado: 'próximamente' },
            { nombre: 'Tareas', desc: 'Gestión operativa del equipo', emoji: '✅', estado: 'próximamente' },
            { nombre: 'Objetivos', desc: 'Metas macro por área', emoji: '🎯', estado: 'próximamente' },
            { nombre: 'Clientes', desc: 'Pipeline comercial y fichas', emoji: '🤝', estado: 'próximamente' },
            { nombre: 'Calendario', desc: 'Actividades y eventos', emoji: '📅', estado: 'próximamente' },
            { nombre: 'Panel Dirección', desc: 'Vista global del equipo', emoji: '📊', estado: 'próximamente' },
          ].map((modulo) => (
            <div key={modulo.nombre} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors">
              <div className="text-3xl mb-3">{modulo.emoji}</div>
              <h3 className="font-semibold text-white mb-1">{modulo.nombre}</h3>
              <p className="text-gray-400 text-sm mb-3">{modulo.desc}</p>
              <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded-full">{modulo.estado}</span>
            </div>
          ))}
        </div>
      </main>

    </div>
  )
}