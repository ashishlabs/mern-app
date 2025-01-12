"use client";
import { JSX } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Autosuggest from "react-autosuggest";

interface TodoFormProps {
    todoToEdit: any;
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: string[];
    tagInput: string;
    suggestionsList: string[];
    dueDate: string;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setStatus: (status: string) => void;
    setPriority: (priority: string) => void;
    setTags: (tags: string[]) => void;
    setTagInput: (tagInput: string) => void;
    setDueDate: (dueDate: string) => void;
    handleTagRemove: (tag: string) => void;
    handleTagInputChange: (event: any, { newValue }: any) => void;
    handleTagAddition: (event: any) => void;
    onSuggestionsFetchRequested: ({ value }: any) => void;
    onSuggestionsClearRequested: () => void;
    getSuggestionValue: (suggestion: string) => string;
    renderSuggestion: (suggestion: string) => JSX.Element;
    handleCreateOrUpdateTodo: (e: React.FormEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent<Element>) => void;
}

export default function TodoForm({
    todoToEdit,
    title,
    description,
    status,
    priority,
    tags,
    tagInput,
    suggestionsList,
    dueDate,
    setTitle,
    setDescription,
    setStatus,
    setPriority,
    setTags,
    setTagInput,
    setDueDate,
    handleTagRemove,
    handleTagInputChange,
    handleTagAddition,
    onSuggestionsFetchRequested,
    onSuggestionsClearRequested,
    getSuggestionValue,
    renderSuggestion,
    handleCreateOrUpdateTodo,
    handleKeyDown,
}: TodoFormProps) {
    return (
        <>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{todoToEdit ? "Edit Todo" : "Create Todo"}</h2>
            <form onSubmit={handleCreateOrUpdateTodo} onKeyDown={handleKeyDown} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 min-h-[100px]"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="status" className="block text-sm font-semibold text-gray-700">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 bg-white"
                    >
                        <option value="pending">📋 Pending</option>
                        <option value="in-progress">🔄 In Progress</option>
                        <option value="completed">✅ Completed</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Priority</label>
                    <div className="flex space-x-6">
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="priority"
                                value="low"
                                checked={priority === "low"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio text-green-500 focus:ring-green-400"
                            />
                            <span className="ml-2 text-gray-700 group-hover:text-green-600 transition-colors">Low</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="priority"
                                value="medium"
                                checked={priority === "medium"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio text-yellow-500 focus:ring-yellow-400"
                            />
                            <span className="ml-2 text-gray-700 group-hover:text-yellow-600 transition-colors">Medium</span>
                        </label>
                        <label className="flex items-center cursor-pointer group">
                            <input
                                type="radio"
                                name="priority"
                                value="high"
                                checked={priority === "high"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio text-red-500 focus:ring-red-400"
                            />
                            <span className="ml-2 text-gray-700 group-hover:text-red-600 transition-colors">High</span>
                        </label>
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700">
                        Due Date
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">
                        Tags
                    </label>
                    <Autosuggest
                        suggestions={suggestionsList}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                            placeholder: "Add a tag and press Enter",
                            value: tagInput,
                            onChange: handleTagInputChange,
                            onKeyDown: handleTagAddition,
                        }}
                        theme={{
                            input: "mt-1 p-3 w-full border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200",
                            suggestionsContainer: "absolute z-10 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 w-full",
                            suggestion: "p-3 cursor-pointer hover:bg-gray-50 transition-colors",
                            suggestionHighlighted: "bg-blue-50",
                        }}
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                        {tags?.map((tag, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full flex items-center group hover:bg-blue-100 transition-colors">
                                {tag}
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className="ml-2 cursor-pointer opacity-60 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleTagRemove(tag)}
                                />
                            </span>
                        ))}
                    </div>
                </div>
                <button 
                    type="submit" 
                    className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-medium text-sm mt-6"
                >
                    {todoToEdit ? "Update Todo" : "Create Todo"}
                </button>
            </form>
        </>
    );
}