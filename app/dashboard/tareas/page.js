'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const COLUMNAS = [
  { id: 'pendiente', label: 'Pendiente', color: 'border-gray-600' },
  { id: 'en_proceso', label: 'En proceso', color: 'border-blue-500' },
  { id: 'bloqueada', label: 'Bloqueada', color: 'border-red-500' },
  { id: 'completada', label: 'Completada', color: 'border-green-500' },
]

const PRIORIDAD_COLOR = {
  alta: 'bg-red-900 text-red-300',
  media: 'bg-yellow-900 text-yellow-300',
  baja: 'bg-gray-800 text-gray-400',
}

export default function TareasPage() {
  const [tareas, setTareas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [nueva, setNueva] = useState({
    titulo: '',
    descripcion: '',
    area: '',
    prioridad: 'media',
    estado: 'pendiente',
    fecha_limite: '',
  })

  useEffect(() => {
    fetchTareas()
  }, [])

  const fetchTareas = async () => {
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTareas(data)
    setLoading(false)
  }

  const crearTarea = async (e) => {
  e.preventDefault()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('usuario:', user)
  const { data, error } = await supabase.from('tareas').insert({
    ...nueva,
    creado_por: user.id,
    fecha_limite: nueva.fecha_limite || null,
  })
  console.log('data:', data)
  console.log('error:', error)
  if (!error) {
    setShowForm(false)
    setNueva({ titulo: '', descripcion: '', area: '', prioridad: 'media', estado: 'pendiente', fecha_limite: '' })
    fetchTareas()
  }
}

  const cambiarEstado = async (id, nuevoEstado) => {
    await supabase.from('tareas').update({ estado: nuevoEstado }).eq('id', id)
    fetchTareas()
  }

  const tareasPorEstado = (estado) => tareas.filter(t => t.estado === estado)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando tareas...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Inicio</a>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-bold">✅ Tareas</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva tarea
        </button>
      </div>

      {/* Kanban */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNAS.map(col => (
          <div key={col.id} className={`bg-gray-900 rounded-xl border-t-2 ${col.color} p-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-gray-300">{col.label}</h2>
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                {tareasPorEstado(col.id).length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {tareasPorEstado(col.id).map(tarea => (
                <div key={tarea.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-500 transition-colors">
                  <p className="text-sm font-medium text-white mb-1">{tarea.titulo}</p>
                  {tarea.descripcion && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{tarea.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORIDAD_COLOR[tarea.prioridad]}`}>
                      {tarea.prioridad}
                    </span>
                    {tarea.fecha_limite && (
                      <span className="text-xs text-gray-500">
                        {new Date(tarea.fecha_limite).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </div>
                  {tarea.area && (
                    <p className="text-xs text-gray-500 mt-1">{tarea.area}</p>
                  )}
                  {/* Mover tarea */}
                  <select
                    value={tarea.estado}
                    onChange={(e) => cambiarEstado(tarea.id, e.target.value)}
                    className="mt-2 w-full bg-gray-700 text-gray-300 text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none"
                  >
                    {COLUMNAS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              ))}
              {tareasPorEstado(col.id).length === 0 && (
                <p className="text-xs text-gray-600 text-center py-4">Sin tareas</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal nueva tarea */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-lg font-bold mb-4">Nueva tarea</h2>
            <form onSubmit={crearTarea} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Título de la tarea *"
                value={nueva.titulo}
                onChange={e => setNueva({ ...nueva, titulo: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={nueva.descripcion}
                onChange={e => setNueva({ ...nueva, descripcion: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500 resize-none"
                rows={3}
              />
              <select
                value={nueva.area}
                onChange={e => setNueva({ ...nueva, area: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Área (opcional)</option>
                <option value="vinculacion">Vinculación</option>
                <option value="produccion">Producción</option>
                <option value="admin">Admin y Finanzas</option>
                <option value="comunicaciones">Comunicaciones</option>
                <option value="pedagogico">Desarrollo Pedagógico</option>
                <option value="direccion">Dirección</option>
              </select>
              <select
                value={nueva.prioridad}
                onChange={e => setNueva({ ...nueva, prioridad: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="alta">Prioridad Alta</option>
                <option value="media">Prioridad Media</option>
                <option value="baja">Prioridad Baja</option>
              </select>
              <input
                type="date"
                value={nueva.fecha_limite}
                onChange={e => setNueva({ ...nueva, fecha_limite: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              />
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Crear tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}