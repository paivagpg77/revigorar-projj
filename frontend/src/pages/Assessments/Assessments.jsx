import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ChevronRight, Plus, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { listAssessments } from '../../services/assessmentsService.js'
import { listPatients } from '../../services/patientsService.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import './Assessments.css'

const FILTERS = ['Todas', 'Ativas', 'Concluídas']

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U'
}

export default function Assessments() {
  const [assessments, setAssessments] = useState([])
  const [patients, setPatients] = useState([])
  const [filter, setFilter] = useState('Todas')
  const [query, setQuery] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const showToast = useToast()

  async function load() {
    try {
      setError('')
      const data = await listAssessments()
      setAssessments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Não foi possível carregar as avaliações.')
    }
  }

  useEffect(() => {
    let active = true
    Promise.all([listAssessments(), listPatients()]).then(([a, p]) => {
      if (!active) return
      setAssessments(Array.isArray(a) ? a : [])
      setPatients(Array.isArray(p) ? p : [])
    }).catch((err) => {
      if (active) setError(err?.message || 'Não foi possível carregar as avaliações.')
    })
    return () => { active = false }
  }, [])

  const filtered = assessments.filter((a) => {
    const matchesFilter = filter === 'Todas' || (filter === 'Ativas' && a.assessmentStatus === 'Ativo') || (filter === 'Concluídas' && a.assessmentStatus === 'Concluída')
    const matchesQuery = String(a.name || '').toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <div className="page">
      <div className="page-header">
        <div><h1>Avaliações</h1><p>Avaliações clínicas realmente registradas no sistema.</p></div>
        <button className="btn btn-primary" onClick={() => setShowNew((v) => !v)}><Plus size={15} /> Nova avaliação</button>
      </div>

      {showNew && <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="panel-title">Escolha o paciente</h3>
          <button className="btn-icon" onClick={() => setShowNew(false)} aria-label="Fechar"><X size={14} /></button>
        </div>
        {patients.length ? <div className="assessments-grid">{patients.map((p) => <Link key={p.id} className="assessment-card" to={`/pacientes/${p.id}/avaliacao`} onClick={() => setShowNew(false)}>
          <div className="assessment-card__head"><Avatar initials={initialsOf(p.name)} size={38} /><div><strong>{p.name}</strong><span>{p.age || 0} anos</span></div></div>
          <div className="assessment-card__footer"><span>{p.type || 'Ferida'}</span><ChevronRight size={13} /></div>
        </Link>)}</div> : <p>Nenhum paciente cadastrado.</p>}
      </div>}

      {error && <div className="panel"><p>{error}</p></div>}

      <div className="assessments-toolbar">
        <div className="assessments-search"><Search size={16} /><input placeholder="Buscar paciente..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="assessments-filters">{FILTERS.map((f) => <button key={f} className={filter === f ? 'is-active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
      </div>

      <div className="assessments-grid">
        {filtered.map((a) => <div className="assessment-card" key={a.assessmentId || a.id}>
          <div className="assessment-card__head"><Avatar initials={initialsOf(a.name)} size={38} /><div><strong>{a.name}</strong><span>{a.age || 0} anos</span></div><Badge tone={a.assessmentStatus === 'Concluída' ? 'success' : 'warning'}>{a.assessmentStatus}</Badge></div>
          <div className="assessment-card__location"><MapPin size={13} /> {a.location || 'Não informado'}</div>
          <div className="assessment-card__footer"><span>{a.type || 'Ferida'} · última avaliação {a.lastEval || '—'}</span><Link to={`/pacientes/${a.id}/avaliacao`}>Ver avaliação <ChevronRight size={13} /></Link></div>
        </div>)}
        {!filtered.length && <p className="assessments-empty">Nenhuma avaliação registrada.</p>}
      </div>
    </div>
  )
}
