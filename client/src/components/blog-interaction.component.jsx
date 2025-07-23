import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
const BlogInteraction = () => {
    let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper } = useContext(BlogContext);
    // let { blog, setBlog } = useContext(BlogContext);
    // const { blog, setBlog, } = useContext(BlogContext);

    // // Safe access using optional chaining
    // const title = blog?.title;
    // const blog_id = blog?._id;
    // const activity = blog?.activity || {};
    // const total_likes = activity.total_likes ?? 0;
    // const total_comments = activity.total_comments ?? 0;
    // const author_username = blog?.author?.personal_info?.username || "unknown";
    // console.log(blog);

    let { userAuth: { username, access_token } } = useContext(UserContext);
    console.log(username);
    console.log("Richardson Hall", _id)
    useEffect(() => {
        if (access_token) {
            axios.post(import.meta.env.VITE_SERVER_URL + "/isliked-by-user", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data: { result } }) => {
                    console.log("bol like kiya kya? ", Boolean(result));
                    setLikedByUser(Boolean(result));

                })
                .catch((err) => {
                    console.log(err);

                })
        }
    }, [access_token, _id])

    const handleLike = () => {
        if (access_token) {
            setLikedByUser(preVal => !preVal);
            !isLikedByUser ? total_likes++ : total_likes--;
            setBlog({ ...blog, activity: { ...activity, total_likes } })
            axios.post(import.meta.env.VITE_SERVER_URL + "/like-blog", { _id, likedByUser: isLikedByUser }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                    console.log(data);

                })
                .catch((err) => {
                    console.log(err);

                })
        }
        else {
            toast.error("Please Login to Like this blog")
        }
    }
    const handleComment = () => {
        setCommentsWrapper(preVal => !preVal)
    }
    return (
        <>
            <Toaster />
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">

                    <button className={"w-10 h-10 rounded-full flex items-center justify-center " + (isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80")}
                        onClick={handleLike}
                    >
                        <i className={"fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")} />
                    </button>
                    <p className="text-xl text-dark-grey"> {total_likes}</p>


                    <button className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                        onClick={handleComment}
                    >
                        <i className="fi fi-rr-comment-dots" />
                    </button>
                    <p className="text-xl text-dark-grey"> {total_comments}</p>

                </div>
                <div className="flex gap-6 items-center">
                    {/* {
                        username === author_username ?
                            <Link to={`/editor/${_id}`} className="underline hover:text-purple">Edit</Link> : ""
                    } */}
                    {username === author_username && blog.draft ? (
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">
                            Edit
                        </Link>
                    ) : null}


                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}><i className="fi fi-brands-twitter text-xl hover:text-twitter" /></Link>
                    <Link
                        to={`https://api.whatsapp.com/send?text=Read ${encodeURIComponent(title)} - ${encodeURIComponent(location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <i className="fi fi-brands-whatsapp text-xl hover:text-green-500" />
                    </Link>

                </div>
            </div>
            <hr className="border-grey my-2" />

        </>
    )
}
export default BlogInteraction;