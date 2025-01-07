import React, { FC } from "react";
import { Label } from "../ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
} from "../ui/select"; // Import Select components from shadcn/ui
import DatePicker from "./DatePicker";

interface EditableFieldProps {
    label: string;
    value: any;
    isEditing: boolean;
    onChange: (value: number | string) => void;
    placeholder?: string;
    inputType?: "text" | "number";
    fieldType?: "amount" | "age" | "select" | "date";
    className?: string;
    options?: { value: string; label: string }[]; // For select options
}

const LabsField: FC<EditableFieldProps> = ({
    label,
    value,
    isEditing,
    onChange,
    placeholder = "Enter value",
    inputType = "text",
    className = "",
    fieldType = "",
    options = [],
}) => {
    const renderInputField = () => {
        switch (fieldType) {
            case "date":
                return (
                    <DatePicker value={value} label={label}
                        onChange={(value) => onChange(value)} />
                );

            case "select":
                return (
                    <Select value={value as string} onValueChange={(val) => onChange(val)}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {options.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                );

            default:
                return (
                    <input
                        type={inputType}
                        value={value}
                        onChange={(e) =>
                            onChange(inputType === "number" ? parseFloat(e.target.value) || 0 : e.target.value)
                        }
                        placeholder={placeholder}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700 focus:ring-2 focus:ring-blue-400"
                    />
                );
        }
    };
    const renderLabel = () => {
        switch (fieldType) {
            case "date":
                return (
                    <p className="text-base text-gray-700">
                        {new Date(value).toLocaleDateString()}
                    </p>
                );

            case "select":
                return (
                    <p className="text-base text-gray-700">{value}</p>
                );

            default:
                return (
                    <p className="text-base text-gray-700">{inputType === "number" ?
                        fieldType === "amount" ? `₹ ${value} ` : value : value}</p>
                );
        }
    };

    return (
        <div className={`${className}`}>
            {label && (
                <Label className="text-sm text-gray-600 mb-1 block">{label}</Label>
            )}
            {isEditing ? (
                renderInputField()
            ) : (
                renderLabel()
            )}
        </div>
    );
};

export default LabsField;
