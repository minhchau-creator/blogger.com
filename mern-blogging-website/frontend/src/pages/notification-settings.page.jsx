import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";

const NotificationSettings = () => {

    let { userAuth: { access_token } } = useContext(UserContext);

    const [notificationSettings, setNotificationSettings] = useState({
        all: true,
        comments: true,
        likes: true,
        replies: true
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-user-profile", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                if (data.notification_settings) {
                    setNotificationSettings(data.notification_settings);
                }
                setLoading(false);
            })
            .catch(err => {
                console.log(err);
                setLoading(false);
            });
        }
    }, [access_token]);

    const handleNotificationToggle = (field) => {
        const newSettings = { ...notificationSettings };
        
        if (field === 'all') {
            // If toggling "all", set all fields to the new value
            const newValue = !notificationSettings.all;
            newSettings.all = newValue;
            newSettings.comments = newValue;
            newSettings.likes = newValue;
            newSettings.replies = newValue;
        } else {
            // Toggle individual field
            newSettings[field] = !notificationSettings[field];
            
            // Update "all" based on individual fields
            newSettings.all = newSettings.comments && newSettings.likes && newSettings.replies;
        }

        setNotificationSettings(newSettings);

        // Save to backend
        let loadingToast = toast.loading("Updating...");

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/update-notification-settings", newSettings, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(() => {
            toast.dismiss(loadingToast);
            toast.success("Notification settings updated!");
        })
        .catch(({ response }) => {
            toast.dismiss(loadingToast);
            toast.error(response?.data?.error || "Failed to update settings");
            // Revert on error
            setNotificationSettings(notificationSettings);
        });
    };

    return (
        <AnimationWrapper>
            <Toaster />
            
            <h1 className="max-md:hidden">Notification Settings</h1>

            {/* Notification Settings Section */}
            <div className="py-10 w-full">
                <h2 className="text-2xl font-medium mb-5">Notification Preferences</h2>
                
                <div className="flex flex-col gap-5">
                    {/* All Notifications Toggle */}
                    <div className="flex items-center justify-between p-5 bg-grey/50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-lg">All Notifications</h3>
                            <p className="text-dark-grey text-sm mt-1">Enable or disable all notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notificationSettings.all}
                                onChange={() => handleNotificationToggle('all')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-grey peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                        </label>
                    </div>

                    {/* Individual Notification Toggles */}
                    <div className="flex items-center justify-between p-4 hover:bg-grey/30 rounded-lg transition-all">
                        <div>
                            <h3 className="font-medium">Comment Notifications</h3>
                            <p className="text-dark-grey text-sm">When someone comments on your post</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notificationSettings.comments}
                                onChange={() => handleNotificationToggle('comments')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-grey peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-grey/30 rounded-lg transition-all">
                        <div>
                            <h3 className="font-medium">Like Notifications</h3>
                            <p className="text-dark-grey text-sm">When someone likes your post</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notificationSettings.likes}
                                onChange={() => handleNotificationToggle('likes')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-grey peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 hover:bg-grey/30 rounded-lg transition-all">
                        <div>
                            <h3 className="font-medium">Reply Notifications</h3>
                            <p className="text-dark-grey text-sm">When someone replies to your comment</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={notificationSettings.replies}
                                onChange={() => handleNotificationToggle('replies')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-grey peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-grey after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                        </label>
                    </div>
                </div>
            </div>

        </AnimationWrapper>
    )
}

export default NotificationSettings;
