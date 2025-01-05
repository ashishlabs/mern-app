import mongoose from 'mongoose';
const BatchSchema = new mongoose.Schema({
    name: String,
    students: [mongoose.Schema.Types.ObjectId],
});
const Batch = mongoose.model('Batch', BatchSchema);

export default Batch;