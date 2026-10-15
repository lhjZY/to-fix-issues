import { STATUS_LABEL, type IssueStatus } from '@raven/shared'
import type { ReactNode } from 'react'
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
import { Field, FieldGroup, FieldLabel } from './ui/field.tsx'
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
  return (
    <Dialog>
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

        {/* 提交逻辑在第 30 步实现，这里先阻止表单的默认提交（会刷新页面） */}
        <form id="create-issue-form" onSubmit={(event) => event.preventDefault()}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="issue-title">标题</FieldLabel>
              <Input id="issue-title" placeholder="Issue 标题" autoFocus />
            </Field>
            <Field>
              <FieldLabel htmlFor="issue-description">描述</FieldLabel>
              <Textarea id="issue-description" placeholder="添加描述…" rows={5} />
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">取消</Button>
          </DialogClose>
          <Button type="submit" form="create-issue-form">
            创建
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
