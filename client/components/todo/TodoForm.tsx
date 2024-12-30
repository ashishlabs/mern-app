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
            <h2 className="text-xl font-bold mb-4">{todoToEdit ? "Edit Todo" : "Create Todo"}</h2>
            <form onSubmit={handleCreateOrUpdateTodo} onKeyDown={handleKeyDown}>
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <div className="flex space-x-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="priority"
                                value="low"
                                checked={priority === "low"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio"
                            />
                            <span className="ml-2">Low</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="priority"
                                value="medium"
                                checked={priority === "medium"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio"
                            />
                            <span className="ml-2">Medium</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="priority"
                                value="high"
                                checked={priority === "high"}
                                onChange={(e) => setPriority(e.target.value)}
                                className="form-radio"
                            />
                            <span className="ml-2">High</span>
                        </label>
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        required
                        className="mt-1 p-2 w-full border border-gray-300 rounded"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                        Tags
                    </label>
                    <Autosuggest
                        suggestions={suggestionsList}
                        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={onSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={{
                            placeholder: "Add a tag",
                            value: tagInput,
                            onChange: handleTagInputChange,
                            onKeyDown: handleTagAddition,
                        }}
                        theme={{
                            input: "mt-1 p-2 w-full border border-gray-300 rounded",
                            suggestionsContainer: "absolute z-10 bg-white border border-gray-300 rounded mt-1",
                            suggestion: "p-2 cursor-pointer",
                            suggestionHighlighted: "bg-gray-200",
                        }}
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tags?.map((tag, index) => (
                            <span key={index} className="bg-gray-200 px-2 py-1 rounded-full flex items-center">
                                {tag}
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className="ml-2 cursor-pointer"
                                    onClick={() => handleTagRemove(tag)}
                                />
                            </span>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700">
                    {todoToEdit ? "Update Todo" : "Create Todo"}
                </button>
            </form>
        </>
    );
}