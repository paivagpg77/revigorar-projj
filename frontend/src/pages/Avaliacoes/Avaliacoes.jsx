import { FileText, Plus } from 'lucide-react';
import { AppShell } from '../../components/AppShell/AppShell';
import '../Module.css';

export default function Avaliacoes() {
  return (
    <AppShell
      title="Avaliações clínicas"
      subtitle="Registre evolução, escalas e informações clínicas de cada ferida."
    >
      <div className="page-toolbar">
        <div className="module-summary">
          <FileText size={19} />
          Prontuário especializado
        </div>

        <button className="action-btn">
          <Plus size={17} />
          Nova avaliação
        </button>
      </div>

      <div className="data-card">
        <div className="empty-module">
          <FileText size={38} />

          <h3>Módulo clínico</h3>

          <p>
            As avaliações ficam vinculadas às feridas e aos pacientes.
            O próximo passo é conectar o formulário clínico completo
            às escalas e fotos.
          </p>
        </div>
      </div>
    </AppShell>
  );
}