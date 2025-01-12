"use client";

import ConfirmationModal from '@/components/ConfirmationModal';
import HomeLayout from '@/components/home/Home';
import DatePicker from '@/components/todo/DatePicker';
import ContainerLayout from '@/components/ui/container';
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
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's': // Ctrl/Cmd + S to save
                    e.preventDefault();
                    document.getElementById('btn-create-update-todo')?.click();
                    break;
                case 'b': // Ctrl/Cmd + B to go back
                    e.preventDefault();
                    router.push(ROUTES.TODOS);
                    break;
            }
        }
        // Escape to go back
        if (e.key === 'Escape') {
            router.push(ROUTES.TODOS);
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateOrUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
      <ContainerLayout>
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-2xl font-semibold text-gray-800">{todoToEdit ? "Edit Task" : "Create Task"}</h2>
          <button
            onClick={() => router.push(ROUTES.TODOS)}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2"
          >
            <span>ESC to close</span>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleCreateOrUpdateTodo} onKeyDown={handleKeyDown} className="space-y-6">
          <div className="flex gap-3 mb-6">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all text-sm font-medium ${
                  priority === p 
                    ? `${p === 'high' 
                        ? 'bg-red-50 text-red-700 border-red-200' 
                        : p === 'medium' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200' 
                        : 'bg-green-50 text-green-700 border-green-200'} border-2` 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Title *
              </label>
              <span className="text-sm text-gray-400">
                {title.length}/100
              </span>
            </div>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors({...errors, title: ''});
              }}
              maxLength={100}
              placeholder="What needs to be done?"
              className={`mt-1 p-3 border rounded-lg w-full
                       focus:ring-2 focus:ring-blue-100 focus:border-blue-300 
                       transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
              autoFocus
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          <div className="flex gap-3 mb-4">
            {['pending', 'in-progress', 'completed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all text-sm font-medium ${
                  status === s 
                    ? `${s === 'completed' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : s === 'in-progress' 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'} border-2` 
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">
                  {s === 'pending' ? '⏳' : s === 'in-progress' ? '🔄' : '✅'}
                </span>
                {s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>

          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <span className="text-sm text-gray-400">
                {description.length}/500
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Add details about your task..."
              className="mt-1 p-3 border border-gray-200 rounded-lg w-full
                       focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                       transition-all duration-200 resize-none"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Due Date *</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setDueDate(new Date().toISOString().split('T')[0])}
                className="px-4 py-2 text-sm bg-gray-50 rounded-md hover:bg-gray-100
                         text-gray-600 border border-gray-200 transition-all duration-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setDueDate(tomorrow.toISOString().split('T')[0]);
                }}
                className="px-4 py-2 text-sm bg-gray-50 rounded-md hover:bg-gray-100
                         text-gray-600 border border-gray-200 transition-all duration-200"
              >
                Tomorrow
              </button>
            </div>
            <DatePicker 
              dueDate={dueDate} 
              setDueDate={(date) => {
                setDueDate(date);
                setErrors({...errors, dueDate: ''});
              }} 
            />
            {errors.dueDate && (
              <p className="text-sm text-red-500">{errors.dueDate}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['work', 'personal', 'urgent', 'meeting'].map(tag => (
                !tags.includes(tag) && (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setTags([...tags, tag])}
                    className="px-3 py-1.5 text-sm bg-gray-50 rounded-md hover:bg-gray-100
                             text-gray-600 border border-gray-200 transition-all duration-200"
                  >
                    + {tag}
                  </button>
                )
              ))}
            </div>
            
            <Autosuggest
              suggestions={suggestions}
              onSuggestionsFetchRequested={onSuggestionsFetchRequested}
              onSuggestionsClearRequested={onSuggestionsClearRequested}
              getSuggestionValue={getSuggestionValue}
              renderSuggestion={renderSuggestion}
              inputProps={{
                placeholder: "Type and press Enter to add tag",
                value: tagInput,
                onChange: handleTagInputChange,
                onKeyDown: handleTagAddition,
                className: "w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
              }}
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {tags?.map((tag) => (
                <span key={tag} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md flex items-center border border-blue-100">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t">
            <button
              id="btn-create-update-todo"
              type="submit"
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:ring-offset-2 transition-all duration-200 font-medium"
            >
              {todoToEdit ? "Update Task (Ctrl + S)" : "Create Task (Ctrl + S)"}
            </button>
            {todoToEdit && (
              <button
                type="button"
                onClick={() => setIsConfirmationModalOpen(true)}
                className="py-2.5 px-4 bg-red-50 text-red-600 rounded-lg 
                         hover:bg-red-100 focus:outline-none focus:ring-2 
                         focus:ring-red-500 focus:ring-offset-2 transition-all
                         duration-200 font-medium border border-red-200"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </ContainerLayout>
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
