import { apiClient } from './apiClient.js'


export async function getDashboard() {
  return apiClient.get('/dashboard/stats')
}


export async function getStats() {
  const data = await getDashboard()

  return {
    activePatients:
      Number(data?.patients ?? 0),

    assessmentsToday:
      Number(data?.evaluations_today ?? 0),

    evolutionsToday:
      Number(data?.evolutions_today ?? 0),

    pendencies:
      Number(data?.pendencias ?? 0),
  }
}


export async function getUpcoming() {
  const data = await getDashboard()

  const appointments =
    Array.isArray(data?.next_appointments)
      ? data.next_appointments
      : []

  return appointments.map((appointment) => {
    const patient =
      appointment?.patient || {}

    const name =
      patient?.name ||
      appointment?.patient_name ||
      'Paciente'

    let detail = 'Horário não informado'

    if (appointment?.scheduled_at) {
      const date = new Date(
        appointment.scheduled_at
      )

      if (!Number.isNaN(date.getTime())) {
        detail =
          date.toLocaleTimeString(
            'pt-BR',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          )
      }
    }

    return {
      id: appointment?.id,

      name,

      detail,

      status:
        appointment?.status === 'confirmed'
          ? 'Confirmado'
          : appointment?.status === 'pending'
            ? 'Pendente'
            : appointment?.status || 'Pendente',
    }
  })
}


export async function getWeeklySeries() {
  const data = await getDashboard()

  const weekly =
    Array.isArray(data?.weekly)
      ? data.weekly
      : []

  const labels = [
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb',
    'Dom',
  ]

  const values = [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
  ]

  weekly.forEach((item) => {
    if (!item?.day) return

    const date = new Date(item.day)

    if (Number.isNaN(date.getTime())) {
      return
    }

    const day = date.getDay()

    const index =
      day === 0
        ? 6
        : day - 1

    values[index] =
      Number(item?.count || 0)
  })

  return {
    labels,
    values,
  }
}


export async function getDistribution() {
  const data = await getDashboard()

  const distribution =
    Array.isArray(data?.wounds_by_etiology)
      ? data.wounds_by_etiology
      : []

  const total =
    distribution.reduce(
      (sum, item) =>
        sum +
        Number(item?.count || 0),
      0
    )

  if (!total) {
    return []
  }

  return distribution.map((item) => ({
    label:
      item?.etiology ||
      'Outros',

    value:
      Math.round(
        (
          Number(item?.count || 0) /
          total
        ) * 100
      ),
  }))
}