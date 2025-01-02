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
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link href={ROUTES.DASHBOARD} className="text-xl font-bold hover:text-gray-300">
            MyApp
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href={ROUTES.DASHBOARD} className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link href={ROUTES.TODOS} className="hover:text-gray-300">
              Todo
            </Link>
            <Link href={ROUTES.SONGS} className="hover:text-gray-300">
              Music
            </Link>
          </div>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
        <div className="md:hidden">
          <button onClick={toggleMenu} className="focus:outline-none">
            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden mt-4">
          <Link href={ROUTES.DASHBOARD} className="block py-2 px-4 hover:bg-gray-700" onClick={toggleMenu}>
            Dashboard
          </Link>
          <Link href={ROUTES.TODOS} className="block py-2 px-4 hover:bg-gray-700" onClick={toggleMenu}>
            Todo
          </Link>
          <Link href={ROUTES.PLAYLIST} className="block py-2 px-4 hover:bg-gray-700" onClick={toggleMenu}>
            Music
          </Link>
          <button
            onClick={() => {
              toggleMenu();
              handleLogout();
            }}
            className="block w-full text-left py-2 px-4 bg-red-500 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Navigation;