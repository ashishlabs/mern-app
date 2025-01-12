import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faList, faMap, faMusic } from "@fortawesome/free-solid-svg-icons";
import HomeLayout from "@/components/home/Home";

const Dashboard = () => {
    const apps = [
        {
            name: "Quick Task",
            description: "Manage your tasks efficiently",
            icon: faList,
            link: "/todos",
            bgColor: "bg-emerald-50",
            iconColor: "text-emerald-600",
            hoverBg: "hover:bg-emerald-100"
        },
        {
            name: "Music",
            description: "Listen to your favorite songs",
            icon: faMusic,
            link: "/songs",
            bgColor: "bg-purple-50",
            iconColor: "text-purple-600",
            hoverBg: "hover:bg-purple-100"
        },
        {
            name: "Richa Classes",
            description: "Manage richa classes",
            icon: faBook,
            link: "/students",
            bgColor: "bg-blue-50",
            iconColor: "text-blue-600",
            hoverBg: "hover:bg-blue-100"
        }
    ];

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-8">
                <h1 className="text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                    Dashboard
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {apps.map((app) => (
                        <Link 
                            href={app.link} 
                            key={app.name} 
                            className={`block p-8 ${app.bgColor} rounded-xl shadow-sm 
                            ${app.hoverBg} hover:shadow-md transition-all duration-300 
                            transform hover:-translate-y-1`}
                        >
                            <div className="flex items-center mb-4">
                                <div className={`p-3 rounded-lg ${app.iconColor} bg-white/80 mr-4`}>
                                    <FontAwesomeIcon icon={app.icon} className="text-2xl" />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">{app.name}</h2>
                            </div>
                            <p className="text-gray-600">{app.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </HomeLayout>
    );
};

export default Dashboard;