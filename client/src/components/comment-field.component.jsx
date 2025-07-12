import { useContext, useState } from "react";
import { UserContext } from '../App'
import { Toaster, toast } from 'react-hot-toast'
import axios from "axios";
import { BlogContext } from "../pages/blog.page";
const CommentField = ({ action, index = undefined, replyingTo = undefined, setReplying }) => {

    //let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);
    const context = useContext(BlogContext);

    // Provide safe defaults to avoid undefined errors
    const blog = context.blog || {};
    const setBlog = context.setBlog;
    const setTotalParentCommentsLoaded = context.setTotalParentCommentsLoaded;

    const _id = blog._id;
    const blog_author = blog.author?._id;

    const comments = blog.comments || {};
    const commentsArr = comments.results || [];

    const activity = blog.activity || {};
    const total_comments = activity.total_comments || 0;
    const total_parent_comments = activity.total_parent_comments || 0;


    // const { blog, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);

    // Optional fallback if blog isn't loaded yet
    // if (!blog) return null;

    // const _id = blog._id;
    // const blog_author = blog.author?._id;
    // const comments = blog.comments || { results: [] };
    // const activity = blog.activity || {};
    // const total_comments = activity.total_comments ?? 0;
    // const total_parent_comments = activity.total_parent_comments ?? 0;


    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    const [comment, setComment] = useState("");
    if (!blog)
        return null;
    const handleComment = () => {
        if (!access_token) {
            toast.error("Please Login to Comment!")
            return;

        }
        if (!comment.length) {
            toast.error("Write something to leave a comment")
            return;
        }

        axios.post(import.meta.env.VITE_SERVER_URL + '/add-comment', {
            _id, blog_author, comment, replying_to: replyingTo
        },
            {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json'
                }
            }
        ).then(({ data }) => {
            console.log(data);

            setComment("");
            data.commented_by = { personal_info: { username, fullname, profile_img } }
            let newCommentArray;

            if (replyingTo) {
                commentsArr[index].children.push(data._id);

                data.childrenLevel = commentsArr[index].childrenLevel + 1

                data.parentIndex = index

                commentsArr[index].isReplyLoaded = true
                commentsArr.splice(index + 1, 0, data)
                newCommentArray = commentsArr
                setReplying(false);
            }
            else {
                data.childrenLevel = 0;

                newCommentArray = [data, ...commentsArr];
            }


            let parentCommentIncremental = replyingTo ? 0 : 1;

            setBlog({ ...blog, comments: { ...comments, results: newCommentArray }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncremental } })

            setTotalParentCommentsLoaded(preVal => preVal + parentCommentIncremental)

        })
            .catch((err) => {
                console.log(err);

            })
    }
    return (
        <>
            <Toaster />
            <textarea value={comment} placeholder="Leave a comment......." className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
                onChange={(e) => setComment(e.target.value)}
            >
            </textarea>
            <button className="btn-dark mt-5 px-10"
                onClick={handleComment}
            >
                {action}
            </button>



        </>
    )
}
export default CommentField;