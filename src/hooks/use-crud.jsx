"use client"

import { useState, useCallback, useEffect } from "react"
import { useApi } from "./use-api"
import { toast } from "react-hot-toast"

export function useCrud(endpoint, options = {}) {
  const {
    initialData = [],
    idField = "id",
    pagination = false,
    pageSize = 10,
    sortField = null,
    sortDirection = "asc",
    filters = {},
    autoFetch = true,
  } = options

  const api = useApi()
  const [data, setData] = useState(initialData)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentSort, setCurrentSort] = useState({ field: sortField, direction: sortDirection })
  const [currentFilters, setCurrentFilters] = useState(filters)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch data with pagination, sorting, and filtering
  const fetchData = useCallback(
    async (page = currentPage, sort = currentSort, filters = currentFilters) => {
      try {
        setIsLoading(true)
        setError(null)

        const params = {
          ...(pagination ? { page, limit: pageSize } : {}),
          ...(sort.field ? { sort: sort.field, order: sort.direction } : {}),
          ...filters,
        }

        const response = await api.get(endpoint, params)

        if (pagination && response.meta) {
          setData(response.data || [])
          setTotalItems(response.meta.total || response.data.length)
        } else {
          setData(response.data || response || [])
          setTotalItems(response.data?.length || response?.length || 0)
        }

        return response
      } catch (err) {
        setError(err.message || "Failed to fetch data")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [api, endpoint, pagination, pageSize, currentPage, currentSort, currentFilters],
  )

  // Initial data fetch
  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  // Get a single item by ID
  const getById = useCallback(
    async (id) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.get(`${endpoint}/${id}`)
        setSelectedItem(response.data || response)

        return response.data || response
      } catch (err) {
        setError(err.message || `Failed to get item with ID: ${id}`)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [api, endpoint],
  )

  // Create a new item
  const create = useCallback(
    async (itemData) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.post(endpoint, itemData)

        // Update local data
        setData((prevData) => [...prevData, response.data || response])
        toast.success("Item created successfully")

        return response.data || response
      } catch (err) {
        setError(err.message || "Failed to create item")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [api, endpoint],
  )

  // Update an existing item
  const update = useCallback(
    async (id, itemData) => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await api.put(`${endpoint}/${id}`, itemData)

        // Update local data
        setData((prevData) =>
          prevData.map((item) => (item[idField] === id ? { ...item, ...(response.data || response) } : item)),
        )

        if (selectedItem && selectedItem[idField] === id) {
          setSelectedItem({ ...selectedItem, ...(response.data || response) })
        }

        toast.success("Item updated successfully")

        return response.data || response
      } catch (err) {
        setError(err.message || `Failed to update item with ID: ${id}`)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [api, endpoint, idField, selectedItem],
  )

  // Delete an item
  const remove = useCallback(
    async (id) => {
      try {
        setIsLoading(true)
        setError(null)

        await api.remove(`${endpoint}/${id}`)

        // Update local data
        setData((prevData) => prevData.filter((item) => item[idField] !== id))

        if (selectedItem && selectedItem[idField] === id) {
          setSelectedItem(null)
        }

        toast.success("Item deleted successfully")

        return true
      } catch (err) {
        setError(err.message || `Failed to delete item with ID: ${id}`)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [api, endpoint, idField, selectedItem],
  )

  // Handle pagination
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page)
      fetchData(page)
    },
    [fetchData],
  )

  // Handle sorting
  const handleSort = useCallback(
    (field, direction = "asc") => {
      const newSort = { field, direction }
      setCurrentSort(newSort)
      fetchData(currentPage, newSort)
    },
    [currentPage, fetchData],
  )

  // Handle filtering
  const handleFilter = useCallback(
    (filters) => {
      setCurrentFilters(filters)
      setCurrentPage(1) // Reset to first page when filtering
      fetchData(1, currentSort, filters)
    },
    [currentSort, fetchData],
  )

  // Reset all filters
  const resetFilters = useCallback(() => {
    setCurrentFilters({})
    fetchData(currentPage, currentSort, {})
  }, [currentPage, currentSort, fetchData])

  return {
    data,
    totalItems,
    currentPage,
    pageSize,
    isLoading,
    error,
    selectedItem,
    setSelectedItem,
    fetchData,
    getById,
    create,
    update,
    remove,
    handlePageChange,
    handleSort,
    handleFilter,
    resetFilters,
  }
}

