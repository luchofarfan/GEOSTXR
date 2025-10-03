import { useState, useCallback, useMemo } from 'react'
import type { Project, DrillHole, Structure } from '@/types/geostxr-data'

interface MultiDrillHoleDataState {
  selectedDrillHoles: string[]
  filteredProjects: Project[]
  searchTerm: string
  structureTypeFilter: string
  depthRange: { min: number; max: number }
  sortBy: 'name' | 'depth' | 'structures' | 'date'
  sortDirection: 'asc' | 'desc'
}

interface MultiDrillHoleDataActions {
  setSelectedDrillHoles: (ids: string[]) => void
  toggleDrillHoleSelection: (id: string) => void
  selectAllDrillHoles: () => void
  deselectAllDrillHoles: () => void
  setSearchTerm: (term: string) => void
  setStructureTypeFilter: (type: string) => void
  setDepthRange: (range: { min: number; max: number }) => void
  setSortBy: (field: 'name' | 'depth' | 'structures' | 'date') => void
  setSortDirection: (direction: 'asc' | 'desc') => void
  resetFilters: () => void
}

interface MultiDrillHoleDataReturn {
  state: MultiDrillHoleDataState
  actions: MultiDrillHoleDataActions
  computed: {
    allDrillHoles: DrillHole[]
    filteredDrillHoles: DrillHole[]
    selectedDrillHolesData: DrillHole[]
    totalStructures: number
    totalDepth: number
    structureTypes: string[]
    depthStatistics: {
      min: number
      max: number
      avg: number
    }
    structureStatistics: {
      total: number
      byType: Record<string, number>
      avgPerMeter: number
    }
  }
}

const initialState: MultiDrillHoleDataState = {
  selectedDrillHoles: [],
  filteredProjects: [],
  searchTerm: '',
  structureTypeFilter: 'all',
  depthRange: { min: 0, max: 1000 },
  sortBy: 'name',
  sortDirection: 'asc'
}

export function useMultiDrillHoleData(projects: Project[]): MultiDrillHoleDataReturn {
  const [state, setState] = useState<MultiDrillHoleDataState>(initialState)

  // Get all drill holes from all projects
  const allDrillHoles = useMemo(() => {
    return projects.flatMap(project => project.drillHoles)
  }, [projects])

  // Get unique structure types
  const structureTypes = useMemo(() => {
    const types = new Set<string>()
    allDrillHoles.forEach(dh => {
      dh.scenes.forEach(scene => {
        scene.structures.forEach(structure => {
          types.add(structure.structureType)
        })
      })
    })
    return Array.from(types).sort()
  }, [allDrillHoles])

  // Calculate depth statistics
  const depthStatistics = useMemo(() => {
    if (allDrillHoles.length === 0) {
      return { min: 0, max: 0, avg: 0 }
    }
    
    const depths = allDrillHoles.map(dh => dh.totalDepth)
    return {
      min: Math.min(...depths),
      max: Math.max(...depths),
      avg: depths.reduce((sum, depth) => sum + depth, 0) / depths.length
    }
  }, [allDrillHoles])

  // Filter drill holes based on current filters
  const filteredDrillHoles = useMemo(() => {
    let filtered = allDrillHoles

    // Search filter
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase()
      filtered = filtered.filter(dh => 
        dh.name.toLowerCase().includes(term) ||
        dh.info.holeName.toLowerCase().includes(term)
      )
    }

    // Structure type filter
    if (state.structureTypeFilter !== 'all') {
      filtered = filtered.filter(dh => {
        const hasStructureType = dh.scenes.some(scene =>
          scene.structures.some(structure => 
            structure.structureType === state.structureTypeFilter
          )
        )
        return hasStructureType
      })
    }

    // Depth range filter
    filtered = filtered.filter(dh => 
      dh.totalDepth >= state.depthRange.min && 
      dh.totalDepth <= state.depthRange.max
    )

    // Sort
    filtered.sort((a, b) => {
      let aVal: string | number
      let bVal: string | number

      switch (state.sortBy) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'depth':
          aVal = a.totalDepth
          bVal = b.totalDepth
          break
        case 'structures':
          aVal = a.scenes.reduce((sum, scene) => sum + scene.structures.length, 0)
          bVal = b.scenes.reduce((sum, scene) => sum + scene.structures.length, 0)
          break
        case 'date':
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
          break
        default:
          aVal = a.name
          bVal = b.name
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return state.sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      } else {
        return state.sortDirection === 'asc' 
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number)
      }
    })

    return filtered
  }, [allDrillHoles, state])

  // Get selected drill holes data
  const selectedDrillHolesData = useMemo(() => {
    return allDrillHoles.filter(dh => state.selectedDrillHoles.includes(dh.id))
  }, [allDrillHoles, state.selectedDrillHoles])

  // Calculate statistics for selected drill holes
  const totalStructures = useMemo(() => {
    return selectedDrillHolesData.reduce((sum, dh) => 
      sum + dh.scenes.reduce((s, scene) => s + scene.structures.length, 0), 0
    )
  }, [selectedDrillHolesData])

  const totalDepth = useMemo(() => {
    return selectedDrillHolesData.reduce((sum, dh) => sum + dh.totalDepth, 0)
  }, [selectedDrillHolesData])

  const structureStatistics = useMemo(() => {
    const allStructures = selectedDrillHolesData.flatMap(dh => 
      dh.scenes.flatMap(scene => scene.structures)
    )

    const byType = allStructures.reduce((acc, structure) => {
      acc[structure.structureType] = (acc[structure.structureType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const avgPerMeter = totalDepth > 0 ? totalStructures / totalDepth : 0

    return {
      total: totalStructures,
      byType,
      avgPerMeter
    }
  }, [selectedDrillHolesData, totalStructures, totalDepth])

  // Actions
  const setSelectedDrillHoles = useCallback((ids: string[]) => {
    setState(prev => ({ ...prev, selectedDrillHoles: ids }))
  }, [])

  const toggleDrillHoleSelection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedDrillHoles: prev.selectedDrillHoles.includes(id)
        ? prev.selectedDrillHoles.filter(dhId => dhId !== id)
        : [...prev.selectedDrillHoles, id]
    }))
  }, [])

  const selectAllDrillHoles = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedDrillHoles: allDrillHoles.map(dh => dh.id)
    }))
  }, [allDrillHoles])

  const deselectAllDrillHoles = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedDrillHoles: []
    }))
  }, [])

  const setSearchTerm = useCallback((term: string) => {
    setState(prev => ({ ...prev, searchTerm: term }))
  }, [])

  const setStructureTypeFilter = useCallback((type: string) => {
    setState(prev => ({ ...prev, structureTypeFilter: type }))
  }, [])

  const setDepthRange = useCallback((range: { min: number; max: number }) => {
    setState(prev => ({ ...prev, depthRange: range }))
  }, [])

  const setSortBy = useCallback((field: 'name' | 'depth' | 'structures' | 'date') => {
    setState(prev => ({ ...prev, sortBy: field }))
  }, [])

  const setSortDirection = useCallback((direction: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortDirection: direction }))
  }, [])

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchTerm: '',
      structureTypeFilter: 'all',
      depthRange: { min: 0, max: 1000 },
      sortBy: 'name',
      sortDirection: 'asc'
    }))
  }, [])

  // Initialize selected drill holes when projects change
  useMemo(() => {
    if (allDrillHoles.length > 0 && state.selectedDrillHoles.length === 0) {
      setSelectedDrillHoles(allDrillHoles.map(dh => dh.id))
    }
  }, [allDrillHoles, state.selectedDrillHoles.length, setSelectedDrillHoles])

  return {
    state,
    actions: {
      setSelectedDrillHoles,
      toggleDrillHoleSelection,
      selectAllDrillHoles,
      deselectAllDrillHoles,
      setSearchTerm,
      setStructureTypeFilter,
      setDepthRange,
      setSortBy,
      setSortDirection,
      resetFilters
    },
    computed: {
      allDrillHoles,
      filteredDrillHoles,
      selectedDrillHolesData,
      totalStructures,
      totalDepth,
      structureTypes,
      depthStatistics,
      structureStatistics
    }
  }
}
