import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import { apiFetch } from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt, faSave, faTimes, faPlus, faAdd } from "@fortawesome/free-solid-svg-icons";
import LabsField from "./LabsField";

const FeesTable = () => {
    const [fees, setFees] = useState([]);
    const [newFee, setNewFee] = useState(null);
    const router = useRouter();
    const { id } = useParams();

    const paymentMethods = [
        { value: "Cash", label: "Cash" },
        { value: "UPI", label: "UPI" },
    ];

    useEffect(() => {
        getFeesData();
    }, []);


    const saveFees = async (newFee) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees`,
            {
                method: "POST",
                body: {
                    amountPaid: newFee?.amountPaid,
                    paymentMethod: newFee?.paymentMethod,
                    paymentDate: newFee?.paymentDate,
                    studentId: id
                }
            }
        );
        if (response.data) {
            setNewFee(null);
        }
    };

    const getFeesData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees/${id}`
        );
        setFees(response?.data.map(data => {
            return {
                ...data,
                isEditing: false
            }
        }));
    };

    const updateFees = async (updatedFees, feesID) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees/${feesID}`,
            {
                method: "POST",
                body: {
                    amountPaid: updatedFees?.amountPaid,
                    paymentMethod: updatedFees?.paymentMethod,
                    paymentDate: updatedFees?.paymentDate,
                    studentId: id
                }
            }
        );
        if (response.data) {
            getFeesData();
        }
    };


    const deleteFees = async (feesID) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees/${feesID}`,
            {
                method: "DELETE",
            }
        );
        if (response.data) {
            getFeesData();
        }
    };

    const handleAddNew = () => {
        setNewFee({
            _id: `new_${Date.now()}`,
            amountPaid: "",
            paymentMethod: "",
            paymentDate: "",
            isEditing: true,
        });
    };

    const handleSaveNew = () => {
        saveFees(newFee);
        setFees((prev) => [...prev, { ...newFee, isEditing: false }]);
        setNewFee(null);
    };

    const handleCancelNew = () => {
        setNewFee(null);
    };

    const handleEdit = (id) => {
        setFees((prev) =>
            prev.map((fee) => (fee._id === id ? { ...fee, isEditing: true } : fee))
        );
    };

    const handleSave = (id) => {
        setFees((prev) =>
            prev.map((fee) => (fee._id === id ? { ...fee, isEditing: false } : fee))
        );
        const updatedFees = fees.find((fee) => fee._id === id);
        updateFees(updatedFees, id)
    };

    const handleCancel = (id) => {
        getFeesData();
    };

    const handleDelete = (id) => {
        deleteFees(id);
    };

    const handleChange = (id, field, value) => {
        if (id.startsWith("new_")) {
            setNewFee((prev) => ({ ...prev, [field]: value }));
        } else {
            setFees((prev) =>
                prev.map((fee) => (fee._id === id ? { ...fee, [field]: value } : fee))
            );
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white">
            <div className="flex">
                <Button
                    onClick={() => handleAddNew()}
                    className="bg-blue-600 text-white hover:bg-blue-700 p-2 
                                    shadow-sm"
                >
                    <FontAwesomeIcon icon={faAdd} />
                </Button>
            </div>
            {newFee && (
                <div className="p-6 border mt-2">
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={handleSaveNew}
                            className="bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-md shadow-sm"
                        >
                            <FontAwesomeIcon icon={faSave} />
                        </Button>
                        <Button
                            onClick={handleCancelNew}
                            className="bg-gray-600 text-white hover:bg-gray-700 p-2 rounded-md shadow-sm"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2  md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <LabsField
                            label="Amount"
                            isEditing={true}
                            onChange={(value) =>
                                handleChange(newFee._id, "amountPaid", value)
                            }
                            value={newFee.amountPaid}
                            inputType="number"
                            fieldType="amount"
                        />
                        <LabsField
                            label="Payment Method"
                            isEditing={true}
                            onChange={(value) =>
                                handleChange(newFee._id, "paymentMethod", value)
                            }
                            value={newFee.paymentMethod}
                            fieldType="select"
                            options={paymentMethods}
                        />
                        <LabsField
                            label="Payment Date"
                            isEditing={true}
                            onChange={(value) =>
                                handleChange(newFee._id, "paymentDate", value)
                            }
                            value={newFee.paymentDate}
                            fieldType="date"
                        />
                    </div>
                </div>
            )}

            {fees.map((fee) => (
                <div key={fee._id} className="p-6 border mt-2 group ">
                    <div className="flex gap-3 justify-end">
                        {fee.isEditing ? (
                            <>
                                <Button
                                    onClick={() => handleSave(fee._id)}
                                    className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white hover:bg-blue-700 p-2 rounded-md shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faSave} />
                                </Button>
                                <Button
                                    onClick={() => handleCancel(fee._id)}
                                    className="opacity-0 group-hover:opacity-100 bg-gray-600 text-white hover:bg-gray-700 p-2 rounded-md shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    onClick={() => handleEdit(fee._id)}
                                    className="opacity-0 group-hover:opacity-100 bg-green-600 text-white hover:bg-green-700 p-2 rounded-md shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                <Button
                                    onClick={() => handleDelete(fee._id)}
                                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white hover:bg-red-700 p-2 rounded-md shadow-sm"
                                >
                                    <FontAwesomeIcon icon={faTrashAlt} />
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2  md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <LabsField
                            label="Amount"
                            isEditing={fee.isEditing}
                            onChange={(value) =>
                                handleChange(fee._id, "amountPaid", value)
                            }
                            value={fee.amountPaid}
                            inputType="number"
                            fieldType="amount"
                        />
                        <LabsField
                            label="Payment Method"
                            isEditing={fee.isEditing}
                            onChange={(value) =>
                                handleChange(fee._id, "paymentMethod", value)
                            }
                            value={fee.paymentMethod}
                            fieldType="select"
                            options={paymentMethods}
                        />
                        <LabsField
                            label="Payment Date"
                            isEditing={fee.isEditing}
                            onChange={(value) =>
                                handleChange(fee._id, "paymentDate", value)
                            }
                            value={fee.paymentDate}
                            fieldType="date"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeesTable;
