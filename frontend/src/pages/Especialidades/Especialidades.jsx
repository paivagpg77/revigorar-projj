import { useEffect,useState } from 'react';
import { Plus, Stethoscope, Trash2, Pencil } from 'lucide-react';
import { AppShell } from "../../components/AppShell/AppShell";
import { getSpecialties,createSpecialty,updateSpecialty,deleteSpecialty } from '../../services/api';
import '../Module.css';
const defaults=['Estomaterapia','Enfermagem em feridas','Laserterapia','Podiatria','Medicina'];
export default function Especialidades(){
 const [items,setItems]=useState([]),[show,setShow]=useState(false),[editing,setEditing]=useState(null),[error,setError]=useState('');
 async function load(){try{setItems(await getSpecialties())}catch(e){setError(e.message)}}useEffect(()=>{load()},[]);
 async function submit(e){e.preventDefault();const f=new FormData(e.target);try{if(editing)await updateSpecialty(editing.id,{name:f.get('name'),description:f.get('description')});else await createSpecialty({name:f.get('name'),description:f.get('description')});setShow(false);setEditing(null);load()}catch(e){setError(e.message)}}
 async function remove(id){if(!confirm('Remover esta especialidade?'))return;try{await deleteSpecialty(id);load()}catch(e){setError(e.message)}}
 async function quick(name){try{await createSpecialty({name,description:'Especialidade clínica do profissional'});load()}catch(e){setError(e.message)}}
 return <AppShell title="Especialidades" subtitle="Configure as áreas de atuação que aparecem na sua prática clínica.">
  <div className="page-toolbar"><div className="module-summary"><Stethoscope size={19}/><span>{items.length} especialidade(s) cadastrada(s)</span></div><button className="action-btn" onClick={()=>{setEditing(null);setShow(true)}}><Plus size={17}/> Nova especialidade</button></div>{error&&<div className="toast-error">{error}</div>}
  {items.length===0&&<div className="suggest-card"><div><b>Comece pelas especialidades mais usadas</b><p>Adicione rapidamente ou crie uma especialidade personalizada.</p></div><div className="suggest-list">{defaults.map(d=><button key={d} className="ghost-btn" onClick={()=>quick(d)}>+ {d}</button>)}</div></div>}
  <div className="specialty-grid">{items.map(i=><div className="specialty-card" key={i.id}><div className="specialty-icon"><Stethoscope size={20}/></div><div className="specialty-info"><h3>{i.name}</h3><p>{i.description||'Área de atuação clínica'}</p></div><div className="row-actions"><button className="mini-btn" onClick={()=>{setEditing(i);setShow(true)}}><Pencil size={15}/></button><button className="mini-btn danger-mini" onClick={()=>remove(i.id)}><Trash2 size={15}/></button></div></div>)}</div>
  {show&&<div className="modal-backdrop"><form className="modal-card" onSubmit={submit}><div className="modal-head"><h2>{editing?'Editar especialidade':'Nova especialidade'}</h2><button type="button" onClick={()=>setShow(false)}>×</button></div><div className="form-field"><label>Nome</label><input name="name" defaultValue={editing?.name||''} placeholder="Ex.: Laserterapia" required/></div><div className="form-field"><label>Descrição</label><textarea name="description" defaultValue={editing?.description||''} placeholder="Como essa especialidade será usada..."/></div><div className="form-actions"><button type="button" className="ghost-btn" onClick={()=>setShow(false)}>Cancelar</button><button className="action-btn">Salvar</button></div></form></div>}
 </AppShell>
}
