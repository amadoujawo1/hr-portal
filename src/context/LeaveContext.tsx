
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Employee, LeaveRequest, LeaveStatus, LeaveType } from '@/types';
import { currentUser, mockEmployees, mockLeaveRequests } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface LeaveContextProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  currentEmployee: Employee;
  isAdmin: boolean;
  addLeaveRequest: (leaveRequest: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'createdAt'>) => void;
  updateLeaveStatus: (id: string, status: LeaveStatus, reason?: string) => void;
  getEmployeeById: (id: string) => Employee | undefined;
  getLeaveRequestsByEmployeeId: (employeeId: string) => LeaveRequest[];
  getLeaveRequestsByStatus: (status: LeaveStatus) => LeaveRequest[];
}

const LeaveContext = createContext<LeaveContextProps | undefined>(undefined);

export const LeaveProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [currentEmployee, setCurrentEmployee] = useState<Employee>(currentUser);

  // For demo purposes, consider managers/directors as admins
  const isAdmin = !currentEmployee.manager;

  const addLeaveRequest = (leaveRequest: Omit<LeaveRequest, 'id' | 'employeeId' | 'status' | 'createdAt'>) => {
    const newLeaveRequest: LeaveRequest = {
      ...leaveRequest,
      id: `l${leaveRequests.length + 1}`,
      employeeId: currentEmployee.id,
      status: 'pending',
      createdAt: new Date(),
    };
    
    setLeaveRequests([...leaveRequests, newLeaveRequest]);
    toast({
      title: "Leave request submitted",
      description: "Your leave request has been submitted for approval.",
    });
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus, reason?: string) => {
    setLeaveRequests(
      leaveRequests.map((request) => {
        if (request.id === id) {
          return {
            ...request,
            status,
            updatedAt: new Date(),
            approvedBy: status === 'approved' ? currentEmployee.id : undefined,
            rejectionReason: status === 'rejected' ? reason : undefined,
          };
        }
        return request;
      })
    );

    toast({
      title: `Leave request ${status}`,
      description: `The leave request has been ${status}.`,
    });
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find(emp => emp.id === id);
  };

  const getLeaveRequestsByEmployeeId = (employeeId: string): LeaveRequest[] => {
    return leaveRequests.filter(req => req.employeeId === employeeId);
  };

  const getLeaveRequestsByStatus = (status: LeaveStatus): LeaveRequest[] => {
    return leaveRequests.filter(req => req.status === status);
  };

  return (
    <LeaveContext.Provider
      value={{
        employees,
        leaveRequests,
        currentEmployee,
        isAdmin,
        addLeaveRequest,
        updateLeaveStatus,
        getEmployeeById,
        getLeaveRequestsByEmployeeId,
        getLeaveRequestsByStatus,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (context === undefined) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};
