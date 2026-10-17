import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { Bold, Italic, List, ListOrdered, ListTodo } from 'lucide-react'
import { useEffect } from 'react'

const menuOptions = {
  strategy: 'fixed' as const,
  placement: 'top' as const,
  offset: 8,
  flip: { padding: 8 },
  shift: { padding: 8 },
}

export function SelectionToolbar({ editor }: { editor: Editor }) {
  useEffect(() => {
    // 挂载后才能找到滚动容器；BubbleMenu 默认只监听 window。
    const container = editor.view.dom.closest<HTMLElement>('[data-editor-scroll]')
    const updatePosition = () =>
      editor.commands.setMeta('raven-selection-toolbar', 'updatePosition')
    container?.addEventListener('scroll', updatePosition)
    return () => container?.removeEventListener('scroll', updatePosition)
  }, [editor])

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      taskList: editor.isActive('taskList'),
      canBold: editor.can().toggleBold(),
      canItalic: editor.can().toggleItalic(),
    }),
  })

  const toggleSelectedList = (type: 'bulletList' | 'orderedList' | 'taskList') => {
    const active = editor.isActive(type)
    // 先拆出选中的段落，避免 toggleList 把未选中的相邻列表项也换类型。
    const chain = editor.chain().focus().clearNodes()
    if (active) chain.run()
    else chain.toggleList(type, type === 'taskList' ? 'taskItem' : 'listItem', true).run()
  }

  const actions = [
    {
      label: '粗体',
      icon: Bold,
      active: state.bold,
      disabled: !state.canBold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: '斜体',
      icon: Italic,
      active: state.italic,
      disabled: !state.canItalic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: '无序列表',
      icon: List,
      active: state.bulletList,
      run: () => toggleSelectedList('bulletList'),
    },
    {
      label: '有序列表',
      icon: ListOrdered,
      active: state.orderedList,
      run: () => toggleSelectedList('orderedList'),
    },
    {
      label: '任务清单',
      icon: ListTodo,
      active: state.taskList,
      run: () => toggleSelectedList('taskList'),
    },
  ]

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="raven-selection-toolbar"
      appendTo={() => document.body}
      options={menuOptions}
      updateDelay={100}
      resizeDelay={0}
      className="z-50"
    >
      <div
        role="toolbar"
        aria-label="文本格式"
        className="z-50 flex items-center gap-1 rounded-lg border border-line bg-elevated p-1 shadow-xl"
        // 不让鼠标按下按钮时把焦点从编辑器移走，否则文字选区会消失。
        onMouseDown={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            editor.chain().setTextSelection(editor.state.selection.to).focus().run()
          }
          if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
            )
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement)
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? buttons.length - 1
                  : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) %
                    buttons.length
            buttons[next]?.focus()
          }
        }}
      >
        {actions.map(({ label, icon: Icon, active, disabled, run }, index) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            aria-pressed={active}
            title={label}
            disabled={disabled}
            className={`flex size-8 items-center justify-center rounded text-fg-muted outline-none hover:bg-white/10 hover:text-fg focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 ${active ? 'bg-white/10 text-fg' : ''} ${index === 2 ? 'ml-1 border-l border-line' : ''}`}
            onClick={run}
          >
            <Icon className="size-4" />
          </button>
        ))}
      </div>
    </BubbleMenu>
  )
}
