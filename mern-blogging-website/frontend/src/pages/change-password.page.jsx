import { useContext, useRef } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import AnimationWrapper from "../common/page-animation";

const ChangePassword = () => {

    let { userAuth: { access_token } } = useContext(UserContext);
    const changePasswordForm = useRef();

    const handlePasswordChange = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { currentPassword, newPassword, confirmPassword } = formData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error("Please fill all fields");
        }

        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match");
        }

        if (newPassword.length < 6) {
            return toast.error("Password should be at least 6 characters long");
        }

        let loadingToast = toast.loading("Changing password...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", {
            currentPassword,
            newPassword
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            toast.success("Password changed successfully!");
            changePasswordForm.current.reset();
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            toast.error(response?.data?.error || "Failed to change password");
        });
    };

    return (
        <AnimationWrapper>
            <Toaster />
            
            <h1 className="max-md:hidden">Change Password</h1>

            {/* Change Password Section */}
            <div className="py-10 w-full">
                {/* Title and Description - Left aligned */}
                <h2 className="text-2xl font-medium mb-2">Update Your Password</h2>
                <p className="text-dark-grey mb-8">Enter your current password and choose a new one</p>
                
                {/* Form with labels on left, inputs on right */}
                <form ref={changePasswordForm} className="w-full">
                    <div className="grid grid-cols-[200px_60%] gap-6 items-start mb-6 max-md:grid-cols-1">
                        <label className="text-dark-grey pt-3">Old password:</label>
                        <InputBox 
                            name="currentPassword" 
                            type="password" 
                            placeholder="" 
                            icon="fi-rr-unlock"
                        />
                    </div>

                    <div className="grid grid-cols-[200px_60%] gap-6 items-start mb-6 max-md:grid-cols-1">
                        <label className="text-dark-grey pt-3">New password:</label>
                        <div className="w-full">
                            <InputBox 
                                name="newPassword" 
                                type="password" 
                                placeholder="" 
                                icon="fi-rr-lock"
                            />
                            <p className="text-dark-grey text-sm mt-2 ml-1">Must be 6-20 characters with a number, lowercase and uppercase letter</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-[200px_60%] gap-6 items-start mb-6 max-md:grid-cols-1">
                        <label className="text-dark-grey pt-3">Confirm new password:</label>
                        <InputBox 
                            name="confirmPassword" 
                            type="password" 
                            placeholder="" 
                            icon="fi-rr-lock"
                        />
                    </div>

                    <div className="ml-[220px] max-md:ml-0">
                        <button 
                            className="btn-dark px-10" 
                            type="submit"
                            onClick={handlePasswordChange}
                        >
                            Change Account Password
                        </button>
                    </div>
                </form>
            </div>

        </AnimationWrapper>
    )
}

export default ChangePassword;
