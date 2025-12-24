import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import InputBox from "../components/input.component";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import { storeInSession } from "../common/session";

const EditProfile = () => {

    let { userAuth, userAuth: { access_token }, setUserAuth } = useContext(UserContext);

    const [profile, setProfile] = useState({
        personal_info: {
            fullname: "",
            email: "",
            username: "",
            bio: "",
            profile_img: ""
        },
        social_links: {
            youtube: "",
            instagram: "",
            facebook: "",
            twitter: "",
            github: "",
            website: ""
        }
    });

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [bioCharLeft, setBioCharLeft] = useState(200);

    const bioRef = useRef();
    const profileImgEle = useRef();
    const uploadImgBtn = useRef();

    useEffect(() => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-user-profile", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                setProfile(data);
                setBioCharLeft(200 - (data.personal_info.bio ? data.personal_info.bio.length : 0));
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
        }
    }, [access_token]);

    const handleCharChange = (e) => {
        let input = e.target;
        setBioCharLeft(200 - input.value.length);
    }

    const handleImagePreview = (e) => {
        let img = e.target.files[0];

        if (img) {
            let loadingToast = toast.loading("Uploading...");
            setUploading(true);

            const formData = new FormData();
            formData.append('profileImage', img);

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/upload-profile-image", formData, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(({ data }) => {
                toast.dismiss(loadingToast);
                toast.success("Image uploaded! Click Update to save.");
                
                profileImgEle.current.src = data.profile_img;
                setProfile(prev => ({
                    ...prev,
                    personal_info: {
                        ...prev.personal_info,
                        profile_img: data.profile_img
                    }
                }));
                setUploading(false);
            })
            .catch(err => {
                toast.dismiss(loadingToast);
                toast.error(err.response?.data?.error || "Failed to upload image");
                setUploading(false);
            });
        }
    }

    const handleImageUpload = (e) => {
        e.preventDefault();
        uploadImgBtn.current.click();
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(e.target);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { username, bio, youtube, facebook, twitter, github, instagram, website } = formData;

        let loadingToast = toast.loading("Updating...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-profile", {
            username,
            bio,
            social_links: { youtube, facebook, twitter, github, instagram, website },
            profile_img: profile.personal_info.profile_img
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {
            toast.dismiss(loadingToast);
            toast.success("Profile updated successfully!");
            
            // Update user context and session
            let newUserAuth = { ...userAuth, username: data.username, profile_img: data.profile_img };
            storeInSession("user", JSON.stringify(newUserAuth));
            setUserAuth(newUserAuth);
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            toast.error(response.data.error);
        });
    }

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                <form onSubmit={handleSubmit}>
                    <Toaster />

                    <h1 className="max-md:hidden">Edit Profile</h1>

                    <div className="flex flex-col lg:flex-row items-start py-10 gap-8 lg:gap-10">

                        <div className="max-lg:center mb-5">
                            <label htmlFor="uploadImg" id="profileImgLabel" 
                                className="relative block w-48 h-48 bg-grey rounded-full overflow-hidden">
                                <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center text-white bg-black/30 opacity-0 hover:opacity-100 cursor-pointer">
                                    Upload
                                </div>
                                <img ref={profileImgEle} src={profile.personal_info.profile_img} />
                            </label>
                            <input id="uploadImg" type="file" accept=".jpeg, .png, .jpg" hidden 
                                onChange={handleImagePreview} ref={uploadImgBtn} />

                            <button className="btn-light mt-5 max-lg:center lg:w-full px-10" 
                                onClick={handleImageUpload}
                                disabled={uploading}
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </button>
                        </div>

                        <div className="w-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-5">
                                <div>
                                    <InputBox 
                                        name="fullname" 
                                        type="text" 
                                        value={profile.personal_info.fullname}
                                        placeholder="Full Name" 
                                        disable={true}
                                        icon="fi-rr-user"
                                    />
                                </div>

                                <div>
                                    <InputBox 
                                        name="email" 
                                        type="email" 
                                        value={profile.personal_info.email}
                                        placeholder="Email" 
                                        disable={true}
                                        icon="fi-rr-envelope"
                                    />
                                </div>
                            </div>

                            <InputBox 
                                name="username" 
                                type="text" 
                                value={profile.personal_info.username}
                                placeholder="Username" 
                                icon="fi-rr-at"
                            />
                            <p className="text-dark-grey -mt-3 text-sm">Username will use to search user and will be visible to all users</p>

                            <textarea 
                                name="bio" 
                                maxLength={200} 
                                defaultValue={profile.personal_info.bio}
                                className="input-box h-64 lg:h-40 resize-none leading-7 mt-5 pl-5"
                                placeholder="Bio"
                                onChange={handleCharChange}
                                ref={bioRef}
                            ></textarea>

                            <p className="mt-1 text-dark-grey text-sm">{bioCharLeft} characters left</p>

                            <p className="my-6 text-dark-grey">Add Your Social Handles below</p>

                            <div className="md:grid md:grid-cols-2 gap-x-6">
                                <InputBox 
                                    name="youtube" 
                                    type="text" 
                                    value={profile.social_links.youtube}
                                    placeholder="https://" 
                                    icon="fi-brands-youtube"
                                />
                                
                                <InputBox 
                                    name="instagram" 
                                    type="text" 
                                    value={profile.social_links.instagram}
                                    placeholder="https://" 
                                    icon="fi-brands-instagram"
                                />

                                <InputBox 
                                    name="facebook" 
                                    type="text" 
                                    value={profile.social_links.facebook}
                                    placeholder="https://" 
                                    icon="fi-brands-facebook"
                                />

                                <InputBox 
                                    name="twitter" 
                                    type="text" 
                                    value={profile.social_links.twitter}
                                    placeholder="https://" 
                                    icon="fi-brands-twitter"
                                />

                                <InputBox 
                                    name="github" 
                                    type="text" 
                                    value={profile.social_links.github}
                                    placeholder="https://" 
                                    icon="fi-brands-github"
                                />

                                <InputBox 
                                    name="website" 
                                    type="text" 
                                    value={profile.social_links.website}
                                    placeholder="https://" 
                                    icon="fi-rr-globe"
                                />
                            </div>

                            <button className="btn-dark w-auto px-10 mt-5" type="submit">
                                Update
                            </button>

                        </div>

                    </div>
                </form>
            }
        </AnimationWrapper>
    )
}

export default EditProfile;
