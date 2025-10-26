import { searchProcedures, normalizarTexto } from '@/lib/data'
import { TramitesTable } from '@/components/admin/tramites-table'
import { TramitesCatalog } from '@/components/tramites-catalog'
import { fetchProceduresFromDB } from '@/lib/data'

export default function ConsistencyTestPage() {
  // Esta página se puede usar para pruebas manuales de consistencia
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pruebas de Consistencia entre Interfaces</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Interfaz Pública</h2>
          <div className="border p-4 rounded-lg">
            {/* Aquí se puede integrar el componente público para pruebas */}
            <p>Componente de búsqueda pública</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Interfaz Administrativa</h2>
          <div className="border p-4 rounded-lg">
            {/* Aquí se puede integrar el componente administrativo para pruebas */}
            <p>Componente de búsqueda administrativa</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Resultados de Pruebas</h2>
        <div className="border p-4 rounded-lg bg-gray-50">
          <p>Los resultados de las pruebas se mostrarán aquí</p>
        </div>
      </div>
    </div>
  )
}