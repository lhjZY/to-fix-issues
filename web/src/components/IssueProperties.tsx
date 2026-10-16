import { PRIORITY_LABEL, type Issue, type Project } from '@raven/shared'
import { Box, Tag } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar } from './Avatar.tsx'
import { LabelChip } from './LabelChip.tsx'
import { PriorityIcon } from './PriorityIcon.tsx'
import { StatusPicker } from './StatusPicker.tsx'

type PropertySectionProps = {
  title: string
  children: ReactNode
}

// 一个区块：小标题 + 内容
function PropertySection({ title, children }: PropertySectionProps) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-medium text-fg-subtle">{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  )
}

type PropertyItemProps = {
  icon: ReactNode
  label: string
  muted?: boolean
}

// 一行属性：图标 + 文字；muted 用于"未设置"的状态
function PropertyItem({ icon, label, muted = false }: PropertyItemProps) {
  return (
    <div className="flex h-8 items-center gap-2.5 rounded-md px-2">
      <span className="flex size-5 items-center justify-center">{icon}</span>
      <span className={muted ? 'text-fg-subtle' : 'text-fg'}>{label}</span>
    </div>
  )
}

type IssuePropertiesProps = {
  issue: Issue
  project: Project
}

export function IssueProperties({ issue, project }: IssuePropertiesProps) {
  return (
    <div className="flex flex-col gap-8">
      <PropertySection title="Properties">
        <StatusPicker key={issue.identifier} issue={issue} projectKey={project.key} />
        <PropertyItem
          icon={<PriorityIcon priority={issue.priority} />}
          label={PRIORITY_LABEL[issue.priority]}
          muted={issue.priority === 0}
        />
        <PropertyItem
          icon={<Avatar user={issue.assignee} />}
          label={issue.assignee ? issue.assignee.name : 'Assign'}
          muted={issue.assignee === null}
        />
      </PropertySection>

      <PropertySection title="Labels">
        {issue.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 px-2">
            {issue.labels.map((label) => (
              <LabelChip key={label.id} label={label} />
            ))}
          </div>
        ) : (
          <PropertyItem icon={<Tag className="size-4 text-fg-subtle" />} label="Add label" muted />
        )}
      </PropertySection>

      <PropertySection title="Project">
        <PropertyItem icon={<Box className="size-4 text-fg-muted" />} label={project.name} />
      </PropertySection>
    </div>
  )
}
