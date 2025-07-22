import { UserContext } from "../App";
import { getDay } from "../common/date";
import { useContext, useState } from "react";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
    const {
        commented_by,
        commentedAt,
        comment,
        _id,
        children = [],
        childrenLevel = 0,
        isReplyLoaded = false
    } = commentData || {};

    const {
        personal_info: {
            username: commented_by_username = "",
            fullname = "Anonymous",
            profile_img = "/default-profile.png"
        } = {}
    } = commented_by || {};

    let { blog, blog: { comments, activity, activity: { total_parent_comments }, comments: { results: commentsArr }, author: { personal_info: blog_author } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext);

    let { userAuth: { access_token, username } } = useContext(UserContext);

    const [isReply, setReplying] = useState(false)


    const getParentIndex = () => {
        let startingPoint = index - 1;

        try {
            while (commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel) {
                startingPoint--;
            }
        }
        catch {
            startingPoint = undefined;
        }

        return startingPoint;
    }

    const removeCommentsCards = (startingPoint, isDelete = false) => {
        if (commentsArr[startingPoint]) {
            while (commentsArr[startingPoint].childrenLevel > commentData.childrenLevel) {
                commentsArr.splice(startingPoint, 1);

                if (!commentsArr[startingPoint]) {
                    break;
                }
            }
        }
        if (isDelete) {
            let parentIndex = getParentIndex();
            if (parentIndex != undefined) {
                commentsArr[parentIndex].children = commentsArr[parentIndex].children.filter(child => child != _id)

                if (!commentsArr[parentIndex].children.length) {
                    commentsArr[parentIndex].isReplyLoaded = false;
                }
            }

            commentsArr.splice(index, 1);
        }

        if (commentData.childrenLevel == 0 && isDelete) {
            setTotalParentCommentsLoaded(preVal => preVal - 1)
        }
        setBlog({ ...blog, comments: { results: commentsArr }, activity: { ...activity, total_parent_comments: total_parent_comments - (commentData.childrenLevel == 0) } })
    }

    const hideReplies = () => {
        commentData.isReplyLoaded = false;

        removeCommentsCards(index + 1)
    }
    const loadReplies = ({ skip = 0, currentIndex = index }) => {
        if (commentsArr[currentIndex].children.length) {
            hideReplies();

            axios.post(import.meta.env.VITE_SERVER_URL + "/get-replies", {
                _id: commentsArr[currentIndex]._id, skip
            })
                .then(({ data: { replies } }) => {
                    commentsArr[currentIndex].isReplyLoaded = true;
                    for (let i = 0; i < replies.length; i++) {
                        replies[i].childrenLevel = commentData.childrenLevel + 1;

                        commentsArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);


                    }
                    setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
                })
                .catch(err => {
                    console.log(err);

                })


        }
    }
    const handleReplyClick = () => {
        if (!access_token) {
            return toast.error("Login to Reply")
        }
        setReplying(preVal => !preVal)

    }

    const deleteComment = (e) => {
        e.target.setAttribute("disable", true);
        axios.post(import.meta.env.VITE_SERVER_URL + '/delete-comment', { _id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.removeAttribute("disable");
                removeCommentsCards(index + 1, true);
            })
            .catch(err => {
                console.log(err);

            })
    }
    const LoadMoreRepliesButton = () => {
        let parentIndex = getParentIndex();
        if (commentsArr[index + 1]) {
            if (commentsArr[index + 1].childrenLevel < commentsArr[index].childrenLevel) {
                if ((index - parentIndex) < commentsArr[parentIndex].children.length)
                    return <button onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })} className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"> Load More Replies </button>
            }
        }
        else {
            if (parentIndex) {
                if ((index - parentIndex) < commentsArr[parentIndex].children.length)
                    return <button onClick={() => loadReplies({ skip: index - parentIndex, currentIndex: parentIndex })} className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"> Load More Replies </button>
            }
        }

    }
    return (
        <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
            <div className="my-5 p-6 rounded-md border border-grey">
                <div className="flex gap-3 items-center mb-8">
                    <img src={profile_img} className="w-6 h-6 rounded-full" />

                    <p className="line-clamp-1">{fullname} @{commented_by_username}</p>
                    <p className="min-w-fit">{getDay(commentedAt)}</p>
                </div>

                <p className="font-gelasio text-xl ml-3"> {comment}</p>

                <div className="flex gap-5 items-center mt-5">
                    {
                        commentData.isReplyLoaded ?
                            <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={hideReplies}>
                                <i className="fi fi-rs-comment-dots"> </i>Hide Replies
                            </button>
                            :
                            <button className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2" onClick={loadReplies}>
                                <i className="fi fi-rs-comment-dots"> </i> {children.length} Replies
                            </button>
                    }
                    <button className="underline" onClick={handleReplyClick}> Reply </button>
                    {
                        username == commented_by_username || username == blog_author ?
                            <button className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
                                onClick={deleteComment}
                            >
                                <i className="fi fi-rr-trash pointer-events-none"></i>
                            </button> : ""
                    }
                </div>

                {
                    isReply ?
                        <div className="mt-8">
                            <CommentField action="reply" index={index} replyingTo={_id} setReplying={setReplying} />
                        </div> :
                        ""

                }

            </div>
            <LoadMoreRepliesButton />
        </div >
    )
}
export default CommentCard;