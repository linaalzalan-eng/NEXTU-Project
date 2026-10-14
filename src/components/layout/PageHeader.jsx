import { useI18n } from '@/lib/i18n/useI18n.js'

/** Page title block (eyebrow, h1, lede). Also sets the document title. */
export function PageHeader({ eyebrow, title, lede }) {
  const { t } = useI18n()

  return (
    <header className="mb-8 lg:mb-10">
      <title>{`${title} · ${t('app.name')}`}</title>
      <div>
        {eyebrow && <p className="text-sm font-medium text-ink-3">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold text-ink lg:text-3xl">{title}</h1>
        {lede && <p className="mt-2 max-w-prose text-ink-2">{lede}</p>}
      </div>
    </header>
  )
}
