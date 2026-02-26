'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PIPELINE = [
  { id: 'prospecto', label: 'Prospecto', color: 'border-gray-500' },
  { id: 'propuesta', label: 'Propuesta enviada', color: 'border-blue-500' },
  { id: 'negociacion', label: 'Negociación', color: 'border-yellow-500' },
  { id: 'contrato', label: 'Contrato firmado', color: 'border-purple-500' },
  { id: 'ejecucion', label: 'En ejecución', color: 'border-orange-500' },
  { id: 'cerrado', label: 'Cerrado', color: 'border-green-500' },
]

const PIPELINE_COLOR = {
  prospecto: 'bg-gray-800 text-gray-300',
  propuesta: 'bg-blue-900 text-blue-300',
  negociacion: 'bg-yellow-900 text-yellow-300',
  contrato: 'bg-purple-900 text-purple-300',
  ejecucion: 'bg-orange-900 text-orange-300',
  cerrado: 'bg-green-900 text-green-300',
}

const PAGO_COLOR = {
  pendiente: 'text-red-400',
  parcial: 'text-yellow-400',
  completo: 'text-green-400',
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [vistaFiltro, setVistaFiltro] = useState('todos')
  const [nuevo, setNuevo] = useState({
    nombre: '',
    tipo: '',
    estado_pipeline: 'prospecto',
    contacto_nombre: '',
    contacto_cargo: '',
    contacto_email: '',
    contacto_telefono: '',
    notas: '',
    estado_pago: 'pendiente',
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setClientes(data)
    setLoading(false)
  }

  const crearCliente = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('clientes').insert({ ...nuevo })
    if (!error) {
      setShowForm(false)
      setNuevo({ nombre: '', tipo: '', estado_pipeline: 'prospecto', contacto_nombre: '', contacto_cargo: '', contacto_email: '', contacto_telefono: '', notas: '', estado_pago: 'pendiente' })
      fetchClientes()
    }
  }

  const cambiarPipeline = async (id, estado) => {
    await supabase.from('clientes').update({ estado_pipeline: estado }).eq('id', id)
    fetchClientes()
    if (clienteSeleccionado?.id === id) {
      setClienteSeleccionado({ ...clienteSeleccionado, estado_pipeline: estado })
    }
  }

  const clientesFiltrados = vistaFiltro === 'todos'
    ? clientes
    : clientes.filter(c => c.estado_pipeline === vistaFiltro)

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400">Cargando clientes...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Inicio</a>
          <span className="text-gray-600">/</span>
          <h1 className="text-lg font-bold">🤝 Clientes</h1>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      {/* Pipeline tabs */}
      <div className="px-6 pt-5 flex gap-2 flex-wrap">
        <button
          onClick={() => setVistaFiltro('todos')}
          className={`text-xs px-3 py-1.5 rounded-full transition-colors ${vistaFiltro === 'todos' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
        >
          Todos ({clientes.length})
        </button>
        {PIPELINE.map(p => (
          <button
            key={p.id}
            onClick={() => setVistaFiltro(p.id)}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${vistaFiltro === p.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            {p.label} ({clientes.filter(c => c.estado_pipeline === p.id).length})
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 overflow-hidden">

        {/* Lista */}
        <div className="flex-1 p-6 flex flex-col gap-3 overflow-y-auto">
          {clientesFiltrados.length === 0 && (
            <div className="text-center py-20 text-gray-600">
              <p className="text-4xl mb-3">🤝</p>
              <p>No hay clientes en esta etapa todavía</p>
            </div>
          )}
          {clientesFiltrados.map(cliente => (
            <div
              key={cliente.id}
              onClick={() => setClienteSeleccionado(cliente)}
              className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition-colors ${clienteSeleccionado?.id === cliente.id ? 'border-red-500' : 'border-gray-800 hover:border-gray-600'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{cliente.nombre}</h3>
                  {cliente.tipo && <p className="text-xs text-gray-500 mt-0.5">{cliente.tipo}</p>}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${PIPELINE_COLOR[cliente.estado_pipeline]}`}>
                    {PIPELINE.find(p => p.id === cliente.estado_pipeline)?.label}
                  </span>
                  <span className={`text-xs ${PAGO_COLOR[cliente.estado_pago]}`}>
                    Pago: {cliente.estado_pago}
                  </span>
                </div>
              </div>
              {cliente.contacto_nombre && (
                <p className="text-xs text-gray-400 mt-2">👤 {cliente.contacto_nombre} {cliente.contacto_cargo && `· ${cliente.contacto_cargo}`}</p>
              )}
            </div>
          ))}
        </div>

        {/* Panel detalle */}
        {clienteSeleccionado && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white">{clienteSeleccionado.nombre}</h2>
              <button onClick={() => setClienteSeleccionado(null)} className="text-gray-500 hover:text-white text-lg">×</button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Etapa del pipeline</p>
                <select
                  value={clienteSeleccionado.estado_pipeline}
                  onChange={e => cambiarPipeline(clienteSeleccionado.id, e.target.value)}
                  className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                >
                  {PIPELINE.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              {clienteSeleccionado.tipo && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Tipo</p>
                  <p className="text-sm text-white">{clienteSeleccionado.tipo}</p>
                </div>
              )}

              {(clienteSeleccionado.contacto_nombre || clienteSeleccionado.contacto_email || clienteSeleccionado.contacto_telefono) && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Contacto</p>
                  {clienteSeleccionado.contacto_nombre && <p className="text-sm text-white">{clienteSeleccionado.contacto_nombre}</p>}
                  {clienteSeleccionado.contacto_cargo && <p className="text-xs text-gray-400">{clienteSeleccionado.contacto_cargo}</p>}
                  {clienteSeleccionado.contacto_email && <p className="text-xs text-blue-400 mt-1">{clienteSeleccionado.contacto_email}</p>}
                  {clienteSeleccionado.contacto_telefono && <p className="text-xs text-gray-400">{clienteSeleccionado.contacto_telefono}</p>}
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Estado de pago</p>
                <span className={`text-sm font-medium ${PAGO_COLOR[clienteSeleccionado.estado_pago]}`}>
                  {clienteSeleccionado.estado_pago}
                </span>
              </div>

              {clienteSeleccionado.notas && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notas internas</p>
                  <p className="text-sm text-gray-300 bg-gray-800 rounded-lg p-3">{clienteSeleccionado.notas}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-1">Agregado</p>
                <p className="text-xs text-gray-400">{new Date(clienteSeleccionado.created_at).toLocaleDateString('es-CL')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal nuevo cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nuevo cliente</h2>
            <form onSubmit={crearCliente} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nombre del cliente / establecimiento *"
                value={nuevo.nombre}
                onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
                required
              />
              <select
                value={nuevo.tipo}
                onChange={e => setNuevo({ ...nuevo, tipo: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="">Tipo de cliente</option>
                <option value="colegio">Colegio</option>
                <option value="empresa">Empresa</option>
                <option value="institucion">Institución</option>
                <option value="municipio">Municipio</option>
                <option value="otro">Otro</option>
              </select>
              <select
                value={nuevo.estado_pipeline}
                onChange={e => setNuevo({ ...nuevo, estado_pipeline: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                {PIPELINE.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Nombre del contacto"
                value={nuevo.contacto_nombre}
                onChange={e => setNuevo({ ...nuevo, contacto_nombre: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="Cargo del contacto"
                value={nuevo.contacto_cargo}
                onChange={e => setNuevo({ ...nuevo, contacto_cargo: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Email del contacto"
                value={nuevo.contacto_email}
                onChange={e => setNuevo({ ...nuevo, contacto_email: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              />
              <input
                type="text"
                placeholder="Teléfono del contacto"
                value={nuevo.contacto_telefono}
                onChange={e => setNuevo({ ...nuevo, contacto_telefono: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              />
              <select
                value={nuevo.estado_pago}
                onChange={e => setNuevo({ ...nuevo, estado_pago: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500"
              >
                <option value="pendiente">Pago pendiente</option>
                <option value="parcial">Pago parcial</option>
                <option value="completo">Pago completo</option>
              </select>
              <textarea
                placeholder="Notas internas (opcional)"
                value={nuevo.notas}
                onChange={e => setNuevo({ ...nuevo, notas: e.target.value })}
                className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:border-red-500 resize-none"
                rows={3}
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
                  Crear cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}