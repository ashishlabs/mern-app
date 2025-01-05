"use client";
import HomeLayout from "@/components/home/Home";
import { apiFetch } from "@/utils/api";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faGraduationCap, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent, SelectLabel } from "@/components/ui/select";  // Ensure Select component is imported
import { SelectGroup } from "@radix-ui/react-select";

interface Student {
    name: string;
    age: number;
    class: string;
    batch: string;
}

const StudentDetails: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [newStudent, setNewStudent] = useState<Student>({
        name: '',
        age: 0,
        class: '',
        batch: '',
    });

    useEffect(() => {
        const fetchStudents = async () => {
            const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students`);
            setStudents(response?.data);
        };
        fetchStudents();
    }, []);

    const addStudent = () => {
        console.log("Adding student", newStudent);
    };

    return (
        <HomeLayout>
            <div className="flex flex-col p-8 min-h-screen bg-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Richa Classes</h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <Card
                            key={student.id}
                            className="shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg border border-gray-200"
                        >
                            <CardHeader className="flex items-center p-4 bg-gray-50 rounded-t-lg">
                                <Avatar>
                                    <AvatarImage src={`/images/students/${student.id}.jpg`} alt={student.name} />
                                    <AvatarFallback className="bg-blue-600 text-white font-bold uppercase">
                                        {student.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-lg font-semibold text-gray-800">{student.name}</CardTitle>
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
                    <Dialog >
                        <DialogTrigger>
                            <button
                                className="p-4 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-2xl" />
                            </button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-lg">
                            <DialogHeader>
                                <DialogTitle >Add New Student</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                        placeholder="Enter student name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={newStudent.age}
                                        onChange={(e) => setNewStudent({ ...newStudent, age: parseInt(e.target.value) })}
                                        placeholder="Enter student age"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="class">Class</Label>
                                    <Input
                                        id="class"
                                        value={newStudent.class}
                                        onChange={(e) => setNewStudent({ ...newStudent, class: e.target.value })}
                                        placeholder="Enter student class"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="batch">Batch</Label>
                                    <Select
                                        value={newStudent.batch}
                                        onValueChange={(value) => setNewStudent({ ...newStudent, batch: value })}
                                    >
                                        <SelectTrigger >
                                            <SelectValue placeholder="Select a batch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Batches</SelectLabel>
                                                <SelectItem value="4pm-6pm">4pm-6pm</SelectItem>
                                                <SelectItem value="5pm-7pm">5pm-7pm</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button onClick={addStudent} className="bg-blue-500 text-white">Add Student</Button>
                                <DialogClose asChild>
                                    <Button className="ml-4">Cancel</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

        </HomeLayout>
    );
};

export default StudentDetails;
