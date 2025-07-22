import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";

const BlogContent = ({ blog }) => {
    let { title, company, jobRole, department, ctc, year, experience, preparation, difficulty, offerType, tags } = blog || {};

    return (
        <>
            <div className="text-black px-6 py-4 space-y-6">

                <div className="space-y-1 text-gray-800">
                    <div><span className="font-semibold">Company:</span> {company}</div>
                    <div><span className="font-semibold">Role:</span> {jobRole}</div>
                    <div><span className="font-semibold">Department:</span> {department}</div>
                    <div><span className="font-semibold">CTC:</span> {ctc}</div>
                    <div><span className="font-semibold">Year:</span> {year}</div>
                    <div><span className="font-semibold">Offer Type:</span> {offerType}</div>
                    <div><span className="font-semibold">Difficulty:</span> {difficulty}</div>
                    {tags?.length > 0 && (
                        <div>
                            <span className="font-semibold">Tags:</span>{" "}
                            <span className="inline-flex flex-wrap gap-2 mt-1">
                                {tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="bg-gray-200 text-sm px-2 py-1 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </span>
                        </div>
                    )}
                </div>

                <div className="my-8">
                    <h2 className="text-2xl font-semibold mb-2">Experience</h2>
                    <p className="font-gelasio blog-page-content leading-relaxed whitespace-pre-line">
                        {experience}
                    </p>
                </div>

                {preparation && (
                    <div className="my-8">
                        <h2 className="text-2xl font-semibold mb-2">Preparation Tips</h2>
                        <p className="leading-relaxed whitespace-pre-line">
                            {preparation}
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}
export default BlogContent;