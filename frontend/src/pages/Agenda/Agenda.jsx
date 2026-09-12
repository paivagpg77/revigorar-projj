import { useEffect, useState } from 'react';
import { Plus, CalendarDays, Trash2, CheckCircle2 } from 'lucide-react';
import { AppShell } from "../../components/AppShell/AppShell";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getPatients } from '../../services/api';
import '../Module.css';

const fmtDate = v => new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
const statusLabel = {scheduled:'Agendado',confirmed:'Confirmado',completed:'Concluído',cancelled:'Cancelado',no_show:'Não compareceu'};

export default function Agenda(){
 const [items,setItems]=useState([]),[patients,setPatients]=useState([]),[show,setShow]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){setLoading(true);try{const [a,p]=await Promise.all([getAppointments(),getPatients('limit=100')]);setItems(a);setPatients(p.data||[])}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 async function submit(e){e.preventDefault();setError('');const f=new FormData(e.target);try{await createAppointment({patient_id:f.get('patient_id'),scheduled_at:new Date(f.get('scheduled_at')).toISOString(),duration_min:Number(f.get('duration_min')||60),location_type:f.get('location_type'),procedure_type:f.get('procedure_type'),notes:f.get('notes')});setShow(false);load()}catch(e){setError(e.message)}}
 async function cancel(id){if(!confirm('Cancelar este atendimento?'))return;try{await updateAppointment(id,{status:'cancelled'});load()}catch(e){setError(e.message)}}
 async function remove(id){if(!confirm('Excluir este agendamento?'))return;try{await deleteAppointment(id);load()}catch(e){setError(e.message)}}
 return <AppShell title="Agenda" subtitle="Organize consultas, retornos e atendimentos domiciliares.">
  <div className="page-toolbar"><div className="module-summary"><CalendarDays size={19}/><span>{items.length} atendimento(s)</span></div><button className="action-btn" onClick={()=>setShow(true)}><Plus size={17}/> Novo atendimento</button></div>
  {error&&<div className="toast-error">{error}</div>}
  <div className="data-card">{loading?<div className="empty-module">Carregando agenda...</div>:items.length===0?<div className="empty-module"><CalendarDays size={34}/><h3>Agenda livre</h3><p>Cadastre o primeiro atendimento para começar.</p></div>:
  <table className="data-table"><thead><tr><th>Data e hora</th><th>Paciente</th><th>Procedimento</th><th>Local</th><th>Status</th><th></th></tr></thead><tbody>{items.map(a=><tr key={a.id}><td><b>{fmtDate(a.scheduled_at)}</b><div className="muted">{a.duration_min} min</div></td><td>{a.patient?.name||a.patient_id}</td><td>{a.procedure_type||'—'}</td><td>{a.location_type==='home'?'Domiciliar':a.location_type==='telehealth'?'Teleatendimento':'Clínica'}</td><td><span className={`pill ${a.status==='cancelled'?'danger':''}`}>{statusLabel[a.status]||a.status}</span></td><td><div className="row-actions">{a.status!=='cancelled'&&<button className="mini-btn" title="Cancelar" onClick={()=>cancel(a.id)}><CheckCircle2 size={15}/></button>}<button className="mini-btn danger-mini" onClick={()=>remove(a.id)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table>}</div>
  {show&&<div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><div className="modal-head"><h2>Novo atendimento</h2><button type="button" onClick={()=>setShow(false)}>×</button></div><div className="form-grid">
   <div className="form-field full"><label>Paciente</label><select name="patient_id" required><option value="">Selecione...</option>{patients.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
   <div className="form-field"><label>Data e hora</label><input name="scheduled_at" type="datetime-local" required/></div><div className="form-field"><label>Duração (min)</label><input name="duration_min" type="number" defaultValue="60" min="15"/></div>
   <div className="form-field"><label>Local</label><select name="location_type"><option value="clinic">Clínica</option><option value="home">Domiciliar</option><option value="telehealth">Teleatendimento</option></select></div><div className="form-field"><label>Procedimento</label><select name="procedure_type"><option value="evaluation">Avaliação</option><option value="dressing_change">Troca de curativo</option><option value="laser">Laserterapia</option><option value="stomia">Estomia</option><option value="follow_up">Retorno</option></select></div>
   <div className="form-field full"><label>Observações</label><textarea name="notes" placeholder="Observações do atendimento..."/></div></div><div className="form-actions"><button type="button" className="ghost-btn" onClick={()=>setShow(false)}>Cancelar</button><button className="action-btn">Salvar atendimento</button></div></form></div>}
 </AppShell>
}
