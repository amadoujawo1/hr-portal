
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'bereavement' | 'other';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  avatar?: string;
  manager?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  type: LeaveType;
  status: LeaveStatus;
  reason: string;
  createdAt: Date;
  updatedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}
