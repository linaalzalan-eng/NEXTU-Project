import { useI18n } from '@/lib/i18n/useI18n.js'

/** Title block for the account screens. Also sets the document title. */
export function AuthHeader({ title, lede }) {
  const { t } = useI18n()
  return (
    <div className="mb-8">
      <title>{`${title} · ${t('app.name')}`}</title>
      <h1 className="text-2xl font-semibold text-ink lg:text-3xl">{title}</h1>
      {lede && <p className="mt-2 text-ink-2">{lede}</p>}
    </div>
  )
}
