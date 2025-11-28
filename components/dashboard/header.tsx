"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  const { data: session } = useSession()
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U"

  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b bg-background/80 backdrop-blur-md px-6">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden md:block md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-9"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </Button>
        <div className="flex items-center gap-3 rounded-lg border bg-muted/50 px-3 py-2">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col sm:flex">
            <span className="text-sm font-medium leading-none">{session?.user?.name}</span>
            <span className="mt-1 text-xs text-muted-foreground leading-none">
              {session?.user?.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
