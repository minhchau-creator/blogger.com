import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const NotificationCommentField = ({ _id, blog_author, index = undefined, replyingTo = undefined, setReplying, notification_id, notificationData }) => {

    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, notifications: { results }, setNotifications } = notificationData;

    const [comment, setComment] = useState("");

    const handleComment = () => {

        if (!access_token) {
            return toast.error("Login first to leave a comment");
        }

        if (!comment.length) {
            return toast.error("Write something to leave a comment...");
        }

        console.log('=== NOTIFICATION REPLY DEBUG ===');
        console.log('_id (blog_mongo_id):', _id);
        console.log('blog_author:', blog_author);
        console.log('comment:', comment);
        console.log('replyingTo:', replyingTo);
        console.log('notification_id:', notification_id);

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id,
            blog_author,
            comment,
            replying_to: replyingTo,
            notification_id
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(({ data }) => {

            setComment("");
            setReplying(false);

            // Update notification with reply
            results[index].reply = { comment };
            setNotifications({ ...notifications, results });

            toast.success("Reply sent successfully!");

        })
        .catch(err => {
            console.error('=== ERROR SENDING REPLY ===');
            console.error('Full error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            toast.error("Failed to send reply");
        })

    }

    return (
        <>
            <Toaster />
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a reply..."
                className="input-box pl-5 placeholder:text-dark-grey resize-none h-[100px] overflow-auto"
            ></textarea>
            <button className="btn-dark mt-3 px-8" onClick={handleComment}>Reply</button>
        </>
    )
}

export default NotificationCommentField;
