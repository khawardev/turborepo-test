'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/server/actions/authActions'
import {
  ChevronsUpDown,
  Book,
  FileText,
  Settings,
  Globe,
  CreditCard,
  LogOut
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenuButton } from '@/components/Firecrawl/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";



export default function SidebarUserV2() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  if (loading) {
    return (
      <SidebarMenuButton size="lg" className="animate-pulse">
        <div className="aspect-square size-8 rounded-lg bg-muted" />
        <div className="grid flex-1 gap-1 text-left">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </SidebarMenuButton>
    )
  }

  if (!user) {
    return null
  }

  return <DropdownMenu open={open} onOpenChange={setOpen}>
    <DropdownMenuTrigger asChild>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        
        <Avatar >
          <AvatarImage
            src={`https://avatar.vercel.sh/${user.email}.png`}
            alt={user.name || ""}
          />
          <AvatarFallback>
            {user.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
        <ChevronsUpDown className="ml-auto size-4" />
      </SidebarMenuButton>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      className="w-58 ml-3"
      side='top'
      align='end'
      sideOffset={4}
    >
      <DropdownMenuLabel label='Account' rootOpenSetter={setOpen} />
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="bg-accent "
      >
        <div className="flex items-center gap-2   text-left text-sm">
          <Avatar >
            <AvatarImage
              src={`https://avatar.vercel.sh/${user.email}.png`}
              alt={user.name || ""}
            />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
        <div className="ml-auto size-2 rounded-full bg-primary" />
      </DropdownMenuItem>
      
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Book />
          Blog
        </DropdownMenuItem>
        <DropdownMenuItem>
          <FileText />
          Documentation
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Globe />
          Domain checker
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings />
          Account Settings
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Settings />
          Team Settings
        </DropdownMenuItem>
        <DropdownMenuItem>
          <CreditCard />
          Manage Subscriptions
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />

      <DropdownMenuItem variant="destructive">
        <LogOut />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
}