"use client";
import { useState, useEffect, useRef, JSX } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClock, faExclamationCircle, faExclamationTriangle,
    faSearch, faArrowCircleDown, faPlus
} from "@fortawesome/free-solid-svg-icons";
import TodoList from "@/components/todo/TodoList";
import Kanban from "@/components/todo/Kanban";
import HomeLayout from "@/components/home/Home";
import { useDeviceType } from "@/utils/mobile";
import { ROUTES } from "@/utils/routes";
import { Todo } from "@/model/todo/todo";
import { apiFetch } from "@/utils/api";
import Tooltip from "@/components/common/Tooltip";



export default function Todos() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");
    const [sortOption, setSortOption] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const isMobile = useDeviceType();
    const todosPerPage = 10;


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
        console.log(filterStatus);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }

        try {
            const response = await apiFetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos?query=${searchQuery}&status=${filterStatus}&sortBy=${sortOption}&page=${currentPage}&limit=${todosPerPage}`);
            setTodos(Array.isArray(response.data.todos) ? response.data.todos : []);
            setTotalCount(response.data.totalCount);
        } catch (error) {
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
            router.push(ROUTES.LOGIN);
            return;
        }

        try {
            const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/search?query=${query}`);
            setTodos(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
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


    const handleStatusChange = async (todoId: string, newStatus: string) => {
        console.log(todoId,status);
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }

        try {
            const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todoId}/status`, {
                method: "PATCH",
                body: { status: newStatus },
            });
            setTodos(todos.map(todo => (todo._id === todoId ? { ...todo, status: response.data.status } : todo)));
        } catch (error) {
            console.error("Update todo status error:", error);
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
        router.push(`/todos/${todoId}`);
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n': // Ctrl/Cmd + N to create new task
                        e.preventDefault();
                        openEditModal(ROUTES.CREATE_TODO);
                        break;
                    case 'f': // Ctrl/Cmd + F to focus search
                        e.preventDefault();
                        document.getElementById('searchQuery')?.focus();
                        break;
                }
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);


    return (
        <HomeLayout>
            <div className="flex flex-col p-4 sm:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 sm:mb-0">
                        Task Management
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col">
                        <label htmlFor="filterStatus" className="text-sm font-semibold text-gray-700 mb-2">
                            Filter by Status
                        </label>
                        <select
                            id="filterStatus"
                            value={filterStatus}
                            onChange={handleFilterStatus}
                            className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                     transition-all duration-200 hover:bg-gray-100"
                        >
                            <option value="">All Tasks</option>
                            <option value="pending">⏳ Pending</option>
                            <option value="in-progress">🔄 In Progress</option>
                            <option value="completed">✅ Completed</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="sortOption" className="text-sm font-semibold text-gray-700 mb-2">
                            Sort by
                        </label>
                        <select
                            id="sortOption"
                            value={sortOption}
                            onChange={handleSortOption}
                            className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                     transition-all duration-200 hover:bg-gray-100"
                        >
                            <option value="">Default</option>
                            <option value="dueDate">📅 Due Date</option>
                            <option value="priority">🎯 Priority</option>
                            <option value="creationDate">⭐ Creation Date</option>
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="searchQuery" className="text-sm font-semibold text-gray-700 mb-2">
                            Search Tasks
                        </label>
                        <div className="flex shadow-sm">
                            <input
                                id="searchQuery"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tasks... (Ctrl + F)"
                                className="flex-grow p-2.5 bg-gray-50 border border-gray-200 rounded-l-lg
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                         transition-all duration-200"
                            />
                            <button
                                onClick={() => fetchTodos()}
                                className="px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700
                                         focus:outline-none focus:ring-2 focus:ring-blue-500
                                         transition-all duration-200 active:bg-blue-800"
                            >
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>
                </div>

                {!isLoading && todos.length === 0 ? (
                    <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <div className="mb-4 text-gray-400">
                            <FontAwesomeIcon icon={faPlus} className="text-4xl" />
                        </div>
                        <p className="mb-6 text-gray-600">No tasks available. Create your first task to get started!</p>
                        <button
                            onClick={() => openEditModal(ROUTES.CREATE_TODO)}
                            className="py-2.5 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                     transition-all duration-200 transform hover:scale-105"
                        >
                            Create New Task
                        </button>
                    </div>
                ) : (
                    !isLoading && (
                        <div className="w-full">
                            <div className="flex justify-between items-center mb-4 bg-white p-4 rounded-lg shadow-sm">
                                <p className="text-gray-700">
                                    Showing <span className="font-semibold">{todos.length}</span> of{" "}
                                    <span className="font-semibold">{totalCount}</span> tasks
                                </p>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="py-2 px-4 bg-white border border-gray-300 rounded-md
                                                 text-gray-700 hover:bg-gray-50 focus:outline-none 
                                                 focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                                                 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        ← Previous
                                    </button>
                                    <span className="py-2 px-4 bg-blue-50 border border-blue-200 rounded-md">
                                        Page {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={currentPage * todosPerPage >= totalCount}
                                        className="py-2 px-4 bg-white border border-gray-300 rounded-md
                                                 text-gray-700 hover:bg-gray-50 focus:outline-none 
                                                 focus:ring-2 focus:ring-blue-500 disabled:opacity-50
                                                 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                            {isMobile === true ? (
                                <TodoList
                                    todos={todos}
                                    handleStatusChange={handleStatusChange}
                                    getStatusIndicator={getStatusIndicator}
                                    getPriorityIcon={getPriorityIcon}
                                    handleOnEdit={openEditModal}
                                />
                            ) : (
                                <Kanban
                                    todos={todos}
                                    handleStatusChange={handleStatusChange}
                                    handleOnEdit={openEditModal}
                                />
                            )}
                            <div className="fixed bottom-8 right-8 flex flex-col gap-2">
                                <Tooltip text="Create New Task (Ctrl + N)" position="left">
                                    <button
                                        onClick={() => openEditModal(ROUTES.CREATE_TODO)}
                                        className="p-4 bg-blue-600 text-white rounded-full shadow-lg 
                                                 hover:bg-blue-700 hover:scale-110 transform transition-all duration-200
                                                 focus:outline-none focus:ring-4 focus:ring-blue-500/50 
                                                 active:scale-95 active:bg-blue-800"
                                        aria-label="Create new task"
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                                    </button>
                                </Tooltip>
                            </div>
                        </div>
                    )
                )}
            </div>
        </HomeLayout>
    );
}