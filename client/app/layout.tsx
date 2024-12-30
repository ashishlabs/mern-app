"use client";
import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faList, faMusic, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import "./globals.css"; 
import PushNotification from "@/components/notifications/push.notification";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  return (
    <html lang="en">
    <head>
      <title>Todo App</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body className="min-h-screen">
      {showSidebar && (
        <aside className={`bg-gray-800 text-white flex flex-col transition-width duration-300 ${isCollapsed ? "w-16" : "w-64"} fixed top-0 left-0 h-full`}>
          <div className="p-4 text-2xl font-bold flex justify-between items-center">
            <span className={`${isCollapsed ? "hidden" : "block"}`}>Todo App</span>
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronLeft} />
            </button>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/todos" className="block py-2 px-4 rounded hover:bg-gray-700 flex items-center">
                  <FontAwesomeIcon icon={faList} className="mr-2" />
                  <span className={`${isCollapsed ? "hidden" : "block"}`}>Todo List</span>
                </Link>
              </li>
              <li>
                <Link href="/playlist" className="block py-2 px-4 rounded hover:bg-gray-700 flex items-center">
                  <FontAwesomeIcon icon={faMusic} className="mr-2" />
                  <span className={`${isCollapsed ? "hidden" : "block"}`}>Songs List</span>
                </Link>
              </li>
            </ul>
          </nav>
          <div className="p-4">
            <button onClick={handleLogout} className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </aside>
      )}
      <main className={`flex-1 p-4 transition-margin duration-300 ${showSidebar ? (isCollapsed ? "ml-16" : "ml-64") : "ml-0"}`}>
        {children}
      </main>
      <PushNotification />
    </body>
  </html>
  );
}