// require('dotenv').config()
// require('dotenv').config();

import 'dotenv/config.js'
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken'
import cors from 'cors';
import admin from 'firebase-admin'
import serviceAccountKey from './campusprep-27051-firebase-adminsdk-fbsvc-0c79b52f30.json' assert {type: 'json'}
import { getAuth } from 'firebase-admin/auth'

import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from './Schema/Notification.js'
import Comment from './Schema/Comment.js'
import { assert } from 'console';
const dotenv = require('dotenv');
dotenv.config();
// require('dotenv').config();
console.log('process.env.PORT:', process.env.PORT);




const server = express();
server.use(express.json())
server.use(cors())
mongoose.connect(process.env.MONGODB_URL, {
    autoIndex: true
})

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    // projectId: serviceAccountKey.project_id
    projectId: "campusprep-27051"
})

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const generateUsername = async (email) => {
    let username = email.split("@")[0];
    const userNameExists = await User.exists({ "personal_info.username": username }).then(res => res)

    userNameExists ? username += nanoid().substring(0, 5) : "";
    return username;

}

const formatDataToSend = (user) => {
    const access_token = jwt.sign({ id: user._id }, process.env.SECRET_ACCESS_KEY)

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname
    }
}


const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
        return res.status(401).json({ "error": "No access token" })
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ "error": "Access token is invalid" })
        }
        req.user = user.id;
        next();
    })

}
server.post("/signup", (req, res) => {
    const { fullname, email, password } = req.body;
    //validating the data from frontend
    // console.log(fullname);


    if (fullname.length < 3) {
        return res.status(400).json({ "error": "FullName must be atleast 3 letters long" })
    }
    if (!email.length) {
        return res.status(403).json({ "error": "Enter email" })
    }
    if (!emailRegex.test(email)) {
        return res.status(403).json({ "error": "Invalid Email" })
    }
    if (!passwordRegex.test(password)) {
        return res.status(403).json({ "error": "Password should be in between 6 to 20 characters long with a numeric, lowercase and uppercase letters" })
    }
    bcrypt.hash(password, 10, async (err, hashed_Password) => {
        const username = await generateUsername(email);
        const user = new User({
            personal_info: {
                fullname, email, password: hashed_Password, username
            }
        })

        user.save().then((u) => {
            return res.status(200).json(formatDataToSend(u))
        })
            .catch(err => {
                if (err.code == "11000") {
                    return res.status(500).json({ "error": "Email Already exits" })
                }
                return res.status(500).json({ "error": err.message });

            })
        // console.log(user);

    })
    // return res.status(200).json({ "status": "okay" })
})
server.post("/signin", (req, res) => {
    let { email, password } = req.body;
    User.findOne({ "personal_info.email": email })
        .then((user) => {
            if (!user) {
                return res.status(403).json({ "error": "Email not found" });
            }
            if (!user.google_auth) {
                bcrypt.compare(password, user.personal_info.password, (err, result) => {
                    if (err) {
                        return res.status(403).json({ "error": "Error occured while logging in please check password again" })
                    }

                    if (!result) {
                        return res.status(403).json({ "error": "Incorrect Password" })
                    }
                    else {
                        return res.status(200).json(formatDataToSend(user))
                    }
                })
            }
            else {
                return res.status(403).json({ "error": "Account was created using Google.Try Logging In With Google" })
            }


        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ "error": err.message })

        })

})


server.post('/google-auth', async (req, res) => {
    const { access_token } = req.body;
    console.log("Received access_token:", access_token);

    try {
        const decodedUser = await getAuth().verifyIdToken(access_token);
        console.log("Decoded User:", decodedUser);

        const { email, name, picture } = decodedUser;
        // const profileImg = picture?.replace("s96-c", "s384-c") || "";
        // const profileImg = picture?.replace("s96-c", "s384-c") || undefined;

        let user = await User.findOne({ "personal_info.email": email }).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth");

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({ "error": "This email was signed up without Google. Please log in with password to access the account" });
            }
        } else {
            const username = await generateUsername(email);
            if (profileImg) {
                personal_info.profile_img = profileImg;
            }
            user = new User({
                personal_info: { fullname: name, email, profile_img: profileImg, username },
                google_auth: true
            });

            await user.save();
        }

        return res.status(200).json(formatDataToSend(user));
    } catch (err) {
        console.error("Token verification failed:", err);
        return res.status(401).json({ "error": "Failed to authenticate with Google" });
    }
});


server.post("/change-password", verifyJWT, (req, res) => {
    let { currentPassword, newPassword } = req.body;


    if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
        return res.status(403).json({ error: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters" })
    }

    User.findOne({ _id: req.user })
        .then((user) => {
            if (user.google_auth) {
                return res.status(403).json({ error: "You cannot change this account's password since it is logged in through Google" })
            }

            bcrypt.compare(currentPassword, user.personal_info.password, (err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Some Error occured while changing the password, please try again later" })
                }
                if (!result) {
                    return res.status(403).json({ error: "Incorrect Password" })
                }

                bcrypt.hash(newPassword, 10, (err, hashed_password) => {
                    User.findOneAndUpdate({ _id: req.user }, { "personal_info.password": hashed_password })
                        .then((u) => {
                            return res.status(200).json({ status: " Password changed successfully" })

                        })
                        .catch((err) => {
                            return res.status(500).json({ error: "Some error occured while saving new password, please try again later" })
                        })
                })
            })
        })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: "User not found" })

        })

})

server.post("/all-latest-blogs-count", (req, res) => {
    Blog.countDocuments({ draft: false })
        .then(cnt => {
            return res.status(200).json({ totalDocs: cnt })
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.message })

        })
})

server.post('/latest-blogs', (req, res) => {
    let { page } = req.body
    let maxLimit = 5;
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.fullname personal_info.username -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title ctc offerType banner activity publishedAt -_id ")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})
server.get('/trending-blogs', (req, res) => {
    let maxLimit = 5
    Blog.find({ draft: false })
        .populate("author", "personal_info.profile_img personal_info.fullname personal_info.username -_id")
        .sort({ "activity.total_read": -1, "activity.total_likes": -1 })
        .select("blog_id title ctc offerType activity publishedAt -_id ")
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/search-blogs", (req, res) => {
    let { tag, query, author, page, limit, eliminate_blog } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false, blog_id: { $ne: eliminate_blog } };
    }
    else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i')/*, experience: new RegExp(query, 'i')*/ };
    }
    else if (author) {
        findQuery = { draft: false, author }
    }
    let maxLimit = limit ? limit : 2;
    Blog.find(findQuery)
        .populate("author", "personal_info.profile_img personal_info.fullname personal_info.username -_id")
        .sort({ "publishedAt": -1 })
        .select("blog_id title ctc offerType activity tags publishedAt -_id ")
        .skip((page - 1) * maxLimit)
        .limit(maxLimit)
        .then(blogs => {
            return res.status(200).json({ blogs })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })

})

server.post('/search-blogs-count', (req, res) => {
    let { tag, author, query } = req.body;
    let findQuery;
    if (tag) {
        findQuery = { tags: tag, draft: false };
    }
    else if (query) {
        findQuery = { draft: false, title: new RegExp(query, 'i'), experience: new RegExp(query, 'i') };
    }
    else if (author) {
        findQuery = { draft: false, author }
    }
    Blog.countDocuments({ draft: false })
        .then(cnt => {
            return res.status(200).json({ totalDocs: cnt })
        })
        .catch((err) => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })

        })
})

server.post("/search-users", (req, res) => {
    let { query } = req.body;
    if (!query || typeof query !== "string") {
        return res.status(400).json({ error: "Invalid search query" });
    }

    User.find({ "personal_info.username": new RegExp(query, 'i') })
        .limit(50)
        .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
        .then(users => {
            return res.status(200).json(users)
        })
        .catch((err) => {
            res.status(500).json({ error: err.message })
        })
})

server.post('/get-profile', (req, res) => {
    let { username } = req.body;

    User.findOne({ "personal_info.username": username })
        .select("-personal_info.password -google_auth -updatedAt -blogs")
        .then((user) => {
            return res.status(200).json(user);
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message });
        })
})

server.post("/update-profile-img", verifyJWT, (req, res) => {
    let { url } = req.body;
    User.findOneAndUpdate({ _id: req.user }, { "personal_info.profile_img": url })
        .then(() => {
            return res.status(200).json({ profile_img: url })
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("update-profile", verifyJWT, (req, res) => {
    let { username, bio, social_links } = req.body;
    let bioLimit = 150;

    if (username.length < 4) {
        return res.status(403).json({ error: "Username should be atleast 4 letters long" });
    }
    if (bio.length > bioLimit) {
        return res.status(403).json({ error: `Bio should not be more than ${bioLimit} characters` })
    }

    let socialLinksArr = Object.keys(social_links);

    try {
        for (let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) {
                let hostname = new URL(social_links[socialLinksArr[i]]).hostname;

                if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] != 'website') {
                    return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid` })
                }

            }
        }
    }
    catch (err) {
        return res.status({ error: "You must provide full social links with http(s) included" })
    }

    let UpdateObj = {
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
    }

    User.findOneAndUpdate({ _id: req.user }, UpdateObj, {
        runValidators: true
    })
        .then(() => {
            return res.status(200).json({ username })
        })
        .catch((err) => {
            if (err.code === 11000) {
                return res.status(409).json({ error: "Username is already taken" })
            }

            return res.status(500).json({ error: err.message })
        })
})

server.post('/createBlog', verifyJWT, (req, res) => {

    let authorId = req.user;

    let { title, banner, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, draft, id } = req.body

    if (!title.length) {
        return res.status(403).json({ error: "You must provide a title to publish the blog" })
    }

    tags = tags.map(tag => tag.toLowerCase());
    let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();
    console.log(blog_id);

    if (id) {
        Blog.findOneAndUpdate({ blog_id }, { title, banner, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, draft: draft ? draft : false })
            .then(blog => {
                return res.status(200).json({ id: blog_id });
            })
            .catch((err) => {
                return res.status(500).json({ error: err.message })
            })
    } else {
        let blog = new Blog({
            title, banner, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, author: authorId, blog_id, draft: Boolean(draft)
        })
        blog.save().then(blog => {
            let incrementVal = draft ? 0 : 1;
            User.findOneAndUpdate({ _id: authorId }, {
                $inc: { "account_info.total_posts": incrementVal }, $push: {
                    "blogs": blog._id
                }
            })
                .then(user => {
                    return res.status(200).json({ id: blog.blog_id })
                })
                .catch(err => {
                    return res.status(500).json({ "error": "Failed to update total posts number" })
                })
        })
            .catch(err => {
                return res.status(500).json({ "error": err.message })
            })

    }




})

server.post('/get-blog', (req, res) => {
    let { blog_id, draft, mode } = req.body;
    let incremental = mode != 'edit' ? 1 : 0;
    // let query = blog_id.length === 24
    //     ? { _id: blog_id }  // MongoDB _id
    //     : { blog_id };      // Custom blog_id

    Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incremental } })
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title company jobRole department ctc year banner experience preparation difficulty offerType tags publishedAt activity")
        .then(blog => {

            User.findOneAndUpdate({ "personal_info.username": blog.author.personal_info.username }, {
                $inc: { "account_info.total_reads": incremental }
            })
                .catch((err) => {
                    return res.status(500).json({ error: err.message })
                })

            if (blog.draft && !draft) {
                return res.status(500).json({ error: 'You Cannot Access draft blog' })
            }
            return res.status(200).json({ blog });
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })
})

server.post("/like-blog", verifyJWT, (req, res) => {
    let user_id = req.user;

    let { _id, likedByUser } = req.body

    let incremental = !likedByUser ? 1 : -1;

    Blog.findOneAndUpdate({ _id }, { $inc: { "activity.total_likes": incremental } })
        .then(blog => {
            if (!likedByUser) {
                let like = new Notification({
                    type: "like",
                    blog: _id,
                    notification_for: blog.author,
                    user: user_id
                })
                like.save().then(notification => {
                    return res.status(200).json({ liked_by_user: true })
                })
                    .catch((err) => {
                        return res.status(500).json({ error: err.message })
                    })
            }
            else {
                Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
                    .then(data => {
                        return res.status(200).json({ liked_by_user: false })
                    })
                    .catch((err) => {
                        return res.status(500).json({ error: err.message })
                    })
            }
        })
})

server.post('/isliked-by-user', verifyJWT, (req, res) => {
    let user_id = req.user

    let { _id } = req.body;
    Notification.exists({ user: user_id, type: "like", blog: _id })
        .then(result => {
            return res.status(200).json({ result })
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })
})

server.post('/add-comment', verifyJWT, (req, res) => {
    let user_id = req.user;
    console.log("BODY RECEIVED IN /add-comment:", req.body);

    let { _id, comment, replying_to, blog_author, notification_id } = req.body

    if (!comment.length) {
        return res.status(403).json({ error: "Write something to leave a comment" })
    }

    let commentObj = {
        blog_id: _id,
        blog_author, comment, commented_by: user_id
    }

    if (replying_to) {
        commentObj.parent = replying_to;
        commentObj.isReply = true;
    }
    const commentDoc = new Comment(commentObj);
    commentDoc.save().then(async commentFile => {
        let { comment, commentedAt, children } = commentFile;
        Blog.findOneAndUpdate({ _id }, {
            $push: { "comments": commentFile._id }, $inc: {
                "activity.total_comments": 1, "activity.total_parent_comments": replying_to ? 0 : 1

            }
        })
            .then(blog => {
                console.log("New Comment Added");

            })

        let notificationObj = {
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: blog_author,
            user: user_id,
            comment: commentFile._id
        }
        if (replying_to) {
            notificationObj.replied_on_comment = replying_to;
            await Comment.findOneAndUpdate({ _id: replying_to }, { $push: { children: commentFile._id } })
                .then(replyingToCommentDoc => {
                    notificationObj.notification_for = replyingToCommentDoc.commented_by
                })


            if (notification_id) {
                Notification.findOneAndUpdate({ _id: notification_id }, { reply: commentFile._id })
                    .then(notification => console.log("Notification Updated")
                    )
            }
        }
        new Notification(notificationObj).save().then(noti => console.log("New notification created"));
        return res.status(200).json({
            comment, commentedAt, _id: commentFile._id, user_id, children
        })


    })
        .catch(err => {
            console.log(err);
            return res.status(500).json({ error: err.message })

        })
})

server.post("/get-blog-comments", (req, res) => {
    let { blog_id, skip } = req.body;
    let maxLimit = 5;

    Comment.find({ blog_id, isReply: false })
        .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
        .skip(skip)
        .limit(maxLimit)
        .sort({
            'commentedAt': -1
        })
        .then(comment => {
            return res.status(200).json(comment);
        })
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message })

        })
})

server.post('/get-replies', (req, res) => {
    let { _id, skip } = req.body;
    let maxLimit = 5;
    Comment.findOne({ _id })
        .populate({
            path: "children",
            options: {
                limit: maxLimit,
                skip: skip,
                sort: { 'commentedAt': -1 }
            },
            populate: {
                path: 'commented_by',
                select: "personal_info.profile_img personal_info.username personal_info.fullname",

            },
            select: " -blog_id -updatedAt"

        })
        .select("children")
        .then(doc => {
            return res.status(200).json({ replies: doc.children })
        })
        .catch(err => {
            return res.status(500).json({ error: err.message })
        })
})

const deleteComments = (_id) => {
    Comment.findOneAndDelete({ _id })
        .then(comment => {
            if (comment.parent) {
                Comment.findOneAndUpdate({ _id: comment.parent }, { $pull: { children: _id } })
                    .then(data => console.log("Comment delete from parent"))
                    .catch(err => console.log(err))
            }

            Notification.findOneAndDelete({ comment: _id }).then(notification => console.log("Comment notification deleted"))

            Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } }).then(notification => console.log("Reply notification deleted"))

            Blog.findOneAndUpdate({ _id: comment.blog_id }, { $pull: { comments: _id }, $inc: { "activity.total_comments": -1 }, "activity.total_parent_comments": comment.parent ? 0 : -1 })
                .then(blog => {
                    if (comment.children.length) {
                        comment.children.map(replies => {
                            deleteComments(replies)
                        })
                    }
                })
        })
        .catch(err => {
            console.log(err.message);

        })
}



server.post('/delete-comment', verifyJWT, (req, res) => {
    // let user_id = req.body;
    // let { _id } = req.body;
    let user_id = req.user;
    const { _id } = req.body;
    Comment.findOne({ _id })
        .then(comment => {
            if (user_id == comment.commented_by || user_id == comment.blog_author) {
                deleteComments(_id)

                return res.status(200).json({ status: 'done' })
            }
            else {
                return res.status(403).json({ error: "This comment cannot be deleted" })
            }
        })
})



server.get("/new-notification", verifyJWT, (req, res) => {
    let user_id = req.user;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
        .then(result => {
            if (result) {
                return res.status(200).json({ new_notification_available: true })
            }
            else {
                return res.status(200).json({ new_notification_available: false })
            }
        })
        .catch((err) => {
            console.log(err.message);

            return res.status(500).json({ error: err.message })
        })

})


server.post("/notification", verifyJWT, (req, res) => {
    let user_id = req.user;

    let { page, filter, deletedDocCnt } = req.body;

    let maxLimit = 10;
    let findQuery = { notification_for: user_id, user: { $ne: user_id } };
    let skipDocs = (page - 1) * maxLimit;
    if (filter != 'all') {
        findQuery.type = filter;
    }
    if (deletedDocCnt) {
        skipDocs -= deletedDocCnt;
    }

    Notification.find(findQuery)
        .skip(skipDocs)
        .limit(maxLimit)
        .populate("blog", "title blog_id")
        .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
        .populate("comment", "comment")
        .populate("replied_on_comment", "comment")
        .populate("reply", "comment")
        .sort({ createdAt: -1 })
        .select("createdAt type seen reply")
        .then(notifications => {
            // return res.status(200).json({ notifications });
            Notification.updateMany(findQuery, { seen: true })
                .skip(skipDocs)
                .limit(maxLimit)
                .then(() => console.log("notification seen")
                );

            return res.status(200).json({
                results: notifications,
                page,
                totalDocs: notifications.length
            })
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({ error: err.message })

        })

})


server.post("/all-notifications-count", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { filter } = req.body;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } }
    if (filter != 'all') {
        findQuery.type = filter
    }

    Notification.countDocuments(findQuery)
        .then(cnt => {
            return res.status(200).json({ totalDocs: cnt })
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })
})



server.post("/user-written-blogs", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { page, draft, query, deletedDocCnt } = req.body;
    let maxLimit = 5;
    let skipDocs = (page - 1) * maxLimit;
    if (deletedDocCnt) {
        skipDocs -= deletedDocCnt;
    }

    Blog.find({ author: user_id, draft, title: new RegExp(query, 'i') })
        .skip(skipDocs)
        .limit(maxLimit)
        .sort({ publishedAt: -1 })
        .select("title banner publishedAt blog_id activity des draft -_id")
        .then((blogs) => {
            return res.status(200).json({ blogs })
        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })

})


server.post("/user-written-blogs-count", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { draft, query } = req.body;
    Blog.countDocuments({ author: user_id, draft, title: new RegExp(query, 'i') })
        .then(count => {
            return res.status(200).json({ totalDocs: count })
        })
        .catch((err) => {
            return res.status.apply(500).json({ error: err.message })
        })
})


server.post("/delete-blog", verifyJWT, (req, res) => {
    let user_id = req.user;
    let { blog_id } = req.body;

    Blog.findOneAndDelete({ blog_id })
        .then(blog => {
            Notification.deleteMany({ blog: blog_id })
                .then(data => {
                    console.log("Notification Deleted");
                })

            Comment.deleteMany({ blog: blog_id })
                .then(data => {
                    console.log("Comment Deleted");

                })

            User.findOneAndUpdate({ _id: user_id }, { $pull: { blog: blog._id }, $inc: { "account_info.total_posts": -1 } })
                .then(user => {
                    console.log("Blog Deleted");

                })

            return res.status(200).json({ status: 'Done' })


        })
        .catch((err) => {
            return res.status(500).json({ error: err.message })
        })
})

server.listen(process.env.PORT, () => {
    console.log("Listening on Port -> " + process.env.PORT);

})
