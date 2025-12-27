import { fetchClient } from "../utils/fetchClient";

export const clinicVisitsApi = {
  getAll: () => fetchClient.get("/clinic-visits"),
  create: (data) => fetchClient.post("/clinic-visits", data),
  getStats: () => fetchClient.get("/clinic-visits/stats"),
};
