"use client";
import { JSX } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faPlay, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Todo {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: string[];
    createdDate: string;
    dueDate: string;
}

interface TodoListProps {
    todos: Todo[];
    handleStatusChange: (id: string, status: string) => void;
    getStatusIndicator: (status: string) => JSX.Element;
    getPriorityIcon: (priority: string) => JSX.Element;
    handleOnEdit: (id: string) => void;
}

const TodoList: React.FC<TodoListProps> = ({
    todos,
    handleStatusChange,
    getStatusIndicator,
    getPriorityIcon,
    handleOnEdit
}) => {
    return (
        <ul className="space-y-6 max-w-4xl mx-auto px-4 sm:px-8">
            {todos.map((todo) => (
                <li 
                    key={todo._id} 
                    className="group relative overflow-hidden bg-gradient-to-r from-white/90 to-white/95 
                        backdrop-blur-lg border border-gray-200/60 shadow-sm hover:shadow-lg 
                        rounded-xl transition-all duration-300 ease-out
                        hover:border-indigo-200/60 hover:from-white/95 hover:to-white"
                >
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex gap-1 pt-1">
                                <input
                                    type="checkbox"
                                    checked={todo.status === "completed"}
                                    onChange={() => handleStatusChange(todo._id, todo.status === "completed" ? "pending" : "completed")}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 
                                        focus:ring-indigo-500 cursor-pointer transition-colors"
                                    title={todo.status === "completed" ? "Mark as Incomplete" : "Mark as Complete"}
                                />
                            </div>

                            <div 
                                className="flex-1 cursor-pointer transition-opacity"
                                onClick={() => handleOnEdit(todo._id)}
                                style={{ opacity: todo.status === "completed" ? 0.75 : 1 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <h2 className="text-lg sm:text-xl font-medium flex items-center gap-2 
                                        text-gray-900">
                                        {getStatusIndicator(todo.status)}
                                        <span className={todo.status === "completed" ? "line-through" : ""}>
                                            {todo.title}
                                        </span>
                                    </h2>
                                    <div className="ml-auto flex items-center gap-2">
                                        {getPriorityIcon(todo.priority)}
                                        <span className="hidden sm:inline-block h-5 w-px bg-gray-200" />
                                        <span className={`text-sm font-medium whitespace-nowrap
                                            ${new Date(todo.dueDate) < new Date() 
                                                ? 'text-rose-500' 
                                                : 'text-gray-500'}`}>
                                            Due {new Date(todo.dueDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-base mb-4 line-clamp-2 
                                    group-hover:line-clamp-none transition-all duration-300">
                                    {todo.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {todo?.tags?.map((tag, index) => (
                                            <span 
                                                key={index} 
                                                className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full 
                                                    text-sm font-medium hover:bg-gray-100 
                                                    transition-colors whitespace-nowrap
                                                    border border-gray-100"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-400 ml-auto">
                                        Created {new Date(todo.createdDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default TodoList;