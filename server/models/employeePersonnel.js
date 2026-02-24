import mongoose from "mongoose";

const EmployeePersonnelSchema = new mongoose.Schema({}, {
    strict: false,
    collection: "employeePersonnel"
});

export default mongoose.model("EmployeePersonnel", EmployeePersonnelSchema);