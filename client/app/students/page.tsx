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
            <div className="flex flex-col p-8 min-h-screen bg-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Richa Classes</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {students?.map((student) => (
                        <Card
                            key={student.name}
                            className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg border border-gray-200"
                        >
                            <CardHeader className="flex flex-row gap-4 items-center p-4 bg-gray-50 rounded-t-lg">
                                <Avatar>
                                    <AvatarFallback className="bg-blue-600 text-white font-bold uppercase">
                                        {student.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg font-semibold text-gray-800">{student?.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-6 text-base">
                                    <div className="flex items-center space-x-4">
                                        <FontAwesomeIcon icon={faUser} className="text-blue-500 text-xl" />
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Age</p>
                                            <p className="text-gray-900 text-lg font-semibold">{student.age}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <FontAwesomeIcon icon={faGraduationCap} className="text-green-500 text-xl" />
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Class</p>
                                            <p className="text-gray-900 text-lg font-semibold">{student.class}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <FontAwesomeIcon icon={faClock} className="text-purple-500 text-xl" />
                                        <div>
                                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Batch</p>
                                            <p className="text-gray-900 text-lg font-semibold">{student.batch}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                                <Button
                                    onClick={() => addStudent(student._id)}
                                    variant="outline"
                                    className="w-full text-sm font-medium text-blue-600 border-blue-600 hover:bg-blue-100"
                                >
                                    View Details
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div className="fixed bottom-8 right-8">
                    <FontAwesomeIcon onClick={() => {
                        addStudent(ROUTES.ADD_STUDENTS);
                    }} icon={faPlus} className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl" />
                </div>
            </div>

        </HomeLayout>
    );
};

export default StudentDetails;
