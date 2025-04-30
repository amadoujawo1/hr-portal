
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, differenceInDays, eachDayOfInterval, isWeekend } from "date-fns"
import { LeaveType } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}

export function calculateLeaveDays(startDate: Date, endDate: Date): number {
  const days = differenceInDays(endDate, startDate) + 1;
  
  // If we want to exclude weekends
  const allDays = eachDayOfInterval({ start: startDate, end: endDate });
  const businessDays = allDays.filter(day => !isWeekend(day));
  
  return businessDays.length;
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
    vacation: 'bg-blue-100 text-blue-800',
    sick: 'bg-red-100 text-red-800',
    personal: 'bg-green-100 text-green-800',
    bereavement: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  };
  
  return colors[type] || 'bg-gray-100 text-gray-800';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusBadgeColor(status: string): Record<string, boolean> {
  switch(status) {
    case 'pending':
      return { 'bg-yellow-100 text-yellow-800 border-yellow-300': true };
    case 'approved':
      return { 'bg-green-100 text-green-800 border-green-300': true };
    case 'rejected':
      return { 'bg-red-100 text-red-800 border-red-300': true };
    default:
      return { 'bg-gray-100 text-gray-800 border-gray-300': true };
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
