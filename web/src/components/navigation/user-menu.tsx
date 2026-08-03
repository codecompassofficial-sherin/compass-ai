'use client'

import { LogOut, Settings, User as UserIcon } from 'lucide-react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function UserMenu() {
  const { user, logout } = useAuth()

  const name = user ? `${user.firstName} ${user.lastName}` : 'Account'
  const email = user?.email ?? 'Signed in as guest'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full"
            aria-label="Open user menu"
          />
        }
      >
        <Avatar size="sm">
          <AvatarFallback>
            {user ? (
              getInitials(user.firstName, user.lastName)
            ) : (
              <UserIcon className="size-3.5" />
            )}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-56">
        <DropdownMenuLabel>
          <span className="flex flex-col gap-0.5">
            <span className="text-foreground truncate font-medium">{name}</span>
            <span className="text-muted-foreground truncate font-normal">
              {email}
            </span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Settings />
          Account settings
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onClick={() => void logout()}>
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
