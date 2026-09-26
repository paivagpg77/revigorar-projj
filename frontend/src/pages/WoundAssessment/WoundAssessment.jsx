import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'
import { getPatient } from '../../services/patientsService.js'
import { getWoundAssessment, saveWoundAssessmentSection } from '../../services/assessmentsService.js'
import { useToast } from '../../components/Toast/ToastContext.jsx'
import './WoundAssessment.css'

const SUBNAV = ['Dados gerais', 'Avaliação da ferida', 'Características', 'Escalas clínicas', 'Condutas']
const empty = (v = '') => v

export default function WoundAssessment() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [section, setSection] = useState('Avaliação da ferida')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [assessment, setAssessment] = useState(null)
  const [formKey, setFormKey] = useState(0)
  const showToast = useToast()

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getPatient(id), getWoundAssessment(id)]).then(([p, a]) => {
      if (!active) return
      setPatient(p)
      setAssessment(a || {})
    }).catch((err) => {
      if (active) showToast(err.message || 'Não foi possível carregar a avaliação.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  const getSaved = (group, key) => assessment?.[group]?.[key] ?? ''

  const handleSave = async (e, label) => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData(e.currentTarget)
      const data = {}
      for (const [key, value] of formData.entries()) {
        if (key === 'sinais_infeccao') {
          data[key] = [...(data[key] || []), value]
        } else data[key] = value
      }
      const saved = await saveWoundAssessmentSection(id, label, data)
      setAssessment((prev) => ({ ...(prev || {}), ...(saved || {}) }))
      showToast(`${label} salvo com sucesso.`)
    } catch (err) {
      showToast(err.message || 'Não foi possível salvar a avaliação.')
    } finally { setSaving(false) }
  }

  if (loading) return <div className="page"><p>Carregando avaliação...</p></div>
  if (!patient) return <div className="page"><div className="panel"><h3>Paciente não encontrado</h3></div></div>

  return (
    <div className="page">
      <Breadcrumb items={[{ label: 'Pacientes', to: '/pacientes' }, { label: patient.name, to: `/pacientes/${patient.id}` }, { label: 'Avaliação da ferida' }]} />
      <div className="wound-layout">
        <nav className="wound-subnav panel">
          {SUBNAV.map((item) => <button key={item} className={section === item ? 'is-active' : ''} onClick={() => setSection(item)}>{item}</button>)}
        </nav>
        <form className="panel wound-form" key={`${section}-${formKey}`} onSubmit={(e) => handleSave(e, section)}>
          {section === 'Dados gerais' && <>
            <h3 className="panel-title">Dados gerais</h3>
            <div className="form-grid">
              <div className="form-field"><label>Diagnóstico</label><input name="diagnostico" defaultValue={getSaved('identification', 'diagnostico')} /></div>
              <div className="form-field"><label>Data de início do tratamento</label><input name="data_de_inicio_do_tratamento" type="date" defaultValue={getSaved('identification', 'data_de_inicio_do_tratamento')} /></div>
              <div className="form-field"><label>Convênio</label><select name="convenio" defaultValue={getSaved('identification', 'convenio')}><option value="">Selecione</option><option>Particular</option><option>SUS</option><option>Convênio médico</option></select></div>
            </div>
            <div className="form-grid">
              <div className="form-field"><label>Profissional responsável</label><input name="profissional_responsavel" defaultValue={getSaved('identification', 'profissional_responsavel')} /></div>
              <div className="form-field"><label>Frequência de avaliação</label><select name="frequencia_de_avaliacao" defaultValue={getSaved('identification', 'frequencia_de_avaliacao')}><option value="">Selecione</option><option>Diária</option><option>Semanal</option><option>Quinzenal</option><option>Mensal</option></select></div>
            </div>
            <div className="form-field"><label>Histórico clínico relevante</label><textarea name="historico_clinico_relevante" rows={3} defaultValue={getSaved('identification', 'historico_clinico_relevante')} /></div>
          </>}

          {section === 'Avaliação da ferida' && <>
            <h3 className="panel-title">Avaliação da ferida</h3>
            <div className="form-field"><label>Localização</label><input name="localizacao" defaultValue={getSaved('identification', 'localizacao')} /></div>
            <div className="form-grid">
              <div className="form-field"><label>Comprimento (cm)</label><input name="comprimento_cm" inputMode="decimal" defaultValue={getSaved('identification', 'comprimento_cm')} /></div>
              <div className="form-field"><label>Largura (cm)</label><input name="largura" inputMode="decimal" defaultValue={getSaved('identification', 'largura')} /></div>
              <div className="form-field"><label>Profundidade (cm)</label><input name="profundidade" inputMode="decimal" defaultValue={getSaved('identification', 'profundidade')} /></div>
            </div>
            <div className="form-grid">
              <div className="form-field"><label>Tipo de tecido</label><select name="tipo_de_tecido" defaultValue={getSaved('identification', 'tipo_de_tecido')}><option value="">Selecione</option><option>Granulação</option><option>Necrose</option><option>Esfacelo</option><option>Epitelização</option></select></div>
              <div className="form-field"><label>Exsudato</label><select name="exsudato" defaultValue={getSaved('identification', 'exsudato')}><option value="">Selecione</option><option>Ausente</option><option>Leve</option><option>Moderado</option><option>Intenso</option></select></div>
              <div className="form-field"><label>Odor</label><select name="odor" defaultValue={getSaved('identification', 'odor')}><option value="">Selecione</option><option>Ausente</option><option>Leve</option><option>Intenso</option></select></div>
            </div>
            <div className="form-field"><label>Observações</label><textarea name="observacoes" rows={3} defaultValue={getSaved('identification', 'observacoes')} /></div>
          </>}

          {section === 'Características' && <>
            <h3 className="panel-title">Características</h3>
            <div className="form-grid">
              <div className="form-field"><label>Bordas</label><select name="bordas" defaultValue={getSaved('characteristics', 'bordas')}><option value="">Selecione</option><option>Regulares</option><option>Irregulares</option><option>Maceradas</option><option>Epitelizadas</option></select></div>
              <div className="form-field"><label>Pele perilesional</label><select name="pele_perilesional" defaultValue={getSaved('characteristics', 'pele_perilesional')}><option value="">Selecione</option><option>Íntegra</option><option>Ressecada</option><option>Macerada</option><option>Eritematosa</option></select></div>
              <div className="form-field"><label>Dor (0–10)</label><input name="dor_escala_010" type="number" min="0" max="10" defaultValue={getSaved('characteristics', 'dor_escala_010')} /></div>
            </div>
            <div className="form-field"><label>Sinais de infecção</label><div className="wound-checklist">{['Hiperemia', 'Calor local', 'Edema', 'Secreção purulenta', 'Odor fétido'].map((s) => <label key={s}><input type="checkbox" name="sinais_infeccao" value={s} defaultChecked={(getSaved('characteristics', 'sinais_infeccao') || []).includes?.(s)} /> {s}</label>)}</div></div>
            <div className="form-field"><label>Presença de biofilme</label><select name="presenca_de_biofilme" defaultValue={getSaved('characteristics', 'presenca_de_biofilme')}><option value="">Selecione</option><option>Não</option><option>Suspeito</option><option>Confirmado</option></select></div>
          </>}

          {section === 'Escalas clínicas' && <>
            <h3 className="panel-title">Escalas clínicas</h3>
            <p>Registre os resultados das escalas após a avaliação clínica.</p>
            <div className="form-grid">
              <div className="form-field"><label>Braden (pontuação)</label><input name="braden_pontuacao" type="number" min="0" defaultValue={getSaved('characteristics', 'braden_pontuacao')} /></div>
              <div className="form-field"><label>PUSH (pontuação)</label><input name="push_pontuacao" type="number" min="0" defaultValue={getSaved('characteristics', 'push_pontuacao')} /></div>
              <div className="form-field"><label>Área da ferida</label><input name="area_da_ferida" defaultValue={getSaved('characteristics', 'area_da_ferida')} /></div>
            </div>
            <div className="form-field"><label>Observações das escalas</label><textarea name="observacoes_escalas" rows={3} defaultValue={getSaved('characteristics', 'observacoes_escalas')} /></div>
          </>}

          {section === 'Condutas' && <>
            <h3 className="panel-title">Condutas</h3>
            <div className="form-grid">
              <div className="form-field"><label>Cobertura indicada</label><input name="cobertura_indicada" defaultValue={getSaved('care_plan', 'cobertura_indicada')} /></div>
              <div className="form-field"><label>Frequência de troca</label><input name="frequencia_de_troca" defaultValue={getSaved('care_plan', 'frequencia_de_troca')} /></div>
              <div className="form-field"><label>Retorno previsto</label><input name="retorno_previsto" type="date" defaultValue={getSaved('care_plan', 'retorno_previsto')} /></div>
            </div>
            <div className="form-field"><label>Orientações ao paciente/cuidador</label><textarea name="orientacoes_ao_paciente_cuidador" rows={3} defaultValue={getSaved('care_plan', 'orientacoes_ao_paciente_cuidador')} /></div>
            <div className="form-field"><label>Encaminhamentos</label><textarea name="encaminhamentos" rows={2} defaultValue={getSaved('care_plan', 'encaminhamentos')} /></div>
          </>}

          <div className="wound-form__actions">
            <button type="button" className="btn btn-secondary" onClick={() => setFormKey((k) => k + 1)}>Limpar alterações</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
