/**
 * Utility functions for validating tramite data
 */

/**
 * Validates that the requiere_pago field has a valid value
 * @param value The value to validate
 * @returns boolean indicating if the value is valid
 */
export function isValidRequierePago(value: any): boolean {
  return value === "Sí" || value === "No" || value === null || value === undefined || value === ""
}

/**
 * Normalizes the requiere_pago field value
 * @param value The value to normalize
 * @returns normalized value or empty string if invalid
 */
export function normalizeRequierePago(value: any): string | null {
  if (value === "Sí" || value === "No") {
    return value
  }
  if (value === null || value === undefined || value === "") {
    return null
  }
  return null // For invalid values, return null instead of empty string
}

/**
 * Validates tramite data object
 * @param tramiteData The tramite data to validate
 * @returns array of error messages
 */
export function validateTramiteData(tramiteData: any): string[] {
  const errors: string[] = []

  // Validate requiere_pago field
  if (tramiteData.requiere_pago !== undefined && !isValidRequierePago(tramiteData.requiere_pago)) {
    errors.push("El campo 'requiere_pago' solo puede tener los valores 'Sí', 'No', o estar vacío")
  }

  return errors
}

/**
 * Server-side validation for requiere_pago field
 * @param value The value to validate
 * @returns object with isValid boolean and normalized value
 */
export function validateAndNormalizeRequierePago(value: any): { isValid: boolean; normalizedValue: string | null } {
  if (value === "Sí" || value === "No") {
    return { isValid: true, normalizedValue: value }
  }
  if (value === null || value === undefined || value === "") {
    return { isValid: true, normalizedValue: null }
  }
  return { isValid: false, normalizedValue: null }
}