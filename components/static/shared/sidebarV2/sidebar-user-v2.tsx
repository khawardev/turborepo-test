import {
  BadgeCheck,
  Bell,
  ChevronUp,
  CreditCard,
  LogOut,
  Sparkles,
  User,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { getCurrentUser } from '@/server/actions/authActions';
import { SignoutButton } from '../AuthButtons';

export async function SidebarUserV2() {
  const user: any = await getCurrentUser();
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger  asChild>
            <SidebarMenuButton size={'default'}> 
              <Avatar className=" hover:cursor-pointer border size-4">
                <AvatarImage src={user?.image || `https://avatar.vercel.sh/${user.email}.png`} alt="Profile image" />
                <AvatarFallback>{user?.name?.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              {user?.name} 
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-50 mx-auto "
          >
            <DropdownMenuItem>
              <span> Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem >
              <SignoutButton/>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
