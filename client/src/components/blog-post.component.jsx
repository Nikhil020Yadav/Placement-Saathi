import { getDay } from "../common/date";
import { Link } from 'react-router-dom';
import { fetchCompanyLogo } from "../common/fetchCompanyLogo.js";
import { useState, useEffect } from "react";
const BlogPostCard = ({ content, author }) => {
    const [companyLogo, setCompanyLogo] = useState(null);
    console.log("BlogPostCard content:", content);

    let { publishedAt, title, company, ctc, offerType, activity: { total_likes }, blog_id: id } = content;
    let { fullname, profile_img, username } = author

    // const fallbackCompany = id?.match(/^[A-Za-z]+/)?.[0];
    // const company = content.company || fallbackCompany || "Unknown";

    // const company = content.company || id?.split("-")[0];
    console.log(company);
    useEffect(() => {
        const fetchLogo = async () => {
            const { logoUrl } = await fetchCompanyLogo(company);
            setCompanyLogo(logoUrl);
        };
        if (company) fetchLogo();
    }, [company]);

    return (
        <Link to={`/blog/${id}`} className="flex gap-8 items-center border-b border-grey pb-5 mb-4">
            <div className="w-full">
                <div className="flex gap-2 items-center mb-7">
                    <img src={profile_img} className="w-6 h-6 rounded-full" />
                    <p className="line-clamp-1">{fullname}</p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>
                <h1 className="blog-title">{title}</h1>
                <p className="my-3 text-xl font-gelasio leading-7 max-sm:hidden md:max-[1100px]:hidden line-clamp-2"> {ctc}</p>
                <div className="flex gap-4 mt-7">
                    <span className="btn-light py-1 px-4">
                        {offerType}
                    </span>
                    <span className="ml-3 flex items-center gap-2 text-dark-grey">

                        <i className="fi fi-rr-heart text-xl" />
                        {total_likes}
                    </span>
                </div>

            </div>
            <div className="h-28 w-28 flex items-center justify-center bg-white shadow-sm rounded-lg overflow-hidden border">
                {companyLogo ? (
                    <img
                        src={companyLogo}
                        onError={(e) => { e.target.src = "/default-banner.png"; }}
                        className="max-h-20 max-w-[80%] object-contain"
                        alt={`${company} logo`}
                    />
                ) : (
                    <img
                        src="/default-banner.png"
                        className="h-16 w-auto object-contain"
                        alt="default logo"
                    />
                )}
            </div>
        </Link>
    )
}

export default BlogPostCard;