import { Inbox, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader.jsx'
import { Alert } from '@/components/ui/Alert.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { Card } from '@/components/ui/Card.jsx'
import { Dialog } from '@/components/ui/Dialog.jsx'
import { EmptyState } from '@/components/ui/EmptyState.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { ProgressBar } from '@/components/ui/ProgressBar.jsx'
import { useToast } from '@/components/ui/useToast.js'
import { useI18n } from '@/lib/i18n/useI18n.js'

/** Development-only page (route /ui, D-22) for reviewing every component and state. */
export default function UiGalleryPage() {
  const { t } = useI18n()
  const { showToast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <PageHeader title={t('gallery.title')} lede={t('gallery.lede')} />

      <div className="flex flex-col gap-6">
        <Card title={t('gallery.buttons')}>
          <div className="flex flex-wrap items-center gap-3">
            <Button>{t('gallery.primary')}</Button>
            <Button variant="secondary">{t('gallery.secondary')}</Button>
            <Button variant="ghost">{t('gallery.ghost')}</Button>
            <Button variant="danger">{t('gallery.danger')}</Button>
            <Button icon={Plus}>{t('gallery.add')}</Button>
            <Button size="sm">{t('gallery.small')}</Button>
            <Button loading>{t('gallery.loading')}</Button>
            <Button disabled>{t('gallery.disabled')}</Button>
            <Button variant="secondary" icon={Trash2} iconOnly aria-label={t('gallery.danger')} />
          </div>
        </Card>

        <Card title={t('gallery.inputs')}>
          <div className="grid gap-5 md:grid-cols-3">
            <Input label={t('gallery.titleLabel')} />
            <Input label={t('gallery.titleLabel')} hint={t('gallery.titleHint')} />
            <Input label={t('gallery.titleLabel')} error={t('gallery.titleError')} />
          </div>
        </Card>

        <Card title={t('gallery.feedback')}>
          <div className="flex flex-col gap-3">
            <Alert>{t('gallery.alertInfo')}</Alert>
            <Alert variant="success">{t('gallery.alertSuccess')}</Alert>
            <Alert variant="warning">{t('gallery.alertWarning')}</Alert>
            <Alert variant="danger">{t('gallery.alertDanger')}</Alert>
          </div>
        </Card>

        <Card title={t('gallery.progress')}>
          <div className="flex flex-col gap-4">
            {[0, 45, 100, null].map((value) => (
              <ProgressBar
                key={String(value)}
                value={value}
                label={t('gallery.progressLabel')}
                emptyText={t('dashboard.noTasksValue')}
              />
            ))}
          </div>
        </Card>

        <Card title={t('gallery.empty')}>
          <EmptyState icon={Inbox} title={t('gallery.emptyTitle')} headingLevel="h3">
            {t('gallery.emptyBody')}
          </EmptyState>
        </Card>

        <Card title={t('gallery.overlays')}>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              {t('gallery.openDialog')}
            </Button>
            <Button variant="secondary" onClick={() => showToast({ message: t('gallery.toastText'), variant: 'success' })}>
              {t('gallery.showToast')}
            </Button>
          </div>
        </Card>
      </div>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={t('gallery.dialogTitle')}
        description={t('gallery.dialogBody')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="danger" onClick={() => setDialogOpen(false)}>
              {t('gallery.dialogConfirm')}
            </Button>
          </>
        }
      />
    </>
  )
}
