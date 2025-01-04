"use client";

import ConfirmationModal from '@/components/ConfirmationModal';
import HomeLayout from '@/components/home/Home';
import DatePicker from '@/components/todo/DatePicker';
import { Todo } from '@/model/todo/todo';
import { apiFetch } from '@/utils/api';
import { ROUTES } from '@/utils/routes';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';

const TodoDetails = () => {
  const router = useRouter();
  const { id } = useParams();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchTags();
  }, []);



  const handleCreateOrUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    const url = todoToEdit
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${todoToEdit._id}`
      : `${process.env.NEXT_PUBLIC_API_BASE_URL}/todos`;
    const method = todoToEdit ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        body: { title, description, status, priority, tags, dueDate },
      });
      if (response.data) {
        router.push(ROUTES.TODOS);
      }
    } catch (error) {
      console.error(`${todoToEdit ? "Update" : "Create"} todo error:`, error);
    }
  };

  const handleDeleteTodo = async () => {
    console.log(id);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${id}`, {
        method: "DELETE",
      });

      setIsConfirmationModalOpen(false);
      if (response.data) {
        router.push(ROUTES.TODOS);
      }
    } catch (error) {
      console.error("Delete todo error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<Element>) => {
    if (e.key === "Enter") {
      e.preventDefault();
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
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tags`, {
        method: "POST",
        body: { tag: tagInput.trim() },
      });

      const tags = response.data.map((val: any) => val.tag);
      setSuggestions(tags);
    } catch (error) {
      console.error("Add tag error:", error);
    }
  }

  const fetchTags = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const tags = response.data.map((val: any) => val.tag);
      setSuggestions(tags);
    } catch (error) {
      console.error("Fetch tags error:", error);
    }
  };

  const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
  };

  const onSuggestionsClearRequested = () => {
  };

  const getSuggestionValue = (suggestion: string) => suggestion;

  const renderSuggestion = (suggestion: string) => <div>{suggestion}</div>;


  useEffect(() => {
    if (id === ROUTES.CREATE_TODO) {
      setTodoToEdit(null);
      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setTags([]);
      setTagInput("");
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDueDate(tomorrow.toISOString().split("T")[0]);
      return;
    }
    getTodoData();
  }, [id]);
  const getTodoData = async () => {

    const token = localStorage.getItem("token");
    if (!token) {
      router.push(ROUTES.LOGIN);
      return;
    }

    try {
      const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/todos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTodoToEdit(response.data);
      setTitle(response.data.title);
      setDescription(response.data.description);
      setStatus(response.data.status);
      setPriority(response.data.priority);
      setTags(response.data.tags);
      setDueDate(response?.data?.dueDate.split("T")[0]);
    } catch (error) {
      console.error("Fetch todo error:", error);
    }
  }
  return (
    <HomeLayout>
      <div className="flex flex-col p-4 sm:p-8 lg:px-48  min-h-screen bg-gray-100">
        <h2 className="text-lg sm:text-xl font-bold mb-4">{todoToEdit ? "Edit Task" : "Create Task"}</h2>
        <form onSubmit={handleCreateOrUpdateTodo} onKeyDown={handleKeyDown} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
          <div className="flex flex-col">
            <DatePicker dueDate={dueDate} setDueDate={setDueDate} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tags" className="text-sm font-medium text-gray-700">
              Tags
            </label>
            <Autosuggest
              suggestions={suggestions}
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
                input: "mt-1 p-2 border border-gray-300 rounded w-full",
                suggestionsContainer: "absolute z-10 bg-white border border-gray-300 rounded mt-1 ",
                suggestion: "p-2 cursor-pointer",
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
          <button
            onClick={() => handleCreateOrUpdateTodo}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            {todoToEdit ? "Update Task" : "Create Task"}
          </button>
        </form>
        {todoToEdit && (
          <button
            onClick={() => setIsConfirmationModalOpen(true)}
            className="w-full py-2 px-4 bg-red-500 mt-2 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        )}
      </div>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleDeleteTodo}
        message="Are you sure you want to delete this todo?"
      />
    </HomeLayout>
  );
};

export default TodoDetails;
