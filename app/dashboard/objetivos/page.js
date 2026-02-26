'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const AREAS = [
  { id: 'vinculacion', label: 'Vinculación' },
  { id: 'produccion', label: 'Producción' },
  { id: 'admin', label: 'Admin y Finanzas' },
  { id: 'comunicaciones', label: 'Comunicaciones' },
  { id: 'pedagogico', label: 'Desarrollo Pedagógico' },
  { id: 'direccion', label: 'Dirección' },
]

const ESTADO_COLOR = {
  activo: 'bg-blue-900 text-blue-300',
  completado: 'bg-green-900 text-green-300',
  pausado: 'bg-yellow-900 text-yellow-300',
}

export default function ObjetivosPage() {
  const [objetivos, setObjetivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [areaFiltro, setAreaFiltro] = useState('todas')
  const [nuevo, setNuevo] = useState({
    titulo: '',
    descripcion: '',
    area: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'activo',
    progreso: 0,
  })

  useEffect(() => {
    fetchObjetivos()
  }, [])

  const fetchObjetivos = async () => {
    const { data, error } = await supabase
      .from('objetivos')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setObjetivos(data)
    setLoading(false)
  }

  const crearObjetivo = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('objetivos').insert({
      ...nuevo,
      responsable_id: user.id,
      fecha_inicio: nuevo.fecha_inicio || null,
      fecha_fin: nuevo.fecha_fin || null,
      progreso: parseInt(nuevo.progreso),
    })
    if (!error) {
      setShowForm(false)
      setNuevo({ titulo: '', descripcion: '', area: '', fecha_inicio: '', fecha_fin: '', estado: 'activo', progreso: 0 })
      fetchObjetivos()
    }
  }

  const actualizarProgreso = async (id, progreso) => {
    await supabase.from('objetivos').update({ progreso: parseInt(progreso) }).eq('id', id)
    fetchObjetivos()
  }

  const objetivosFiltrados = areaFiltro === 'todas'
    ? objetivos
    : objetivos.filter(o => o.area === areaFiltro)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando objetivos...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Inicio</a>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-bold">🎯 Objetivos</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo objetivo
        </button>
      </div>

      {/* Filtro por área */}
      <div className="px-6 pt-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setAreaFiltro('todas')}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${areaFiltro === 'todas' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          Todas las áreas
        </button>
        {AREAS.map(area => (
          <button
            key={area.id}
            onClick={() => setAreaFiltro(area.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${areaFiltro === area.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Lista de objetivos */}
      <div className="p-6 flex flex-col gap-4">
        {objetivosFiltrados.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <p className="text-4xl mb-3">🎯</p>
            <p>No hay objetivos para esta área todavía</p>
          </div>
        )}
        {objetivosFiltrados.map(obj => (
          <div key={obj.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ESTADO_COLOR[obj.estado]}`}>
                    {obj.estado}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {AREAS.find(a => a.id === obj.area)?.label || obj.area}
                  </span>
                </div>
                <h3 className="font-semibold text-white mt-2">{obj.titulo}</h3>
                {obj.descripcion && (
                  <p className="text-sm text-gray-400 mt-1">{obj.descripcion}</p>
                )}
                {(obj.fecha_inicio || obj.fecha_fin) && (
                  <p className="text-xs text-gray-500 mt-2">
                    {obj.fecha_inicio && `Desde ${new Date(obj.fecha_inicio).toLocaleDateString('es-CL')}`}
                    {obj.fecha_inicio && obj.fecha_fin && ' → '}
                    {obj.fecha_fin && `Hasta ${new Date(obj.fecha_fin).toLocaleDateString('es-CL')}`}
                  </p>
                )}
              </div>

              {/* Progreso */}
              <div className="flex flex-col items-center gap-1 min-w-[80px]">
                <span className="text-2xl font-bold text-white">{obj.progreso}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={obj.progreso}
                  onChange={e => actualizarProgreso(obj.id, e.target.value)}
                  className="w-full accent-red-500"
                />
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mt-4 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-300"
                style={{ width: `${obj.progreso}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal nuevo objetivo */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nuevo objetivo</h2>
            <form onSubmit={crearObjetivo} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Título del objetivo *"
                value={nuevo.titulo}
                onChange={e => setNuevo({ ...nuevo, titulo: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                required
              />
              <textarea
                placeholder="Descripción (opcional)"
                value={nuevo.descripcion}
                onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500 resize-none"
                rows={3}
              />
              <select
                value={nuevo.area}
                onChange={e => setNuevo({ ...nuevo, area: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Seleccioná un área *</option>
                {AREAS.map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
              <select
                value={nuevo.estado}
                onChange={e => setNuevo({ ...nuevo, estado: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="completado">Completado</option>
              </select>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Fecha inicio</label>
                  <input
                    type="date"
                    value={nuevo.fecha_inicio}
                    onChange={e => setNuevo({ ...nuevo, fecha_inicio: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 mb-1 block">Fecha fin</label>
                  <input
                    type="date"
                    value={nuevo.fecha_fin}
                    onChange={e => setNuevo({ ...nuevo, fecha_fin: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Progreso inicial: {nuevo.progreso}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={nuevo.progreso}
                  onChange={e => setNuevo({ ...nuevo, progreso: e.target.value })}
                  className="w-full accent-red-500"
                />
              </div>
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
                  Crear objetivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}