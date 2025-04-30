
import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { CalendarCheck, FileText, Home, Menu, User, Users } from 'lucide-react';
import { useLeave } from '@/context/LeaveContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { currentEmployee, isAdmin } = useLeave();
  const location = useLocation();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="flex flex-col items-center justify-center p-4">
            <div className="flex items-center justify-center">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={currentEmployee.avatar} />
                <AvatarFallback>{getInitials(currentEmployee.name)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">{currentEmployee.name}</p>
              <p className="text-xs text-sidebar-foreground/70">{currentEmployee.position}</p>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === '/' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                asChild
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === '/calendar' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                asChild
              >
                <Link to="/calendar">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Calendar
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === '/requests' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                asChild
              >
                <Link to="/requests">
                  <FileText className="mr-2 h-4 w-4" />
                  My Requests
                </Link>
              </Button>
              
              <Button
                variant="ghost"
                className={`w-full justify-start ${location.pathname === '/profile' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                asChild
              >
                <Link to="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </Button>
              
              {isAdmin && (
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${location.pathname === '/admin' ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                  asChild
                >
                  <Link to="/admin">
                    <Users className="mr-2 h-4 w-4" />
                    Admin
                  </Link>
                </Button>
              )}
            </div>
          </SidebarContent>
          
          <SidebarFooter className="border-t p-4">
            <p className="text-xs text-center text-sidebar-foreground/70">
              TimeOff Harmony Suite
            </p>
          </SidebarFooter>
        </Sidebar>
        
        <div className="flex-1">
          <header className="flex items-center h-14 border-b px-4 lg:px-6">
            <SidebarTrigger>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Sidebar</span>
              </Button>
            </SidebarTrigger>
            
            <div className="flex-1">
              <h1 className="text-lg font-medium">
                {location.pathname === '/' && "Dashboard"}
                {location.pathname === '/calendar' && "Leave Calendar"}
                {location.pathname === '/requests' && "My Leave Requests"}
                {location.pathname === '/profile' && "My Profile"}
                {location.pathname === '/admin' && "Admin Dashboard"}
              </h1>
            </div>
          </header>
          
          <main className="flex-1 p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
