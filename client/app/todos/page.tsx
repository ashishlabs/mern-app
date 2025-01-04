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
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) {
            router.push(ROUTES.LOGIN);
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
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
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
                                openEditModal(ROUTES.CREATE_TODO);
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
                            <div className="fixed bottom-8 right-8">
                                <button onClick={() => {
                                    openEditModal(ROUTES.CREATE_TODO);
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
        </HomeLayout>
    );
}