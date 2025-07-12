import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useState } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import LoadMoreBtn from "../components/load-more.component";
import NoDataMessage from "../components/nodata.component";
import { FilterPaginationData } from "../common/filter-pagination-data";
import { useEffect } from "react";
import axios from "axios";
import BlogPostCard from "../components/blog-post.component";
import UserCard from "../components/usercard.component";
const SearchPage = () => {
    let { query } = useParams()
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null)
    const searchBlogs = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", { query, page })
            .then(async ({ data }) => {
                console.log(data.blogs);
                let formatedData = await FilterPaginationData({
                    arr: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr

                })
                console.log(formatedData);
                console.log("Results:", formatedData?.results?.length);
                setBlogs(formatedData)


            })
    }

    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_URL + "/search-users", { query })
            .then(({ data }) => {
                console.log("I got a name", data);

                setUsers(data);
            })
            .catch((err) => {
                console.log(err.message);

            })
    }

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }
    useEffect(() => {
        resetState();
        searchBlogs({ page: 1, create_new_arr: true })
        fetchUsers();
    }, [query])

    const UserCardWrapper = () => {
        console.log(users);

        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ?
                            users.map((user, i) => {
                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.8 }}>
                                    <UserCard user={user} />
                                </AnimationWrapper>

                            })
                            : <NoDataMessage msg="No User Found" />
                }
            </>
        )
    }


    return (
        <section className="h-cover flex justify-center gap-10">
            <div className="w-full">
                <InPageNavigation routes={[`Search Results for ${query}`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]}>
                    <>
                        {

                            blogs == null ? <Loader /> :
                                (!blogs.results.length ? <NoDataMessage msg="No Experiences shared yet!" /> :
                                    blogs.results.map((blg, i) => {
                                        return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * .1 }} >

                                            <BlogPostCard content={blg} author={blg.author.personal_info} />
                                        </AnimationWrapper>
                                    }))
                        }
                        <LoadMoreBtn state={blogs} fetchDataFunc={searchBlogs} />
                    </>

                    <UserCardWrapper />
                </InPageNavigation>
            </div>
            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-1 border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8">User related to search <i className="fi fi-rr-user mt-1" /></h1>
                <UserCardWrapper />
            </div>
        </section>
    )
}
export default SearchPage;