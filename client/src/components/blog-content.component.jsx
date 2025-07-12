import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const BlogContent = ({ blog }) => {
    let { title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags } = blog;

    return (
        <>
            <div className="capitalize text-black"> {company}</div>
            <div className="my-12 font-gelasio blog-page-content">
                {experience}

            </div>
        </>
    )
}
export default BlogContent;