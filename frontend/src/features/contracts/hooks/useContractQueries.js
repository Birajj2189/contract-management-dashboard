import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import contractService from '@/services/contractService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addNotification } from '@/store/slices/notificationsSlice'
import env from '@/config/env'

const QUERY_KEY = 'contracts'

export const useContracts = (params) =>
  useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () =>
      contractService.list(params).then((r) => ({
        contracts: r.data.data.contracts,
        meta: r.data.meta,
      })),
    keepPreviousData: true,
    staleTime: env.queryStaleTime,
  })

export const useContract = (id) =>
  useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => contractService.getOne(id).then((r) => r.data.data.contract),
    enabled: !!id,
  })

export const useContractVersions = (id) =>
  useQuery({
    queryKey: [QUERY_KEY, id, 'versions'],
    queryFn: () => contractService.getVersions(id).then((r) => r.data.data.versions),
    enabled: !!id,
  })

/** Full version row including `snapshot` (GET /contracts/:id/versions/:versionId). */
export const useContractVersion = (contractId, versionId) =>
  useQuery({
    queryKey: [QUERY_KEY, contractId, 'versions', versionId],
    queryFn: () => contractService.getVersion(contractId, versionId).then((r) => r.data.data.version),
    enabled: !!contractId && !!versionId,
  })

export const useContractVersionDiff = (contractId, fromId, toId, { enabled: enabledOption = true } = {}) =>
  useQuery({
    queryKey: [QUERY_KEY, contractId, 'versions', 'compare', fromId, toId],
    queryFn: () =>
      contractService
        .compareVersions(contractId, { from: fromId, to: toId })
        .then((r) => r.data.data),
    enabled:
      !!contractId &&
      !!fromId &&
      !!toId &&
      fromId !== toId &&
      enabledOption,
  })

export const useContractAudit = (id) =>
  useQuery({
    queryKey: [QUERY_KEY, id, 'audit'],
    queryFn: () => contractService.getAudit(id).then((r) => r.data.data.logs),
    enabled: !!id,
  })

export const useCreateContract = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  return useMutation({
    mutationFn: (data) => contractService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      const contract = res.data.data.contract
      toast.success('Contract created successfully!')
      dispatch(
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Contract created',
          message: `"${contract.title}" was created.`,
          read: false,
          createdAt: new Date().toISOString(),
        })
      )
      navigate(`/contracts/${contract.id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create contract.')
    },
  })
}

export const useUpdateContract = (id) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data) => contractService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] })
      toast.success('Contract updated successfully!')
      navigate(`/contracts/${id}`)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update contract.')
    },
  })
}

export const useDeleteContract = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => contractService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Contract deleted.')
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete contract.')
    },
  })
}
