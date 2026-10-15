import { zodResolver } from '@hookform/resolvers/zod'
import { CreateIssueInputSchema, STATUS_LABEL, type IssueStatus } from '@raven/shared'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'
import { useCreateIssue } from '../hooks/useCreateIssue.ts'
import { Button } from './ui/button.tsx'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog.tsx'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field.tsx'
import { Input } from './ui/input.tsx'
import { Textarea } from './ui/textarea.tsx'
import { StatusIcon } from './StatusIcon.tsx'

type CreateIssueDialogProps = {
  // 新建的 issue 默认使用的状态（从哪个分组点开的就用哪个状态）
  status: IssueStatus
  // 点击后打开弹窗的元素，比如分组头部的 + 按钮
  trigger: ReactNode
}

export function CreateIssueDialog({ status, trigger }: CreateIssueDialogProps) {
  // 弹窗只在项目列表页使用，直接从 URL 读取项目 key
  const { projectKey = '' } = useParams()
  const createIssue = useCreateIssue(projectKey)

  // 自己控制弹窗的开关：提交成功后要由代码关闭弹窗
  const [open, setOpen] = useState(false)

  // 表单：校验规则直接复用后端的 CreateIssueInputSchema
  const form = useForm({
    resolver: zodResolver(CreateIssueInputSchema),
    defaultValues: { title: '', description: '', status },
  })
  const { errors } = form.formState

  // 校验通过后才会被调用，values 已经是 schema 处理过的数据
  const onSubmit = form.handleSubmit((values) => {
    createIssue.mutate(values, {
      onSuccess: () => {
        setOpen(false)
        form.reset()
      },
    })
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* asChild：不额外包一层按钮，直接把打开弹窗的能力交给 trigger 本身 */}
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>新建 Issue</DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <StatusIcon status={status} />
            {STATUS_LABEL[status]}
          </DialogDescription>
        </DialogHeader>

        <form id="create-issue-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Field data-invalid={errors.title ? true : undefined}>
              <FieldLabel htmlFor="issue-title">标题</FieldLabel>
              <Input
                id="issue-title"
                placeholder="Issue 标题"
                autoFocus
                aria-invalid={errors.title ? true : undefined}
                {...form.register('title')}
              />
              <FieldError errors={[errors.title]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="issue-description">描述</FieldLabel>
              <Textarea
                id="issue-description"
                placeholder="添加描述…"
                rows={5}
                {...form.register('description')}
              />
            </Field>
          </FieldGroup>
        </form>

        {createIssue.isError && <p className="text-destructive">创建失败，请稍后重试。</p>}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" form="create-issue-form" disabled={createIssue.isPending}>
            {createIssue.isPending ? '创建中…' : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
