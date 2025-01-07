"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "../ui/calendar"

type DatePickerProps = {
    value: string;
    label?: string;
    onChange: (date: string) => void;
};

const DatePicker: React.FC<DatePickerProps> = ({ label, value, onChange }) => {

    return (
        <div className="flex flex-col">
            <Popover>
                {!label ? <label htmlFor="date" className="text-sm font-medium text-gray-700">
                    {label ? label : 'Select Date'}
                </label> : ''}
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[280px] justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {value ? format(value, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                    <div className="rounded-md border">
                        <Calendar mode="single" selected={value ? new Date(value) : undefined}
                            onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")} />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default DatePicker;
