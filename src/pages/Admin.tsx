
import React, { useState } from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, calculateLeaveDays, getLeaveTypeLabel, getStatusBadgeColor, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Admin = () => {
  const { leaveRequests, updateLeaveStatus, employees, getEmployeeById } = useLeave();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  
  // Filter only pending requests for admin view
  const pendingRequests = leaveRequests.filter(req => req.status === 'pending');
  
  // All leave requests for team view
  const allRequests = [...leaveRequests].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const selectedRequestDetails = selectedRequest 
    ? leaveRequests.find(req => req.id === selectedRequest)
    : null;
    
  const handleApprove = () => {
    if (selectedRequest) {
      updateLeaveStatus(selectedRequest, 'approved');
      setSelectedRequest(null);
      setShowApproveDialog(false);
    }
  };
  
  const handleReject = () => {
    if (selectedRequest && rejectionReason.trim()) {
      updateLeaveStatus(selectedRequest, 'rejected', rejectionReason);
      setSelectedRequest(null);
      setShowRejectDialog(false);
      setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{employees.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {leaveRequests.filter(req => 
                req.status === 'approved' && 
                new Date(req.updatedAt || req.createdAt).getMonth() === new Date().getMonth()
              ).length}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>Leave requests that require your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No pending requests require your approval</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left text-sm font-medium">Employee</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Type</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Date Range</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Days</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Submitted</th>
                    <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => {
                    const employee = getEmployeeById(request.employeeId);
                    if (!employee) return null;
                    
                    return (
                      <tr key={request.id} className="border-t">
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <span>{employee.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{getLeaveTypeLabel(request.type)}</td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(new Date(request.startDate))} - {formatDate(new Date(request.endDate))}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {calculateLeaveDays(new Date(request.startDate), new Date(request.endDate))}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {formatDate(new Date(request.createdAt))}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-auto w-auto text-green-600 hover:text-green-800" 
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setShowApproveDialog(true);
                              }}
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-0 h-auto w-auto text-red-600 hover:text-red-800" 
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setShowRejectDialog(true);
                              }}
                            >
                              <XCircle className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedRequest(request.id)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>View and manage your team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="py-3 px-4 text-left text-sm font-medium">Employee</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Position</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Department</th>
                  <th className="py-3 px-4 text-left text-sm font-medium">Contact</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id} className="border-t">
                    <td className="py-3 px-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={employee.avatar} />
                          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                        </Avatar>
                        <span>{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{employee.position}</td>
                    <td className="py-3 px-4 text-sm">{employee.department}</td>
                    <td className="py-3 px-4 text-sm">{employee.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Request Details Dialog */}
      <Dialog open={!!selectedRequest && !showApproveDialog && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequestDetails && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Employee</div>
                <div className="font-medium">
                  {getEmployeeById(selectedRequestDetails.employeeId)?.name}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{getLeaveTypeLabel(selectedRequestDetails.type)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge variant="outline" className={getStatusBadgeColor(selectedRequestDetails.status)}>
                    {selectedRequestDetails.status.charAt(0).toUpperCase() + selectedRequestDetails.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Start Date</div>
                  <div className="font-medium">{formatDate(new Date(selectedRequestDetails.startDate))}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">End Date</div>
                  <div className="font-medium">{formatDate(new Date(selectedRequestDetails.endDate))}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Total Days</div>
                <div className="font-medium">
                  {calculateLeaveDays(
                    new Date(selectedRequestDetails.startDate),
                    new Date(selectedRequestDetails.endDate)
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Reason</div>
                <div className="rounded-md bg-muted p-3 text-sm">
                  {selectedRequestDetails.reason}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                  <div className="font-medium">{formatDate(new Date(selectedRequestDetails.createdAt))}</div>
                </div>
              </div>
              
              {selectedRequestDetails.status === 'pending' && (
                <DialogFooter className="mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowRejectDialog(true);
                    }}
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowApproveDialog(true);
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={(open) => {
        if (!open) {
          setShowApproveDialog(false);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Leave Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this leave request?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
            <AlertCircle className="text-green-600 mr-3 mt-0.5 h-5 w-5" />
            <div>
              <h4 className="text-green-800 font-medium text-sm">Confirmation</h4>
              <p className="text-green-700 text-sm">
                This will approve the leave request and notify the employee.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowApproveDialog(false);
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={(open) => {
        if (!open) {
          setShowRejectDialog(false);
          setRejectionReason('');
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea 
                id="reason" 
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
              <AlertCircle className="text-red-600 mr-3 mt-0.5 h-5 w-5" />
              <div>
                <h4 className="text-red-800 font-medium text-sm">Important</h4>
                <p className="text-red-700 text-sm">
                  This rejection reason will be visible to the employee.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
                setSelectedRequest(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
