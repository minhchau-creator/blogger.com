import AnimationWrapper from "../common/page-animation"; //makes page fade in
import InputBox from "../components/input.component"; // input  email, password 
import { Link, Navigate } from "react-router-dom"; //Navigate between pages, redirect user programmatically
import { Toaster, toast } from "react-hot-toast"; // toaster for showing success/error messages, toast for showing individual messages
import axios from "axios"; // make HTTP requests to serevr backend (API calls)
import { storeInSession } from "../common/session"; // save user data in session storage
import { UserContext } from "../App"; // Access global user state (shared across all pages)
import { useContext } from "react"; // Access React context API for global state management
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const UserAuthForm = ({ type }) => { // type: "sign-in" or "sign-up"

    // get data from gloabal context -> return: access_token = "abcxyz" if logged in, null if not 
    const { userAuth: { access_token }, setUserAuth } = useContext(UserContext);
    
    // Send login/signup data to backend
    const userAuthThroughServer = (serverRoute, formData) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
        })
        .catch(({ response }) => {
            toast.error(response.data.error);
        })

    }

    // Handle Google OAuth
    const handleGoogleSuccess = (credentialResponse) => {
        console.log("Google credential received:", credentialResponse);
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/google-auth", {
            access_token: credentialResponse.credential
        })
        .then(({ data }) => {
            console.log("Auth successful:", data);
            storeInSession("user", JSON.stringify(data));
            setUserAuth(data);
        })
        .catch((error) => {
            console.error("Google auth error:", error);
            const errorMessage = error.response?.data?.error || "Failed to authenticate with Google";
            toast.error(errorMessage);
        });
    };

    const handleSubmit = (e) => {

        e.preventDefault();

        let serverRoute = type == "sign-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;  //Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters

        let form = new FormData(formElement);
        let formData = {};

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { fullname, email, password } = formData;

        // Validations
        if(fullname){
            if(fullname.length < 3){
                return toast.error("Fullname must be at least 3 letters long");
            }
        }
        if(!email.length){
            return toast.error("Enter Email");
        }
        if(!emailRegex.test(email)){
            return toast.error("Email is invalid");
        }
        if(!passwordRegex.test(password)){
            return toast.error("Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters");
        }

        userAuthThroughServer(serverRoute, formData);

    }

    return (
        access_token ?
        <Navigate to="/" />
        :
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center px-4">
                <Toaster />
                <form id="formElement" className="w-full max-w-[400px]">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-gelasio capitalize text-center mb-12 sm:mb-16 md:mb-24">
                        {type == "sign-in" ? "Welcome back" : "Join us today"}
                    </h1>

                    {
                        type != "sign-in" ?
                        <InputBox 
                            name="fullname"
                            type="text"
                            placeholder="Full Name"
                            icon="fi-rr-user"
                        />
                        : ""
                    }

                    <InputBox 
                        name="email"
                        type="email"
                        placeholder="Email"
                        icon="fi-rr-envelope"
                    />

                    <InputBox 
                        name="password"
                        type="password"
                        placeholder="Password"
                        icon="fi-rr-key"
                    />

                    {type == "sign-in" && (
                        <div className="text-right mb-4">
                            <Link to="/forgot-password" className="text-sm text-dark-grey hover:text-black underline">
                                Forgot Password?
                            </Link>
                        </div>
                    )}

                    <button 
                        className="btn-dark center mt-10 sm:mt-14"
                        type="submit"
                        onClick={handleSubmit}
                    >
                        { type.replace("-", " ") }
                    </button>

                    <div className="relative w-full flex items-center gap-2 my-6 sm:my-10 opacity-10 uppercase text-black font-bold">
                        <hr className="w-1/2 border-black" />
                        <p className="text-sm">or</p>
                        <hr className="w-1/2 border-black" />
                    </div>

                    {/* Google Auth Button */}
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => {
                                console.error("Google Sign In Failed");
                                toast.error("Google Sign In Failed");
                            }}
                            theme="filled_black"
                            size="large"
                            text={type == "sign-in" ? "signin_with" : "signup_with"}
                            shape="rectangular"
                            width="300"
                        />
                    </div>

                    {
                        type == "sign-in" ?
                        <p className="mt-4 sm:mt-6 text-dark-grey text-base sm:text-xl text-center">
                            Don't have an account ?
                            <Link to="/signup" className="underline text-black text-base sm:text-xl ml-1">
                                Join us today
                            </Link>
                        </p>
                        :
                        <p className="mt-4 sm:mt-6 text-dark-grey text-base sm:text-xl text-center">
                            Already a member ?
                            <Link to="/signin" className="underline text-black text-base sm:text-xl ml-1">
                                Sign in here.
                            </Link>
                        </p>
                    }

                </form>
            </section>
        </AnimationWrapper>
        </GoogleOAuthProvider>
    )
}

export default UserAuthForm;
