import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faMusic } from "@fortawesome/free-solid-svg-icons";
import HomeLayout from "@/components/home/Home";

const Dashboard = () => {
    const apps = [
        {
            name: "Todo List",
            description: "Manage your tasks and to-dos",
            icon: faList,
            link: "/todos",
        },
        {
            name: "Music",
            description: "Listen to your favorite songs",
            icon: faMusic,
            link: "/songs",
        },
    ];

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apps.map((app) => (
                        <Link href={app.link} key={app.name} className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <FontAwesomeIcon icon={app.icon} className="text-3xl text-blue-500 mr-4" />
                                <h2 className="text-xl font-bold">{app.name}</h2>
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