import { Markdown } from '@tiptap/markdown'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'
import './MarkdownContent.css'

type MarkdownContentProps = {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } },
      }),
      Markdown,
    ],
    content,
    contentType: 'markdown',
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'markdown-content', role: 'region', 'aria-label': 'Issue 描述' },
    },
  })

  useEffect(() => {
    // content 是初始值；查询刷新带来新描述时，需要同步到编辑器实例。
    editor?.commands.setContent(content, { contentType: 'markdown', emitUpdate: false })
  }, [editor, content])

  return <EditorContent editor={editor} />
}
