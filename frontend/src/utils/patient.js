/**
 * Calcula a idade (em anos completos) a partir de uma data de nascimento (YYYY-MM-DD).
 */
export function calculateAge(birthDate) {
  if (!birthDate) return null
  const birth = new Date(`${birthDate}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

/**
 * Retorna o nome do responsável a ser exibido, considerando o caso em que
 * o próprio paciente é seu responsável.
 */
export function responsibleLabel(patient) {
  if (!patient) return ''
  if (patient.selfResponsible) return `${patient.name} (o(a) próprio(a) paciente)`
  return patient.responsibleName || '—'
}
