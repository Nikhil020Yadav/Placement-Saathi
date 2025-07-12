import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios"
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";

import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { FilterPaginationData } from "../common/filter-pagination-data";
import LoadMoreBtn from "../components/load-more.component";

const HomePage = () => {


    let [blog, setBlog] = useState(null)
    let [trendingBlogs, setTrendingBlogs] = useState(null)
    let [pageState, setPageState] = useState("home")
    let categories = ["DSA", "Leetcode", "fte", "Development", "CS Fundamentals", "Competetive Programming", "Backend Development", "React", "Machine Learning", "Training Model"]

    const fetchLatestBlogs = (page = 1) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/latest-blogs", { page })
            .then(async ({ data }) => {

                console.log(data.blogs);
                let formatedData = await FilterPaginationData({
                    arr: blog,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count"


                })
                console.log(formatedData);
                console.log("Results:", formatedData?.results?.length);
                setBlog(formatedData)

            })
            .catch((err) => {
                console.log(err);

            })
    }
    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_URL + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlogs(data.blogs)
                console.log(data.blogs);

            })
            .catch((err) => {
                console.log(err);

            })
    }

    const loadBlogByCategory = (category) => {
        //let category = e.target.innerText.toLowerCase();
        console.log(pageState);

        setBlog(null);
        if (pageState == category) {
            setPageState("home");
            return;
        }
        else {
            setPageState(category);
        }


    }
    const fetchBlogByCategory = ({ page = 1 }) => {
        console.log(pageState);

        axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { tag: pageState, page })
            .then(async ({ data }) => {
                console.log(data.blogs);
                let formatedData = await FilterPaginationData({
                    arr: blog,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState }

                })
                console.log(formatedData);
                console.log("Results:", formatedData?.results?.length);
                setBlog(formatedData)
                // setBlog(data.blogs)
                // console.log(data.blogs);

            })
            .catch((err) => {
                console.log(err);

            })
    }

    useEffect(() => {
        activeTabRef.current.click();
        if (pageState == "home") {
            fetchLatestBlogs(1);
        } else {
            fetchBlogByCategory(1);
        }
        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

    }, [pageState])
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/** latest blogs*/}
                <div className="w-full">
                    <InPageNavigation
                        routes={[pageState, "trending blogs"]}
                        defaultHidden={["trending blogs"]}
                    >

                        <>
                            {

                                blog == null ? <Loader /> :
                                    (!blog.results.length ? <NoDataMessage msg="No Experiences shared yet!" /> :
                                        blog.results.map((blg, i) => {
                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }} >

                                                <BlogPostCard content={blg} author={blg.author.personal_info} />
                                            </AnimationWrapper>
                                        }))
                            }
                            <LoadMoreBtn state={blog} fetchDataFunc={(pageState === "home" ? fetchLatestBlogs : fetchBlogByCategory)} />
                        </>
                        {
                            trendingBlogs == null ? <Loader /> :
                                (!trendingBlogs.length ? <NoDataMessage msg="No Experiences shared yet!" /> :
                                    trendingBlogs.map((blg, i) => {
                                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }} >
                                            <MinimalBlogPost blog={blg} index={i} />

                                        </AnimationWrapper>
                                    }))
                        }


                    </InPageNavigation>
                </div>
                {/**filters and trending blogs */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
                    <div className="flex flex-col gap-10">
                        <div>
                            <h1 className="font-medium text-xl mb-8"> Your Seniors are Here to Help You!!</h1>
                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <button onClick={() => loadBlogByCategory(category)} className={"tag " + (pageState == category ? " bg-black text-white" : " ")} key={i}>
                                            {category}
                                        </button>
                                    })
                                }
                            </div>
                        </div>

                        <div>
                            <h1 className="font-medium text-xl mb-8"> Trending <i className="fi fi-rr-arrow-trend-up" /></h1>
                            {
                                trendingBlogs == null ? <Loader /> :
                                    trendingBlogs.map((blg, i) => {
                                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }} >
                                            <MinimalBlogPost blog={blg} index={i} />

                                        </AnimationWrapper>
                                    })
                            }
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
}

export default HomePage;