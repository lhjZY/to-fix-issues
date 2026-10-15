import type { User } from '@raven/shared'
import { CircleUserRound } from 'lucide-react'

type AvatarProps = {
  user: User | null
}

export function Avatar({ user }: AvatarProps) {
  // 没有负责人: 显示占位图标
  if (user === null) {
    return <CircleUserRound className="size-5 text-fg-subtle" strokeWidth={1.5} />
  }

  // 有图片
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name} className="size-5 rounded-full" />
  }

  // 没有头像图片：显示名字首字母
  return (
    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-white">
      {user.name[0]}
    </span>
  )
}
