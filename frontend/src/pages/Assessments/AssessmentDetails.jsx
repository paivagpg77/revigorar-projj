import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Download, Edit3 } from 'lucide-react'
import Avatar from '../../components/Avatar/Avatar.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import { getPatient } from '../../services/patientsService.js'
import { getWoundAssessment } from '../../services/assessmentsService.js'
import './AssessmentDetails.css'

function display(value, fallback = 'Não informado') {
  if (value === undefined || value === null || value === '') return fallback
  if (Array.isArray(value)) return value.length ? value.join(', ') : fallback
  return String(value)
}

function formatDate(value) {
  if (!value) return 'Não informado'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return display(value)
  return date.toLocaleDateString('pt-BR')
}

function initialsOf(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'U'
}

function Field({ label, value, wide = false }) {
  return (
    <div className={`assessment-detail-field${wide ? ' assessment-detail-field--wide' : ''}`}>
      <span>{label}</span>
      <strong>{display(value)}</strong>
    </div>
  )
}

export default function AssessmentDetails() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getPatient(patientId), getWoundAssessment(patientId)])
      .then(([patientData, assessmentData]) => {
        if (!active) return
        setPatient(patientData)
        setAssessment(assessmentData || {})
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Não foi possível carregar a avaliação.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [patientId])

  const identification = assessment?.identification || {}
  const characteristics = assessment?.characteristics || {}
  const carePlan = assessment?.care_plan || {}
  const hasData = useMemo(() => [identification, characteristics, carePlan].some((group) => Object.keys(group).length > 0), [identification, characteristics, carePlan])

  function generatePdf() {
    window.print()
  }

  if (loading) return <div className="page"><p>Carregando avaliação...</p></div>
  if (error) return <div className="page"><div className="panel"><h3>Não foi possível carregar</h3><p>{error}</p><Link className="btn btn-secondary" to="/avaliacoes">Voltar para avaliações</Link></div></div>
  if (!patient) return <div className="page"><div className="panel"><h3>Paciente não encontrado</h3><Link className="btn btn-secondary" to="/avaliacoes">Voltar</Link></div></div>

  return (
    <div className="page assessment-detail-page">
      <div className="assessment-detail-actions no-print">
        <Link className="btn btn-secondary" to="/avaliacoes"><ArrowLeft size={15} /> Voltar para avaliações</Link>
        <div>
          <Link className="btn btn-secondary" to={`/pacientes/${patient.id}/avaliacao`}><Edit3 size={15} /> Editar avaliação</Link>
          <button type="button" className="btn btn-primary" onClick={generatePdf} disabled={!hasData}><Download size={15} /> Gerar PDF</button>
        </div>
      </div>

      <div className="assessment-printable">
        <div className="assessment-detail-header">
          <div className="assessment-detail-patient">
            <Avatar initials={initialsOf(patient.name)} size={52} />
            <div>
              <h1>Avaliação clínica</h1>
              <h2>{patient.name}</h2>
              <p>{display(patient.age, '—')} anos · {display(patient.gender, 'Sexo não informado')} · {display(patient.type, 'Ferida')}</p>
            </div>
          </div>
          <Badge tone="success">{hasData ? 'Concluída' : 'Sem dados'}</Badge>
        </div>

        <section className="assessment-detail-section">
          <h3>Resumo da avaliação</h3>
          <div className="assessment-detail-grid assessment-detail-grid--four">
            <Field label="Última atualização" value={formatDate(assessment?.updated_at)} />
            <Field label="Diagnóstico" value={identification.diagnostico} />
            <Field label="Localização" value={identification.localizacao} />
            <Field label="Área da ferida" value={characteristics.area_da_ferida} />
          </div>
        </section>

        <section className="assessment-detail-section">
          <h3>Dados gerais</h3>
          <div className="assessment-detail-grid">
            <Field label="Diagnóstico" value={identification.diagnostico} />
            <Field label="Data de início do tratamento" value={identification.data_de_inicio_do_tratamento} />
            <Field label="Convênio" value={identification.convenio} />
            <Field label="Profissional responsável" value={identification.profissional_responsavel} />
            <Field label="Frequência de avaliação" value={identification.frequencia_de_avaliacao} />
            <Field label="Histórico clínico relevante" value={identification.historico_clinico_relevante} wide />
          </div>
        </section>

        <section className="assessment-detail-section">
          <h3>Avaliação da ferida</h3>
          <div className="assessment-detail-grid">
            <Field label="Localização" value={identification.localizacao} />
            <Field label="Comprimento" value={identification.comprimento_cm ? `${identification.comprimento_cm} cm` : ''} />
            <Field label="Largura" value={identification.largura ? `${identification.largura} cm` : ''} />
            <Field label="Profundidade" value={identification.profundidade ? `${identification.profundidade} cm` : ''} />
            <Field label="Tipo de tecido" value={identification.tipo_de_tecido} />
            <Field label="Exsudato" value={identification.exsudato} />
            <Field label="Odor" value={identification.odor} />
            <Field label="Observações" value={identification.observacoes} wide />
          </div>
        </section>

        <section className="assessment-detail-section">
          <h3>Características e escalas</h3>
          <div className="assessment-score-row">
            <div><span>Braden</span><strong>{display(characteristics.braden_pontuacao)}</strong></div>
            <div><span>PUSH</span><strong>{display(characteristics.push_pontuacao)}</strong></div>
            <div><span>Área</span><strong>{display(characteristics.area_da_ferida)}</strong></div>
            <div><span>Dor</span><strong>{characteristics.dor_escala_010 !== undefined && characteristics.dor_escala_010 !== '' ? `${characteristics.dor_escala_010}/10` : 'Não informado'}</strong></div>
          </div>
          <div className="assessment-detail-grid">
            <Field label="Bordas" value={characteristics.bordas} />
            <Field label="Pele perilesional" value={characteristics.pele_perilesional} />
            <Field label="Sinais de infecção" value={characteristics.sinais_infeccao} />
            <Field label="Presença de biofilme" value={characteristics.presenca_de_biofilme} />
            <Field label="Observações das escalas" value={characteristics.observacoes_escalas} wide />
          </div>
        </section>

        <section className="assessment-detail-section">
          <h3>Condutas</h3>
          <div className="assessment-detail-grid">
            <Field label="Cobertura indicada" value={carePlan.cobertura_indicada} />
            <Field label="Frequência de troca" value={carePlan.frequencia_de_troca} />
            <Field label="Retorno previsto" value={carePlan.retorno_previsto} />
            <Field label="Orientações ao paciente/cuidador" value={carePlan.orientacoes_ao_paciente_cuidador} wide />
            <Field label="Encaminhamentos" value={carePlan.encaminhamentos} wide />
          </div>
        </section>

        <footer className="assessment-detail-footer">
          Documento gerado pelo REVIGORAR · {new Date().toLocaleString('pt-BR')}
        </footer>
      </div>
    </div>
  )
}
