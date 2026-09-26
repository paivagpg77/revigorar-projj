import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ClipboardCheck, Activity, AlertCircle, ChevronRight } from 'lucide-react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import LineChart from '../../components/LineChart/LineChart.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { getStats, getUpcoming, getWeeklySeries, getDistribution } from '../../services/dashboardService.js'
import './Dashboard.css'

function statusDistribution(upcoming) {
  if (!upcoming.length) return []
  const counts = upcoming.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc }, {})
  const colors = ['var(--color-primary)', 'var(--color-primary-light)', 'var(--color-accent-soft)']
  return Object.entries(counts).map(([label, count], i) => ({ label, value: Math.round((count / upcoming.length) * 100), color: colors[i % colors.length] }))
}

export default function Dashboard() {
  const [stats, setStats] = useState({ activePatients: 0, assessmentsToday: 0, evolutionsToday: 0, pendencies: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [series, setSeries] = useState({ labels: [], values: [] })
  const [distribution, setDistribution] = useState([])

  useEffect(() => {
    let active = true
    Promise.allSettled([getStats(), getUpcoming(), getWeeklySeries(), getDistribution()]).then(([a, b, c, d]) => {
      if (!active) return
      if (a.status === 'fulfilled') setStats(a.value)
      if (b.status === 'fulfilled') setUpcoming(Array.isArray(b.value) ? b.value : [])
      if (c.status === 'fulfilled') setSeries(c.value)
      if (d.status === 'fulfilled') setDistribution(d.value)
    })
    return () => { active = false }
  }, [])

  return (
    <div className="page">
      <div className="page-header"><div><h1>Dashboard</h1><p>Visão geral da sua rotina</p></div></div>
      <div className="dash-stats">
        <Link to="/pacientes" className="dash-stat-link"><StatCard icon={<Users size={20} />} label="Pacientes ativos" value={stats.activePatients} /></Link>
        <Link to="/avaliacoes" className="dash-stat-link"><StatCard icon={<ClipboardCheck size={20} />} label="Avaliações hoje" value={stats.assessmentsToday} /></Link>
        <Link to="/evolucoes" className="dash-stat-link"><StatCard icon={<Activity size={20} />} label="Evoluções hoje" value={stats.evolutionsToday} /></Link>
        <Link to="/agenda" className="dash-stat-link"><StatCard icon={<AlertCircle size={20} />} label="Pendências" value={stats.pendencies} /></Link>
      </div>
      <div className="dash-grid">
        <div className="panel"><h3 className="panel-title">Evolução dos atendimentos</h3><span className="dash-subtle">Últimos 7 dias</span><LineChart values={series.values} labels={series.labels} /></div>
        <div className="panel"><h3 className="panel-title">Distribuição por tipo de atendimento</h3><DonutChart data={distribution} total={stats.activePatients} /></div>
      </div>
      <div className="dash-grid dash-grid--bottom">
        <div className="panel"><h3 className="panel-title">Próximos atendimentos</h3><div className="dash-upcoming">
          {upcoming.map((u) => <Link className="dash-upcoming__item" to={u.patient_id ? `/pacientes/${u.patient_id}` : '/agenda'} key={u.id || `${u.name}-${u.detail}`}><div><strong>{u.name || 'Paciente'}</strong><span>{u.detail || u.time || 'Horário não informado'}</span></div><Badge>{u.status || 'Pendente'}</Badge><ChevronRight size={16} className="dash-upcoming__chevron" /></Link>)}
          {!upcoming.length && <p className="agenda-empty">Nenhum atendimento agendado.</p>}
        </div></div>
        <div className="panel"><h3 className="panel-title">Status dos próximos atendimentos</h3><DonutChart data={statusDistribution(upcoming)} total={upcoming.length} centerLabel="Agendados" /></div>
      </div>
    </div>
  )
}
