import { useContext } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import { UserContext } from "../App";

const NotificationCard = ({ data, index, notificationState }) => {

    let { seen, type, reply, createdAt, comment, replied_on_comment, user, blog, _id: notification_id } = data;

    let { userAuth: { username: author_username, profile_img: author_profile_img } } = useContext(UserContext);

    // Safely extract blog data
    if (!blog || !blog.author) {
        return null;
    }

    let { blog_id, title } = blog;

    return (
        <div className={"p-6 border-b border-grey border-l-black " + (!seen ? " border-l-2 " : " ")}>

            <div className="flex gap-5 mb-3">
                <img src={user.personal_info.profile_img} className="w-14 h-14 flex-none rounded-full" />
                <div className="w-full">
                    {/* Time at top right */}
                    <div className="flex justify-between items-start mb-2">
                        <div></div>
                        <p className="text-dark-grey text-sm min-w-fit">{getDay(createdAt)}</p>
                    </div>

                    {/* User info and blog title on same line */}
                    <h1 className="font-medium text-xl text-dark-grey mb-3">
                        <span className="lg:inline-block hidden capitalize">{user.personal_info.fullname}</span>
                        <Link to={`/user/${user.personal_info.username}`} className="mx-1 text-black underline">@{user.personal_info.username}</Link>
                        <span className="font-normal">
                            {
                                type == 'like' ? " liked your blog " :
                                type == 'comment' ? " commented on " :
                                " replied on "
                            }
                        </span>
                        <Link
                            to={`/blog/${blog_id}`}
                            className="font-medium text-dark-grey hover:underline"
                        >
                            "{title}"
                        </Link>
                    </h1>

                    {
                        type == 'reply' ?
                        <div className="p-4 mt-2 rounded-md bg-grey">
                            <p>{replied_on_comment.comment}</p>
                        </div> : ""
                    }

                </div>
            </div>

            {
                type != 'like' ?
                <div className="ml-14 pl-5 mt-3 text-dark-grey">
                    <p className="font-gelasio">{comment.comment}</p>

                    <div className="flex gap-5 mt-3">
                        <Link
                            to={`/blog/${blog_id}`}
                            className="underline hover:text-black"
                        >
                            View Post
                        </Link>
                    </div>

                    {
                        reply ?
                        <div className="mt-5 p-4 bg-grey rounded-md">
                            <div className="flex gap-3 mb-3">
                                <img src={author_profile_img} className="w-8 h-8 rounded-full" />
                                <div>
                                    <h1 className="font-medium text-dark-grey">
                                        <Link to={`/user/${author_username}`} className="mx-1 text-black underline">
                                            @{author_username}
                                        </Link>
                                        <span className="font-normal">replied</span>
                                    </h1>
                                </div>
                            </div>
                            <p className="ml-11 font-gelasio text-dark-grey">{reply.comment}</p>
                        </div> : ""
                    }

                </div> : ""
            }

        </div>
    )
}

export default NotificationCard;
