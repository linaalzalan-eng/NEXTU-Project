import { useI18n } from '@/lib/i18n/useI18n.js'

/** Page title block (eyebrow, h1, lede). Also sets the document title. */
export function PageHeader({ eyebrow, title, lede }) {
  const { t } = useI18n()

  return (
    <header className="mb-7 md:mb-8">
      <title>{`${title} · ${t('app.name')}`}</title>
      <div>
        {eyebrow && <p className="text-sm font-medium text-ink-3">{eyebrow}</p>}
        <h1 className="mt-1 text-[1.75rem] leading-snug font-semibold text-ink md:text-[2rem]">{title}</h1>
        {lede && <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-2 md:text-base">{lede}</p>}
      </div>
    </header>
  )
}
