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
        <ul className="space-y-4">
            {todos.map((todo) => (
                <li onClick={() => handleOnEdit(todo._id)} key={todo._id} className="p-4 bg-white shadow-md rounded relative group cursor-pointer">
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