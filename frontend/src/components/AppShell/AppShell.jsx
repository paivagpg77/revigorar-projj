import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, FileText, DollarSign, Package, Stethoscope, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearToken, getUser } from '../../services/api';
import './AppShell.css';

const groups = [
  { label:'PRINCIPAL', items:[
    ['/dashboard','Painel',LayoutDashboard],
    ['/pacientes','Pacientes',Users],
    ['/agenda','Agenda',CalendarDays],
    ['/avaliacoes','Avaliações',FileText],
  ]},
  { label:'GESTÃO', items:[
    ['/financeiro','Financeiro',DollarSign],
    ['/estoque','Estoque',Package],
  ]},
  { label:'ESPECIALIDADES', items:[
    ['/especialidades','Especialidades',Stethoscope],
  ]},
];

export function AppShell({ children, title, subtitle }) {
  const [open,setOpen]=useState(false);
  const navigate=useNavigate();
  const user=getUser();
  useEffect(()=>{ if(!user) navigate('/login'); },[user,navigate]);
  const initials=user?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2)||'RV';

  function logout(){ clearToken(); localStorage.removeItem('revigorar_user'); navigate('/'); }

  return <div className="app-shell">
    <button className="mobile-menu" onClick={()=>setOpen(true)}><Menu size={20}/></button>
    <aside className={`app-sidebar ${open?'open':''}`}>
      <div className="app-brand"><div className="brand-icon"/><b>REVIGORAR</b><button className="close-menu" onClick={()=>setOpen(false)}><X size={18}/></button></div>
      <nav>
        {groups.map(g=><div className="nav-group" key={g.label}>
          <span>{g.label}</span>
          {g.items.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setOpen(false)} className={({isActive})=>isActive?'active':''}><Icon size={17}/>{label}</NavLink>)}
        </div>)}
      </nav>
      <div className="app-sidebar-bottom">
        <button onClick={logout}><LogOut size={17}/>Sair</button>
        <div className="profile-mini"><div>{initials}</div><span><b>{user?.full_name || 'Profissional'}</b><small>Plano {user?.plan || 'Free'}</small></span></div>
      </div>
    </aside>
    <main className="app-content">
      <header className="module-header"><div><div className="eyebrow">REVIGORAR · GESTÃO CLÍNICA</div><h1>{title}</h1>{subtitle&&<p>{subtitle}</p>}</div><div className="module-date">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</div></header>
      {children}
    </main>
  </div>
}
