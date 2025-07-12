import { Toaster } from "react-hot-toast"
import AnimationWrapper from "../common/page-animation"
import { useContext } from 'react';
import { EditorContext } from '../pages/editor.pages'
import Tag from "./tags.component";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";
const PublishForm = () => {

    let characterLimit = 250;
    let tagLimit = 10;
    let { blog, blog: { title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, }, setEditorState, setBlog } = useContext(EditorContext)

    let { userAuth: { access_token } } = useContext(UserContext)

    let navigate = useNavigate()
    const handleClose = () => {
        setEditorState("editor")
    }

    const handleBlogTitleChange = (e) => {
        let input = e.target;

        setBlog({ ...blog, title: input.value })
    }
    const handleKeyDown = (e) => {
        console.log(e.keyCode);

        if (e.keyCode == 13 || e.keyCode == 188) {
            e.preventDefault();

            let tag = e.target.value;
            console.log(tag);
            if (blog.tags.length < tagLimit) {
                if (!blog.tags.includes(tag) && tag.length) {
                    setBlog({ ...blog, tags: [...blog.tags, tag] })
                }
            }
            else {
                toast.error(`You can add maximum ${tagLimit} tags`);
            }

            e.target.value = "";


        }
    }

    const publishBlog = (e) => {

        if (e.target.className.includes("disable")) {
            return
        }

        if (!blog.title.length) {
            return toast.error("Write Blog Title Before Publishing")
        }

        let loadingToast = toast.loading("Publishing....")
        e.target.classList.add("disable");
        let blogObj = {
            title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags, draft: false
        }
        axios.post(import.meta.env.VITE_SERVER_URL + "/createBlog", blogObj, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                e.target.classList.remove("disable");

                toast.dismiss(loadingToast);
                toast.success("Published !!")

                setTimeout(() => {
                    navigate("/dashboard/blogs")
                }, 500);
            })
            .catch(({ response }) => {
                e.target.classList.remove("disable");
                toast.dismiss(loadingToast);
                console.log(import.meta.env.VITE_SERVER_URL);


                return toast.error(response.data.error)
            })



    }
    return (
        <AnimationWrapper>
            <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4">
                <Toaster />

                <button className="w-12 h-12 absolute right-[5vw] z-10 top-[5%] lg:top-[10%]"
                    onClick={handleClose}

                >
                    <i className="fi fi-br-cross"></i>
                </button>
                <div className="max-w-[550px] center">
                    <p text-dark-grey mb-1> Preview </p>

                    <div className="w-full aspect-video rounded-1g overflow-hidden bg-grey mt-4">
                        <img src="" />
                    </div>
                    <h1 className="text-4xl font-medium mt-2 leading-tight line-clamp-2">{blog.title}</h1>

                    <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">{blog.company}</p>
                </div>
                <div className="border-grey lg:border-1 lg:pl-8">
                    <p className="text-dark-grey mb-2 mt-2"> The Title:  </p>
                    <input type="text" placeholder={blog.title} defaultValue={blog.title} className="input-box pl-4"
                        onChange={handleBlogTitleChange}

                    />
                    <p> Preview </p>
                    <textarea
                        maxLength={characterLimit}
                        defaultValue={blog.experience}
                        className="h-40 resize-none loading-7 input-box pl-4"
                    // onChange={handleExpChange}
                    >

                    </textarea>
                    <p className="mt-1 text-dark-grey text-sm text-right"> {characterLimit - blog.experience.length} characters left</p>

                    <p className="text-black mb-2 mt-9">    Topics - (Helps in searching and ranking your blog)</p>
                    <div className="relative input-box pl-2 py-2 pb-4">
                        <input type="text" placeholder="Topic" className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                            onKeyDown={handleKeyDown}
                        />
                        {blog.tags.map((tag, i) => {
                            return <Tag tag={tag} key={i} tagIndex={i} />
                        })}

                    </div>
                    <p className="mt-1 mb-4 text-dark-grey text-right"> {tagLimit - blog.tags.length} tags left </p>

                    <button className="btn-dark px-8"
                        onClick={publishBlog}
                    > Publish </button>
                </div>

            </section>
        </AnimationWrapper>
    )
}

export default PublishForm