"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
    dueDate: string;
    setDueDate: (date: string) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({ dueDate, setDueDate }) => {

    const handleDateSelection = (daysToAdd: number) => {
        const newDueDate = format(addDays(new Date(), daysToAdd), "yyyy-MM-dd");
        setDueDate(newDueDate);
    };

    return (
        <div className="flex flex-col">
            <Popover>
                <label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                    Due Date
                </label>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !dueDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                    <div className="rounded-md border">
                        <Calendar mode="single" selected={dueDate ? new Date(dueDate) : undefined} onSelect={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")} />
                    </div>
                    <div className="flex flex-col">
                        <Button variant="link" onClick={() => handleDateSelection(0)}>
                            Today
                        </Button>
                        <Button variant="link" onClick={() => handleDateSelection(1)}>
                            Tomorrow
                        </Button>
                        <Button variant="link" onClick={() => handleDateSelection(7)}>
                            In a week
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DatePicker;
