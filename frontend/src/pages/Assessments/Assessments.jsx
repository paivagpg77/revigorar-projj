import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, ChevronRight, Plus, X, FileText } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { listAssessments } from '../../services/assessmentsService.js'
import { listPatients } from '../../services/patientsService.js'
import './Assessments.css'

const FILTERS = ['Todas', 'Ativas', 'Concluídas']

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U'
}

export default function Assessments() {
  const [assessments, setAssessments] = useState([])
  const [patients, setPatients] = useState([])
  const [view, setView] = useState('view')
  const [filter, setFilter] = useState('Todas')
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')

  async function load() {
    try {
      setError('')
      const [assessmentData, patientData] = await Promise.all([listAssessments(), listPatients()])
      setAssessments(Array.isArray(assessmentData) ? assessmentData : [])
      setPatients(Array.isArray(patientData) ? patientData : [])
    } catch (err) {
      setError(err?.message || 'Não foi possível carregar as avaliações.')
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = assessments.filter((a) => {
    const matchesFilter = filter === 'Todas' || (filter === 'Ativas' && a.assessmentStatus === 'Ativo') || (filter === 'Concluídas' && a.assessmentStatus === 'Concluída')
    const matchesQuery = String(a.name || '').toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Avaliações</h1>
          <p>Avaliações clínicas realmente registradas no sistema.</p>
        </div>
      </div>

      <div className="assessment-tabs" role="tablist" aria-label="Avaliações">
        <button type="button" className={view === 'view' ? 'is-active' : ''} onClick={() => setView('view')}><FileText size={15} /> Ver avaliações</button>
        <button type="button" className={view === 'new' ? 'is-active' : ''} onClick={() => setView('new')}><Plus size={15} /> Nova avaliação</button>
      </div>

      {view === 'new' ? (
        <div className="panel">
          <div className="assessment-section-head">
            <div>
              <h3 className="panel-title">Escolha o paciente</h3>
              <p>Abra a avaliação do paciente para preencher ou atualizar os dados.</p>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => setView('view')}><X size={14} /> Cancelar</button>
          </div>
          {patients.length ? (
            <div className="assessments-grid">
              {patients.map((p) => (
                <Link key={p.id} className="assessment-card" to={`/pacientes/${p.id}/avaliacao`}>
                  <div className="assessment-card__head">
                    <Avatar initials={initialsOf(p.name)} size={38} />
                    <div><strong>{p.name}</strong><span>{p.age || 0} anos</span></div>
                  </div>
                  <div className="assessment-card__footer"><span>{p.type || 'Ferida'}</span><ChevronRight size={13} /></div>
                </Link>
              ))}
            </div>
          ) : <p>Nenhum paciente cadastrado.</p>}
        </div>
      ) : (
        <>
          {error && <div className="panel"><p>{error}</p></div>}

          <div className="assessments-toolbar">
            <div className="assessments-search"><Search size={16} /><input placeholder="Buscar paciente..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
            <div className="assessments-filters">{FILTERS.map((f) => <button key={f} className={filter === f ? 'is-active' : ''} onClick={() => setFilter(f)}>{f}</button>)}</div>
          </div>

          <div className="assessments-grid">
            {filtered.map((a) => (
              <div className="assessment-card" key={a.assessmentId || a.id}>
                <div className="assessment-card__head">
                  <Avatar initials={initialsOf(a.name)} size={38} />
                  <div><strong>{a.name}</strong><span>{a.age || 0} anos</span></div>
                  <Badge tone={a.assessmentStatus === 'Concluída' ? 'success' : 'warning'}>{a.assessmentStatus}</Badge>
                </div>
                <div className="assessment-card__location"><MapPin size={13} /> {a.location || 'Não informado'}</div>
                <div className="assessment-card__footer">
                  <span>{a.type || 'Ferida'} · última avaliação {a.lastEval || '—'}</span>
                  <Link to={`/avaliacoes/${a.id}`} className="assessment-view-link">Ver avaliação <ChevronRight size={13} /></Link>
                </div>
              </div>
            ))}
            {!filtered.length && <p className="assessments-empty">Nenhuma avaliação registrada.</p>}
          </div>
        </>
      )}
    </div>
  )
}
