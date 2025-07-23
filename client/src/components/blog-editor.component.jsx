import { Link, useNavigate, useParams } from "react-router-dom";
import logo from '../imgs/IIEST_Shibpur_logo.svg';
import AnimationWrapper from "../common/page-animation";
import defaultBanner from '../imgs/blog banner.png';
import { useContext, useRef, useEffect, useState } from "react";
import { EditorContext } from "../pages/editor.pages";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
const BlogEditor = () => {

    let { blog, blog: { title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags }, setBlog, setEditorState } = useContext(EditorContext);


    let { userAuth: { access_token } } = useContext(UserContext)
    let { blog_id } = useParams()
    let navigate = useNavigate()

    const handleTitleKeyDown = (e) => {
        console.log(e);
        if (e.keyCode == 13) {
            e.preventDefault();
        }

    }
    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + "px";
        setBlog({ ...blog, title: input.value });
    };

    const handlePublish = () => {
        console.log("Publish button clicked");

        if (!blog.title?.trim()) {
            toast.error("Title is required");
            return;
        }
        if (!blog.experience?.trim()) {
            toast.error("Experience is required");
            return;
        }


        console.log("Blog Data to Publish:", blog);


        setEditorState("publish");


        toast.success("Experience ready to publish!");
    };
    const handleSaveDraft = (e) => {
        if (e.target.className.includes("disable")) {
            return
        }

        if (!blog.title.length) {
            return toast.error("Write Blog Title Before Saving Draft")
        }

        let loadingToast = toast.loading("Saving Draft....")
        e.target.classList.add("disable");
        let blogObj = {
            title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, draft: true
        }
        axios.post(import.meta.env.VITE_SERVER_URL + "/createBlog", { ...blogObj, id: blog_id }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.classList.remove("disable");

                toast.dismiss(loadingToast);
                toast.success("Saved as Draft!!")

                setTimeout(() => {
                    navigate("/dashboard/blogs?tab=draft")
                }, 500);
            })
            .catch(({ response }) => {
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                console.log(import.meta.env.VITE_SERVER_URL);


                return toast.error(response.data.error)
            })


    }

    if (!blog) {
        return <div>Loading blog...</div>;
    }

    return (
        <>
            <nav className="navbar">
                <Link to="/" className="flex-none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full">
                    {blog.title.length ? blog.title : "New Blog "}
                </p>

                <div className="flex gap-4 ml-auto">
                    <button className="btn-dark py-2" onClick={handlePublish}>
                        Publish
                    </button>
                    <button className="btn-light py-2"
                        onClick={handleSaveDraft}
                    >Save Draft</button>
                </div>
            </nav>

            <AnimationWrapper>
                <section>
                    <div className="mx-auto max-w-[900px] w-full">

                        <textarea
                            defaultValue={blog.title}
                            placeholder="Title"
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        >
                        </textarea>

                        <hr className="w-full opacity-10 my-5" />

                        <input
                            type="text"
                            placeholder="Company Name (e.g., Amazon)"
                            className="w-full p-3 border rounded-md mt-5"
                            value={blog.company || ''}
                            onChange={(e) => setBlog({ ...blog, company: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Job Role (e.g., SDE-1, Analyst)"
                            className="w-full p-3 border rounded-md mt-5"
                            value={blog.jobRole || ''}
                            onChange={(e) => setBlog({ ...blog, jobRole: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Department (e.g., CSE, IT, ETC)"
                            className="w-full p-3 border rounded-md mt-5"
                            value={blog.department || ''}
                            onChange={(e) => setBlog({ ...blog, department: e.target.value })}
                        />

                        <input
                            type="text"
                            placeholder="Package (e.g., 12 LPA)"
                            className="w-full p-3 border rounded-md mt-5"
                            value={blog.ctc || ''}
                            onChange={(e) => setBlog({ ...blog, ctc: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Year of Placement (e.g., 2025)"
                            className="w-full p-3 border rounded-md mt-5"
                            value={blog.year || ''}
                            onChange={(e) => setBlog({ ...blog, year: e.target.value })}
                        />
                        <textarea
                            placeholder="Write your full experience here..."
                            className="w-full h-[500px] resize-none mt-5 p-3 border rounded-md"
                            value={blog.experience || ''}
                            onChange={(e) => setBlog({ ...blog, experience: e.target.value })}
                        />

                        <textarea
                            placeholder="Preparation Tips / Resources"
                            className="w-full h-[200px] resize-none mt-5 p-3 border rounded-md"
                            value={blog.preparation || ''}
                            onChange={(e) => setBlog({ ...blog, preparation: e.target.value })}
                        />
                        <select className="w-full p-3 border rounded-md mt-5"
                            value={blog.difficulty || ''}
                            onChange={(e) => setBlog({ ...blog, difficulty: e.target.value })}

                        >
                            <option value="">Select Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>

                        <select className="w-full p-3 border rounded-md mt-5"
                            value={blog.offerType || ''}
                            onChange={(e) => setBlog({ ...blog, offerType: e.target.value })}

                        >
                            <option value="" className="">Offer Type</option>
                            <option value="PPO">PPO</option>
                            <option value="FTE">FTE</option>
                            <option value="Internship">Internship</option>
                        </select>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    );
};

export default BlogEditor;
