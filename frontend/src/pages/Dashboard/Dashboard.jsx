import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getToken, getUser, clearToken, getPatients, getFinancialDashboard, getStockAlerts, getAppointments } from '../../services/api';
import { Users, Activity, DollarSign, Clock, Package, Calendar, LogOut, LayoutDashboard, FileText, MessageCircle, Settings, Stethoscope, Zap, Footprints } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const [patients, setPatients] = useState({ data: [], meta: { total: 0 } });
  const [financial, setFinancial] = useState({ income: 0, expense: 0, profit: 0 });
  const [alerts, setAlerts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) { navigate('/login'); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [p, f, a, ap] = await Promise.all([
        getPatients().catch(() => ({ data: [], meta: { total: 0 } })),
        getFinancialDashboard().catch(() => ({ income: 0, expense: 0, profit: 0 })),
        getStockAlerts().catch(() => []),
        getAppointments().catch(() => []),
      ]);
      setPatients(p);
      setFinancial(f);
      setAlerts(a);
      setAppointments(ap);
    } catch (err) { console.error(err); }
    setLoading(false);
  }

  function handleLogout() {
    clearToken();
    localStorage.removeItem('revigorar_user');
    navigate('/');
  }

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??';

  if (loading) return <div className="dash-loading"><div className="dash-spinner" /><p>Carregando painel...</p></div>;

  return (
    <div className="dash-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="brand-icon" style={{width:30,height:30}} /><span className="brand-name" style={{color:'rgba(255,255,255,.9)',fontSize:15}}>REVIGORAR</span>
        </div>
        <div className="sb-section">
          <div className="sb-label">PRINCIPAL</div>
          <button className="sb-item active"><LayoutDashboard size={17}/> Painel</button>
          <button className="sb-item"><Users size={17}/> Pacientes <span className="sb-badge">{patients.meta.total}</span></button>
          <button className="sb-item"><Calendar size={17}/> Agenda</button>
          <button className="sb-item"><FileText size={17}/> Avaliações</button>
        </div>
        <div className="sb-section">
          <div className="sb-label">GESTÃO</div>
          <button className="sb-item"><DollarSign size={17}/> Financeiro</button>
          <button className="sb-item"><Package size={17}/> Estoque {alerts.length > 0 && <span className="sb-badge warn">{alerts.length}</span>}</button>
          <button className="sb-item"><MessageCircle size={17}/> Comunicação</button>
        </div>
        <div className="sb-section">
          <div className="sb-label">ESPECIALIDADES</div>
          <button className="sb-item"><Stethoscope size={17}/> Estomias</button>
          <button className="sb-item"><Zap size={17}/> Laserterapia</button>
          <button className="sb-item"><Footprints size={17}/> Podiatria</button>
        </div>
        <div className="sb-bottom">
          <button className="sb-item"><Settings size={17}/> Configurações</button>
          <button className="sb-item" onClick={handleLogout}><LogOut size={17}/> Sair</button>
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div><div className="sb-name">{user?.full_name}</div><div className="sb-plan">Plano {user?.plan || 'Free'}</div></div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">
        <header className="topbar">
          <input type="text" placeholder="🔍 Buscar paciente, ferida, documento..." className="topbar-search" />
          <span className="topbar-date">{new Date().toLocaleDateString('pt-BR',{weekday:'short',day:'numeric',month:'long'})}</span>
        </header>

        <div className="dash-content">
          <div className="greeting">
            <h1>Bom dia, {user?.full_name?.split(' ')[0]}</h1>
            <p>Você tem {appointments.length} atendimento(s) e {alerts.length} alerta(s) de estoque.</p>
          </div>

          {/* STATS */}
          <div className="stats-row">
            <div className="stat-card" style={{'--accent':'var(--teal-400)'}}>
              <Users size={20} className="stat-icon" />
              <div className="stat-label">Pacientes ativos</div>
              <div className="stat-value">{patients.meta.total}</div>
            </div>
            <div className="stat-card" style={{'--accent':'#818CF8'}}>
              <Activity size={20} className="stat-icon" />
              <div className="stat-label">Taxa de cicatrização</div>
              <div className="stat-value">87%</div>
            </div>
            <div className="stat-card" style={{'--accent':'var(--coral)'}}>
              <DollarSign size={20} className="stat-icon" />
              <div className="stat-label">Receita do mês</div>
              <div className="stat-value">R$ {Number(financial.income).toLocaleString('pt-BR')}</div>
            </div>
            <div className="stat-card" style={{'--accent':'#FBBF24'}}>
              <Clock size={20} className="stat-icon" />
              <div className="stat-label">Lucro líquido</div>
              <div className="stat-value">R$ {Number(financial.profit).toLocaleString('pt-BR')}</div>
            </div>
          </div>

          {/* GRID */}
          <div className="dash-grid">
            {/* PACIENTES RECENTES */}
            <div className="card">
              <div className="card-head"><span>Pacientes recentes</span><button className="card-action">Ver todos</button></div>
              <div className="card-body">
                {patients.data.length === 0 ? (
                  <div className="empty">
                    <Users size={32} style={{color:'var(--ink-ghost)',marginBottom:8}} />
                    <p>Nenhum paciente cadastrado ainda.</p>
                    <p style={{fontSize:13,color:'var(--ink-faint)'}}>Crie pelo terminal ou aguarde o módulo de cadastro.</p>
                  </div>
                ) : (
                  <div className="patient-list">
                    {patients.data.slice(0, 5).map(p => {
                      const ini = p.name.split(' ').map(n => n[0]).join('').slice(0, 2);
                      const colors = ['var(--teal-500)','#818CF8','var(--coral)','#FBBF24','#22D3EE'];
                      return (
                        <div className="patient-row" key={p.id}>
                          <div className="p-avatar" style={{background:colors[patients.data.indexOf(p)%5]}}>{ini}</div>
                          <div className="p-info">
                            <div className="p-name">{p.name}</div>
                            <div className="p-meta">{p.gender === 'F' ? 'Fem' : p.gender === 'M' ? 'Masc' : '—'} · {p.phone || 'Sem telefone'}</div>
                          </div>
                          <span className={`p-status ${p.status === 'active' ? 'active' : 'other'}`}>{p.status === 'active' ? 'Ativo' : p.status}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* FINANCEIRO */}
            <div className="card">
              <div className="card-head"><span>Resumo financeiro</span><button className="card-action">Detalhes</button></div>
              <div className="card-body">
                <div className="fin-rows">
                  <div className="fin-row"><span>Receita bruta</span><span className="fin-val positive">R$ {Number(financial.income).toLocaleString('pt-BR')}</span></div>
                  <div className="fin-row"><span>Despesas</span><span className="fin-val negative">R$ {Number(financial.expense).toLocaleString('pt-BR')}</span></div>
                  <div className="fin-row total"><span>Lucro líquido</span><span className="fin-val">R$ {Number(financial.profit).toLocaleString('pt-BR')}</span></div>
                </div>
                {financial.income > 0 && (
                  <>
                    <div className="fin-bar"><div className="fin-bar-fill" style={{width:`${Math.min(100, (financial.income / 20000) * 100)}%`}} /></div>
                    <div className="fin-bar-label"><span>Meta: R$ 20.000</span><span>{Math.round((financial.income / 20000) * 100)}%</span></div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* STOCK ALERTS */}
          {alerts.length > 0 && (
            <div className="card" style={{marginTop:20}}>
              <div className="card-head"><span>⚠️ Alertas de estoque</span><button className="card-action">Gerenciar</button></div>
              <div className="card-body">
                <div className="stock-list">
                  {alerts.map(a => (
                    <div className="stock-item" key={a.id}>
                      <div className="stock-info">
                        <div className="stock-name">{a.name}</div>
                        <div className="stock-qty">{Number(a.quantity).toFixed(0)} {a.unit} restantes (mín: {Number(a.min_quantity).toFixed(0)})</div>
                      </div>
                      <div className="stock-level"><div className="stock-fill" style={{width:`${Math.min(100, (a.quantity/Math.max(a.min_quantity,1))*50)}%`, background: a.quantity <= a.min_quantity ? 'var(--coral)' : '#F59E0B'}} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
