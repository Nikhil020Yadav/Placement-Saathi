import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { FilterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import InPageNavigation from "../components/inpage-navigation.component";
import Loader from "../components/loader.component";
import NoDataMessage from "../components/nodata.component";
import AnimationWrapper from "../common/page-animation";
import { ManagePublishedBlogCard, ManageDraftBlogPost } from "../components/manage-blogcard.component";
import LoadMoreBtn from "../components/load-more.component";
import { useSearchParams } from "react-router-dom";
const ManageBlogs = () => {

    const [blogs, setBlogs] = useState(null);
    const [drafts, setDrafts] = useState(null);
    const [query, setQuery] = useState("");
    let activeTab = useSearchParams()[0].get("tab")
    let { userAuth: { access_token } } = useContext(UserContext);

    const getBlogs = ({ page, draft, deletedDocCnt = 0 }) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/user-written-blogs", {
            page, draft, query, deletedDocCnt
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(async ({ data }) => {
                let formatedData = await FilterPaginationData({
                    state: draft ? drafts : blogs,
                    data: data.blogs, page,
                    user: access_token,
                    countRoute: "/user-written-blogs-count",
                    data_to_send: { draft, query }
                })

                console.log("draft -->" + draft, formatedData);

                if (draft) {
                    setDrafts(formatedData);
                }
                else {
                    setBlogs(formatedData);
                }







            })
            .catch((err) => {
                console.log(err);

            })
    }


    useEffect(() => {
        if (access_token) {
            if (blogs === null) {
                getBlogs({ page: 1, draft: false })
            }
            if (drafts === null) {
                getBlogs({ page: 1, draft: true })
            }
        }
    }, [access_token, blogs, drafts, query])


    const handleSearch = (e) => {
        let searchQuery = e.target.value;

        setQuery(searchQuery);
        if (e.keyCode === 13 && searchQuery.length) {
            setBlogs(null)
            setDrafts(null)
        }
    }

    const handleChange = (e) => {
        if (!e.target.value.length) {
            setQuery("");
            setBlogs(null)
            setDrafts(null)
        }
    }



    return (
        <>
            <h1 className="max-md:hidden">Manage Your Shared Experiences</h1>
            <Toaster />
            <div className="relative max-md:mt-5 md:mt-8 mb-10">
                <input
                    type="search"
                    className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
                    placeholder="Search"
                    onChange={handleChange}
                    onKeyDown={handleSearch}
                >
                </input>

                <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
            </div>


            <InPageNavigation routes={["Published Experiences", "Drafts"]} defaultActiveIndex={activeTab != 'draft' ? 0 : 1}>
                {//published
                    blogs === null ? <Loader /> :
                        blogs.results.length ?

                            <>
                                {
                                    blogs.results.map((blog, i) => {
                                        return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                                            <ManagePublishedBlogCard blog={{ ...blog, index: i, setStateFun: setBlogs }} />
                                        </AnimationWrapper>
                                    })
                                }

                                <LoadMoreBtn state={blogs} fetchDataFunc={getBlogs} additionalParam={{ draft: false, deletedDocCnt: blogs.deletedDocCnt }} />
                            </>

                            : <NoDataMessage msg="No Published Experiences" />
                }


                {//DRAFTS
                    drafts === null ? <Loader /> :
                        drafts.results.length ?

                            <>
                                {
                                    drafts.results.map((draft, i) => {
                                        return <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                                            <ManageDraftBlogPost blog={{ ...draft, index: i, setStateFun: setDrafts }} />
                                        </AnimationWrapper>
                                    })
                                }
                                <LoadMoreBtn state={drafts} fetchDataFunc={getBlogs} additionalParam={{ draft: true, deletedDocCnt: drafts.deletedDocCnt }} />
                            </>

                            : <NoDataMessage msg="No Draft Experiences" />
                }
            </InPageNavigation>
        </>
    )
}
export default ManageBlogs