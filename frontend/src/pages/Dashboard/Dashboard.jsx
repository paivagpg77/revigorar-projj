import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ClipboardCheck,
  Activity,
  AlertCircle,
  ChevronRight,
} from 'lucide-react'

import StatCard from '../../components/StatCard/StatCard.jsx'
import LineChart from '../../components/LineChart/LineChart.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import Badge from '../../components/Badge/Badge.jsx'

import { listPatients } from '../../services/patientsService.js'

import {
  getStats,
  getUpcoming,
  getWeeklySeries,
  getDistribution,
} from '../../services/dashboardService.js'

import './Dashboard.css'


function getStatusDistribution(upcoming = []) {
  if (!Array.isArray(upcoming) || upcoming.length === 0) {
    return []
  }

  const counts = upcoming.reduce((acc, item) => {
    const status = item?.status || 'Pendente'

    acc[status] = (acc[status] || 0) + 1

    return acc
  }, {})

  const colors = [
    'var(--color-primary)',
    'var(--color-primary-light)',
    'var(--color-accent-soft)',
  ]

  return Object.entries(counts).map(
    ([label, count], index) => ({
      label,

      value: Math.round(
        (count / upcoming.length) * 100
      ),

      color:
        colors[index % colors.length],
    })
  )
}


function normalizePatients(response) {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.content)) {
    return response.content
  }

  if (Array.isArray(response?.patients)) {
    return response.patients
  }

  if (Array.isArray(response?.items)) {
    return response.items
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  return []
}


export default function Dashboard() {
  const [stats, setStats] = useState({
    activePatients: 0,
    assessmentsToday: 0,
    evolutionsToday: 0,
    pendencies: 0,
  })

  const [upcoming, setUpcoming] = useState([])

  const [series, setSeries] = useState({
    labels: [],
    values: [],
  })

  const [distribution, setDistribution] =
    useState([])

  const [patients, setPatients] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      setLoading(true)

      const results =
        await Promise.allSettled([
          getStats(),
          getUpcoming(),
          getWeeklySeries(),
          getDistribution(),
          listPatients(),
        ])

      if (!active) return

      const [
        statsResult,
        upcomingResult,
        seriesResult,
        distributionResult,
        patientsResult,
      ] = results


      if (
        statsResult.status === 'fulfilled' &&
        statsResult.value
      ) {
        setStats({
          activePatients:
            Number(
              statsResult.value.activePatients ?? 0
            ),

          assessmentsToday:
            Number(
              statsResult.value.assessmentsToday ?? 0
            ),

          evolutionsToday:
            Number(
              statsResult.value.evolutionsToday ?? 0
            ),

          pendencies:
            Number(
              statsResult.value.pendencies ?? 0
            ),
        })
      }


      if (
        upcomingResult.status === 'fulfilled' &&
        Array.isArray(upcomingResult.value)
      ) {
        setUpcoming(upcomingResult.value)
      } else {
        setUpcoming([])
      }


      if (
        seriesResult.status === 'fulfilled' &&
        seriesResult.value
      ) {
        setSeries({
          labels:
            Array.isArray(
              seriesResult.value.labels
            )
              ? seriesResult.value.labels
              : [],

          values:
            Array.isArray(
              seriesResult.value.values
            )
              ? seriesResult.value.values
              : [],
        })
      } else {
        setSeries({
          labels: [],
          values: [],
        })
      }


      if (
        distributionResult.status === 'fulfilled' &&
        Array.isArray(distributionResult.value)
      ) {
        setDistribution(
          distributionResult.value
        )
      } else {
        setDistribution([])
      }


      if (
        patientsResult.status === 'fulfilled'
      ) {
        setPatients(
          normalizePatients(
            patientsResult.value
          )
        )
      } else {
        setPatients([])
      }

      setLoading(false)
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])


  function patientIdByName(name) {
    if (!name) return ''

    const match = patients.find(
      (patient) =>
        patient?.name === name
    )

    return match?.id || ''
  }


  const statusDistribution =
    getStatusDistribution(upcoming)


  return (
    <div className="page">

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>

          <p>
            Visão geral da sua rotina
          </p>
        </div>
      </div>


      <div className="dash-stats">

        <Link
          to="/pacientes"
          className="dash-stat-link"
        >
          <StatCard
            icon={<Users size={20} />}
            label="Pacientes ativos"
            value={
              loading
                ? '...'
                : stats.activePatients
            }
          />
        </Link>


        <Link
          to="/avaliacoes"
          className="dash-stat-link"
        >
          <StatCard
            icon={
              <ClipboardCheck size={20} />
            }
            label="Avaliações hoje"
            value={
              loading
                ? '...'
                : stats.assessmentsToday
            }
          />
        </Link>


        <Link
          to="/evolucoes"
          className="dash-stat-link"
        >
          <StatCard
            icon={<Activity size={20} />}
            label="Evoluções hoje"
            value={
              loading
                ? '...'
                : stats.evolutionsToday
            }
          />
        </Link>


        <Link
          to="/agenda"
          className="dash-stat-link"
        >
          <StatCard
            icon={
              <AlertCircle size={20} />
            }
            label="Pendências"
            value={
              loading
                ? '...'
                : stats.pendencies
            }
          />
        </Link>

      </div>


      <div className="dash-grid">

        <div className="panel">

          <h3 className="panel-title">
            Evolução dos atendimentos
          </h3>

          <span className="dash-subtle">
            Últimos 7 dias
          </span>

          <LineChart
            values={series.values}
            labels={series.labels}
          />

        </div>


        <div className="panel">

          <h3 className="panel-title">
            Distribuição por tipo de atendimento
          </h3>

          <DonutChart
            data={distribution}
            total={stats.activePatients}
          />

        </div>

      </div>


      <div className="dash-grid dash-grid--bottom">

        <div className="panel">

          <h3 className="panel-title">
            Próximos atendimentos
          </h3>


          <div className="dash-upcoming">

            {upcoming.length === 0 ? (

              <div className="dash-empty">
                Nenhum atendimento agendado.
              </div>

            ) : (

              upcoming.map((item, index) => {

                const patientId =
                  patientIdByName(
                    item?.name
                  )

                const link =
                  patientId
                    ? `/pacientes/${patientId}`
                    : '/pacientes'

                return (
                  <Link
                    className="dash-upcoming__item"
                    to={link}
                    key={
                      item?.id ||
                      `${item?.name}-${index}`
                    }
                  >

                    <div>

                      <strong>
                        {item?.name ||
                          'Paciente'}
                      </strong>

                      <span>
                        {item?.detail ||
                          'Horário não informado'}
                      </span>

                    </div>


                    <Badge>
                      {item?.status ||
                        'Pendente'}
                    </Badge>


                    <ChevronRight
                      size={16}
                      className="dash-upcoming__chevron"
                    />

                  </Link>
                )
              })
            )}

          </div>

        </div>


        <div className="panel">

          <h3 className="panel-title">
            Status dos próximos atendimentos
          </h3>

          <DonutChart
            data={statusDistribution}
            total={upcoming.length}
            centerLabel="Agendados"
          />

        </div>

      </div>

    </div>
  )
}