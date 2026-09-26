import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MessageSquare, Camera, Image as ImageIcon } from 'lucide-react'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { getPatient } from '../../services/patientsService.js'
import { getCurrentUser } from '../../services/authService.js'
import { getMessages, sendMessage as sendMessageApi, requestPhoto as requestPhotoApi, getMonitoringStatus } from '../../services/monitoringService.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import './RemoteMonitoring.css'

function initialsOf(name = '') { return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U' }

export default function RemoteMonitoring() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [user, setUser] = useState({ name: 'Usuário' })
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState({ status: 'offline' })
  const [note, setNote] = useState('')
  const showToast = useToast()

  useEffect(() => {
    let active = true
    Promise.all([getPatient(id), getMessages(id), getMonitoringStatus(id), getCurrentUser()]).then(([p, m, s, u]) => {
      if (!active) return
      setPatient(p); setMessages(m || []); setStatus(s || {}); setUser(u || { name: 'Usuário' })
    }).catch((err) => { if (active) showToast(err.message || 'Não foi possível carregar o acompanhamento.') })
    return () => { active = false }
  }, [id])

  const sendMessage = async () => {
    if (!note.trim()) return
    try { const created = await sendMessageApi(id, note.trim()); setMessages((list) => [...list, { id: created.id, from: 'nurse', name: user.name, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: created.text }]); setNote(''); showToast('Mensagem registrada.') } catch (err) { showToast(err.message || 'Não foi possível enviar.') }
  }

  const requestPhoto = async () => {
    try { const created = await requestPhotoApi(id); setMessages((list) => [...list, { id: created.id, from: 'nurse', name: user.name, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), text: created.text }]); showToast('Solicitação registrada.') } catch (err) { showToast(err.message || 'Não foi possível registrar a solicitação.') }
  }

  if (!patient) return <div className="page"><p>Carregando acompanhamento...</p></div>

  return <div className="page"><Breadcrumb items={[{ label: 'Pacientes', to: '/pacientes' }, { label: patient.name, to: `/pacientes/${patient.id}` }, { label: 'Acompanhamento remoto' }]} /><h1 className="monitoring__title">Acompanhamento remoto</h1><div className="monitoring-grid"><div className="panel monitoring-upload"><div className="monitoring-upload__icon"><MessageSquare size={22} /></div><h3>Enviar orientação</h3><p>Registre uma mensagem para este paciente.</p><textarea className="monitoring-upload__textarea" rows={3} placeholder="Escreva uma orientação..." value={note} onChange={(e) => setNote(e.target.value)} /><button className="btn btn-primary" onClick={sendMessage}>Enviar mensagem</button><button className="btn btn-secondary" onClick={requestPhoto}><Camera size={14} /> Solicitar nova foto</button></div><div className="panel monitoring-chat">{messages.map((m) => <div className={`monitoring-chat__msg ${m.from === 'nurse' ? 'monitoring-chat__msg--reply' : ''}`} key={m.id}><Avatar initials={m.from === 'nurse' ? initialsOf(m.name || user.name) : initialsOf(patient.name)} size={32} /><div><div className="monitoring-chat__head"><strong>{m.from === 'nurse' ? (m.name || user.name) : patient.name}</strong><span>{m.time}</span></div><p>{m.text}</p>{m.photo && <div className="monitoring-chat__photo"><ImageIcon size={20} /></div>}</div></div>)}{!messages.length && <p>Nenhuma mensagem registrada.</p>}</div><div className="panel monitoring-status"><h3 className="panel-title">Status do acompanhamento</h3><Badge tone={status.status === 'online' ? 'success' : 'neutral'}>{status.status === 'online' ? 'Online' : 'Sem status'}</Badge><div className="monitoring-status__info"><span>Última atividade</span><strong>{status.lastSeen ? new Date(status.lastSeen).toLocaleString('pt-BR') : '—'}</strong></div><Link to={`/pacientes/${patient.id}/evolucao`} className="btn btn-secondary">Ver histórico</Link></div></div></div>
}
