import { useSearchParams } from 'react-router'

/** PHASE 2 PREVIEW ONLY (D-22): 'empty' when the URL has ?preview=empty, otherwise 'sample'. */
export function usePreviewState() {
  const [searchParams] = useSearchParams()
  return searchParams.get('preview') === 'empty' ? 'empty' : 'sample'
}
