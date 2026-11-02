
const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("./models/Feedback");
const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_feedback";

app.use(express.json());

app.post("/api/feedback", async (req, res)=>{
    const{studentName, courseName, message, rating}=req.body??{};

    if(
        typeof studentName !== "string" || !studentName.trim() ||
        typeof courseName !== "string" || !courseName.trim() ||
        typeof message !== "string" || !message.trim() ||
        rating === undefined || rating === null
    ){
        return res.status(400).json({ message: "All fields are required" });
    }

    if(!Number.isInteger(rating) || rating < 1 || rating > 5){
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    try{
        const feedback = await Feedback.create({
            studentName,
            courseName,
            message,
            rating
        });

        return res.status(201).json({
            message: "Feedback submitted successfully",
            feedback
        });
    }catch(error){
        if(error instanceof mongoose.Error.ValidationError){
          return res.status(400).json({ message: error.message });
        }
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

app.get("/api/feedback", async (req, res)=>{
    try{
        const page=parseInt(req.query.page) || 1;
        const limit=parseInt(req.query.limit) || 5;

        if(page<1 || limit<1){
          return res.status(400).json({ message: "Page and limit must be positive numbers" });
        }

        const skip = (page - 1) * limit;
        const feedback = await Feedback.find().skip(skip).limit(limit);
        const totalRecords = await Feedback.countDocuments();

        return res.status(200).json({
            currentPage: page,
            totalRecords,
            feedback
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
});

app.patch("/api/feedback/:id", async (req, res) => {
    try {
        const {id}=req.params;
        const {status}=req.body ?? {};

        if(!mongoose.Types.ObjectId.isValid(id)){
          return res.status(400).json({ message: "Invalid feedback ID" });
        }

        if(typeof status !== "string" || !["Pending", "Reviewed"].includes(status)){
          return res.status(400).json({ message: "Status must be Pending or Reviewed" });
        }

        const feedback=await Feedback.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true }
        );

        if(!feedback){
          return res.status(404).json({ message: "Feedback not found" });
        }

        return res.status(200).json({
          message: "Feedback status updated successfully",
          feedback
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

async function startServer(){
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

if(require.main === module){
    startServer().catch(error => {
        console.error("Failed to connect to MongoDB:", error);
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };
