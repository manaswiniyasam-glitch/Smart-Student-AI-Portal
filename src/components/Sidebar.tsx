/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Volume2, 
  Users, 
  Terminal, 
  BookOpen, 
  CheckSquare, 
  BarChart2, 
  Sparkles, 
  User, 
  Shield, 
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap
} from 'lucide-react';
import { UserRole, UserProfile } from '../types.js';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setTab, user, setUser, onLogout }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const handleRoleSwitch = (newRole: UserRole) => {
    // Switch mock user profiles instantly
    if (newRole === 'student') {
      setUser({
        id: "stud_1",
        name: "Alex Mercer",
        email: "alex.mercer@college.edu",
        role: "student",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120",
        regNo: "STUD20260401",
        department: "Computer Science & Engineering",
        semester: "VI Semester",
        bio: "Passionate Java and TypeScript optimizer. Aiming for distributed high-load backend engineer roles."
      });
    } else if (newRole === 'faculty') {
      setUser({
        id: "fac_1",
        name: "Dr. Evelyn Hargreaves",
        email: "evelyn@college.edu",
        role: "faculty",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
        department: "Computer Science",
        bio: "Senior Professor, Neural Language Analytics and Pattern Computing Research Lead."
      });
    } else {
      setUser({
        id: "admin_1",
        name: "Dean Albert Vance",
        email: "albert.vance@college.edu",
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120",
        department: "Academics & Strategy Board",
        bio: "University Dean. Monitoring technical placements readiness index, skill charts, and campus hackathons."
      });
    }
    setTab('home');
  };

  const navItems = [
    { id: 'home', label: 'Dashboard Home', icon: Home, roles: ['student', 'faculty', 'admin'] },
    { id: 'gd', label: 'Group Discussion AI', icon: Users, roles: ['student', 'faculty', 'admin'] },
    { id: 'essay', label: 'Essay Grader AI', icon: FileText, roles: ['student', 'faculty', 'admin'] },
    { id: 'speech', label: 'Speech Analyzer AI', icon: Volume2, roles: ['student', 'faculty', 'admin'] },
    { id: 'compiler', label: 'Hackathons & Coding', icon: Terminal, roles: ['student', 'faculty', 'admin'] },
    { id: 'subject', label: 'Subject Expertise AI', icon: BookOpen, roles: ['student', 'faculty', 'admin'] },
    { id: 'skills', label: 'Skills Marks Board', icon: CheckSquare, roles: ['student', 'faculty', 'admin'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart2, roles: ['student', 'faculty', 'admin'] },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(user.role));

  const roleLabels = {
    student: { name: 'Student Portal', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' },
    faculty: { name: 'Faculty Admin', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' },
    admin: { name: 'Dean Dashboard', color: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d121f] border-b border-gray-800 text-white sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          <span className="font-sans font-bold tracking-tight text-white">Smart Student AI</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Container */}
      <aside 
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 transform md:relative md:translate-x-0 transition-all duration-300 ease-in-out z-40 bg-[#0c101d] border-r border-gray-800 flex flex-col text-white
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          ${collapsed ? 'w-20' : 'w-72'}
          md:flex h-full
        `}
      >
        {/* Sidebar Top Brand */}
        <div className="hidden md:flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <GraduationCap className="h-7 w-7 text-indigo-500 flex-shrink-0" />
            {!collapsed && (
              <span className="font-sans font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent truncate">
                Smart Student AI
              </span>
            )}
          </div>
          <button 
            id="sidebar-collapse-toggle"
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User Card Profile details */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <img 
              referrerPolicy="no-referrer"
              src={user.avatar} 
              alt={user.name} 
              className="h-11 w-11 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="font-sans font-semibold text-sm text-gray-100 truncate">{user.name}</h4>
                <p className="font-mono text-[10px] text-gray-400 truncate">{user.email}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className={`text-[10px] font-sans font-medium px-2 py-0.5 rounded-full ${roleLabels[user.role].color}`}>
                    {roleLabels[user.role].name}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Role Quick Switcher Panel */}
        {!collapsed && (
          <div className="px-4 py-3 bg-[#111627] border-b border-gray-800">
            <p className="font-sans font-medium text-[10px] text-indigo-400 flex items-center gap-1.5 mb-2 uppercase tracking-wider">
              <ArrowRightLeft className="h-3 w-3" /> DEMO ROLE SELECTOR
            </p>
            <div className="grid grid-cols-3 gap-1">
              {(['student', 'faculty', 'admin'] as UserRole[]).map((r) => (
                <button
                  id={`role-switch-${r}`}
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`text-[11px] font-sans font-semibold py-1 rounded transition-all capitalize border
                    ${user.role === r 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25' 
                      : 'bg-[#181d33] text-gray-400 border-gray-800 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Menus List */}
        <nav id="sidebar-navigation" className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            const isSelected = currentTab === item.id;
            return (
              <button
                id={`sidebar-nav-${item.id}`}
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-sans text-sm font-medium transition-all group relative
                  ${isSelected 
                    ? 'bg-indigo-600/15 text-indigo-400 stroke-[2.5]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {/* Active Highlight Line */}
                {isSelected && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-indigo-500 rounded-r-md" />
                )}
                <IconComponent className={`h-[18px] w-[18px] flex-shrink-0 transition-transform group-hover:scale-105
                  ${isSelected ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}
                `} />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}

                {/* Collapsed bubble popup hint */}
                {collapsed && (
                  <div className="absolute left-20 bg-[#080b14] border border-gray-800 text-white font-sans text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout bottom trigger */}
        <div className="p-4 border-t border-gray-800">
          <button
            id="sidebar-logout-button"
            onClick={onLogout}
            className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 font-sans text-sm font-medium transition-all
              ${collapsed ? 'justify-content' : ''}
            `}
          >
            <User className="h-[18px] w-[18px]" />
            {!collapsed && <span className="truncate">Sign Out Credentials</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
