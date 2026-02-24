import mongoose from "mongoose";

const EmployeeAdminSupportSchema = new mongoose.Schema({}, {
    strict: false,
    collection: "employeeAdminSupport"
});

export default mongoose.model("EmployeeAdminSupport", EmployeeAdminSupportSchema);