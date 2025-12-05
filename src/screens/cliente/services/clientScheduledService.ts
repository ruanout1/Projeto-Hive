import api from '../../../lib/api';

export async function getClientScheduledServices() {
  const response = await api.get("/client-portal/scheduled-services");
  return response.data;
}
