import type { ChainedCommands, Editor } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Pilcrow,
  Quote,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const commands = [
  {
    label: 'Heading 1',
    keywords: 'h1 标题 一级',
    icon: Heading1,
    run: (chain: ChainedCommands) => chain.setHeading({ level: 1 }).run(),
  },
  {
    label: 'Heading 2',
    keywords: 'h2 标题 二级',
    icon: Heading2,
    run: (chain: ChainedCommands) => chain.setHeading({ level: 2 }).run(),
  },
  {
    label: 'Heading 3',
    keywords: 'h3 标题 三级',
    icon: Heading3,
    run: (chain: ChainedCommands) => chain.setHeading({ level: 3 }).run(),
  },
  {
    label: 'Text',
    keywords: 'paragraph 正文 段落',
    icon: Pilcrow,
    run: (chain: ChainedCommands) => chain.setParagraph().run(),
  },
  {
    label: 'Bulleted list',
    keywords: 'ul bullet 无序列表',
    icon: List,
    run: (chain: ChainedCommands) => chain.toggleBulletList().run(),
  },
  {
    label: 'Numbered list',
    keywords: 'ol numbered 有序列表',
    icon: ListOrdered,
    run: (chain: ChainedCommands) => chain.toggleOrderedList().run(),
  },
  {
    label: 'Checklist',
    keywords: 'task todo 任务 清单',
    icon: ListTodo,
    run: (chain: ChainedCommands) => chain.toggleTaskList().run(),
  },
  {
    label: 'Quote',
    keywords: 'blockquote 引用',
    icon: Quote,
    run: (chain: ChainedCommands) => chain.toggleBlockquote().run(),
  },
  {
    label: 'Code block',
    keywords: 'code 代码',
    icon: Code,
    run: (chain: ChainedCommands) => chain.setCodeBlock().run(),
  },
]

type MenuState = {
  from: number
  to: number
  query: string
  left: number
  top: number
  selected: number
  items: typeof commands
}

export function SlashMenu({
  editor,
  onOpenChange,
}: {
  editor: Editor | null
  onOpenChange: (open: boolean) => void
}) {
  const [menu, setMenu] = useState<MenuState | null>(null)
  const current = useRef<MenuState | null>(null)
  const dismissedAt = useRef<number | null>(null)
  const menuId = useId()

  useEffect(() => {
    if (!editor) return
    const publish = (next: MenuState | null) => {
      current.current = next
      setMenu(next)
      onOpenChange(next !== null)
    }
    const choose = (state: MenuState, index: number) => {
      const item = state.items[index]
      if (!item) return
      publish(null)
      item.run(editor.chain().focus().deleteRange({ from: state.from, to: state.to }).clearNodes())
    }
    const update = () => {
      const { $from, from, empty } = editor.state.selection
      const prefix = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
      const match = empty && !$from.parent.type.spec.code && /^\/([^\s/]*)$/.exec(prefix)
      if (!editor.isFocused || !match) {
        dismissedAt.current = null
        publish(null)
        return
      }
      const start = from - match[0].length
      if (dismissedAt.current === start) return
      const query = match[1].toLowerCase()
      const items = commands.filter((item) =>
        `${item.label} ${item.keywords}`
          .toLowerCase()
          .split(' ')
          .some((word) => word.startsWith(query)),
      )
      const rect = editor.view.coordsAtPos(from)
      const height = Math.min(360, items.length * 36 + 48)
      publish({
        from: start,
        to: from,
        query,
        items,
        selected: current.current?.query === query ? current.current.selected : 0,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 296)),
        top:
          rect.bottom + height + 8 < window.innerHeight
            ? rect.bottom + 8
            : Math.max(8, rect.top - height - 8),
      })
    }
    const key = new PluginKey('raven-slash-menu')
    editor.registerPlugin(
      new Plugin({
        key,
        props: {
          handleKeyDown: (_view, event) => {
            const state = current.current
            if (!state || event.isComposing || event.keyCode === 229) return false
            if (event.key === 'Escape') {
              dismissedAt.current = state.from
              publish(null)
              return true
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              const count = state.items.length
              if (count)
                publish({
                  ...state,
                  selected: (state.selected + (event.key === 'ArrowDown' ? 1 : -1) + count) % count,
                })
              return true
            }
            if (event.key === 'Enter') {
              choose(state, state.selected)
              return true
            }
            return false
          },
        },
      }),
      // 菜单先处理 Enter 和方向键，避免被编辑器的换段快捷键抢先消费。
      (plugin, plugins) => [plugin, ...plugins],
    )
    const close = () => publish(null)
    editor.on('transaction', update)
    editor.on('focus', update)
    editor.on('blur', close)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      editor.off('transaction', update)
      editor.off('focus', update)
      editor.off('blur', close)
      editor.unregisterPlugin(key)
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      onOpenChange(false)
    }
  }, [editor, onOpenChange])

  useEffect(() => {
    if (!editor) return
    const element = editor.view.dom
    element.setAttribute('aria-haspopup', 'listbox')
    element.setAttribute('aria-expanded', String(menu !== null))
    if (menu) {
      element.setAttribute('aria-controls', menuId)
      if (menu.items.length)
        element.setAttribute('aria-activedescendant', `${menuId}-${menu.selected}`)
      else element.removeAttribute('aria-activedescendant')
    } else {
      element.removeAttribute('aria-controls')
      element.removeAttribute('aria-activedescendant')
    }
    document.getElementById(`${menuId}-${menu?.selected}`)?.scrollIntoView({ block: 'nearest' })
  }, [editor, menu, menuId])

  if (!menu || !editor) return null

  return createPortal(
    <div
      id={menuId}
      role="listbox"
      aria-label="描述格式"
      className="fixed z-50 max-h-[min(360px,calc(100vh-16px))] w-72 overflow-y-auto rounded-xl border border-line bg-elevated p-1.5 shadow-2xl"
      style={{ left: menu.left, top: menu.top }}
      onMouseDown={(event) => event.preventDefault()}
    >
      <p className="px-2 py-1.5 text-[11px] text-fg-subtle">插入格式</p>
      {menu.items.length === 0 && <p className="p-3 text-sm text-fg-muted">没有匹配的格式</p>}
      {menu.items.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={item.label}
            id={`${menuId}-${index}`}
            type="button"
            role="option"
            tabIndex={-1}
            aria-selected={index === menu.selected}
            className={`flex h-9 w-full items-center gap-3 rounded-md px-2 text-left text-sm ${index === menu.selected ? 'bg-white/10 text-fg' : 'text-fg-muted hover:bg-white/5'}`}
            onClick={() => {
              const state = current.current
              if (!state) return
              current.current = null
              setMenu(null)
              onOpenChange(false)
              item.run(
                editor.chain().focus().deleteRange({ from: state.from, to: state.to }).clearNodes(),
              )
            }}
          >
            <Icon className="size-5 text-fg-subtle" />
            {item.label}
          </button>
        )
      })}
    </div>,
    document.body,
  )
}
