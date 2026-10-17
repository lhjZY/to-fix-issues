import type { Editor } from '@tiptap/core'
import { Plugin, PluginKey, type Transaction } from '@tiptap/pm/state'
import { useEffect, useState } from 'react'
import { client } from '../lib/api.ts'

export type ImageUploadState = 'idle' | 'uploading' | 'error'

export function useImagePaste(
  editor: Editor | null,
  identifier: string,
  onUploadStateChange: (state: ImageUploadState) => void,
) {
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editor) return
    const key = new PluginKey('raven-image-paste')
    let controller: AbortController | null = null
    let position: number | null = null

    const trackPosition = ({ transaction }: { transaction: Transaction }) => {
      if (position === null) return
      // 输入会改变文档位置；-1 让在同一点继续输入的文字留在图片之后。
      const mapped = transaction.mapping.mapResult(position, -1)
      position = mapped.deleted ? null : mapped.pos
    }

    const upload = async (file: File, request: AbortController) => {
      try {
        const response = await client.api.issues[':identifier'].attachments.$post(
          { param: { identifier }, form: { file } },
          { init: { signal: request.signal } },
        )
        if (!response.ok) {
          throw new Error('图片上传失败，请检查图片文件后重新粘贴。')
        }
        const attachment = await response.json()
        if (request.signal.aborted || editor.isDestroyed) return
        if (position === null) {
          throw new Error('原粘贴位置已被删除，请在新位置重新粘贴。')
        }
        // 不 focus、不读取上传结束时的光标，避免打断其他位置的输入。
        editor.commands.insertContentAt(
          position,
          { type: 'image', attrs: { src: attachment.url, alt: '粘贴的图片' } },
          { updateSelection: false },
        )
        setError('')
        onUploadStateChange('idle')
      } catch (error) {
        if (!request.signal.aborted) {
          setError(
            error instanceof Error && !(error instanceof TypeError)
              ? error.message
              : '图片上传失败，请检查网络后重新粘贴。',
          )
          onUploadStateChange('error')
        }
      } finally {
        if (!request.signal.aborted) {
          controller = null
          position = null
        }
      }
    }

    editor.registerPlugin(
      new Plugin({
        key,
        props: {
          handlePaste: (view, event) => {
            const files = Array.from(event.clipboardData?.files ?? [])
            if (files.length === 0) return false
            event.preventDefault()
            if (controller) {
              setError('请等待当前图片上传完成，再粘贴下一张。')
              return true
            }
            const [file] = files
            if (files.length !== 1) setError('每次请粘贴一张图片。')
            else if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
              setError('仅支持 PNG、JPEG、GIF、WebP 图片。')
            } else if (file.size === 0 || file.size > 5 * 1024 * 1024) {
              setError('图片不能为空，且不能超过 5 MiB。')
            } else if (editor.isActive('codeBlock')) {
              setError('请在代码块以外粘贴图片。')
            } else {
              setError('')
              position = view.state.selection.from
              controller = new AbortController()
              onUploadStateChange('uploading')
              void upload(file, controller)
            }
            return true
          },
        },
      }),
    )
    editor.on('transaction', trackPosition)
    return () => {
      controller?.abort()
      editor.off('transaction', trackPosition)
      editor.unregisterPlugin(key)
      onUploadStateChange('idle')
    }
  }, [editor, identifier, onUploadStateChange])

  return error
}
