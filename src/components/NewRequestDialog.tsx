
import React, { useState } from 'react';
import { useLeave } from '@/context/LeaveContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { formatDate, calculateLeaveDays } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LeaveType } from '@/types';

interface NewRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewRequestDialog = ({ open, onOpenChange }: NewRequestDialogProps) => {
  const { addLeaveRequest } = useLeave();

  const [leaveType, setLeaveType] = useState<LeaveType>('vacation');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [reason, setReason] = useState('');
  const [isSelectingStartDate, setIsSelectingStartDate] = useState(true);

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (isSelectingStartDate) {
      setStartDate(date);
      setEndDate(date);
      setIsSelectingStartDate(false);
    } else {
      if (startDate && date && date < startDate) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const resetForm = () => {
    setLeaveType('vacation');
    setStartDate(undefined);
    setEndDate(undefined);
    setReason('');
    setIsSelectingStartDate(true);
  };

  const handleSubmit = () => {
    if (startDate && endDate && reason.trim()) {
      addLeaveRequest({
        startDate,
        endDate,
        type: leaveType,
        reason: reason.trim(),
      });
      
      resetForm();
      onOpenChange(false);
    }
  };

  const isFormValid = startDate && endDate && reason.trim().length > 0;
  const leaveDays = startDate && endDate ? calculateLeaveDays(startDate, endDate) : 0;

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Leave Request</DialogTitle>
          <DialogDescription>
            Submit a new leave request for approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <div className="space-y-2">
            <Label htmlFor="type">Leave Type</Label>
            <Select 
              value={leaveType} 
              onValueChange={(value) => setLeaveType(value as LeaveType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick">Sick Leave</SelectItem>
                <SelectItem value="personal">Personal Leave</SelectItem>
                <SelectItem value="bereavement">Bereavement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setEndDate(date);
                        setIsSelectingStartDate(false);
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={!startDate}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => date < (startDate || new Date())}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {startDate && endDate && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex">
                  <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <div className="text-sm text-blue-800">
                    <span className="font-medium">Duration:</span> {leaveDays} working days
                    {leaveDays > 1 && <span> ({formatDate(startDate)} - {formatDate(endDate)})</span>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your leave request"
              className="min-h-[100px]"
            />
          </div>

          {leaveType === 'sick' && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For sick leave longer than 3 consecutive days, a doctor's note may be required.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid}>
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewRequestDialog;
