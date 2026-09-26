import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, ChevronRight, FileText, Download, Plus, Check, X } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import Tabs from '../../components/Tabs/Tabs.jsx'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import { getPatient, updatePatient } from '../../services/patientsService.js'
import { getPatientRecords } from '../../services/evolutionsService.js'
import { listDocuments, addDocument as addDocumentApi } from '../../services/documentsService.js'
import { listPatientPrescriptions } from '../../services/prescriptionsService.js'
import { calculateAge } from '../../utils/patient.js'
import './PatientProfile.css'

const TABS = ['Resumo', 'Histórico', 'Avaliações', 'Evoluções', 'Prescrições', 'Documentos']

export default function PatientProfile() {
  const { id } = useParams()
  const [tab, setTab] = useState('Resumo')
  const [patient, setPatient] = useState(null)
  const [records, setRecords] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const showToast = useToast()

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    let active = true
    getPatient(id).then((data) => { if (active) setPatient(data) })
    getPatientRecords(id).then((data) => { if (active) setRecords(data) })
    listDocuments(id).then((data) => { if (active) setDocuments(data) })
    listPatientPrescriptions(id).then((data) => { if (active) setPrescriptions(data) })
    return () => { active = false }
  }, [id])

  const startEditing = () => {
    setDraft({
      name: patient.name,
      birthDate: patient.birthDate || '',
      gender: patient.gender || '',
      cpf: patient.cpf || '',
      phone: patient.phone || '',
      type: patient.type,
      selfResponsible: !!patient.selfResponsible,
      responsibleName: patient.responsibleName || '',
    })
    setEditing(true)
  }

  const saveEditing = async () => {
    const updated = {
      ...draft,
      age: calculateAge(draft.birthDate),
      responsibleName: draft.selfResponsible ? '' : draft.responsibleName,
    }
    await updatePatient(id, updated)
    setPatient((p) => ({ ...p, ...updated }))
    setEditing(false)
    showToast('Dados pessoais atualizados.')
  }

  const cancelEditing = () => {
    setEditing(false)
    setDraft(null)
  }

  const addDocument = async () => {
    const name = window.prompt('Nome do novo documento (ex: Laudo - setembro.pdf):', 'Novo documento.pdf')
    if (!name) return
    const created = await addDocumentApi(id, { name })
    setDocuments((list) => [created, ...list])
    showToast('Documento adicionado.')
  }

  const downloadDocument = (name) => {
    showToast(`Baixando ${name}...`)
  }

  if (!patient) return <div className="page"><p>Carregando paciente...</p></div>

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Pacientes', to: '/pacientes' }, { label: patient.name }]} />

      <div className="profile-header panel">
        <Avatar initials={patient.name.split(' ').slice(0, 2).map((n) => n[0]).join('')} size={64} />
        <div className="profile-header__info">
          <h1>{patient.name}</h1>
          <span>{patient.age} anos, {patient.gender || 'não informado'} · CPF {patient.cpf || 'não informado'}</span>
        </div>
        <Badge>{patient.status}</Badge>
        <button className="btn btn-secondary" onClick={startEditing}>
          <Pencil size={14} /> Editar
        </button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'Resumo' && (
        <div className="profile-grid">
          <div className="panel">
            <div className="profile-panel-head">
              <h3 className="panel-title">Dados pessoais</h3>
              {editing && (
                <div className="profile-edit-actions">
                  <button className="btn-icon" aria-label="Salvar" onClick={saveEditing}><Check size={14} /></button>
                  <button className="btn-icon" aria-label="Cancelar" onClick={cancelEditing}><X size={14} /></button>
                </div>
              )}
            </div>
            <dl className="profile-facts">
              <div>
                <dt>Nome</dt>
                <dd>
                  {editing ? (
                    <input
                      className="profile-facts__input"
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                    />
                  ) : patient.name}
                </dd>
              </div>
              <div>
                <dt>Data de nascimento</dt>
                <dd>
                  {editing ? (
                    <input
                      type="date"
                      className="profile-facts__input"
                      value={draft.birthDate}
                      onChange={(e) => setDraft((d) => ({ ...d, birthDate: e.target.value }))}
                    />
                  ) : (patient.birthDate ? `${new Date(`${patient.birthDate}T00:00:00`).toLocaleDateString('pt-BR')} (${patient.age} anos)` : `${patient.age} anos`)}
                </dd>
              </div>
              <div>
                <dt>Gênero</dt>
                <dd>
                  {editing ? (
                    <select
                      className="profile-facts__input"
                      value={draft.gender}
                      onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value }))}
                    >
                      <option>Feminino</option>
                      <option>Masculino</option>
                      <option>Outro</option>
                      <option>Prefere não informar</option>
                    </select>
                  ) : (patient.gender || 'Não informado')}
                </dd>
              </div>
              <div>
                <dt>CPF</dt>
                <dd>
                  {editing ? (
                    <input
                      className="profile-facts__input"
                      value={draft.cpf}
                      onChange={(e) => setDraft((d) => ({ ...d, cpf: e.target.value }))}
                    />
                  ) : (patient.cpf || 'Não informado')}
                </dd>
              </div>
              <div>
                <dt>Telefone</dt>
                <dd>
                  {editing ? (
                    <input
                      className="profile-facts__input"
                      value={draft.phone}
                      onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    />
                  ) : (patient.phone || 'Não informado')}
                </dd>
              </div>
              <div>
                <dt>Tipo de cuidado</dt>
                <dd>
                  {editing ? (
                    <select
                      className="profile-facts__input"
                      value={draft.type}
                      onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                    >
                      <option>Ferida</option>
                      <option>Estomia</option>
                    </select>
                  ) : patient.type}
                </dd>
              </div>

              {editing && (
                <div className="profile-facts__responsible-toggle">
                  <label className="patients-form__checkbox">
                    <input
                      type="checkbox"
                      checked={draft.selfResponsible}
                      onChange={(e) => setDraft((d) => ({ ...d, selfResponsible: e.target.checked }))}
                    />
                    O paciente é seu próprio responsável
                  </label>
                </div>
              )}

              <div>
                <dt>Responsável</dt>
                <dd>
                  {editing ? (
                    draft.selfResponsible ? (
                      <span>{draft.name} (o(a) próprio(a) paciente)</span>
                    ) : (
                      <input
                        className="profile-facts__input"
                        placeholder="Nome do responsável e parentesco"
                        value={draft.responsibleName}
                        onChange={(e) => setDraft((d) => ({ ...d, responsibleName: e.target.value }))}
                      />
                    )
                  ) : (
                    patient.selfResponsible
                      ? `${patient.name} (o(a) próprio(a) paciente)`
                      : (patient.responsibleName || 'Não informado')
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="panel">
            <div className="profile-panel-head">
              <h3 className="panel-title">Últimas avaliações</h3>
              <Link to={`/pacientes/${patient.id}/avaliacao`}>Ver todas</Link>
            </div>
            <ul className="profile-timeline">
              {records.slice(0, 3).map((item, index) => (
                <li key={`${item.date}-${index}`}>
                  <div>
                    <strong>{item.date || '—'}</strong>
                    <span>{item.type || 'Registro clínico'}</span>
                  </div>
                  <Badge>{item.status || 'Registrado'}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel profile-links">
            <h3 className="panel-title">Acessos rápidos</h3>
            <Link to={`/pacientes/${patient.id}/avaliacao`}>Avaliação da ferida <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/evolucao`}>Evolução do paciente <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/fotos`}>Registro fotográfico <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/prescricoes`}>Prescrições e condutas <ChevronRight size={14} /></Link>
            <Link to={`/pacientes/${patient.id}/monitoramento`}>Acompanhamento remoto <ChevronRight size={14} /></Link>
          </div>
        </div>
      )}

      {tab === 'Histórico' && (
        <div className="panel">
          <h3 className="panel-title">Histórico completo</h3>
          <ul className="profile-history">
            {records.map((r) => (
              <li key={r.date + r.type}>
                <span className="profile-history__dot" />
                <div>
                  <div className="profile-history__head">
                    <strong>{r.type}</strong>
                    <span>{r.date}</span>
                  </div>
                  <p>{r.description}</p>
                  <span className="profile-history__by">Registrado por {r.professional}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Avaliações' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Avaliações</h3>
            <Link to={`/pacientes/${patient.id}/avaliacao`}>Nova avaliação</Link>
          </div>
          <div className="table-scroll">
            <table className="profile-table">
              <thead>
                <tr><th>Data</th><th>Localização</th><th>Tipo</th><th>Status</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {patient.lastEval ? (
                  <tr>
                    <td>{patient.lastEval}</td>
                    <td>Não informado</td>
                    <td>{patient.type || 'Não informado'}</td>
                    <td><Badge>Registrada</Badge></td>
                    <td>
                      <div className="profile-table__actions">
                        <Link className="btn-icon" to={`/pacientes/${patient.id}/avaliacao`} aria-label="Ver avaliação">
                          <ChevronRight size={15} />
                        </Link>
                        <Link className="btn-icon" to={`/pacientes/${patient.id}/avaliacao`} aria-label="Editar avaliação">
                          <Pencil size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr><td colSpan="5">Nenhuma avaliação registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Evoluções' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Evoluções</h3>
            <Link to={`/pacientes/${patient.id}/evolucao`}>Ver linha do tempo completa</Link>
          </div>
          <ul className="profile-history">
            {records.map((e, index) => (
              <li key={`${e.date}-${e.type}-${index}`}>
                <span className="profile-history__dot" />
                <div>
                  <div className="profile-history__head">
                    <strong>{e.type || 'Registro clínico'}</strong>
                    <span>{e.date}</span>
                  </div>
                  <p>{e.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'Prescrições' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Prescrições</h3>
            <Link to={`/pacientes/${patient.id}/prescricoes`}>Ver todas / nova prescrição</Link>
          </div>
          <div className="table-scroll">
            <table className="profile-table">
              <thead>
                <tr><th>Data</th><th>Tipo</th><th>Descrição</th><th>Status</th></tr>
              </thead>
              <tbody>
                {prescriptions.map((p) => (
                  <tr key={p.id || p.date + p.description}>
                    <td>{p.date}</td>
                    <td>{p.type}</td>
                    <td>{p.description}</td>
                    <td><Badge>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Documentos' && (
        <div className="panel">
          <div className="profile-panel-head">
            <h3 className="panel-title">Documentos</h3>
            <button className="btn btn-secondary" onClick={addDocument}>
              <Plus size={14} /> Adicionar documento
            </button>
          </div>
          <ul className="profile-documents">
            {documents.map((doc) => (
              <li key={doc.name}>
                <div className="profile-documents__icon"><FileText size={16} /></div>
                <div className="profile-documents__body">
                  <strong>{doc.name}</strong>
                  <span>{doc.date} · {doc.size}</span>
                </div>
                <button className="btn-icon" aria-label="Baixar documento" onClick={() => downloadDocument(doc.name)}>
                  <Download size={15} />
                </button>
              </li>
            ))}

            {documents.length === 0 && <p className="profile-documents__empty">Nenhum documento cadastrado.</p>}
          </ul>
        </div>
      )}
    </div>
  )
}
