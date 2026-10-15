import { Link, useParams } from 'react-router'
import { mockIssues } from '../mocks/issues'
import { NotFoundPage } from './NotFoundPage'
import { mockProject } from '../mocks/projects'
import { ChevronRight } from 'lucide-react'

export function IssueDetailPage() {
  const { identifier } = useParams()
  const issue = mockIssues.find((item) => item.identifier === identifier)

  if (!issue) {
    return <NotFoundPage />
  }

  return (
    <div className="p-6">
      {/*面包屑: 项目名 > 编号 */}
      <nav className="flex items-center gap-1 text-fg-muted">
        <Link to={`/projects/${mockProject.key}/issues`} className="hover:text-fg">
          {mockProject.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-fg">{issue.identifier}</span>
      </nav>

      <h1 className="mt-6 text-2xl font-semibold">{issue.title}</h1>
    </div>
  )
}
