"use client";
import HomeLayout from "@/components/home/Home";
import { apiFetch } from "@/utils/api";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faGraduationCap, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Student } from "@/model/students/student.model";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";


const StudentDetails: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const router = useRouter();


    useEffect(() => {
        fetchStudents();
    }, []);
    const fetchStudents = async () => {
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students`);
        setStudents(response?.data);
    };
    const addStudent = (studentId) => {
        router.push(`${ROUTES.STUDENTS}/${studentId}`);
    };


    return (
        <HomeLayout>
            <div className="flex flex-col p-8 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
                        Richa Classes
                    </h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students?.map((student) => (
                        <Card
                            key={student.name}
                            onClick={() => addStudent(student._id)}
                            className="cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-xl border border-gray-200/60 backdrop-blur-sm"
                        >
                            <CardHeader className="flex flex-row gap-4 items-center p-4 bg-white/50 rounded-t-xl border-b border-gray-100">
                                <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-blue-100">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold uppercase">
                                        {student.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg font-semibold text-gray-800">{student?.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 bg-white/40">
                                <div className="grid grid-cols-2 gap-6 text-base">
                                    <div className="flex items-center space-x-4 group">
                                        <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                            <FontAwesomeIcon icon={faUser} className="text-blue-500 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Age</p>
                                            <p className="text-gray-900 font-semibold">{student.age}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 group">
                                        <div className="p-2 rounded-lg bg-green-50 group-hover:bg-green-100 transition-colors">
                                            <FontAwesomeIcon icon={faGraduationCap} className="text-green-500 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Class</p>
                                            <p className="text-gray-900 font-semibold">{student.class}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 group">
                                        <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors">
                                            <FontAwesomeIcon icon={faClock} className="text-purple-500 text-lg" />
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Batch</p>
                                            <p className="text-gray-900 font-semibold">{student.batch}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={() => addStudent(ROUTES.ADD_STUDENTS)}
                        className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-blue-200/50 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                    </button>
                </div>
            </div>
        </HomeLayout>
    );
};

export default StudentDetails;
