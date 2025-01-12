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
        <div className="flex flex-col space-y-1.5">
            <Popover>
                <label htmlFor="dueDate" className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Due Date
                </label>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal hover:bg-gray-50 dark:hover:bg-gray-800",
                            "transition-colors duration-200",
                            "gap-2",
                            !dueDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-3 p-3">
                    <div className="rounded-md border shadow-sm">
                        <Calendar 
                            mode="single" 
                            selected={dueDate ? new Date(dueDate) : undefined} 
                            onSelect={(date) => setDueDate(date ? format(date, "yyyy-MM-dd") : "")}
                            className="rounded-md"
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <Button 
                            variant="ghost" 
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 justify-start" 
                            onClick={() => handleDateSelection(0)}
                        >
                            Today
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 justify-start" 
                            onClick={() => handleDateSelection(1)}
                        >
                            Tomorrow
                        </Button>
                        <Button 
                            variant="ghost" 
                            className="hover:bg-gray-100 dark:hover:bg-gray-800 justify-start" 
                            onClick={() => handleDateSelection(7)}
                        >
                            In a week
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DatePicker;
