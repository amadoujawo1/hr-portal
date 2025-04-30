
import React from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { formatDate, calculateLeaveDays } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile = () => {
  const { currentEmployee, leaveRequests, getEmployeeById } = useLeave();
  
  // Filter requests for current user
  const userRequests = leaveRequests.filter(req => req.employeeId === currentEmployee.id);
  
  // Get manager if exists
  const manager = currentEmployee.manager ? getEmployeeById(currentEmployee.manager) : null;
  
  // Calculate leave stats
  const currentYear = new Date().getFullYear();
  const approvedLeaveDays = userRequests
    .filter(req => req.status === 'approved' && new Date(req.startDate).getFullYear() === currentYear)
    .reduce((total, req) => total + calculateLeaveDays(new Date(req.startDate), new Date(req.endDate)), 0);

  const approvedVacationDays = userRequests
    .filter(req => req.status === 'approved' && req.type === 'vacation' && new Date(req.startDate).getFullYear() === currentYear)
    .reduce((total, req) => total + calculateLeaveDays(new Date(req.startDate), new Date(req.endDate)), 0);

  const approvedSickDays = userRequests
    .filter(req => req.status === 'approved' && req.type === 'sick' && new Date(req.startDate).getFullYear() === currentYear)
    .reduce((total, req) => total + calculateLeaveDays(new Date(req.startDate), new Date(req.endDate)), 0);

  // Placeholder values - in a real app, these would come from company policy
  const vacationAllowance = 25;
  const sickAllowance = 10;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentEmployee.avatar} />
              <AvatarFallback className="text-lg">{getInitials(currentEmployee.name)}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold">{currentEmployee.name}</h2>
              <p className="text-muted-foreground">{currentEmployee.position}</p>
              <p className="text-sm text-muted-foreground">{currentEmployee.email}</p>
              <p className="text-sm font-medium mt-2">{currentEmployee.department} Department</p>
              
              {manager && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Manager</p>
                  <div className="flex items-center mt-1.5 space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={manager.avatar} />
                      <AvatarFallback className="text-xs">{getInitials(manager.name)}</AvatarFallback>
                    </Avatar>
                    <span>{manager.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leave Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedLeaveDays}</div>
            <p className="text-xs text-muted-foreground">Days used in {currentYear}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vacation Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedVacationDays} / {vacationAllowance}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (approvedVacationDays / vacationAllowance) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {vacationAllowance - approvedVacationDays} days remaining
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sick Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedSickDays} / {sickAllowance}</div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
              <div 
                className="bg-red-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min(100, (approvedSickDays / sickAllowance) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {sickAllowance - approvedSickDays} days remaining
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Leave History</CardTitle>
          <CardDescription>Your leave history for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vacation">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vacation">Vacation</TabsTrigger>
              <TabsTrigger value="sick">Sick Leave</TabsTrigger>
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            
            {['vacation', 'sick', 'personal', 'other'].map(leaveType => (
              <TabsContent key={leaveType} value={leaveType} className="mt-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="py-3 px-4 text-left text-sm font-medium">Date Range</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Days</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRequests
                        .filter(req => req.type === leaveType)
                        .map(request => (
                          <tr key={request.id} className="border-t">
                            <td className="py-3 px-4 text-sm">
                              {formatDate(new Date(request.startDate))} - {formatDate(new Date(request.endDate))}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {calculateLeaveDays(new Date(request.startDate), new Date(request.endDate))}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                request.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : request.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">{request.reason}</td>
                          </tr>
                        ))}
                      
                      {userRequests.filter(req => req.type === leaveType).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-muted-foreground">
                            No {leaveType} leave requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
