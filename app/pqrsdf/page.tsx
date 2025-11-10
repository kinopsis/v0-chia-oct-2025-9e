import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ExternalLink, AlertCircle, CheckCircle2, Clock, Scale } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="border-b border-border bg-gradient-to-br from-primary/10 via-background to-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <h1 className="text-3xl font-bold">Radicar PQRSDF</h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Peticiones, Quejas, Reclamos, Sugerencias, Denuncias y Felicitaciones
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* What is PQRSDF */}
            <Card>
              <CardHeader>
                <CardTitle>¿Qué es una PQRSDF?</CardTitle>
                <CardDescription>
                  Mecanismo constitucional para la participación ciudadana y el ejercicio de derechos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Las PQRSDF son un derecho fundamental consagrado en el Artículo 23 de la Constitución Política de
                  Colombia, que permite a los ciudadanos presentar solicitudes respetuosas ante las autoridades por
                  motivos de interés general o particular y obtener pronta resolución.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <FileText className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Petición</h4>
                      <p className="text-xs text-muted-foreground">
                        Solicitud de información, documentos o actuaciones
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Queja</h4>
                      <p className="text-xs text-muted-foreground">
                        Manifestación de inconformidad por un servicio o actuación
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Reclamo</h4>
                      <p className="text-xs text-muted-foreground">
                        Solicitud de corrección de una situación irregular
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Sugerencia</h4>
                      <p className="text-xs text-muted-foreground">Propuesta de mejora o recomendación</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                        <Scale className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Denuncia</h4>
                      <p className="text-xs text-muted-foreground">Reporte de irregularidades o actos de corrupción</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Felicitación</h4>
                      <p className="text-xs text-muted-foreground">Reconocimiento por buen servicio o gestión</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Framework */}
            <Card>
              <CardHeader>
                <CardTitle>Marco Normativo</CardTitle>
                <CardDescription>Legislación colombiana que regula las PQRSDF</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Constitución Política de Colombia</h4>
                    <p className="text-xs text-muted-foreground">
                      Artículo 23: Derecho de petición ante autoridades públicas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Ley 1755 de 2015</h4>
                    <p className="text-xs text-muted-foreground">
                      Regula el derecho fundamental de petición y establece términos de respuesta
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Código de Procedimiento Administrativo (Ley 1437 de 2011)
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Artículos 13 a 33: Procedimientos para peticiones ante entidades públicas
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <Scale className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Ley 1712 de 2014</h4>
                    <p className="text-xs text-muted-foreground">
                      Ley de Transparencia y Acceso a la Información Pública
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response Times */}
            <Card>
              <CardHeader>
                <CardTitle>Términos de Respuesta</CardTitle>
                <CardDescription>Plazos legales establecidos por la Ley 1755 de 2015</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Peticiones Generales</h4>
                    <p className="text-xs text-muted-foreground">15 días hábiles para responder</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Consultas sobre Documentos</h4>
                    <p className="text-xs text-muted-foreground">10 días hábiles para responder</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">Peticiones entre Autoridades</h4>
                    <p className="text-xs text-muted-foreground">10 días hábiles para responder</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  <strong>Nota:</strong> Los términos pueden prorrogarse por 10 días hábiles adicionales cuando sea
                  necesario realizar consultas o recaudar información adicional.
                </p>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>Radicar su PQRSDF</CardTitle>
                <CardDescription>Acceda al sistema oficial de radicación del Municipio de Chía</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Para radicar su Petición, Queja, Reclamo, Sugerencia, Denuncia o Felicitación, haga clic en el botón a
                  continuación para acceder al portal oficial de radicación.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="http://200.122.252.9:8083/Proceso/PQRs.aspx" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="w-full sm:w-auto">
                      <FileText className="h-5 w-5 mr-2" />
                      Ir al Portal de Radicación
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/#paco">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                      Ver Puntos de Atención PACO
                    </Button>
                  </Link>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 mt-4">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    También puede radicar su PQRSDF de manera presencial en cualquiera de nuestros Puntos de Atención al
                    Ciudadano (PACO) durante el horario de atención.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
