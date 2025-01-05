import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
    name: String,
    fees: Number,
});

const Student = mongoose.model('Student', StudentSchema);

export default Student;