import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Image as ImageIcon } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import Tabs from '../../components/Tabs/Tabs.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { getPatient } from '../../services/patientsService.js'
import { getPatientRecords, getEvolutionTimeline } from '../../services/evolutionsService.js'
import { getPatientPhotos, getPhotoUrl } from '../../services/photosService.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import './Evolution.css'

const TABS = ['Linha do tempo', 'Registros', 'Fotos']

export default function Evolution() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [tab, setTab] = useState('Linha do tempo')
  const [expanded, setExpanded] = useState(new Set())
  const [timeline, setTimeline] = useState([])
  const [records, setRecords] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const showToast = useToast()

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getPatient(id), getEvolutionTimeline(id), getPatientRecords(id), getPatientPhotos(id)]).then(([p, t, r, ph]) => {
      if (!active) return
      setPatient(p)
      setTimeline(Array.isArray(t) ? t : [])
      setRecords(Array.isArray(r) ? r : [])
      setPhotos(Array.isArray(ph) ? ph : [])
    }).catch((err) => { if (active) showToast(err.message || 'Não foi possível carregar a evolução.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="page"><p>Carregando evolução...</p></div>
  if (!patient) return <div className="page"><div className="panel"><h3>Paciente não encontrado.</h3></div></div>

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Pacientes', to: '/pacientes' }, { label: patient.name, to: `/pacientes/${patient.id}` }, { label: 'Evolução do paciente' }]} />
      <div className="panel">
        <div className="evolution-head"><h3 className="panel-title">Evolução do paciente</h3></div>
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
        {tab === 'Linha do tempo' && <ul className="evolution-timeline">
          {timeline.map((item) => {
            const date = item.created_at || item.date
            const key = item.id || String(date)
            return <li key={key}><span className="evolution-timeline__dot" /><div className="evolution-timeline__body"><div className="evolution-timeline__row"><div><span className="evolution-timeline__date">{date ? new Date(date).toLocaleString('pt-BR') : '—'}</span><strong>{item.title || item.type || 'Evolução'}</strong><p>{item.description || 'Sem descrição registrada.'}</p></div>{item.has_photo && <div className="evolution-timeline__photo"><ImageIcon size={22} /></div>}</div><button className="btn btn-secondary evolution-timeline__cta" onClick={() => setExpanded((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })}>{expanded.has(key) ? 'Ocultar detalhes' : 'Ver detalhes'}</button>{expanded.has(key) && <p className="evolution-timeline__details">{item.details || item.description || 'Sem detalhes registrados.'}</p>}</div></li>
          })}
          {!timeline.length && <li><div className="evolution-timeline__body"><p>Nenhuma evolução registrada para este paciente.</p></div></li>}
        </ul>}
        {tab === 'Registros' && <div className="table-scroll"><table className="evolution-table"><thead><tr><th>Data</th><th>Tipo</th><th>Profissional</th><th>Descrição</th></tr></thead><tbody>{records.map((r, i) => <tr key={`${r.date}-${r.type}-${i}`}><td>{r.date}</td><td><Badge tone="info">{r.type || 'Registro'}</Badge></td><td>{r.professional || '—'}</td><td>{r.description || '—'}</td></tr>)}{!records.length && <tr><td colSpan="4">Nenhum registro.</td></tr>}</tbody></table></div>}
        {tab === 'Fotos' && <div className="evolution-photos">{photos.map((p) => <div className="evolution-photo-card" key={p.id}><div className="evolution-photo-card__preview">{p.url ? <img src={getPhotoUrl(p.url)} alt="Registro" /> : <ImageIcon size={26} />}</div><div className="evolution-photo-card__footer"><strong>{p.date ? new Date(p.date).toLocaleDateString('pt-BR') : '—'}</strong></div></div>)}{!photos.length && <p>Nenhuma foto registrada.</p>}</div>}
      </div>
    </div>
  )
}
