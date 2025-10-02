'use client'

import { useState, useMemo } from 'react'
import type { Project, Structure } from '@/types/geostxr-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface StructureTableProps {
  projects: Project[]
}

type SortField = 'depth' | 'type' | 'alpha' | 'beta' | 'dipReal' | 'dipDirection'
type SortDirection = 'asc' | 'desc'

export function StructureTable({ projects }: StructureTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('depth')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  
  // Recopilar todas las estructuras con información del sondaje
  const allStructures = useMemo(() => {
    const structures: (Structure & { drillHoleName: string; projectName: string })[] = []
    
    projects.forEach(project => {
      project.drillHoles.forEach(dh => {
        dh.scenes.forEach(scene => {
          scene.structures.forEach(structure => {
            structures.push({
              ...structure,
              drillHoleName: dh.name,
              projectName: project.name
            })
          })
        })
      })
    })
    
    return structures
  }, [projects])
  
  // Obtener tipos únicos
  const uniqueTypes = useMemo(() => {
    const types = new Set(allStructures.map(s => s.structureType))
    return Array.from(types).sort()
  }, [allStructures])
  
  // Filtrar y ordenar
  const filteredStructures = useMemo(() => {
    let filtered = allStructures
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(s => 
        s.structureType.toLowerCase().includes(term) ||
        s.drillHoleName.toLowerCase().includes(term) ||
        s.projectName.toLowerCase().includes(term)
      )
    }
    
    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(s => s.structureType === typeFilter)
    }
    
    // Ordenamiento
    filtered.sort((a, b) => {
      let aVal: number, bVal: number
      
      switch (sortField) {
        case 'depth':
          aVal = a.depth
          bVal = b.depth
          break
        case 'alpha':
          aVal = a.alpha
          bVal = b.alpha
          break
        case 'beta':
          aVal = a.beta
          bVal = b.beta
          break
        case 'dipReal':
          aVal = a.dipReal
          bVal = b.dipReal
          break
        case 'dipDirection':
          aVal = a.dipDirection
          bVal = b.dipDirection
          break
        case 'type':
          return sortDirection === 'asc' 
            ? a.structureType.localeCompare(b.structureType)
            : b.structureType.localeCompare(a.structureType)
        default:
          aVal = a.depth
          bVal = b.depth
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
    
    return filtered
  }, [allStructures, searchTerm, typeFilter, sortField, sortDirection])
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  const exportToCSV = () => {
    const headers = [
      'Proyecto',
      'Sondaje',
      'Tipo',
      'Profundidad_m',
      'Alpha_grados',
      'Beta_grados',
      'AC_grados',
      'Dip_Real_grados',
      'Dip_Direction_grados',
      'UTM_Este_m',
      'UTM_Norte_m',
      'Elevacion_m'
    ]
    
    const rows = filteredStructures.map(s => [
      s.projectName,
      s.drillHoleName,
      s.structureType,
      (s.depth / 100).toFixed(2),
      s.alpha.toFixed(2),
      s.beta.toFixed(2),
      s.ac.toFixed(2),
      s.dipReal.toFixed(2),
      s.dipDirection.toFixed(2),
      s.utmEast.toFixed(2),
      s.utmNorth.toFixed(2),
      s.elevationMeters.toFixed(2)
    ])
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `estructuras_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }
  
  if (allStructures.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-lg rounded-xl p-12 border border-white/10 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-white mb-2">
          No hay estructuras para mostrar
        </h3>
        <p className="text-gray-400">
          Importa datos para ver la tabla de estructuras
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Filtros y búsqueda */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por tipo, sondaje o proyecto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {uniqueTypes.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700"
          >
            📥 Exportar CSV
          </Button>
        </div>
        
        <div className="mt-3 text-sm text-gray-300">
          Mostrando {filteredStructures.length} de {allStructures.length} estructuras
        </div>
      </div>
      
      {/* Tabla */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/10 border-b border-white/20">
              <tr>
                <th className="px-4 py-3 text-left text-white font-semibold">Proyecto</th>
                <th className="px-4 py-3 text-left text-white font-semibold">Sondaje</th>
                <th 
                  className="px-4 py-3 text-left text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('type')}
                >
                  Tipo {sortField === 'type' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('depth')}
                >
                  Prof. (m) {sortField === 'depth' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('alpha')}
                >
                  Alpha° {sortField === 'alpha' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('beta')}
                >
                  Beta° {sortField === 'beta' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('dipReal')}
                >
                  Dip° {sortField === 'dipReal' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-right text-white font-semibold cursor-pointer hover:bg-white/10"
                  onClick={() => handleSort('dipDirection')}
                >
                  Dip Dir° {sortField === 'dipDirection' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-white font-semibold">UTM Este</th>
                <th className="px-4 py-3 text-right text-white font-semibold">UTM Norte</th>
                <th className="px-4 py-3 text-right text-white font-semibold">Elevación</th>
              </tr>
            </thead>
            <tbody>
              {filteredStructures.map((structure, idx) => (
                <tr 
                  key={structure.id}
                  className={`border-b border-white/10 hover:bg-white/5 ${
                    idx % 2 === 0 ? 'bg-white/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-gray-300">{structure.projectName}</td>
                  <td className="px-4 py-3 text-gray-300">{structure.drillHoleName}</td>
                  <td className="px-4 py-3">
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${structure.color}40`,
                        color: structure.color
                      }}
                    >
                      {structure.structureType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {(structure.depth / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.alpha.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.beta.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.dipReal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.dipDirection.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.utmEast.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.utmNorth.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {structure.elevationMeters.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

