import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Image as ImageIcon,
  ChevronRight,
} from 'lucide-react'

import {
  listPatientsWithPhotos,
} from '../../services/photosService.js'

import './PhotosList.css'

export default function PhotosList() {
  const [patients, setPatients] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        setLoading(true)
        setError('')

        const data =
          await listPatientsWithPhotos()

        if (mounted) {
          setPatients(
            Array.isArray(data)
              ? data
              : []
          )
        }
      } catch (err) {
        console.error(
          'Erro ao carregar fotos:',
          err
        )

        if (mounted) {
          setError(
            err?.message ||
              'Não foi possível carregar as fotos.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Fotos</h1>
            <p>
              Registros fotográficos por paciente
            </p>
          </div>
        </div>

        <div className="panel">
          Carregando fotos...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Fotos</h1>
            <p>
              Registros fotográficos por paciente
            </p>
          </div>
        </div>

        <div className="panel">
          <h3>
            Não foi possível carregar as fotos.
          </h3>

          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Fotos</h1>

          <p>
            Registros fotográficos por paciente
          </p>
        </div>
      </div>

      <div className="photoslist-grid">
        {patients.map((patient) => (
          <Link
            className="photoslist-card"
            to={`/pacientes/${patient.id}/fotos`}
            key={patient.id}
          >
            <div className="photoslist-card__preview">
              {patient.thumbnailUrl ? (
                <img
                  src={patient.thumbnailUrl}
                  alt={`Última foto de ${patient.name}`}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none'
                  }}
                />
              ) : (
                <ImageIcon size={26} />
              )}
            </div>

            <div className="photoslist-card__footer">
              <div>
                <strong>
                  {patient.name}
                </strong>

                <span>
                  {patient.lastPhoto
                    ? `Última foto: ${new Date(
                        patient.lastPhoto
                      ).toLocaleDateString(
                        'pt-BR'
                      )}`
                    : 'Nenhuma foto registrada'}
                </span>
              </div>

              <ChevronRight size={15} />
            </div>
          </Link>
        ))}

        {!patients.length && (
          <div className="panel">
            <p>
              Nenhum paciente possui registro
              fotográfico.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}