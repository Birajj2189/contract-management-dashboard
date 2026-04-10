import axiosInstance from './axiosInstance'

const contractService = {
  list: (params) => axiosInstance.get('/contracts', { params }),

  create: (data) => axiosInstance.post('/contracts', data),

  getOne: (id) => axiosInstance.get(`/contracts/${id}`),

  update: (id, data) => axiosInstance.put(`/contracts/${id}`, data),

  remove: (id) => axiosInstance.delete(`/contracts/${id}`),

  getVersions: (id) => axiosInstance.get(`/contracts/${id}/versions`),

  getVersion: (id, versionId) => axiosInstance.get(`/contracts/${id}/versions/${versionId}`),

  getAudit: (id) => axiosInstance.get(`/contracts/${id}/audit`),
}

export default contractService
