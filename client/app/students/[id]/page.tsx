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
import { faEdit, faExclamationTriangle, faSave, faTrash, faTrashRestore } from "@fortawesome/free-solid-svg-icons";
import { StatusCodes } from "@/utils/statusCodes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
                    router.push(ROUTES.STUDENTS);
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

        if (response.data) {
            router.push(ROUTES.STUDENTS);
        }
    }


    return (
        <HomeLayout>
            <ContainerLayout>
                <div className="space-y-2 mx-auto p-4 bg-white rounded-md shadow-md group">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold text-gray-800 justify-start">
                            {id !== ROUTES.ADD_STUDENTS ? "Student Details" : "Add New Student"}
                        </h2>
                        <div className="flex gap-3 justify-end">
                            {!isEditing ? (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="primary-subtle"
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                            ) : (
                                <Button
                                    title="Save"
                                    onClick={() => saveStudent()}
                                    variant="primary-subtle"
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                            )}

                            {id !== ROUTES.ADD_STUDENTS && (
                                <Button
                                    onClick={() => setIsConfirmationModalOpen(true)}
                                    variant="destructive-subtle"
                                    size="sm"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            )}
                        </div>
                    </div>


                    <div className="grid grid-cols-2 sm:grid-cols-2  md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <div className="flex items-center p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md shadow-md">
                            <FontAwesomeIcon
                                icon={faExclamationTriangle}
                                className="text-yellow-500 text-xl mr-3"
                            />
                            <div className="flex-1">
                                <p className="font-medium">{deletedStudent?.name} already exists!</p>
                                <p className="text-sm">Do you want to restore the existing student record?</p>
                            </div>
                            <Button
                                className="bg-yellow-500 text-white hover:bg-yellow-600 p-2 rounded-md shadow-sm flex items-center gap-2"
                                onClick={handleRestore}
                            >
                                <FontAwesomeIcon icon={faTrashRestore} />
                                <span>Restore</span>
                            </Button>
                        </div>
                    )}



                </div>
                <div className="space-y-6 mx-auto p-4 mt-4 bg-white rounded-md shadow-md">
                    <FeesTable />
                    {/* <Tabs defaultValue="transaction" >
                        <TabsList>
                            <TabsTrigger value="transaction">Transaction</TabsTrigger>
                        </TabsList>
                        <TabsContent value="transaction">

                        </TabsContent>
                    </Tabs> */}


                </div>
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
