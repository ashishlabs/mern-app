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
    pending: "bg-yellow-100",
    "in-progress": "bg-blue-100",
    completed: "bg-green-100",
};

const statusTextColors: Record<string, string> = {
    pending: "text-yellow-600",
    "in-progress": "text-blue-600",
    completed: "text-green-600",
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
            <div className="h-screen flex flex-col bg-gray-100">
                <main className="flex-1 flex overflow-x-auto p-4">
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
            className={`flex-1 p-4 mx-2 rounded-lg shadow-md ${statusColors[status]
                }`}
        >
            <div className="text-center mb-4">
                <h2 className="text-xl font-bold capitalize">{status}</h2>
            </div>
            <div className="space-y-4">
                {todos
                    .filter((todo) => todo.status === status)
                    .map((todo) => (
                        <KanbanItem key={todo._id} todo={todo}
                            onEdit={(id) => onEdit(id)} />
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

    return (
        <div
            ref={(node) => {
                if (node) drag(node);
            }}
            onClick={() => onEdit(todo._id)}
            className={`p-4 bg-white shadow rounded-lg border-l-4 cursor-pointer  ${isDragging
                ? "opacity-50"
                : "opacity-100"
                } border-${todo.priority === "high"
                    ? "red-500"
                    : todo.priority === "medium"
                        ? "yellow-500"
                        : "green-500"}`}

        >
            <h3 className="text-lg font-bold mb-1">{todo.title}</h3>
            <p className="text-sm text-gray-700 mb-2">{todo.description}</p>
            <p
                className={`text-xs font-semibold uppercase mb-1 ${statusTextColors[todo.status]
                    }`}
            >
                {todo.status}
            </p>
            <p className="text-xs text-gray-500 font-semibold">
                Due: {new Date(todo.dueDate).toLocaleDateString()}
            </p>
            <p className="flex flex-wrap gap-2 mt-2">
                {todo?.tags?.map((tag, index) => (
                    <span key={index} className="bg-gray-200 px-2 py-1 rounded-md flex items-center">
                        {tag}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default Kanban;
