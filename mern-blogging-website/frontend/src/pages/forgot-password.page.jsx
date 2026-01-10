import { useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Link } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState("");
    const [otp, setOTP] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!email.length) {
            return toast.error("Enter your email");
        }

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return toast.error("Email is invalid");
        }

        setLoading(true);

        try {
            const response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password", { email });
            toast.success(response.data.message);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (!otp.length) {
            return toast.error("Enter OTP code");
        }

        if (otp.length !== 6) {
            return toast.error("OTP must be 6 digits");
        }

        setLoading(true);

        try {
            const response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/verify-otp", { email, otp });
            toast.success(response.data.message);
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.error || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

        if (!newPassword.length) {
            return toast.error("Enter new password");
        }

        if (!passwordRegex.test(newPassword)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        setLoading(true);

        try {
            const response = await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/reset-password", { email, newPassword });
            toast.success(response.data.message);
            setTimeout(() => {
                window.location.href = "/signin";
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to reset password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimationWrapper>
            <section className="h-cover flex items-center justify-center px-4">
                <Toaster />
                <form className="w-full max-w-[400px]">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-gelasio capitalize text-center mb-8 sm:mb-12">
                        Reset Password
                    </h1>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-between mb-8">
                        <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-black' : 'text-grey'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-black text-white border-black' : 'border-grey'}`}>
                                1
                            </div>
                            <p className="text-xs mt-1">Email</p>
                        </div>
                        <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-black' : 'bg-grey'}`}></div>
                        <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-black' : 'text-grey'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-black text-white border-black' : 'border-grey'}`}>
                                2
                            </div>
                            <p className="text-xs mt-1">OTP</p>
                        </div>
                        <div className={`h-0.5 flex-1 ${step >= 3 ? 'bg-black' : 'bg-grey'}`}></div>
                        <div className={`flex flex-col items-center flex-1 ${step >= 3 ? 'text-black' : 'text-grey'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'bg-black text-white border-black' : 'border-grey'}`}>
                                3
                            </div>
                            <p className="text-xs mt-1">New Password</p>
                        </div>
                    </div>

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <>
                            <p className="text-dark-grey text-center mb-6">
                                Enter your email address and we'll send you an OTP to reset your password.
                            </p>
                            <InputBox
                                name="email"
                                type="email"
                                placeholder="Email"
                                icon="fi-rr-envelope"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                                className="btn-dark center mt-8 sm:mt-10"
                                type="submit"
                                onClick={handleRequestOTP}
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <>
                            <p className="text-dark-grey text-center mb-6">
                                We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below.
                            </p>
                            <InputBox
                                name="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                icon="fi-rr-shield-check"
                                value={otp}
                                onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            />
                            <button
                                className="btn-dark center mt-8 sm:mt-10"
                                type="submit"
                                onClick={handleVerifyOTP}
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </button>
                            <button
                                className="text-dark-grey hover:text-black underline text-center w-full mt-4"
                                type="button"
                                onClick={handleRequestOTP}
                            >
                                Resend OTP
                            </button>
                        </>
                    )}

                    {/* Step 3: New Password */}
                    {step === 3 && (
                        <>
                            <p className="text-dark-grey text-center mb-6">
                                Enter your new password
                            </p>
                            <InputBox
                                name="newPassword"
                                type="password"
                                placeholder="New Password"
                                icon="fi-rr-key"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <p className="text-xs text-dark-grey mt-2 mb-6">
                                Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter
                            </p>
                            <button
                                className="btn-dark center mt-8 sm:mt-10"
                                type="submit"
                                onClick={handleResetPassword}
                                disabled={loading}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </>
                    )}

                    <div className="mt-8 text-center">
                        <Link to="/signin" className="text-dark-grey hover:text-black underline">
                            Back to Sign In
                        </Link>
                    </div>
                </form>
            </section>
        </AnimationWrapper>
    );
};

export default ForgotPassword;
