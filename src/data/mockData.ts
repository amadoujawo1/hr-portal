
import { Employee, LeaveRequest } from "@/types";

export const mockEmployees: Employee[] = [
  {
    id: "e1",
    name: "John Doe",
    email: "john.doe@company.com",
    department: "Engineering",
    position: "Senior Developer",
    avatar: "https://i.pravatar.cc/150?img=1",
    manager: "e5"
  },
  {
    id: "e2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    department: "Marketing",
    position: "Marketing Specialist",
    avatar: "https://i.pravatar.cc/150?img=2",
    manager: "e6"
  },
  {
    id: "e3",
    name: "Bob Johnson",
    email: "bob.johnson@company.com",
    department: "Finance",
    position: "Financial Analyst",
    avatar: "https://i.pravatar.cc/150?img=3",
    manager: "e7"
  },
  {
    id: "e4",
    name: "Alice Williams",
    email: "alice.williams@company.com",
    department: "HR",
    position: "HR Specialist",
    avatar: "https://i.pravatar.cc/150?img=4",
    manager: "e8"
  },
  {
    id: "e5",
    name: "Michael Brown",
    email: "michael.brown@company.com",
    department: "Engineering",
    position: "Engineering Manager",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: "e6",
    name: "Sarah Davis",
    email: "sarah.davis@company.com",
    department: "Marketing",
    position: "Marketing Director",
    avatar: "https://i.pravatar.cc/150?img=6"
  },
  {
    id: "e7",
    name: "David Wilson",
    email: "david.wilson@company.com",
    department: "Finance",
    position: "Finance Director",
    avatar: "https://i.pravatar.cc/150?img=7"
  },
  {
    id: "e8",
    name: "Emily Taylor",
    email: "emily.taylor@company.com",
    department: "HR",
    position: "HR Director",
    avatar: "https://i.pravatar.cc/150?img=8"
  },
  {
    id: "e9",
    name: "Chris Martinez",
    email: "chris.martinez@company.com",
    department: "Engineering",
    position: "Junior Developer",
    avatar: "https://i.pravatar.cc/150?img=9",
    manager: "e5"
  },
  {
    id: "e10",
    name: "Lisa Adams",
    email: "lisa.adams@company.com",
    department: "Marketing",
    position: "Marketing Assistant",
    avatar: "https://i.pravatar.cc/150?img=10",
    manager: "e6"
  }
];

// Helper function to create dates relative to today
const dateFrom = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "l1",
    employeeId: "e1",
    startDate: dateFrom(5),
    endDate: dateFrom(10),
    type: "vacation",
    status: "pending",
    reason: "Annual family vacation",
    createdAt: dateFrom(-2)
  },
  {
    id: "l2",
    employeeId: "e2",
    startDate: dateFrom(-5),
    endDate: dateFrom(-3),
    type: "sick",
    status: "approved",
    reason: "Flu",
    createdAt: dateFrom(-7),
    updatedAt: dateFrom(-6),
    approvedBy: "e6"
  },
  {
    id: "l3",
    employeeId: "e3",
    startDate: dateFrom(15),
    endDate: dateFrom(20),
    type: "personal",
    status: "approved",
    reason: "Moving to new apartment",
    createdAt: dateFrom(-10),
    updatedAt: dateFrom(-8),
    approvedBy: "e7"
  },
  {
    id: "l4",
    employeeId: "e4",
    startDate: dateFrom(-15),
    endDate: dateFrom(-12),
    type: "bereavement",
    status: "approved",
    reason: "Family emergency",
    createdAt: dateFrom(-16),
    updatedAt: dateFrom(-16),
    approvedBy: "e8"
  },
  {
    id: "l5",
    employeeId: "e9",
    startDate: dateFrom(3),
    endDate: dateFrom(4),
    type: "personal",
    status: "pending",
    reason: "Doctor's appointment",
    createdAt: dateFrom(-1)
  },
  {
    id: "l6",
    employeeId: "e10",
    startDate: dateFrom(7),
    endDate: dateFrom(8),
    type: "other",
    status: "rejected",
    reason: "Professional development course",
    createdAt: dateFrom(-5),
    updatedAt: dateFrom(-3),
    rejectionReason: "Upcoming marketing campaign launch"
  },
  {
    id: "l7",
    employeeId: "e1",
    startDate: dateFrom(-20),
    endDate: dateFrom(-18),
    type: "sick",
    status: "approved",
    reason: "Food poisoning",
    createdAt: dateFrom(-21),
    updatedAt: dateFrom(-20),
    approvedBy: "e5"
  },
  {
    id: "l8",
    employeeId: "e2",
    startDate: dateFrom(12),
    endDate: dateFrom(17),
    type: "vacation",
    status: "pending",
    reason: "Summer vacation",
    createdAt: dateFrom(-3)
  }
];

// Current logged in user (for demo purposes)
export const currentUser: Employee = mockEmployees[0];

// Current user requests
export const currentUserRequests = mockLeaveRequests.filter(
  req => req.employeeId === currentUser.id
);

// Get employee by ID
export const getEmployeeById = (id: string): Employee | undefined => {
  return mockEmployees.find(emp => emp.id === id);
};

// Get leave requests by employee ID
export const getLeaveRequestsByEmployeeId = (employeeId: string): LeaveRequest[] => {
  return mockLeaveRequests.filter(req => req.employeeId === employeeId);
};

// Get leave requests by status
export const getLeaveRequestsByStatus = (status: string): LeaveRequest[] => {
  return mockLeaveRequests.filter(req => req.status === status);
};
