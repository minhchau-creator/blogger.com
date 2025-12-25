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
        <Link to={`/blog/${id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4">
            <div className="w-full">
                <div className="flex gap-2 items-center mb-7">
                    <img src={profile_img} className="w-6 h-6 rounded-full" />
                    <p className="line-clamp-1">{fullname} @{username}</p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>

                <h1 className="blog-title">{title}</h1>
                <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">{des}</p>

                <div className="flex gap-4 mt-7">
                    {
                        tags.map((tag, index) => (
                            <button key={index} className="btn-light py-1 px-4" onClick={(e) => handleTagClick(e, tag)}>
                                {tag}
                            </button>
                        ))
                    }
                    <span className="ml-3 flex items-center gap-2 text-dark-grey">
                        <i className="fi fi-rr-heart text-xl"></i>
                        {total_likes}
                    </span>
                    <span className="flex items-center gap-2 text-dark-grey">
                        <i className="fi fi-rr-eye text-xl"></i>
                        {total_reads}
                    </span>
                    <span className="flex items-center gap-2 text-dark-grey">
                        <i className="fi fi-rr-comment-dots text-xl"></i>
                        {total_comments}
                    </span>
                </div>

            </div>

            <div className="h-28 aspect-square bg-grey">
                <img src={banner} className="w-full h-full aspect-square object-cover" />
            </div>

        </Link>
    )
}

export default BlogPostCard;
