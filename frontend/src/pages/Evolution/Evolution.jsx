import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPatient } from "../../services/patientsService.js";
import {
  getEvolutionTimeline,
  getPatientRecords,
} from "../../services/evolutionsService.js";
import { getPatientPhotos } from "../../services/photosService.js";

import "./Evolution.css";

export default function Evolution() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [records, setRecords] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError("Paciente não informado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getPatient(id),
        getEvolutionTimeline(id),
        getPatientRecords(id),
        getPatientPhotos(id),
      ]);

      const patientResult = results[0];
      const timelineResult = results[1];
      const recordsResult = results[2];
      const photosResult = results[3];

      if (patientResult.status === "fulfilled") {
        setPatient(patientResult.value);
      } else {
        setPatient(null);
        setError("Não foi possível carregar o paciente.");
      }

      if (timelineResult.status === "fulfilled") {
        setTimeline(
          Array.isArray(timelineResult.value)
            ? timelineResult.value
            : timelineResult.value?.content ||
              timelineResult.value?.items ||
              timelineResult.value?.data ||
              []
        );
      } else {
        setTimeline([]);
      }

      if (recordsResult.status === "fulfilled") {
        setRecords(
          Array.isArray(recordsResult.value)
            ? recordsResult.value
            : recordsResult.value?.content ||
              recordsResult.value?.items ||
              recordsResult.value?.data ||
              []
        );
      } else {
        setRecords([]);
      }

      if (photosResult.status === "fulfilled") {
        setPhotos(
          Array.isArray(photosResult.value)
            ? photosResult.value
            : photosResult.value?.content ||
              photosResult.value?.items ||
              photosResult.value?.data ||
              []
        );
      } else {
        setPhotos([]);
      }

      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="evolution-page">
        <div className="evolution-loading">
          Carregando evolução do paciente...
        </div>
      </div>
    );
  }

  if (error && !patient) {
    return (
      <div className="evolution-page">
        <div className="evolution-error">
          <h2>Não foi possível carregar</h2>
          <p>{error}</p>

          <Link to="/patients">
            Voltar para pacientes
          </Link>
        </div>
      </div>
    );
  }

  const patientName =
    patient?.name ||
    patient?.full_name ||
    patient?.fullName ||
    "Paciente";

  const patientEmail =
    patient?.email ||
    "E-mail não informado";

  const patientPhone =
    patient?.phone ||
    patient?.telephone ||
    "Telefone não informado";

  return (
    <div className="evolution-page">
      <header className="evolution-header">
        <div>
          <Link to="/patients" className="back-link">
            ← Voltar para pacientes
          </Link>

          <h1>{patientName}</h1>

          <p>
            {patientEmail} · {patientPhone}
          </p>
        </div>
      </header>

      <section className="evolution-section">
        <div className="section-header">
          <h2>Evoluções</h2>
          <span>{timeline.length}</span>
        </div>

        {timeline.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma evolução registrada</h3>
            <p>
              Ainda não existem evoluções cadastradas para este paciente.
            </p>
          </div>
        ) : (
          <div className="timeline">
            {timeline.map((item, index) => {
              const itemId = item?.id || index;

              return (
                <article
                  className="timeline-item"
                  key={itemId}
                >
                  <div className="timeline-date">
                    {item?.created_at
                      ? new Date(item.created_at).toLocaleDateString("pt-BR")
                      : item?.date
                      ? new Date(item.date).toLocaleDateString("pt-BR")
                      : "Data não informada"}
                  </div>

                  <div className="timeline-content">
                    <h3>
                      {item?.title ||
                        item?.type ||
                        "Evolução clínica"}
                    </h3>

                    <p>
                      {item?.description ||
                        item?.notes ||
                        item?.content ||
                        "Sem descrição."}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="evolution-section">
        <div className="section-header">
          <h2>Registros</h2>
          <span>{records.length}</span>
        </div>

        {records.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum registro encontrado</h3>
            <p>
              Este paciente ainda não possui registros.
            </p>
          </div>
        ) : (
          <div className="records-list">
            {records.map((record, index) => (
              <article
                className="record-card"
                key={record?.id || index}
              >
                <h3>
                  {record?.title ||
                    record?.type ||
                    "Registro clínico"}
                </h3>

                <p>
                  {record?.description ||
                    record?.notes ||
                    record?.content ||
                    "Sem descrição."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="evolution-section">
        <div className="section-header">
          <h2>Fotos</h2>
          <span>{photos.length}</span>
        </div>

        {photos.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhuma foto cadastrada</h3>
            <p>
              Ainda não existem fotos para este paciente.
            </p>
          </div>
        ) : (
          <div className="photos-grid">
            {photos.map((photo, index) => {
              const imageUrl =
                photo?.url ||
                photo?.image_url ||
                photo?.imageUrl ||
                photo?.file_url ||
                photo?.src;

              return (
                <div
                  className="photo-card"
                  key={photo?.id || index}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Foto ${index + 1} do paciente`}
                    />
                  ) : (
                    <div className="photo-placeholder">
                      Foto sem imagem
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}