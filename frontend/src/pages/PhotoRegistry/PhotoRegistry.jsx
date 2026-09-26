import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { useParams } from 'react-router-dom'

import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Plus,
  Clock,
} from 'lucide-react'

import Breadcrumb from '../../components/Breadcrumb/Breadcrumb.jsx'

import {
  getPatient,
} from '../../services/patientsService.js'

import {
  getPatientPhotos,
  uploadPatientPhoto,
} from '../../services/photosService.js'

import { useToast } from '../../components/Toast/ToastContext.jsx'

import './PhotoRegistry.css'

export default function PhotoRegistry() {
  const { id } = useParams()

  const [patient, setPatient] =
    useState(null)

  const [photos, setPhotos] =
    useState([])

  const [active, setActive] =
    useState(0)

  const [compareIndex, setCompareIndex] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

  const [uploading, setUploading] =
    useState(false)

  const showToast = useToast()

  const fileInputRef =
    useRef(null)

  async function load() {
    const [patientData, photoData] =
      await Promise.all([
        getPatient(id),
        getPatientPhotos(id),
      ])

    setPatient(patientData)

    setPhotos(
      Array.isArray(photoData)
        ? photoData
        : []
    )
  }

  useEffect(() => {
    let mounted = true

    async function initialize() {
      try {
        setLoading(true)

        await load()
      } catch (err) {
        console.error(
          'Erro ao carregar registro fotográfico:',
          err
        )

        if (mounted) {
          showToast(
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

    initialize()

    return () => {
      mounted = false
    }
  }, [id])

  async function handleFileSelected(event) {
    const file =
      event.target.files?.[0]

    event.target.value = ''

    if (!file) return

    try {
      setUploading(true)

      const uploaded =
        await uploadPatientPhoto(
          id,
          file
        )

      if (uploaded) {
        setPhotos((current) => [
          uploaded,
          ...current,
        ])

        setActive(0)
        setCompareIndex(0)
      }

      showToast(
        'Foto enviada e salva com sucesso.'
      )
    } catch (err) {
      console.error(
        'Erro no upload:',
        err
      )

      showToast(
        err?.message ||
          'Não foi possível enviar a foto.'
      )
    } finally {
      setUploading(false)
    }
  }

  function shiftCompare(direction) {
    setCompareIndex((current) =>
      Math.max(
        0,
        Math.min(
          current + direction,
          Math.max(
            0,
            photos.length - 2
          )
        )
      )
    )
  }

  if (loading) {
    return (
      <div className="page">
        <p>
          Carregando registro fotográfico...
        </p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="page">
        <div className="panel">
          <h3>
            Paciente não encontrado.
          </h3>
        </div>
      </div>
    )
  }

  const activePhoto =
    photos[active]

  const compareA =
    photos[compareIndex]

  const compareB =
    photos[compareIndex + 1]

  return (
    <div className="page">
      <Breadcrumb
        items={[
          {
            label: 'Pacientes',
            to: '/pacientes',
          },
          {
            label: patient.name,
            to: `/pacientes/${patient.id}`,
          },
          {
            label:
              'Registro fotográfico',
          },
        ]}
      />

      <div className="photo-grid">
        <div className="panel">
          <h3 className="panel-title">
            Registro fotográfico
          </h3>

          <div className="photo-main">
            {activePhoto?.url ? (
              <img
                src={activePhoto.url}
                alt={`Registro de ${patient.name}`}
                onError={(event) => {
                  console.error(
                    'Imagem não encontrada:',
                    activePhoto.url
                  )

                  event.currentTarget.style.display =
                    'none'
                }}
              />
            ) : (
              <ImageIcon size={40} />
            )}

            <span className="photo-main__date">
              {activePhoto?.date
                ? new Date(
                    activePhoto.date
                  ).toLocaleDateString(
                    'pt-BR'
                  )
                : 'Nenhuma foto registrada'}
            </span>
          </div>

          <div className="photo-thumbs">
            {photos.map(
              (photo, index) => (
                <button
                  type="button"
                  key={photo.id}
                  className={`photo-thumb ${
                    active === index
                      ? 'is-active'
                      : ''
                  }`}
                  onClick={() =>
                    setActive(index)
                  }
                  aria-label={`Foto ${
                    index + 1
                  }`}
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display =
                          'none'
                      }}
                    />
                  ) : (
                    <ImageIcon size={16} />
                  )}
                </button>
              )
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="photo-grid__file-input"
            onChange={
              handleFileSelected
            }
          />

          <button
            type="button"
            className="btn btn-primary photo-grid__add"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
          >
            <Plus size={15} />

            {uploading
              ? 'Enviando...'
              : 'Adicionar nova foto'}
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-title">
            Comparação de imagens
          </h3>

          {photos.length < 2 ? (
            <p>
              Nenhuma comparação disponível.
              Adicione pelo menos duas fotos.
            </p>
          ) : (
            <div className="photo-compare">
              <button
                type="button"
                className="btn-icon"
                aria-label="Comparação anterior"
                onClick={() =>
                  shiftCompare(-1)
                }
              >
                <ChevronLeft size={16} />
              </button>

              {[
                compareA,
                compareB,
              ].map(
                (photo, index) => (
                  <div
                    className="photo-compare__item"
                    key={photo.id}
                  >
                    <span className="photo-compare__date">
                      {new Date(
                        photo.date
                      ).toLocaleDateString(
                        'pt-BR'
                      )}
                    </span>

                    <div className="photo-compare__image">
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={`Comparação ${
                            index + 1
                          }`}
                        />
                      ) : (
                        <ImageIcon
                          size={30}
                        />
                      )}
                    </div>
                  </div>
                )
              )}

              <button
                type="button"
                className="btn-icon"
                aria-label="Próxima comparação"
                onClick={() =>
                  shiftCompare(1)
                }
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          <h4 className="photo-history__title">
            <Clock size={14} />

            Histórico
          </h4>

          <ul className="photo-history">
            {photos.map(
              (photo, index) => (
                <li
                  key={photo.id}
                  onClick={() =>
                    setActive(index)
                  }
                >
                  <span className="photo-history__dot" />

                  {photo.date
                    ? new Date(
                        photo.date
                      ).toLocaleString(
                        'pt-BR'
                      )
                    : 'Data não informada'}
                </li>
              )
            )}

            {!photos.length && (
              <li>
                Nenhuma foto registrada.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}