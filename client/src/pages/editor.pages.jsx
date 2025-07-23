import { useContext, useEffect } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import { useState } from "react";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from "react";
import Loader from "../components/loader.component";
import axios from "axios";
/*const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    author: { personal_info: {} }

}*/
const blogStructure = {
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
    tags: [],         // Offer Type (PPO, FTE, Internship)
    author: {
        personal_info: {}  // Author details (who submitted the experience)
    },
    // createdAt: '',         // optional, for timestamp
    // updatedAt: ''          // optional, for timestamp
}


export const EditorContext = createContext({})

const Editor = () => {

    let { blog_id } = useParams()
    const [blog, setBlog] = useState(blogStructure);
    const [editorState, setEditorState] = useState("editor")
    const [textEditor, setTextEditor] = useState({ isReady: false })
    const [loading, setLoading] = useState(true)
    let { userAuth: { access_token } } = useContext(UserContext)


    useEffect(() => {
        if (!blog_id) {
            return setLoading(false);
        }
        console.log("Fetching 0 ->>", blog_id);

        axios.post(import.meta.env.VITE_SERVER_URL + '/get-blog', {
            blog_id, mode: 'edit'
        })
            .then(({ data: { blog } }) => {
                setBlog(blog);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err.message);
                setBlog(null);
                setLoading(false);
                if (err.response) {
                    toast.error(err.response.data.error || "Something went wrong");
                } else {
                    toast.error("Network error or server is unreachable");
                }

            })
    }, [])
    return (

        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {
                access_token === null ? <Navigate to='/signin' />
                    :
                    loading ? <Loader /> :
                        editorState == 'editor' ?
                            <BlogEditor />
                            :
                            <PublishForm />

            }
        </EditorContext.Provider>
    )
}
export default Editor;