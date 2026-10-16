import {
  ISSUE_STATUSES,
  STATUS_LABEL,
  PRIORITY_LABEL,
  type Issue,
  type Project,
} from '@raven/shared'
import { Box, Tag } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar } from './Avatar.tsx'
import { LabelChip } from './LabelChip.tsx'
import { PriorityIcon } from './PriorityIcon.tsx'
import { StatusIcon } from './StatusIcon.tsx'
import { PropertyPicker } from './PropertyPicker.tsx'
import { Button } from './ui/button.tsx'
import { useLabels } from '../hooks/useLabels.ts'
import type { useUpdateIssue } from '../hooks/useUpdateIssue.ts'

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
  updateIssue: ReturnType<typeof useUpdateIssue>
}

export function IssueProperties({ issue, project, updateIssue }: IssuePropertiesProps) {
  const labelsQuery = useLabels()

  return (
    <div className="flex flex-col gap-8">
      <PropertySection title="Properties">
        <PropertyPicker
          label="状态"
          disabled={updateIssue.isPending}
          onOpen={() => updateIssue.reset()}
          options={ISSUE_STATUSES.map((status) => ({
            value: status,
            label: STATUS_LABEL[status],
            icon: <StatusIcon status={status} />,
            selected: status === issue.status,
            onSelect: () => {
              if (status !== issue.status) updateIssue.mutate({ status })
            },
          }))}
        >
          <StatusIcon status={issue.status} />
          <span>{STATUS_LABEL[issue.status]}</span>
        </PropertyPicker>
        <PropertyPicker
          label="优先级"
          disabled={updateIssue.isPending}
          onOpen={() => updateIssue.reset()}
          options={([0, 1, 2, 3, 4] as const).map((priority) => ({
            value: String(priority),
            label: PRIORITY_LABEL[priority],
            icon: <PriorityIcon priority={priority} />,
            selected: priority === issue.priority,
            onSelect: () => {
              if (priority !== issue.priority) updateIssue.mutate({ priority })
            },
          }))}
        >
          <PriorityIcon priority={issue.priority} />
          <span>{PRIORITY_LABEL[issue.priority]}</span>
        </PropertyPicker>
        <PropertyItem
          icon={<Avatar user={issue.assignee} />}
          label={issue.assignee ? issue.assignee.name : 'Assign'}
          muted={issue.assignee === null}
        />
      </PropertySection>

      <PropertySection title="Labels">
        <PropertyPicker
          label="标签"
          disabled={updateIssue.isPending || !labelsQuery.isSuccess}
          onOpen={() => updateIssue.reset()}
          options={(labelsQuery.data ?? []).map((label) => ({
            value: String(label.id),
            label: label.name,
            icon: (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: label.color }}
              />
            ),
            selected: issue.labels.some((item) => item.id === label.id),
            onSelect: () => {
              const selected = issue.labels.some((item) => item.id === label.id)
              const labelIds = selected
                ? issue.labels.filter((item) => item.id !== label.id).map((item) => item.id)
                : [...issue.labels.map((item) => item.id), label.id]
              updateIssue.mutate({ labelIds })
            },
          }))}
        >
          <Tag data-icon="inline-start" />
          {issue.labels.length > 0 ? (
            <span className="flex min-w-0 flex-wrap gap-1.5">
              {issue.labels.map((label) => (
                <LabelChip key={label.id} label={label} />
              ))}
            </span>
          ) : (
            <span>Add label</span>
          )}
        </PropertyPicker>
        {labelsQuery.isPending && (
          <p role="status" className="px-2 text-xs text-fg-muted">
            加载标签中…
          </p>
        )}
        {labelsQuery.isError && (
          <div role="alert" className="px-2 text-xs text-destructive">
            标签加载失败。
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={labelsQuery.isFetching}
              onClick={() => labelsQuery.refetch()}
            >
              重试
            </Button>
          </div>
        )}
      </PropertySection>

      <PropertySection title="Project">
        <PropertyItem icon={<Box className="size-4 text-fg-muted" />} label={project.name} />
      </PropertySection>
    </div>
  )
}
