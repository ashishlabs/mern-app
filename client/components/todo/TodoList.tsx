"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { JSX } from "react";

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
    setTodoToDelete: (id: string) => void;
    setIsConfirmationModalOpen: (isOpen: boolean) => void;
    openEditModal: (id: string) => void;
    getStatusIndicator: (status: string) => JSX.Element;
    getPriorityIcon: (priority: string) => JSX.Element;
}

const TodoList: React.FC<TodoListProps> = ({
    todos,
    handleStatusChange,
    setTodoToDelete,
    setIsConfirmationModalOpen,
    openEditModal,
    getStatusIndicator,
    getPriorityIcon,
}) => {
    return (
        <ul className="space-y-4">
            {todos.map((todo) => (
                <li key={todo._id} className="p-4 bg-white shadow-md rounded relative group">
                    <input
                        type="checkbox"
                        checked={todo.status === "completed"}
                        onChange={() =>
                            handleStatusChange(
                                todo._id,
                                todo.status === "completed" ? "in-progress" : "completed"
                            )
                        }
                        className="form-checkbox h-5 w-5 text-blue-600 absolute top-[20px] left-[16px]"
                    />
                    <FontAwesomeIcon
                        icon={faTrash}
                        onClick={() => {
                            setTodoToDelete(todo._id);
                            setIsConfirmationModalOpen(true);
                        }}
                        className="absolute top-[20px] right-[16px] text-red-500 hover:text-red-700 hidden group-hover:block cursor-pointer"
                    />
                    <FontAwesomeIcon
                        icon={faEdit}
                        onClick={() => openEditModal(todo._id)}
                        className="absolute top-[20px] right-[50px] text-blue-500 hover:text-blue-700 hidden group-hover:block cursor-pointer"
                    />
                    <div className="ml-8">
                        <h2 className="text-xl font-bold flex items-center">
                            {getStatusIndicator(todo.status)}
                            {todo.title}
                            {getPriorityIcon(todo.priority)}
                        </h2>
                        <p>{todo.description}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {todo?.tags?.map((tag, index) => (
                                <span key={index} className="bg-gray-200 px-2 py-1 rounded-full flex items-center">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            <p>Created Date: {new Date(todo.createdDate).toLocaleDateString()}</p>
                            <p>Due Date: {new Date(todo.dueDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default TodoList;