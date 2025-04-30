
import React from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, calculateLeaveDays, getLeaveTypeLabel, getStatusBadgeColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewRequestDialog from '@/components/NewRequestDialog';

const Dashboard = () => {
  const { leaveRequests, currentEmployee } = useLeave();
  const [showDialog, setShowDialog] = React.useState(false);

  // Filter requests for current user
  const userRequests = leaveRequests.filter(req => req.employeeId === currentEmployee.id);
  
  // Get pending requests
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  
  // Calculate approved leave days this year
  const currentYear = new Date().getFullYear();
  const approvedLeaveDays = userRequests
    .filter(req => req.status === 'approved' && new Date(req.startDate).getFullYear() === currentYear)
    .reduce((total, req) => total + calculateLeaveDays(new Date(req.startDate), new Date(req.endDate)), 0);
  
  // Get upcoming leave (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const upcomingLeave = userRequests.filter(req => 
    req.status === 'approved' && 
    new Date(req.startDate) >= today && 
    new Date(req.startDate) <= thirtyDaysFromNow
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {currentEmployee.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your leave requests</p>
        </div>
        
        <Button onClick={() => setShowDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{pendingRequests.length}</div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Days Taken This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{approvedLeaveDays}</div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{upcomingLeave.length}</div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
          <CardDescription>Your recent leave requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {userRequests.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              No leave requests found. Create a new request to get started.
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium">Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Date Range</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userRequests.slice(0, 5).map((request) => (
                    <tr key={request.id} className="border-t">
                      <td className="py-3 px-4 text-sm">{getLeaveTypeLabel(request.type)}</td>
                      <td className="py-3 px-4 text-sm">
                        {formatDate(new Date(request.startDate))} - {formatDate(new Date(request.endDate))}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {calculateLeaveDays(new Date(request.startDate), new Date(request.endDate))}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userRequests.length > 5 && (
                <div className="bg-muted/50 py-3 px-4 text-center">
                  <Link 
                    to="/requests" 
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View all requests
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <NewRequestDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
      />
    </div>
  );
};

export default Dashboard;
