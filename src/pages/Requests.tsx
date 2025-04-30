
import React, { useState } from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, calculateLeaveDays, getLeaveTypeLabel, getStatusBadgeColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import NewRequestDialog from '@/components/NewRequestDialog';

const Requests = () => {
  const { leaveRequests, currentEmployee } = useLeave();
  const [showDialog, setShowDialog] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Filter requests for current user
  const userRequests = leaveRequests.filter(req => req.employeeId === currentEmployee.id);
  
  // Filter by status
  const pendingRequests = userRequests.filter(req => req.status === 'pending');
  const approvedRequests = userRequests.filter(req => req.status === 'approved');
  const rejectedRequests = userRequests.filter(req => req.status === 'rejected');

  const selectedRequestDetails = selectedRequest 
    ? leaveRequests.find(req => req.id === selectedRequest)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Leave Requests</h1>
        <Button onClick={() => setShowDialog(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({userRequests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <RequestsTable requests={userRequests} onSelectRequest={setSelectedRequest} />
        </TabsContent>
        
        <TabsContent value="pending">
          <RequestsTable requests={pendingRequests} onSelectRequest={setSelectedRequest} />
        </TabsContent>
        
        <TabsContent value="approved">
          <RequestsTable requests={approvedRequests} onSelectRequest={setSelectedRequest} />
        </TabsContent>
        
        <TabsContent value="rejected">
          <RequestsTable requests={rejectedRequests} onSelectRequest={setSelectedRequest} />
        </TabsContent>
      </Tabs>
      
      <NewRequestDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
      />
      
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about this leave request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequestDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{getLeaveTypeLabel(selectedRequestDetails.type)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge className={getStatusBadgeColor(selectedRequestDetails.status)}>
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
              
              {selectedRequestDetails.rejectionReason && (
                <div>
                  <div className="text-sm text-muted-foreground">Rejection Reason</div>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    {selectedRequestDetails.rejectionReason}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Submitted On</div>
                  <div className="font-medium">{formatDate(new Date(selectedRequestDetails.createdAt))}</div>
                </div>
                
                {selectedRequestDetails.updatedAt && (
                  <div>
                    <div className="text-sm text-muted-foreground">Last Updated</div>
                    <div className="font-medium">{formatDate(new Date(selectedRequestDetails.updatedAt))}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface RequestsTableProps {
  requests: any[];
  onSelectRequest: (id: string) => void;
}

const RequestsTable = ({ requests, onSelectRequest }: RequestsTableProps) => {
  if (requests.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No leave requests found in this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardContent className="p-0">
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="py-3 px-4 text-left text-sm font-medium">Type</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Date Range</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Days</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Status</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Submitted</th>
                <th className="py-3 px-4 text-left text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
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
                  <td className="py-3 px-4 text-sm">
                    {formatDate(new Date(request.createdAt))}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    <Button variant="ghost" size="sm" onClick={() => onSelectRequest(request.id)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Requests;
