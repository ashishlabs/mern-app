// models/fees.model.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IFees extends Document {
    studentId: mongoose.Schema.Types.ObjectId;
    amountPaid: number;
    dueAmount: number;
    paymentDate: Date;
    paymentMethod: string; // Example: "Cash", "Bank Transfer", etc.
}

const feesSchema: Schema = new Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amountPaid: { type: Number, required: true },
    dueAmount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: {
        type: String, required: true, enum: ["cash", "upi"],
        default: "cash"
    },
}, {
    timestamps: true,
});

const Fees = mongoose.model<IFees>('Fees', feesSchema);

export default Fees;
