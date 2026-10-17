import Image from '@tiptap/extension-image'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Placeholder } from '@tiptap/extensions'
import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useState } from 'react'
import { useImagePaste, type ImageUploadState } from '../hooks/useImagePaste.ts'
import { SlashMenu } from './SlashMenu.tsx'
import { SelectionToolbar } from './SelectionToolbar.tsx'
import './MarkdownContent.css'

type IssueDescriptionProps = {
  identifier: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  onComposingChange: (composing: boolean) => void
  onMenuChange: (open: boolean) => void
  onUploadStateChange: (state: ImageUploadState) => void
}

export function IssueDescription({
  identifier,
  value,
  onChange,
  onBlur,
  onComposingChange,
  onMenuChange,
  onUploadStateChange,
}: IssueDescriptionProps) {
  const [initialContent] = useState(value)
  const [sourceMode, setSourceMode] = useState(false)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false }, underline: false }),
      Image,
      TaskList,
      TaskItem.configure({
        nested: true,
        a11y: { checkboxLabel: (node) => `完成任务：${node.textContent}` },
      }),
      Placeholder.configure({ placeholder: 'Add description… 输入 / 选择格式' }),
      Markdown,
    ],
    content: initialContent,
    contentType: 'markdown',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        id: 'issue-description',
        class: 'markdown-content min-h-48 outline-none',
        role: 'textbox',
        'aria-label': 'Issue 描述',
        'aria-multiline': 'true',
      },
    },
    onCreate: ({ editor }) => {
      // 允许常见 Markdown 标记标准化，只为尚未支持的节点保留源码。
      const supported = new Set([
        'space',
        'code',
        'heading',
        'hr',
        'blockquote',
        'list',
        'list_item',
        'taskList',
        'taskItem',
        'def',
        'paragraph',
        'text',
        'escape',
        'strong',
        'em',
        'codespan',
        'br',
        'del',
        'link',
        'image',
      ])
      const parser = editor.markdown!.instance
      let unsupported = false
      // 自定义任务节点的 items / nestedTokens 不在 marked 默认遍历范围内。
      const pending: unknown[] = [...parser.lexer(initialContent)]
      while (pending.length) {
        const token = pending.pop()
        if (!token || typeof token !== 'object') continue
        if ('type' in token && typeof token.type === 'string' && !supported.has(token.type)) {
          unsupported = true
          break
        }
        for (const value of Object.values(token)) {
          if (Array.isArray(value)) pending.push(...value)
        }
      }
      if (unsupported) setSourceMode(true)
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getMarkdown()),
  })
  const uploadError = useImagePaste(sourceMode ? null : editor, identifier, onUploadStateChange)

  return (
    <section
      className="mt-5"
      aria-label="描述"
      onBlur={onBlur}
      onCompositionStart={() => onComposingChange(true)}
      onCompositionEnd={() => onComposingChange(false)}
    >
      {sourceMode ? (
        <>
          <p className="mb-3 text-xs text-fg-muted">
            此描述包含暂未支持的内容，使用 Markdown 源码保留原文。
          </p>
          <textarea
            id="issue-description"
            aria-label="Issue 描述源码"
            className="field-sizing-content min-h-48 w-full resize-none bg-transparent font-mono text-sm outline-none"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </>
      ) : (
        <>
          <EditorContent editor={editor} />
          <SlashMenu editor={editor} onOpenChange={onMenuChange} />
          {editor && <SelectionToolbar editor={editor} />}
          {uploadError && (
            <p role="alert" className="mt-3 text-xs text-destructive">
              {uploadError}
            </p>
          )}
        </>
      )}
    </section>
  )
}
