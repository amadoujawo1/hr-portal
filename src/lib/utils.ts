
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { LeaveType } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  // Clone the dates to avoid modifying the original objects
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set times to midnight to ensure we're only counting days
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  
  // Count only business days (Monday to Friday)
  let businessDays = 0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}

export function getLeaveTypeLabel(type: LeaveType): string {
  const labels: Record<LeaveType, string> = {
    vacation: 'Vacation',
    sick: 'Sick Leave',
    personal: 'Personal Leave',
    bereavement: 'Bereavement',
    other: 'Other'
  };
  
  return labels[type] || type;
}

export function getLeaveTypeColor(type: LeaveType): string {
  const colors: Record<LeaveType, string> = {
    vacation: 'text-blue-600 bg-blue-50',
    sick: 'text-red-600 bg-red-50',
    personal: 'text-amber-600 bg-amber-50',
    bereavement: 'text-purple-600 bg-purple-50',
    other: 'text-slate-600 bg-slate-50'
  };
  
  return colors[type] || '';
}

export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    approved: 'bg-green-100 text-green-800 hover:bg-green-200',
    rejected: 'bg-red-100 text-red-800 hover:bg-red-200'
  };
  
  return colors[status] || '';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
