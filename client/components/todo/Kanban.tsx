"use client";
import { Todo } from "@/model/todo/todo";
import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";


interface KanbanProps {
    todos: Todo[];
    handleStatusChange: (id: string, status: string) => void;
    handleOnEdit: (id: string) => void;
}

const ItemType = "TODO";

const statusColors: Record<string, string> = {
    pending: "bg-amber-50",
    "in-progress": "bg-sky-50",
    completed: "bg-emerald-50",
};

const statusTextColors: Record<string, string> = {
    pending: "text-amber-700",
    "in-progress": "text-sky-700",
    completed: "text-emerald-700",
};

const Kanban: React.FC<KanbanProps> = ({ todos, handleStatusChange, handleOnEdit }) => {
    const statuses = ["pending", "in-progress", "completed"];

    const moveTodo = (id: string, newStatus: string) => {
        handleStatusChange(id, newStatus);
    };
    const onEdit = (id: string) => {
        handleOnEdit(id);
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-1 flex overflow-x-auto p-6">
                    {statuses.map((status) => (
                        <KanbanColumn
                            key={status}
                            status={status}
                            todos={todos}
                            moveTodo={moveTodo}
                            onEdit={onEdit}
                        />
                    ))}
                </main>
            </div>
        </DndProvider>
    );
};

interface KanbanColumnProps {
    status: string;
    todos: Todo[];
    moveTodo: (id: string, newStatus: string) => void;
    onEdit: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    todos,
    moveTodo,
    onEdit,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const [, drop] = useDrop({
        accept: ItemType,
        drop: (item: { id: string }) => moveTodo(item.id, status),
    });

    drop(ref);

    return (
        <div
            ref={ref}
            className={`flex-1 p-6 mx-3 rounded-xl ${statusColors[status]} 
            border-2 border-gray-100 transition-all duration-200 hover:border-gray-200
            min-w-[320px] max-w-md`}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold capitalize ${statusTextColors[status]}`}>
                    {status}
                </h2>
                <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-600">
                    {todos.filter((todo) => todo.status === status).length}
                </span>
            </div>
            <div className="space-y-4">
                {todos
                    .filter((todo) => todo.status === status)
                    .map((todo) => (
                        <KanbanItem key={todo._id} todo={todo} onEdit={onEdit} />
                    ))}
            </div>
        </div>
    );
};

interface KanbanItemProps {
    todo: Todo;
    onEdit: (id: string) => void;
}

const KanbanItem: React.FC<KanbanItemProps> = ({ todo, onEdit }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { id: todo._id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const priorityColors = {
        high: "border-red-500 hover:border-red-600",
        medium: "border-amber-500 hover:border-amber-600",
        low: "border-emerald-500 hover:border-emerald-600",
    };

    const formatDate = (date: string) => {
        const dueDate = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dueDate.toDateString() === today.toDateString()) {
            return "Today";
        } else if (dueDate.toDateString() === tomorrow.toDateString()) {
            return "Tomorrow";
        }
        return dueDate.toLocaleDateString();
    };

    return (
        <div
            ref={(node) => {
                if (node) drag(node);
            }}
            id="todo-item"
            onClick={() => onEdit(todo._id)}
            className={`group p-5 bg-white rounded-xl border-l-4 cursor-pointer 
            ${priorityColors[todo.priority as keyof typeof priorityColors]}
            transition-all duration-200 hover:shadow-md
            ${isDragging ? "opacity-50 scale-95 rotate-2" : "opacity-100"}
            relative`}
        >
            <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${todo.priority === 'high' ? 'bg-red-100 text-red-700' :
                    todo.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'}`}>
                    {todo.priority}
                </span>
            </div>

            <h3 className="text-lg font-bold mb-2 text-gray-800 pr-20">{todo.title}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{todo.description}</p>
            
            <div className="flex items-center gap-3 mb-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" strokeLinecap="round" 
                    strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm text-gray-500">
                    {formatDate(todo.dueDate)}
                </span>
            </div>

            {todo?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {todo.tags.map((tag, index) => (
                        <span 
                            key={index} 
                            className="bg-gray-50 px-2.5 py-1 rounded-full text-xs text-gray-600 
                            font-medium group-hover:bg-gray-100 transition-colors duration-200"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Kanban;
