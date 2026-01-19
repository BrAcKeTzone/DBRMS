import { fetchClient } from "../utils/fetchClient";

export const clinicVisitsApi = {
  getAll: (params) => fetchClient.get("/clinic-visits", { params }),
  create: (data) => fetchClient.post("/clinic-visits", data),
  getStats: () => fetchClient.get("/clinic-visits/stats"),
};
