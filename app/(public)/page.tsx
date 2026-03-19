import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { AccessibilityWrapper } from "@/components/accessibility-wrapper"
import {
  Building2,
  DollarSign,
  Car,
  Users,
  MapPin,
  Phone,
  Clock,
  ArrowRight,
  Search,
  FileText,
  Mail, // Added Mail
  ExternalLink, // Added ExternalLink
  Star, // Added Star
  CheckCircle2,
} from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="relative h-[180px] md:h-[260px] flex items-center justify-center overflow-hidden">
            <Image
              src="/hero-chia.png"
              alt="Panorámica de Chía"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative container mx-auto px-4 text-center">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg"
                style={{ fontFamily: 'var(--font-futura-bold)' }}
              >
                Portal de atención ciudadana
              </h1>
            </div>
          </div>
        </section>

        {/* Sección de Canales de Atención Rediseñada */}
        <section id="canales" className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-futura-bold)' }}>Canales de Atención</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos más cerca de ti. Elige el medio que mejor se adapte a tus necesidades para recibir atención personalizada.
              </p>
            </div>

            <div className="space-y-12 max-w-5xl mx-auto">
              {/* Canales Presenciales */}
              <div>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary" style={{ fontFamily: 'var(--font-futura-medium)' }}>
                  <div className="h-1 w-8 bg-primary rounded-full" />
                  Canales Presenciales
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* PACO 1 */}
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center p-6 gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#009540] to-[#00b34d] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground mb-0.5" style={{ fontFamily: 'var(--font-futura-bold)' }}>PACO 1 — Alcaldía Chía</h4>
                          <p className="text-xs text-muted-foreground mb-2">Carrera 9 # 11-24, Chía</p>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                              <Clock className="h-3 w-3" /> L-V 8:00 AM - 4:30 PM
                            </span>
                            <Badge variant="outline" className="text-[10px] font-medium border-primary/20 text-primary bg-primary/5">Punto Principal</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PACO 2 */}
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group bg-white/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                      <div className="flex items-center p-6 gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#009540] to-[#00b34d] flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground mb-0.5" style={{ fontFamily: 'var(--font-futura-bold)' }}>PACO 2 — C.C. Vivenza</h4>
                          <p className="text-xs text-muted-foreground mb-2">Avenida Pradilla # 2-71 (Segundo Piso)</p>
                          <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                              <Clock className="h-3 w-3" /> L-V 8:30 AM - 4:40 PM
                            </span>
                            <Badge variant="outline" className="text-[10px] font-medium border-primary/20 text-primary bg-primary/5">Sede Norte</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-balance">Servicios Principales</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Explora nuestras categorías de servicios más solicitados
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Link href="/tramites?categoria=Vivienda" className="block">
                <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Vivienda</CardTitle>
                    <CardDescription>Licencias, permisos y conceptos de construcción</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tramites?categoria=Impuestos" className="block">
                <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Impuestos</CardTitle>
                    <CardDescription>Predial, industria y comercio, y otros tributos</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tramites?categoria=Tránsito" className="block">
                <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">Tránsito</CardTitle>
                    <CardDescription>Comparendos, licencias y trámites vehiculares</CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/tramites?categoria=SISBEN" className="block">
                <Card className="hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">SISBEN</CardTitle>
                    <CardDescription>Inscripción, actualización y consultas</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-balance">Cómo Funciona</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Realiza tus trámites en tres simples pasos
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Busca tu Trámite</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Encuentra el servicio que necesitas usando nuestro buscador o navegando por categorías
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Revisa los Requisitos</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Consulta la información detallada sobre documentos, costos y tiempos de respuesta
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">Realiza tu Trámite</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  Visita nuestros puntos PACO o realiza tu trámite en línea según la modalidad disponible
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">108</CardTitle>
                  <CardDescription className="text-base">Trámites y Servicios</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">8</CardTitle>
                  <CardDescription className="text-base">Categorías de Servicio</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">1</CardTitle>
                  <CardDescription className="text-base">Puntos de Atención PACO</CardDescription>
                </CardHeader>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-4xl font-bold text-primary">24/7</CardTitle>
                  <CardDescription className="text-base">Consulta en Línea</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-balance">¿Necesitas Ayuda?</h2>
            <p className="text-lg mb-8 text-pretty max-w-2xl mx-auto opacity-90">
              Nuestro equipo está listo para asistirte con cualquier trámite o consulta que tengas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href="/tramites">Explorar Trámites</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="#paco">Contactar PACO</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AccessibilityWrapper />
    </div>
  )
}
