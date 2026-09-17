import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@workspace/ui/components/sidebar'
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  HomeIcon,
  InfoIcon,
  BookOpenIcon,
  FrameIcon,
} from 'lucide-react'
import * as React from 'react'

import { appPaths } from '@/config/app-paths'
import { NavMain } from '@/features/navigation/nav-main'
import { NavProjects } from '@/features/navigation/nav-projects'
import { NavUser } from '@/features/navigation/nav-user'
import { TeamSwitcher } from '@/features/navigation/team-switcher'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: <GalleryVerticalEndIcon />,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: <AudioLinesIcon />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <TerminalIcon />,
      plan: 'Free',
    },
  ],
  navMain: [
    { title: 'Home', url: appPaths.home.href, icon: <HomeIcon /> },
    { title: 'About', url: appPaths.about.href, icon: <InfoIcon /> },
    {
      title: 'Documentation',
      url: 'https://ui.shadcn.com/docs',
      icon: <BookOpenIcon />,
      items: [
        { title: 'React', url: 'https://react.dev/learn' },
        { title: 'Vite', url: 'https://vite.dev/guide/' },
        { title: 'shadcn/ui', url: 'https://ui.shadcn.com/docs' },
      ],
    },
  ],
  projects: [
    { name: 'React', url: 'https://github.com/facebook/react', icon: <FrameIcon /> },
    { name: 'Vite', url: 'https://github.com/vitejs/vite', icon: <TerminalIcon /> },
    { name: 'shadcn/ui', url: 'https://github.com/shadcn-ui/ui', icon: <BookOpenIcon /> },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
