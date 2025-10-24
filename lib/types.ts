export interface Procedure {
  id: number
  nombre_tramite: string
  descripcion: string
  categoria: string
  modalidad: string
  formulario: string
  dependencia_nombre: string
  subdependencia_nombre: string
  requiere_pago: string
  tiempo_respuesta: string
  requisitos: string
  instrucciones: string
  url_suit: string
  url_gov: string
}

export type Category =
  | "Vivienda"
  | "Educación"
  | "Impuestos"
  | "Salud"
  | "Tránsito"
  | "SISBEN"
  | "Medio Ambiente"
  | "Emprendimiento"
