import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useParams, useRouter } from "next/navigation";
import { ROUTES } from "@/utils/routes";
import { apiFetch } from "@/utils/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEdit,
    faTrashAlt,
    faSave,
    faTimes,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import LabsField from "./LabsField";
import { format } from "date-fns"

const FeesTable = () => {
    const [fees, setFees] = useState([]);
    const [modalFee, setModalFee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { id } = useParams();

    const paymentMethods = [
        { value: "Cash", label: "Cash" },
        { value: "UPI", label: "UPI" },
    ];

    useEffect(() => {
        if (id !== ROUTES.ADD_STUDENTS) {
            getFeesData();
        }
    }, []);

    const openModal = (fee = null) => {
        setModalFee(fee || { amountPaid: "", paymentMethod: "", paymentDate: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setModalFee(null);
        setIsModalOpen(false);
    };

    const saveFees = async (newFee) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/fees`, {
            method: "POST",
            body: {
                ...newFee,
                studentId: id,
            },
        });
        if (response.data) {
            getFeesData();
            closeModal();
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
        setFees(response?.data || []);
    };

    const updateFees = async (updatedFee) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees/${updatedFee._id}`,
            {
                method: "POST",
                body: updatedFee,
            }
        );
        if (response.data) {
            getFeesData();
            closeModal();
        }
    };

    const deleteFees = async (feeId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push(ROUTES.LOGIN);
            return;
        }
        const response = await apiFetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/fees/${feeId}`,
            { method: "DELETE" }
        );
        if (response.data) {
            getFeesData();
        }
    };

    const handleModalSave = () => {
        if (modalFee._id) {
            updateFees(modalFee);
        } else {
            saveFees(modalFee);
        }
    };

    const handleInputChange = (field, value) => {
        setModalFee((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-6xl mx-auto bg-gray-50 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-semibold text-gray-800">Transactions</h1>
                <Button
                    onClick={() => openModal()}
                    variant="primary-subtle"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Transaction
                </Button>
            </div>

            {fees.length ? (
                <div className="grid grid-cols-1 gap-5">
                    {fees.map((fee) => (
                        <div
                            key={fee._id}
                            className="group p-6 border border-gray-100 rounded-lg bg-white shadow-sm 
                                     hover:shadow-md transition-all duration-300 relative"
                        >
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <p className="font-medium text-lg text-gray-800">
                                        ₹{fee.amountPaid.toLocaleString('en-IN')}
                                    </p>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <span className="w-32">Payment Method:</span>
                                            <span className="font-medium">{fee.paymentMethod}</span>
                                        </p>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <span className="w-32">Payment Date:</span>
                                            <span className="font-medium">{format(fee.paymentDate, "PPP")}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 
                                            transition-opacity duration-200 absolute right-6">
                                    <Button
                                        onClick={() => openModal(fee)}
                                        variant="primary-subtle"
                                        size="sm"
                                        className="hover:bg-blue-50"
                                    >
                                        <FontAwesomeIcon icon={faEdit} className="text-blue-600" />
                                    </Button>
                                    <Button
                                        onClick={() => deleteFees(fee._id)}
                                        variant="destructive-subtle"
                                        size="sm"
                                        className="hover:bg-red-50"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} className="text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-100">
                    <p className="text-gray-500">No transaction records found.</p>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 
                               backdrop-blur-sm transition-all duration-300">
                    <div className="bg-white p-8 rounded-xl shadow-xl w-11/12 md:w-2/3 lg:w-1/2 
                                  transform transition-all duration-300">
                        <h2 className="text-xl font-semibold mb-6 text-gray-800">
                            {modalFee._id ? "Edit Transaction" : "Add New Transaction"}
                        </h2>
                        <div className="grid gap-4">
                            <LabsField
                                label="Amount"
                                isEditing
                                onChange={(value) => handleInputChange("amountPaid", value)}
                                value={modalFee.amountPaid}
                                inputType="number"
                            />
                            <LabsField
                                label="Payment Method"
                                isEditing
                                onChange={(value) => handleInputChange("paymentMethod", value)}
                                value={modalFee.paymentMethod}
                                fieldType="select"
                                options={paymentMethods}
                            />
                            <LabsField
                                label="Payment Date"
                                isEditing
                                onChange={(value) => handleInputChange("paymentDate", value)}
                                value={modalFee.paymentDate}
                                fieldType="date"
                            />
                        </div>
                        <div className="flex justify-end mt-8 space-x-4">
                            <Button
                                onClick={closeModal}
                                size="sm"
                                variant="secondary-subtle"
                                className="hover:bg-gray-100"
                            >
                                <FontAwesomeIcon icon={faTimes} className="mr-2" /> Cancel
                            </Button>
                            <Button
                                onClick={handleModalSave}
                                variant="primary-subtle"
                                size="sm"
                                className="hover:bg-blue-50"
                            >
                                <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeesTable;
