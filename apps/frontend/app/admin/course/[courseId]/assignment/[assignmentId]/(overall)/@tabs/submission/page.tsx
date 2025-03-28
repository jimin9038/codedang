import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import {
  SubmissionTable,
  SubmissionTableFallback
} from './_components/SubmissionTable'

export default function Submission({
  params
}: {
  params: { courseId: string; assignmentId: string }
}) {
  return (
    <ErrorBoundary fallback={FetchErrorFallback}>
      <Suspense fallback={<SubmissionTableFallback />}>
        <SubmissionTable
          groupId={Number(params.courseId)}
          assignmentId={Number(params.assignmentId)}
        />
      </Suspense>
    </ErrorBoundary>
  )
}
