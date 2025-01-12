"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../utils/routes";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push(ROUTES.LOGIN);
  };

  return (
    <header className="bg-slate-800 text-slate-100 p-4 sticky top-0 z-10 shadow-md transition-all duration-300">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href={ROUTES.DASHBOARD} className="flex items-center transition-transform hover:scale-105">
            <img
              src="/logo.svg"
              alt="Ashish Labs Logo"
              className="h-8 w-auto"
            />
          </Link>
          <div className="hidden md:flex space-x-6">
            <Link
              href={ROUTES.DASHBOARD}
              className="hover:text-teal-300 transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-teal-300"
            >
              Dashboard
            </Link>
            <Link
              href={ROUTES.TODOS}
              className="hover:text-teal-300 transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-teal-300"
            >
              Tasks
            </Link>
            <Link
              href={ROUTES.SONGS}
              className="hover:text-teal-300 transition-colors duration-200 py-2 border-b-2 border-transparent hover:border-teal-300"
            >
              Music
            </Link>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLogout}
            id="btn-logout"
            className="bg-rose-500 hover:bg-rose-600 text-white py-2 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
          >
            Logout
          </button>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none hover:text-teal-300 transition-colors duration-200">
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="text-xl" />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4 bg-slate-700 rounded-lg overflow-hidden shadow-lg transition-all duration-300">
          <Link
            href={ROUTES.DASHBOARD}
            className="block py-3 px-6 hover:bg-slate-600 transition-colors duration-200"
            onClick={toggleMenu}
          >
            Dashboard
          </Link>
          <Link
            href={ROUTES.TODOS}
            className="block py-3 px-6 hover:bg-slate-600 transition-colors duration-200"
            onClick={toggleMenu}
          >
            Todo
          </Link>
          <Link
            href={ROUTES.SONGS}
            className="block py-3 px-6 hover:bg-slate-600 transition-colors duration-200"
            onClick={toggleMenu}
          >
            Music
          </Link>
          <button
            onClick={() => {
              toggleMenu();
              handleLogout();
            }}
            className="block w-full text-left py-3 px-6 bg-rose-500 hover:bg-rose-600 text-white transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navigation;