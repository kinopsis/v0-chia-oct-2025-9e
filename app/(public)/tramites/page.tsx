import { Footer } from "@/components/footer"
import { TramitesCatalog } from "@/components/tramites-catalog"
import { fetchProceduresFromDB } from "@/lib/data"

export default async function Page({ searchParams }: { searchParams: { categoria?: string } }) {
  const procedures = await fetchProceduresFromDB()
  const params = await searchParams
  const initialCategory = params.categoria || null

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">Trámites y Servicios</h1>
            <p className="text-muted-foreground">
              Explora nuestro catálogo completo de {procedures.length} trámites municipales
            </p>
          </div>
        </div>
        <TramitesCatalog initialProcedures={procedures} initialCategory={initialCategory} />
      </main>
      <Footer />
    </div>
  )
}
