import { Link, useNavigate } from "react-router-dom";
import { getDay } from "../common/date";

const BlogPostCard = ({ content, author }) => {

    let { publishedAt, tags, title, des, banner, activity: { total_likes, total_reads, total_comments }, blog_id: id } = content;
    let { fullname, username, profile_img } = author;

    const navigate = useNavigate();

    const handleTagClick = (e, tag) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/search/${tag}`);
    }

    return (
        <Link to={`/blog/${id}`} className="flex gap-4 sm:gap-8 items-center border-b border-grey pb-4 sm:pb-5 mb-3 sm:mb-4">
            <div className="w-full">
                <div className="flex gap-2 items-center mb-4 sm:mb-7">
                    <img src={profile_img} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full" />
                    <p className="line-clamp-1 text-sm sm:text-base">{fullname} @{username}</p>
                    <p className="min-w-fit text-sm sm:text-base">{getDay(publishedAt)}</p>
                </div>

                <h1 className="blog-title">{title}</h1>
                <p className="my-2 sm:my-3 text-base sm:text-xl font-gelasio leading-6 sm:leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">{des}</p>

                <div className="flex gap-2 sm:gap-4 mt-4 sm:mt-7 flex-wrap">
                    {
                        tags.map((tag, index) => (
                            <button key={index} className="btn-light py-1 px-3 sm:px-4 text-sm sm:text-base" onClick={(e) => handleTagClick(e, tag)}>
                                {tag}
                            </button>
                        ))
                    }
                    <span className="ml-1 sm:ml-3 flex items-center gap-1 sm:gap-2 text-dark-grey text-sm sm:text-base">
                        <i className="fi fi-rr-heart text-base sm:text-xl"></i>
                        {total_likes}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-2 text-dark-grey text-sm sm:text-base">
                        <i className="fi fi-rr-eye text-base sm:text-xl"></i>
                        {total_reads}
                    </span>
                    <span className="flex items-center gap-1 sm:gap-2 text-dark-grey text-sm sm:text-base">
                        <i className="fi fi-rr-comment-dots text-base sm:text-xl"></i>
                        {total_comments}
                    </span>
                </div>

            </div>

            <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 flex-shrink-0 bg-grey rounded-md overflow-hidden">
                <img src={banner} className="w-full h-full object-cover" />
            </div>

        </Link>
    )
}

export default BlogPostCard;
