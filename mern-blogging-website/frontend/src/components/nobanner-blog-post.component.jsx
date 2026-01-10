import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {

    let { title, blog_id: id, author: { personal_info: { fullname, username, profile_img } }, publishedAt } = blog;

    return (
        <Link to={`/blog/${id}`} className="flex gap-3 sm:gap-5 mb-6 sm:mb-8">
            <h1 className="blog-index">{index < 10 ? "0" + (index + 1) : index}</h1>

            <div>
                <div className="flex gap-2 items-center mb-3 sm:mb-4">
                    <img src={profile_img} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                    <p className="line-clamp-1 text-sm sm:text-base">{fullname} @{username}</p>
                    <p className="min-w-fit text-sm sm:text-base">{getDay(publishedAt)}</p>
                </div>

                <h1 className="blog-title">{title}</h1>

            </div>

        </Link>
    )
}

export default MinimalBlogPost;
