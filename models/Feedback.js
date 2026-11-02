const mongoose = require("mongoose");
const feedbackSchema = new mongoose.Schema({
    studentName:{
        type: String,
        required: true
    },
    courseName:{
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ["Pending", "Reviewed"],
        default: "Pending"
    }
}, {timestamps: true});
const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports = Feedback;