import mongoose, { Schema } from "mongoose";

const otpSchema = mongoose.Schema({
    
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // OTP expires after 10 minutes (600 seconds)
    }

}, 
{ 
    timestamps: true 
});

export default mongoose.model("otps", otpSchema);
