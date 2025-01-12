"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ConfirmationModal from "@/components/ConfirmationModal";
import HomeLayout from "@/components/home/Home";
import FeesTable from "@/components/students/fees";
import { Button } from "@/components/ui/button";
import ContainerLayout from "@/components/ui/container";
import { useToast } from "@/hooks/use-toast";
import { Student } from "@/model/students/student.model";
import { apiFetch } from "@/utils/api";
import { ROUTES } from "@/utils/routes";
import LabsField from "@/components/students/LabsField";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faExclamationTriangle, faRocket, faSave, faTrash, faTrashRestore } from "@fortawesome/free-solid-svg-icons";
import { StatusCodes } from "@/utils/statusCodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-select";

const StudentDetails = () => {
    const initialStudentState = {
        name: "",
        age: 0,
        class: "",
        batch: "",
    };
    const router = useRouter();
    const { id } = useParams();
    const { toast } = useToast();
    const batches = [
        { value: "4pm-6pm", label: "4pm-6pm" },
        { value: "5pm-7pm", label: "5pm-7pm" }
    ]
    const [isEditing, setIsEditing] = useState(false);
    const [isRestore, setIsRestore] = useState(false);
    const [deletedStudent, setDeletedStudent] = useState<Student>(initialStudentState);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const [newStudent, setNewStudent] = useState<Student>(initialStudentState);

    useEffect(() => {
        fetchStudentDetail();
    }, []);

    const fetchStudentDetail = async () => {
        if (id === ROUTES.ADD_STUDENTS) {
            setIsEditing(true);
            return;
        }
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${id}`);
        if (response?.data) {
            setNewStudent(response.data);
        }
    };

    const saveStudent = async () => {
        let url = id === ROUTES.ADD_STUDENTS
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/students`
            : `${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${id}`;

        const response = await apiFetch(url, {
            method: "POST",
            body: {
                name: newStudent.name,
                age: newStudent.age,
                class: newStudent.class,
                batch: newStudent.batch,
            },
        });
        switch (response?.statusCode) {
            case StatusCodes.OK:
                toast({
                    title: response?.message,
                    variant: "success",
                });
                if (id === ROUTES.ADD_STUDENTS) {
                    router.push(`${ROUTES.STUDENTS}/${response.data._id}`);
                } else {
                    setIsEditing(false);
                }
                break;
            case StatusCodes.CONFLICT:
                setIsRestore(true);
                setDeletedStudent(response.data)
                break;
        }
    };

    const deleteStudent = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }

        try {
            const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${id}`, {
                method: "DELETE",
            });

            setIsConfirmationModalOpen(false);
            if (response.data) {
                toast({
                    title: response.data.name + " deleted successfully",
                    variant: "success",
                });
                router.push(ROUTES.STUDENTS);
            }
        } catch (error) {
            console.error("Delete todo error:", error);
        }
    };

    const handleRestore = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/students/${deletedStudent?._id}`,
            {
                method: "PUT",
            });

        switch (response?.statusCode) {
            case StatusCodes.OK:
                toast({
                    title: response?.message,
                    variant: "success",
                });
                if (id === ROUTES.ADD_STUDENTS) {
                    router.push(`${ROUTES.STUDENTS}/${response.data._id}`);
                } else {
                    setIsEditing(false);
                }
                break;
        }
    }

    const openStudent = () => {
        if (id === ROUTES.ADD_STUDENTS) {
            router.push(`${ROUTES.STUDENTS}/${deletedStudent._id}`);
        } else {
            setIsEditing(false);
        }
    }


    return (
        <HomeLayout>
            <ContainerLayout>
                <Card className="bg-white/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">
                            {id !== ROUTES.ADD_STUDENTS ? "Student Details" : "Add New Student"}
                        </h2>
                        <div className="flex gap-3">
                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-gray-100 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faEdit} className="text-gray-600" />
                                </Button>
                            ) : (
                                <Button
                                    title="Save"
                                    onClick={() => saveStudent()}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-green-50 text-green-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                            )}

                            {id !== ROUTES.ADD_STUDENTS && (
                                <Button
                                    onClick={() => setIsConfirmationModalOpen(true)}
                                    variant="outline"
                                    size="sm"
                                    className="hover:bg-red-50 text-red-600 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            )}
                        </div>
                    </CardHeader>

                    <Separator className="my-2" />

                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="col-span-1">
                                <LabsField label="Name"
                                    isEditing={isEditing}
                                    inputType="text"
                                    placeholder="Enter name"
                                    value={newStudent.name}
                                    onChange={(value: string) =>
                                        setNewStudent({ ...newStudent, name: value })
                                    }
                                />
                            </div>

                            <div className="col-span-1">
                                <LabsField label="Age"
                                    isEditing={isEditing}
                                    inputType="number"
                                    value={newStudent.age}
                                    placeholder="Enter age"
                                    onChange={(value: number) =>
                                        setNewStudent({ ...newStudent, age: value })
                                    }
                                />
                            </div>

                            <div className="col-span-1">
                                <LabsField label="Class"
                                    isEditing={isEditing}
                                    inputType="text"
                                    value={newStudent.class}
                                    placeholder="Enter class"
                                    onChange={(value: string) =>
                                        setNewStudent({ ...newStudent, class: value })
                                    }
                                />
                            </div>

                            <div className="col-span-1">
                                <LabsField label="Batch"
                                    isEditing={isEditing}
                                    inputType="text"
                                    value={newStudent.batch}
                                    fieldType="select"
                                    placeholder="Select batch"
                                    onChange={(value: string) =>
                                        setNewStudent({ ...newStudent, batch: value })
                                    }
                                    options={batches}
                                />
                            </div>
                        </div>

                        {isRestore && (
                            <div className="mt-6 flex items-center p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                                <FontAwesomeIcon
                                    icon={faExclamationTriangle}
                                    className="text-amber-500 text-xl mr-3"
                                />
                                <div className="flex-1">
                                    <p className="font-medium">{deletedStudent?.name} already exists!</p>
                                    {deletedStudent?.isDeleted && (
                                        <p className="text-sm text-amber-700">Do you want to restore the existing student record?</p>
                                    )}
                                </div>
                                {deletedStudent?.isDeleted ? (
                                    <Button
                                        className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
                                        onClick={handleRestore}
                                    >
                                        <FontAwesomeIcon icon={faTrashRestore} className="mr-2" />
                                        <span>Restore</span>
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="border-amber-200 text-amber-800 hover:bg-amber-100"
                                        onClick={openStudent}
                                    >
                                        <FontAwesomeIcon icon={faRocket} className="mr-2" />
                                        <span>Open Student</span>
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="mt-6 bg-white/50 backdrop-blur-sm">
                    <CardContent >
                        <FeesTable />
                    </CardContent>
                </Card>
            </ContainerLayout>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setIsConfirmationModalOpen(false)}
                onConfirm={deleteStudent}
                message="Are you sure you want to remove this student?"
            />
        </HomeLayout>
    );
};

export default StudentDetails;
