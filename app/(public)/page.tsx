import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  MessageSquareWarning,
  Headphones,
  BarChart3,
  Mail,
  Globe,
  ExternalLink,
  Star,
} from "lucide-react"

export default function Page() {
  const heroCards = [
    {
      icon: ClipboardList,
      title: "Trámites",
      description: "Inicia y gestiona tus trámites y servicios municipales en línea de manera rápida y segura.",
      buttonText: "Acceder",
      href: "/tramites",
    },
    {
      icon: FolderOpen,
      title: "Documentos Relacionados",
      description: "Descarga formularios, normativas y documentos de interés público.",
      buttonText: "Consultar",
      href: "/documentos",
    },
    {
      icon: MessageSquareWarning,
      title: "PQRDS",
      description: "Presenta peticiones, quejas, reclamos, denuncias y solicitudes.",
      buttonText: "Radicar",
      href: "/pqrsdf",
    },
    {
      icon: Headphones,
      title: "Canales de Atención",
      description: "Conoce nuestros puntos de atención y horarios de servicio.",
      buttonText: "Ver Puntos",
      href: "#canales",
    },
    {
      icon: BarChart3,
      title: "Informes Trimestrales",
      description: "Accede a los informes de gestión y cumplimiento trimestral.",
      buttonText: "Visualizar",
      href: "https://chia-cundinamarca.gov.co/web/2023/12/11-6-informes-direccion-centro-de-atencion-al-ciudadano/",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <section className="relative overflow-hidden">
          {/* Background image — compact */}
          <div className="relative h-[180px] md:h-[220px] lg:h-[260px]">
            <Image
              src="/Cabezote paco3.jpg.jpeg"
              alt="Vista panorámica de Chía, Cundinamarca"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/70" />

            {/* Hero content — text only */}
            <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-lg md:text-3xl lg:text-4xl" style={{ fontFamily: 'var(--font-futura-bold)' }}>
                Portal de atención ciudadana
              </h1>
            </div>
          </div>

          {/* Overlapping Cards */}
          <div className="relative -mt-20 md:-mt-24 z-10 pb-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
                {heroCards.map((card) => {
                  const IconComponent = card.icon
                  const isExternal = card.href.startsWith("http")
                  const linkProps = isExternal
                    ? { target: "_blank" as const, rel: "noopener noreferrer" }
                    : {}

                  return (
                    <div
                      key={card.title}
                      className="group bg-white dark:bg-card rounded-xl border-2 border-[#009540]/30 hover:border-[#009540] shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center p-5 hover:-translate-y-1"
                    >
                      {/* Icon */}
                      <div className="w-16 h-16 rounded-xl border-2 border-[#009540]/30 bg-[#e3f6eb] dark:bg-[#052e16] flex items-center justify-center mb-4 group-hover:bg-[#009540]/20 transition-colors">
                        <IconComponent className="h-8 w-8 text-[#009540]" />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-sm md:text-base mb-2 text-foreground leading-tight" style={{ fontFamily: 'var(--font-futura-bold)' }}>
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs md:text-sm text-muted-foreground mb-4 flex-1 leading-relaxed">
                        {card.description}
                      </p>

                      {/* Action Button */}
                      <Link href={card.href} {...linkProps} className="mt-auto">
                        <span className="inline-block px-5 py-2 rounded-full bg-[#009540] text-white text-sm font-semibold hover:bg-[#007b36] transition-colors shadow-md hover:shadow-lg">
                          {card.buttonText}
                        </span>
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Canales de Atención Section */}
        <section id="canales" className="py-16 md:py-24 bg-gradient-to-b from-muted/20 via-muted/40 to-muted/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#009540]/10 text-[#009540] text-xs font-semibold mb-4 uppercase tracking-wider">
                <Headphones className="h-4 w-4" />
                Atención al Ciudadano
              </span>
              <h2 className="text-3xl font-bold mb-4 text-balance" style={{ fontFamily: 'var(--font-futura-bold)' }}>Canales de Atención</h2>
              <p className="text-muted-foreground text-pretty max-w-xl mx-auto text-sm">
                Múltiples formas de comunicarte con nosotros. Elige el canal que más te convenga.
              </p>
            </div>

            {/* Presencial Row */}
            <div className="max-w-5xl mx-auto mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#009540]" />
                Canales Presenciales
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {/* PACO 1 */}
                <div className="group relative bg-white dark:bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-[#009540]/40 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#009540] rounded-l-2xl" />
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009540] to-[#007b36] flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground mb-0.5" style={{ fontFamily: 'var(--font-futura-bold)' }}>PACO 1 — Alcaldía Chía</h4>
                      <p className="text-xs text-muted-foreground mb-2">Carrera 9 # 11-24, Chía</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> L-V 8:00 AM - 4:30 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PACO 2 */}
                <div className="group relative bg-white dark:bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-[#009540]/40 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#009540] rounded-l-2xl" />
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#009540] to-[#007b36] flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-foreground mb-0.5" style={{ fontFamily: 'var(--font-futura-bold)' }}>PACO 2 — C.C. Vivenza</h4>
                      <p className="text-xs text-muted-foreground mb-2">Centro Comercial Vivenza, Local 106, Chía</p>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> L-V 8:00 AM - 4:30 PM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Virtual / Remote Row */}
            <div className="max-w-5xl mx-auto">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#009540]" />
                Canales Virtuales y Telefónicos
              </h3>
              <div className="grid md:grid-cols-3 gap-4">

                {/* Telefónico */}
                <div className="group bg-white dark:bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-[#ffdc00]/60 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#ffdc00] to-[#e6c600] flex items-center justify-center mb-3 shadow-md">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-futura-bold)' }}>Canal Telefónico</h4>
                  <a href="tel:+576018844444" className="text-base font-bold text-[#009540] hover:underline block mb-1">+57 601 8844444</a>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    <Clock className="h-3 w-3" /> L-V 8:00 AM - 5:00 PM
                  </span>
                  <a
                    href="https://chia-cundinamarca.gov.co/web/directorio/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-[#009540] hover:underline font-medium"
                  >
                    Directorio Telefónico <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* PQRSDF */}
                <div className="group bg-white dark:bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-[#009540]/40 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#009540] to-[#007b36] flex items-center justify-center mb-3 shadow-md">
                    <MessageSquareWarning className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-futura-bold)' }}>PQRSDF en Línea</h4>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Presente sus Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones.
                  </p>
                  <a
                    href="/pqrsdf"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#009540] text-white text-xs font-semibold hover:bg-[#007b36] transition-colors shadow-sm"
                  >
                    Radicar <ArrowRight className="h-3 w-3" />
                  </a>
                </div>

                {/* Correo */}
                <div className="group bg-white dark:bg-card rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/60 hover:border-[#ffdc00]/60 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#ffdc00] to-[#e6c600] flex items-center justify-center mb-3 shadow-md">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-bold text-sm mb-1" style={{ fontFamily: 'var(--font-futura-bold)' }}>Correo Electrónico</h4>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Envíe sus peticiones, serán radicadas por nuestro personal.
                  </p>
                  <a
                    href="mailto:contactenos@chia.gov.co"
                    className="inline-flex items-center gap-1.5 text-sm text-[#009540] font-semibold hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    contactenos@chia.gov.co
                  </a>
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
                  Visita nuestros canales de atención o realiza tu trámite en línea según la modalidad disponible
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
                  <CardDescription className="text-base">Canales de Atención</CardDescription>
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

        {/* Satisfaction Survey Section */}
        <section className="py-12 md:py-16 bg-gradient-to-r from-[#009540] via-[#00a849] to-[#009540] text-white relative overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border-4 border-white" />
            <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full border-4 border-white" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Star className="h-7 w-7 text-[#ffdc00]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-futura-bold)' }}>¿Cómo fue tu experiencia?</h3>
                  <p className="text-sm text-white/80">Tu opinión nos ayuda a mejorar. Completa nuestra encuesta de satisfacción.</p>
                </div>
              </div>
              <a
                href="https://forms.office.com/Pages/ResponsePage.aspx?id=2Lkf2Chp4kmNXOHhbrkfMazVw9IwrpZJjqTsW3PgErtURVk2V1JCVDkxTUY2RjhYOUtVWlU0NkoyRC4u&origin=QRCode"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#ffdc00] text-[#004b25] font-bold text-sm hover:bg-yellow-300 transition-colors shadow-lg hover:shadow-xl flex-shrink-0"
              >
                <Star className="h-4 w-4" />
                Responder Encuesta
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
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
                <Link href="#canales">Canales de Atención</Link>
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
