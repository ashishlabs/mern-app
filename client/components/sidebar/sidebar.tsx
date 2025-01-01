"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faMusic, faBars, faTimes, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <>
      {/* Toggle Button (for opening the sidebar) */}
      {!isOpen && <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded focus:outline-none"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button> }

      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white fixed top-0 left-0 h-full z-40 flex flex-col transition-transform transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } w-64`}
      >
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <span className="text-xl font-bold">Todo App</span>
          {/* Close Button inside Sidebar */}
          {isOpen && <button
            onClick={toggleSidebar}
            className="text-white focus:outline-none"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-4">
            <li>
              <Link
                href="/todos"
                className="block py-2 px-4 rounded hover:bg-gray-700 flex items-center"
                onClick={toggleSidebar} // Close sidebar on navigation
              >
                <FontAwesomeIcon icon={faList} className="mr-2" />
                <span>Todo List</span>
              </Link>
            </li>
            <li>
              <Link
                href="/playlist"
                className="block py-2 px-4 rounded hover:bg-gray-700 flex items-center"
                onClick={toggleSidebar} // Close sidebar on navigation
              >
                <FontAwesomeIcon icon={faMusic} className="mr-2" />
                <span>Songs List</span>
              </Link>
            </li>
          </ul>
        </nav>
         {/* Logout Button */}
         <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700 flex items-center justify-center"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
        ></div>
      )}
    </>
  );
}
