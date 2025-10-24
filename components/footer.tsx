import Link from "next/link"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-bold text-lg mb-4">Municipio de Chía</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Portal oficial de atención ciudadana del Municipio de Chía, Cundinamarca.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tramites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Trámites y Servicios
                </Link>
              </li>
              <li>
                <Link href="/#paco" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Puntos PACO
                </Link>
              </li>
              <li>
                <a
                  href="https://www.chia-cundinamarca.gov.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sitio Web Oficial
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">+57 601 8844444</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">contactenos@chia.gov.co</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-muted-foreground">Carrera 9 # 11-75, Chía, Cundinamarca</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hours */}
          <div>
            <h3 className="font-bold text-lg mb-4">Horario de Atención</h3>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p>Lunes a Viernes</p>
                <p className="font-medium">8:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Municipio de Chía. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
