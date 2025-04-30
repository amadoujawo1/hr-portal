
import React, { useState } from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLeaveTypeColor, formatDate } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

const CalendarView = () => {
  const { leaveRequests, employees, getEmployeeById } = useLeave();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Filter leave requests for the selected day
  const selectedDayRequests = selectedDate
    ? leaveRequests.filter(
        req =>
          req.status === 'approved' &&
          new Date(req.startDate) <= selectedDate &&
          new Date(req.endDate) >= selectedDate
      )
    : [];

  // Function to highlight days with approved leave requests
  const isDayHighlighted = (date: Date) => {
    return leaveRequests.some(
      req =>
        req.status === 'approved' &&
        new Date(req.startDate) <= date &&
        new Date(req.endDate) >= date
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Leave Calendar</CardTitle>
              <CardDescription>
                View approved leave requests for all team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border mx-auto"
                modifiers={{
                  highlighted: (date) => isDayHighlighted(date),
                }}
                modifiersClassNames={{
                  highlighted: "bg-primary/20",
                }}
                components={{
                  DayContent: ({ date }) => (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div>{date.getDate()}</div>
                      {isDayHighlighted(date) && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50 rounded-sm"></div>
                      )}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDate ? formatDate(selectedDate) : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDayRequests.length === 0
                  ? 'No approved leave requests for this date'
                  : `${selectedDayRequests.length} team member(s) on leave`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedDayRequests.map((request) => {
                  const employee = getEmployeeById(request.employeeId);
                  if (!employee) return null;
                  
                  return (
                    <div
                      key={request.id}
                      className="flex items-center space-x-4 p-3 rounded-md border"
                    >
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{employee.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {employee.department} • {employee.position}
                        </p>
                      </div>
                      <Badge variant="secondary" className={getLeaveTypeColor(request.type)}>
                        {request.type}
                      </Badge>
                    </div>
                  );
                })}
                
                {selectedDayRequests.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No one is on leave for this date</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
