import { apiClient } from "./apiClient.js";

function normalizeList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.results)) {
    return response.results;
  }

  return [];
}

export async function getEvolutionFeed() {
  try {
    const response = await apiClient.get("/evolutions/feed");

    return normalizeList(response);
  } catch (error) {
    console.error("Erro ao carregar feed de evoluções:", error);

    return [];
  }
}

export async function getEvolutionTimeline(patientId) {
  if (!patientId) {
    return [];
  }

  try {
    const response = await apiClient.get(
      `/patients/${patientId}/evolutions`
    );

    return normalizeList(response);
  } catch (error) {
    console.error(
      `Erro ao carregar evoluções do paciente ${patientId}:`,
      error
    );

    return [];
  }
}

export async function getPatientRecords(patientId) {
  if (!patientId) {
    return [];
  }

  try {
    const response = await apiClient.get(
      `/patients/${patientId}/records`
    );

    return normalizeList(response);
  } catch (error) {
    console.error(
      `Erro ao carregar registros do paciente ${patientId}:`,
      error
    );

    return [];
  }
}