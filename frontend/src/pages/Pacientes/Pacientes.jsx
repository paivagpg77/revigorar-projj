import { useEffect, useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { AppShell } from '../../components/AppShell/AppShell';
import { getPatients, createPatient } from '../../services/api';
import '../Module.css';

export default function Pacientes() {
  const [items, setItems] = useState([]);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  async function load() {
    try {
      const r = await getPatients(
        `limit=100${search ? `&search=${encodeURIComponent(search)}` : ''}`
      );

      setItems(r.data || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, [search]);

  async function submit(e) {
    e.preventDefault();

    const f = new FormData(e.target);

    try {
      await createPatient({
        name: f.get('name'),
        birth_date: f.get('birth_date'),
        cpf: f.get('cpf'),
        email: f.get('email'),
        phone: f.get('phone'),
        gender: f.get('gender'),
        address: f.get('address'),
        medical_history: f.get('medical_history'),
      });

      setShow(false);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <AppShell
      title="Pacientes"
      subtitle="Prontuário centralizado para acompanhar cada pessoa ao longo do tratamento."
    >
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Buscar paciente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button className="action-btn" onClick={() => setShow(true)}>
          <Plus size={17} />
          Novo paciente
        </button>
      </div>

      {error && <div className="toast-error">{error}</div>}

      <div className="data-card">
        {items.length === 0 ? (
          <div className="empty-module">
            <Users size={34} />
            <h3>Nenhum paciente encontrado</h3>
            <p>Cadastre um paciente para começar seu prontuário.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Contato</th>
                <th>Nascimento</th>
                <th>Gênero</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <div className="muted">
                      {p.cpf || 'CPF não informado'}
                    </div>
                  </td>

                  <td>{p.phone || p.email || '—'}</td>

                  <td>
                    {p.birth_date
                      ? new Date(p.birth_date).toLocaleDateString('pt-BR')
                      : '—'}
                  </td>

                  <td>{p.gender || '—'}</td>

                  <td>
                    <span className="pill">
                      {p.status === 'active' ? 'Ativo' : p.status || 'Ativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {show && (
        <div className="modal-backdrop">
          <form className="modal-card" onSubmit={submit}>
            <div className="modal-head">
              <h2>Novo paciente</h2>

              <button type="button" onClick={() => setShow(false)}>
                ×
              </button>
            </div>

            <div className="form-grid">
              <div className="form-field full">
                <label>Nome completo</label>
                <input name="name" required />
              </div>

              <div className="form-field">
                <label>Data de nascimento</label>
                <input name="birth_date" type="date" required />
              </div>

              <div className="form-field">
                <label>CPF</label>
                <input name="cpf" />
              </div>

              <div className="form-field">
                <label>Telefone</label>
                <input name="phone" />
              </div>

              <div className="form-field">
                <label>E-mail</label>
                <input name="email" type="email" />
              </div>

              <div className="form-field">
                <label>Gênero</label>

                <select name="gender">
                  <option value="">Não informado</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="O">Outro</option>
                </select>
              </div>

              <div className="form-field full">
                <label>Endereço</label>
                <input name="address" />
              </div>

              <div className="form-field full">
                <label>Histórico clínico</label>
                <textarea name="medical_history" />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setShow(false)}
              >
                Cancelar
              </button>

              <button className="action-btn">
                Cadastrar paciente
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}