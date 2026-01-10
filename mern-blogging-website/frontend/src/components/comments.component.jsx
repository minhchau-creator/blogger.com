import { useContext } from "react";
import { BlogContext } from "../pages/blog.page";
import CommentField from "./comment-field.component";
import axios from "axios";
import NoDataMessage from "./nodata.component";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./comment-card.component";

export const fetchComments = async ({ skip = 0, blog_id, setParentCommentCountFun, comment_array = null }) => {

    let res;

    console.log('fetchComments called with blog_id:', blog_id, 'skip:', skip);

    // blog_id must be MongoDB _id (ObjectId)
    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", { blog_id, skip })
    .then(({ data }) => {

        console.log('Received comments from API:', data);

        data.map(comment => {
            comment.childrenLevel = 0;
        })

        setParentCommentCountFun(preVal => preVal + data.length)

        if(comment_array == null){
            res = { results: data }
        } else {
            res = { results: [ ...comment_array, ...data ] }
        }

        console.log('fetchComments returning:', res);

    })
    .catch(err => {
        console.error('Error fetching comments:', err);
        res = { results: [] };
    })

    return res;

}

const CommentsContainer = () => {

    let { blog, blog: { _id, title, comments, activity: { total_parent_comments } }, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded, setBlog } = useContext(BlogContext);

    // Debug logs
    console.log('=== COMMENTS DEBUG ===');
    console.log('blog._id:', _id);
    console.log('comments object:', comments);
    console.log('total_parent_comments:', total_parent_comments);
    console.log('totalParentCommentsLoaded:', totalParentCommentsLoaded);

    // Đảm bảo commentsArr luôn là mảng
    const commentsArr = (comments && Array.isArray(comments.results)) ? comments.results : [];
    console.log('commentsArr length:', commentsArr.length);
    console.log('commentsArr:', commentsArr);

    const loadMoreComments = async () => {

        // Always use _id (ObjectId) for blog_id
        let newCommentsArr = await fetchComments({ skip: totalParentCommentsLoaded, blog_id: _id, setParentCommentCountFun: setTotalParentCommentsLoaded, comment_array: commentsArr })
        setBlog({ ...blog, comments: newCommentsArr })

    }

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow p-6 mt-8">
            <h1 className="text-xl font-bold mb-4">Comments</h1>
            <CommentField action="comment" />
            <div className="mt-8">
                {
                    Array.isArray(commentsArr) && commentsArr.length ?
                        commentsArr.map((comment, i) => {
                            return <AnimationWrapper key={i}>
                                <CommentCard index={i} leftVal={comment.childrenLevel * 4} commentData={comment} />
                            </AnimationWrapper>
                        })
                    : <NoDataMessage message="No Comments" />
                }
            </div>
            {
                total_parent_comments > totalParentCommentsLoaded ?
                <button 
                    onClick={loadMoreComments}
                    className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2 mt-4"
                >Load More</button> : ""
            }
        </div>
    )
}

export default CommentsContainer;