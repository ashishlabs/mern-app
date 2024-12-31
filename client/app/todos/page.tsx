"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faExclamationCircle, faExclamationTriangle, faArrowDown, faSearch, faArrowCircleDown, faPlus, faTasks, faList } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/Modal";
import ConfirmationModal from "../../components/ConfirmationModal";
import TodoList from "@/components/todo/TodoList";
import TodoForm from "@/components/todo/TodoForm";
import Kanban from "@/components/todo/Kanban";
import HomeLayout from "@/components/home/Home";
import { useDeviceType } from "@/utils/mobile";

interface Todo {
    _id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    tags: string[];
    userId: string;
    createdDate: string;
    dueDate: string;
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
    const [priority, setPriority] = useState("medium");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsList, setSuggestionsList] = useState<string[]>(suggestions);
    const [filterStatus, setFilterStatus] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [dueDate, setDueDate] = useState("");
    const router = useRouter();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const isMobile = useDeviceType();
    const todosPerPage = 10;

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            fetchTodos();
        }
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            if (searchQuery.trim()) {
                searchTodo(searchQuery);
            }
        }, 1000);

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [searchQuery, filterStatus, sortOption, currentPage]);

    const fetchTodos = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos?query=${searchQuery}&status=${filterStatus}&sortBy=${sortOption}&page=${currentPage}&limit=${todosPerPage}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    userId: userId
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch todos");
            }

            const result = await response.json();
            setTodos(Array.isArray(result.data.todos) ? result.data.todos : []);
            setTotalCount(result.data.totalCount);
        } catch (error) {
            setError("Failed to load todos");
            console.error("Fetch todos error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const searchTodo = async (query = "") => {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/search?query=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    userid: userId,
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

    const handleFilterStatus = (e: any) => {
        setFilterStatus(e.target.value);
    }

    const handleSortOption = (e: any) => {
        setSortOption(e.target.value);
    }

    const handleCreateOrUpdateTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        const url = todoToEdit
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todoToEdit._id}`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos`;
        const method = todoToEdit ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, description, userId, status, priority, tags, dueDate }),
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
            setPriority("medium");
            setTags([]);
            setTodoToEdit(null);
            setError('');
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todoId}/status`, {
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todoToDelete}`, {
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

    const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
        if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case "pending":
                return <FontAwesomeIcon icon={faClock} className="text-yellow-500 mr-2" />;
            case "in-progress":
                return <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>;
            case "completed":
                return <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>;
            default:
                return <span className="inline-block w-3 h-3 bg-gray-500 rounded-full mr-2"></span>;
        }
    };

    const getPriorityIcon = (priority: string): JSX.Element => {
        switch (priority) {
            case "high":
                return <FontAwesomeIcon icon={faExclamationCircle} className="text-red-500 ml-2" title="High Priority" />;
            case "medium":
                return <FontAwesomeIcon icon={faExclamationTriangle} className="text-yellow-500 ml-2" title="Medium Priority" />;
            case "low":
                return <FontAwesomeIcon icon={faArrowCircleDown} className="text-green-500 ml-2" title="Low Priority" />;
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${userId}/${todoId}`, {
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
            setPriority(result.data.priority);
            setTags(result.data.tags);
            setIsModalOpen(true);
        } catch (error) {
            setError("Failed to load todo for editing");
            console.error("Fetch todo error:", error);
        }
    };

    const handleTagInputChange = (event: React.FormEvent<HTMLElement>, { newValue }: { newValue: string }) => {
        setTagInput(newValue);
    };

    const handleTagAddition = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim() !== "") {
            if (!tags.some(tag => tag.toLowerCase() === tagInput.trim().toLowerCase())) {
                setTags([...tags, tagInput.trim()]);
                setTagInput("");
                if (!suggestions.some(tag => tag.toLowerCase() === tagInput.trim().toLowerCase())) {
                    addTags();
                }
            }
        }
    };


    const handleTagRemove = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const addTags = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/tags`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    userid: userId,
                },
                body: JSON.stringify({ tag: tagInput.trim() }),
            });

            if (!response.ok) {
                throw new Error("Failed to add tag");
            }
            const result = await response.json();
            const tags = result.data.map((val: any) => val.tag);
            setSuggestions(tags);
        } catch (error) {
            console.error("Add tag error:", error);
        }
    }

    const fetchTags = async () => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/tags`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    userid: userId,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch tags");
            }

            const result = await response.json();
            const tags = result.data.map((val: any) => val.tag);
            setSuggestions(tags);
        } catch (error) {
            setError("Failed to load tags");
            console.error("Fetch tags error:", error);
        }
    };

    const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
        setSuggestionsList(suggestions.filter(suggestion => suggestion.toLowerCase().includes(value.toLowerCase())));
    };

    const onSuggestionsClearRequested = () => {
        setSuggestionsList([]);
    };

    const getSuggestionValue = (suggestion: string) => suggestion;

    const renderSuggestion = (suggestion: string) => <div>{suggestion}</div>;

    return (
        <HomeLayout>
            <div className="flex flex-col p-8 min-h-screen bg-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Todo List</h1>
                </div>

                {/* Filter, Sort, and Search */}
                <div className="flex flex-col sm:flex-row sm:space-x-4 mb-6">
                    {/* Filter Section */}
                    <div className="flex flex-col mb-4 sm:mb-0 w-full sm:w-auto">
                        <label htmlFor="filterStatus" className="text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select
                            id="filterStatus"
                            value={filterStatus}
                            onChange={handleFilterStatus}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    {/* Sort Section */}
                    <div className="flex flex-col mb-4 sm:mb-0 w-full sm:w-auto">
                        <label htmlFor="sortOption" className="text-sm font-medium text-gray-700 mb-1">Sort by</label>
                        <select
                            id="sortOption"
                            value={sortOption}
                            onChange={handleSortOption}
                            className="p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                        >
                            <option value="">Sort By</option>
                            <option value="dueDate">Due Date</option>
                            <option value="priority">Priority</option>
                            <option value="creationDate">Creation Date</option>
                        </select>
                    </div>

                    {/* Search Section */}
                    <div className="flex flex-col flex-grow w-full sm:w-auto">
                        <label htmlFor="searchQuery" className="text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="flex">
                            <input
                                id="searchQuery"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search todos..."
                                className="flex-grow p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={() => fetchTodos()}
                                className="py-2 px-4 bg-blue-500 text-white rounded-r hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* No Todos Available Message */}
                {!isLoading && todos.length === 0 ? (
                    <div className="text-center">
                        <p className="mb-4 text-gray-700">No todos available.</p>
                        <button
                            onClick={() => {
                                setTodoToEdit(null);
                                setTitle("");
                                setDescription("");
                                setStatus("pending");
                                setPriority("medium");
                                setTags([]);
                                setIsModalOpen(true);
                                setTagInput("");
                            }}
                            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Create Todo
                        </button>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="w-full">
                            {/* Pagination */}
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-gray-700">Showing {todos.length} of {totalCount} todos</p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage * todosPerPage >= totalCount}
                                        className="py-2 px-4 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>

                            {/* Todo View (List or Kanban) */}
                            {isMobile === true ? (
                                <TodoList
                                    todos={todos}
                                    handleStatusChange={handleStatusChange}
                                    setTodoToDelete={setTodoToDelete}
                                    setIsConfirmationModalOpen={setIsConfirmationModalOpen}
                                    openEditModal={openEditModal}
                                    getStatusIndicator={getStatusIndicator}
                                    getPriorityIcon={getPriorityIcon}
                                />
                            ) : (
                                <Kanban
                                    todos={todos}
                                    handleStatusChange={handleStatusChange}
                                    handleOnEdit={openEditModal}
                                    handleOnDelete={setTodoToDelete}
                                />
                            )}
                            <div className="fixed bottom-8 right-8">
                                <button
                                    onClick={() => {
                                        setTodoToEdit(null);
                                        setTitle("");
                                        setDescription("");
                                        setStatus("pending");
                                        setPriority("medium");
                                        setTags([]);
                                        setIsModalOpen(true);
                                        setTagInput("");
                                    }}
                                    className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                                </button>
                            </div>
                        </div>
                    )
                )}
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <TodoForm
                    todoToEdit={todoToEdit}
                    title={title}
                    description={description}
                    status={status}
                    priority={priority}
                    tags={tags}
                    tagInput={tagInput}
                    suggestionsList={suggestions}
                    setTitle={setTitle}
                    setDescription={setDescription}
                    setStatus={setStatus}
                    setPriority={setPriority}
                    setTags={setTags}
                    setTagInput={setTagInput}
                    handleTagRemove={handleTagRemove}
                    handleTagInputChange={handleTagInputChange}
                    handleTagAddition={handleTagAddition}
                    onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                    onSuggestionsClearRequested={onSuggestionsClearRequested}
                    getSuggestionValue={getSuggestionValue}
                    renderSuggestion={renderSuggestion}
                    handleCreateOrUpdateTodo={handleCreateOrUpdateTodo}
                    handleKeyDown={handleKeyDown}
                    dueDate={dueDate}
                    setDueDate={setDueDate}
                />
            </Modal>

            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={handleDeleteTodo}
                message="Are you sure you want to delete this todo?"
            />
        </HomeLayout>
    );
}