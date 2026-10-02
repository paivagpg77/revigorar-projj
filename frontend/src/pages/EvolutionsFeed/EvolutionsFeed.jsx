import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, FileText, ClipboardCheck, Plus, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import { getEvolutionFeed, createEvolution } from '../../services/evolutionsService.js'
import { listPatients } from '../../services/patientsService.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import './EvolutionsFeed.css'

const TYPES = ['Todas', 'Fotográfica', 'Prescrição', 'Avaliação']
const TYPE_ICON = { Fotográfica: ImageIcon, Prescrição: FileText, Avaliação: ClipboardCheck }
const PAGE_SIZE = 6

function initialsOf(name = '') { return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U' }

export default function EvolutionsFeed() {
  const [feed, setFeed] = useState([])
  const [patients, setPatients] = useState([])
  const [type, setType] = useState('Todas')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ patient_id: '', type: 'Avaliação', description: '' })
  const [loading, setLoading] = useState(true)
  const showToast = useToast()

  async function load() {
    const [e, p] = await Promise.all([getEvolutionFeed(), listPatients()])
    setFeed(Array.isArray(e) ? e : [])
    setPatients(Array.isArray(p) ? p : [])
    setForm((current) => ({ ...current, patient_id: current.patient_id || p?.[0]?.id || '' }))
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    load().catch((err) => { if (active) showToast(err?.message || 'Não foi possível carregar as evoluções.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const addEvolution = async (event) => {
    event.preventDefault()
    if (!form.patient_id || !form.description.trim()) return
    try {
      const created = await createEvolution({ ...form, description: form.description.trim() })
      setFeed((list) => [created, ...list])
      setForm((f) => ({ ...f, description: '' }))
      setShowForm(false)
      showToast('Evolução registrada.')
    } catch (err) {
      showToast(err?.message || 'Não foi possível registrar a evolução.')
    }
  }

  const filtered = feed.filter((item) => type === 'Todas' || item.type === type)
  const shown = filtered.slice(0, visible)

  return <div className="page">
    <div className="page-header"><div><h1>Evoluções</h1><p>Registros de evolução dos seus pacientes.</p></div><button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}><Plus size={15} /> Nova evolução</button></div>
    {showForm && <form className="panel" onSubmit={addEvolution}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 12 }}>
        <div className="form-field"><label>Paciente</label><select value={form.patient_id} onChange={(e) => setForm((f) => ({ ...f, patient_id: e.target.value }))}>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="form-field"><label>Tipo</label><select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option>Avaliação</option><option>Fotográfica</option><option>Prescrição</option></select></div>
      </div>
      <div className="form-field"><label>Descrição</label><textarea rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required /></div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}><button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}><X size={14} /> Cancelar</button><button type="submit" className="btn btn-primary">Salvar evolução</button></div>
    </form>}
    <div className="evofeed-filters">{TYPES.map((t) => <button key={t} className={type === t ? 'is-active' : ''} onClick={() => { setType(t); setVisible(PAGE_SIZE) }}>{t}</button>)}</div>
    <div className="panel evofeed-list">
      {loading ? <p className="evofeed-empty">Carregando evoluções...</p> : shown.map((item) => { const Icon = TYPE_ICON[item.type] || ClipboardCheck; const patientId = item.patient_id; return <Link className="evofeed-item" to={patientId ? `/pacientes/${patientId}/evolucao` : '/evolucoes'} key={item.id}><Avatar initials={initialsOf(item.name)} size={36} /><div className="evofeed-item__body"><div className="evofeed-item__head"><strong>{item.name || 'Paciente'}</strong><span>{item.date || '—'}</span></div><p>{item.description || 'Sem descrição.'}</p></div><div className="evofeed-item__icon"><Icon size={16} /></div></Link> })}
      {!loading && !shown.length && <p className="evofeed-empty">Nenhuma evolução registrada.</p>}
    </div>
    {visible < filtered.length && <button className="btn btn-secondary evofeed-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>Carregar mais</button>}
  </div>
}
