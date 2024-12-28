"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/Modal";
import ConfirmationModal from "../../components/ConfirmationModal";
import Layout from "../layout";

interface Todo {
    _id: string;
    title: string;
    description: string;
    status: string;
    userId: string;
}

export default function Todos() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [todoToDelete, setTodoToDelete] = useState<string | null>(null);
    const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("pending");
    const router = useRouter();

    useEffect(() => {
        const fetchTodos = async () => {
            const token = localStorage.getItem("token");
            const userId = localStorage.getItem("userId");
            if (!token || !userId) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/v1/todos?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch todos");
                }

                const result = await response.json();
                setTodos(Array.isArray(result.data) ? result.data : []);
            } catch (error) {
                setError("Failed to load todos");
                console.error("Fetch todos error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodos();
    }, [router]);

    const handleCreateOrUpdateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        const url = todoToEdit
            ? `http://localhost:5000/api/v1/todos/${todoToEdit._id}`
            : "http://localhost:5000/api/v1/todos";
        const method = todoToEdit ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, userId, status }),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${todoToEdit ? "update" : "create"} todo`);
            }

            const result = await response.json();
            if (todoToEdit) {
                setTodos(todos.map(todo => (todo._id === todoToEdit._id ? result.data : todo)));
            } else {
                setTodos([...todos, result.data]);
            }

            setIsModalOpen(false);
            setTitle("");
            setDescription("");
            setStatus("pending");
            setTodoToEdit(null);
        } catch (error) {
            setError(`Failed to ${todoToEdit ? "update" : "create"} todo`);
            console.error(`${todoToEdit ? "Update" : "Create"} todo error:`, error);
        }
    };

    const handleStatusChange = async (todoId: string, newStatus: string) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/todos/${todoId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error("Failed to update todo status");
            }

            const updatedTodo = await response.json();
            setTodos(todos.map(todo => (todo._id === todoId ? { ...todo, status: updatedTodo.data.status } : todo)));
        } catch (error) {
            setError("Failed to update todo status");
            console.error("Update todo status error:", error);
        }
    };

    const handleDeleteTodo = async () => {
        if (!todoToDelete) return;

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/todos/${todoToDelete}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to delete todo");
            }

            setTodos(todos.filter(todo => todo._id !== todoToDelete));
            setTodoToDelete(null);
            setIsConfirmationModalOpen(false);
        } catch (error) {
            setError("Failed to delete todo");
            console.error("Delete todo error:", error);
        }
    };

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>;
            case "in-progress":
                return <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>;
            case "completed":
                return <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>;
            default:
                return <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>;
        }
    };

    const openEditModal = async (todoId: string) => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/v1/todos/${userId}/${todoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch todo");
            }

            const result = await response.json();
            setTodoToEdit(result.data);
            setTitle(result.data.title);
            setDescription(result.data.description);
            setStatus(result.data.status);
            setIsModalOpen(true);
        } catch (error) {
            setError("Failed to load todo for editing");
            console.error("Fetch todo error:", error);
        }
    };

    return (
        <Layout>
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <div className="loader"></div>
                </div>
            ) : (
                <div className="flex flex-col p-8 min-h-screen">
                    <div className="flex justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-4">Todo List</h1>
                        </div>
                        {todos.length >0 && ( <button
                            onClick={() => {
                                setTodoToEdit(null);
                                setTitle("");
                                setDescription("");
                                setStatus("pending");
                                setIsModalOpen(true);
                            }}
                            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
                        >
                            Create Todo
                        </button>)}
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    {todos.length === 0 ? (
                        <div className="text-center">
                            <p className="mb-4">No todos available.</p>
                            <button
                                onClick={() => {
                                    setTodoToEdit(null);
                                    setTitle("");
                                    setDescription("");
                                    setStatus("pending");
                                    setIsModalOpen(true);
                                }}
                                className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
                            >
                                Create Todo
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            <ul className="space-y-4">
                                {todos.map((todo) => (
                                    <li key={todo._id} className="p-4 bg-white shadow-md rounded relative group">
                                        <input
                                            type="checkbox"
                                            checked={todo.status === "completed"}
                                            onChange={() => handleStatusChange(todo._id, todo.status === "completed" ? "in-progress" : "completed")}
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
                                            <h2 className="text-xl font-bold">{todo.title}</h2>
                                            <p>{todo.description}</p>
                                            <p className="flex items-center">
                                                {getStatusIndicator(todo.status)}
                                                Status: {todo.status}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 className="text-xl font-bold mb-4">{todoToEdit ? "Edit Todo" : "Create Todo"}</h2>
                <form onSubmit={handleCreateOrUpdateTodo}>
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
                            required
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
                    <button type="submit" className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700">
                        {todoToEdit ? "Update Todo" : "Create Todo"}
                    </button>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handleDeleteTodo}
                message="Are you sure you want to delete this todo?"
            />
        </Layout>
    );
}