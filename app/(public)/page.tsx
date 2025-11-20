"use client"
import Link from "next/link"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"
import { AccessibilityMenu } from "@/components/accessibility-menu"
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
  CheckCircle2,
} from "lucide-react"

export default function Page() {
  const [isAccessibilityMenuOpen, setAccessibilityMenuOpen] = useState(false)
  const triggerRef = useRef(null)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Badge className="mb-4" variant="secondary">
                Portal Oficial
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl">
                Bienvenido al Portal Ciudadano de Chía
              </h1>
              <p className="mb-8 text-lg text-muted-foreground text-pretty md:text-xl">
                Accede a más de 100 trámites y servicios municipales de forma rápida y sencilla. Estamos aquí para
                servirte.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link href="/tramites">
                    Ver Trámites y Servicios
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
                  <Link href="#paco">Puntos de Atención PACO</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* PACO Locations Section */}
        <section id="paco" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-balance">Puntos de Atención PACO</h2>
              <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
                Visítanos en nuestros puntos de atención presencial para recibir asesoría personalizada
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* PACO Centro */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    PACO Centro
                  </CardTitle>
                  <CardDescription>Punto de Atención Principal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">Carrera 9 # 11-75, Centro, Chía</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-muted-foreground">Lunes a Viernes: 8:00 AM - 5:00 PM</p>
                      <p className="text-sm text-muted-foreground">Sábados: 9:00 AM - 1:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+57 601 8844444</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PACO Norte */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    PACO Norte
                  </CardTitle>
                  <CardDescription>Punto de Atención Auxiliar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Dirección</p>
                      <p className="text-sm text-muted-foreground">Calle 15 # 8-45, Sector Norte, Chía</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Horario</p>
                      <p className="text-sm text-muted-foreground">Lunes a Viernes: 8:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Teléfono</p>
                      <p className="text-sm text-muted-foreground">+57 601 8844444</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  <CardTitle className="text-4xl font-bold text-primary">2</CardTitle>
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
      <AccessibilityMenu
        isOpen={isAccessibilityMenuOpen}
        onClose={() => setAccessibilityMenuOpen(false)}
        triggerRef={triggerRef}
      />
    </div>
  )
}
