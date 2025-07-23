import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Link } from "react-router-dom";
import { getDay } from '../common/date.jsx'
import BlogInteraction from "../components/blog-interaction.component.jsx";
import BlogPostCard from "../components/blog-post.component.jsx";
import BlogContent from "../components/blog-content.component.jsx";
import CommentsContainer, { fetchComments } from "../components/comments.component.jsx";
import axios from 'axios';
import { fetchCompanyLogo } from "../common/fetchCompanyLogo.js";
import { getCompanyDomain } from '../common/companyLogo.js';
console.log("Axios loaded:", typeof axios);


export const blogStructure = {
    title: '',             // Overall title (ex: "Amazon SDE-1 Placement Experience")
    banner: '',            // (optional) if you're still keeping banner image URL
    company: '',           // Company Name (Amazon, Microsoft, etc.)
    jobRole: '',           // Job Role (SDE-1, Analyst, etc.)
    department: '',        // Department (CSE, IT, ECE, etc.)
    ctc: '',           // Package (e.g. 12 LPA)
    year: '',              // Year of Placement
    experience: '',        // Full Experience Description
    preparation: '',       // Preparation Tips / Resources
    difficulty: '',        // Difficulty Level (Easy, Medium, Hard)
    offerType: '',
    // Offer Type (PPO, FTE, Internship)
    author: {
        personal_info: {}  // Author details (who submitted the experience)
    },
    tags: [],
    publishedAt: ''
    // createdAt: '',         // optional, for timestamp
    // updatedAt: ''          // optional, for timestamp
}


export const BlogContext = createContext({});
const BlogPage = () => {
    let { blog_id } = useParams()
    const [companyLogo, setCompanyLogo] = useState(null);
    let [blog, setBlog] = useState(blogStructure)
    const [loading, setLoading] = useState(false)
    let [similarBlogs, setSimilarBlogs] = useState(null)

    const [isLikedByUser, setLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);



    let { title, company, jobRole, department, ctc, year, banner, experience, preparation, difficulty, offerType, author: { personal_info: { fullname, username: author_username, profile_img } } } = blog;

    const companyDomain = getCompanyDomain(company);
    const companyLogoUrl = companyDomain
        ? `https://logo.clearbit.com/${companyDomain}`
        : banner;
    const fetchBlog = () => {
        console.log("Fetching blog with blog_id:", blog_id)

        axios.post(import.meta.env.VITE_SERVER_URL + "/get-blog", {
            blog_id
        })
            .then(async ({ data: { blog } }) => {

                blog.comments = await fetchComments({
                    blog_id: blog._id,
                    setParentCommentCountFun: setTotalParentCommentsLoaded
                })
                console.log("Before :", blog);

                setBlog(blog);
                const { logoUrl } = await fetchCompanyLogo(blog.company);
                setCompanyLogo(logoUrl);

                console.log("After : ", blog);
                axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { tag: blog.tags, limit: 6, eliminate_blog: blog_id })
                    .then(({ data }) => {
                        //console.log("Tags", tags);

                        setSimilarBlogs(data.blogs);
                        console.log("Similar", data.blogs);

                    })

                setLoading(false);

            })
            .catch((err) => {
                // console.log(blog);

                // console.log(err.message);
                // setLoading(false);
                setBlog(null);
                setLoading(false);
                if (err.response) {
                    const msg = err.response.data?.error;
                    alert(`Error: ${msg}`);
                } else {
                    alert("Unexpected error occurred");
                }
            })
    }

    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setLikedByUser(false);
        // setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    }


    useEffect(() => {
        resetStates();
        fetchBlog()
    }, [blog_id])
    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
                        <CommentsContainer />
                        <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">

                            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start mb-6">
                                {companyLogo && (
                                    <img
                                        src={companyLogo}
                                        onError={(e) => { e.target.src = "/default-banner.png"; }}
                                        className="h-12 sm:h-16 w-auto object-contain"
                                        alt={`${company} logo`}
                                    />
                                )}
                                <h2 className="text-2xl sm:text-3xl font-semibold text-center sm:text-left">{title}</h2>
                            </div>


                            <div className='mt-12'>

                                <div className="flex max-sm:flex-col justify-between my-8">

                                    <div className="flex gap-5 items-start">
                                        <img src={profile_img} className="w-12 h-12 rounded-full" />
                                        <p className="capitalize"> {fullname}
                                            <br />
                                            @
                                            <Link to={`/user/${author_username}`} className='underline'>{author_username}</Link>
                                        </p>
                                    </div>
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5"> Published on {getDay(blog.publishedAt)}</p>
                                </div>


                            </div>
                            {blog && blog._id && (
                                <BlogInteraction />
                            )}


                            <BlogContent blog={blog} />


                            {
                                similarBlogs != null && similarBlogs.length ?
                                    <>
                                        <h1 className="text-2xl mt-14 mb-10 font-medium"> Similar Blogs </h1>

                                        {
                                            similarBlogs.map((blog, i) => {
                                                let { author: { personal_info } } = blog;
                                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                                    <BlogPostCard content={blog} author={personal_info} />
                                                </AnimationWrapper>
                                            })
                                        }
                                    </>
                                    :
                                    ""
                            }
                        </div>
                    </BlogContext.Provider>
            }

        </AnimationWrapper>
    )
}
export default BlogPage;