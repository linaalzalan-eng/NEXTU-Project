import { useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n/useI18n.js'

/**
 * The shared mechanics of the four account forms (login, register, forgot, reset):
 * field values, inline errors from a validator in lib/authValidation.js (VR-01, VR-02,
 * VR-05), focus on the first invalid field, a loading state that blocks double
 * submission (US-02), and the ServiceError of a failed submit for the form to explain.
 *
 * `onSubmit(values)` runs only when the values are valid. If it rejects, the error is
 * kept in `formError`; if it resolves, the form decides what comes next.
 */
export function useAuthForm({ initialValues, validate, onSubmit }) {
  const { t } = useI18n()
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const inputs = useRef({})
  // A ref, so a second Enter in the same moment is blocked before the re-render.
  const inFlight = useRef(false)

  /** Props for an <Input>: value, change handler, translated error, and a ref for focusing. */
  function field(name) {
    return {
      name,
      value: values[name],
      ref: (element) => {
        inputs.current[name] = element
      },
      onChange: (event) => {
        const { value } = event.target
        setValues((current) => ({ ...current, [name]: value }))
        if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
      },
      error: errors[name] && t(`validation.${name}.${errors[name]}`),
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (inFlight.current) return
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setFormError(null)
    const firstInvalid = Object.keys(initialValues).find((name) => nextErrors[name])
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus()
      return
    }

    inFlight.current = true
    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (caught) {
      setFormError(caught)
    } finally {
      inFlight.current = false
      setSubmitting(false)
    }
  }

  return { values, field, formError, submitting, handleSubmit }
}
