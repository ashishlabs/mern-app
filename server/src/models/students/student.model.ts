import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: { type: String },
    fees: { type: Number, default: 700 },
    age: { type: Number },
    class: { type: String },
    batch: { type: String, enum: ["4pm-6pm", "5pm-7pm"], default: "4pm-6pm" },
    createdDate: { type: Date, default: Date.now },

});

const Student = mongoose.model('Student', StudentSchema);

export default Student;