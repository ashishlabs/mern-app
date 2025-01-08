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
        getFeesData();
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
        <div className="max-w-6xl mx-auto  bg-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-semibold">Transactions</h1>
                <Button
                    onClick={() => openModal()}
                    variant="primary-subtle"
                    size="sm"
                >
                    <FontAwesomeIcon icon={faPlus} /> Add
                </Button>
            </div>

            {fees.length ? (
                <div className="grid grid-cols-1 gap-4">
                    {fees.map((fee) => (
                        <div
                            key={fee._id}
                            className="group p-4 border rounded-md shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="font-medium">Amount Paid: ₹{fee.amountPaid}</p>
                                    <p className="text-sm text-gray-500">
                                        Payment Method: {fee.paymentMethod}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Payment Date: {format(fee.paymentDate, "PPP")}
                                    </p>
                                </div>
                                <div className="flex space-x-2  opacity-100  sm:opacity-0  group-hover:opacity-100">
                                    <Button
                                        onClick={() => openModal(fee)}
                                        variant="primary-subtle"
                                        size="sm"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    <Button
                                        onClick={() => deleteFees(fee._id)}
                                        variant="destructive-subtle"
                                        size="sm"
                                    >
                                        <FontAwesomeIcon icon={faTrashAlt} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No fees records found.</p>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2">
                        <h2 className="text-lg font-semibold mb-4">
                            {modalFee._id ? "Edit Fee" : "Add New Fee"}
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
                        <div className="flex justify-end mt-6 space-x-4">
                            <Button
                                onClick={closeModal}
                                size="sm"
                                variant="secondary-subtle"
                            >
                                <FontAwesomeIcon icon={faTimes} /> Cancel
                            </Button>
                            <Button
                                onClick={handleModalSave}
                                variant="primary-subtle"
                                size="sm"
                            >
                                <FontAwesomeIcon icon={faSave} /> Save
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeesTable;
