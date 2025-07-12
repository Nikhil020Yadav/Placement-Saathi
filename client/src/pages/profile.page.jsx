import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { UserContext } from "../App";
import AboutUser from "../components/about.component";
import { FilterPaginationData } from "../common/filter-pagination-data";
import InPageNavigation from "../components/inpage-navigation.component";
import ErrorPage from "./404.page";
import LoadMoreBtn from "../components/load-more.component";
import NoDataMessage from "../components/nodata.component";
import BlogPostCard from "../components/blog-post.component";
export const profileDataStr = {
    "personal_info": {
        "fullname": "",
        "email": "",
        "username": "",
        "bio": "",
        "profile_img": ""
    },
    "social_links": {
        "youtube": "",
        "instagram": "",
        "facebook": "",
        "twitter": "",
        "github": "",
        "website": ""
    },
    "account_info": {
        "total_posts": 0,
        "total_reads": 0
    },

    "joinedAt": "",
}

const ProfilePage = () => {
    let { id: profileId } = useParams();
    let [profile, setProfile] = useState(profileDataStr)
    let [loading, setLoading] = useState(true);
    let { personal_info: { fullname, username: profile_username, profile_img, bio }, account_info: { total_posts, total_reads }, social_links, joinedAt } = profile;
    let [blogs, setBlogs] = useState(null)
    let [profileLoaded, setProfileLoaded] = useState()
    let { userAuth: { username } } = useContext(UserContext)

    const fetchUserProfile = () => {
        axios.post(import.meta.env.VITE_SERVER_URL + '/get-profile', { username: profileId })
            .then(({ data: user }) => {
                console.log(user);
                if (user != null) {
                    setProfile(user);
                }

                setProfileLoaded(profileId)
                getBlogs({ user_id: user._id })
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false)

            })
    }

    const getBlogs = ({ page = 1, user_id }) => {
        user_id = user_id == undefined ? blogs.user_id : user_id;

        axios.post(import.meta.env.VITE_SERVER_URL + "/search-blogs", {
            author: user_id,
            page
        })
            .then(async ({ data }) => {
                let formatedData = await FilterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { author: user_id }
                })
                formatedData.user_id = user_id;
                console.log(formatedData);

                setBlogs(formatedData);
            })
    }




    const resetStates = () => {
        setProfile(profileDataStr);
        setProfileLoaded("")
        setLoading(true);
    }
    useEffect(() => {
        if (profileId != profileLoaded) {
            setBlogs(null)
        }
        if (blogs == null) {
            resetStates();
            fetchUserProfile();
        }
    }, [profileId, blogs])
    return (
        <>
            <AnimationWrapper>
                {
                    loading ? <Loader /> :
                        profile_username.length ?
                            <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">
                                <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-1 border-grey md:sticky md:top-[100px] md:py-10">
                                    <img src={profile_img} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" />
                                    <h1> {profile_username}</h1>
                                    <p className="text-xl capitalize h-6">{fullname}</p>
                                    <p>{total_posts.toLocaleString()} Blogs - {total_reads.toLocaleString()} Reads </p>


                                    <div className="flex gap-4 mt-2">
                                        {
                                            profileId == username ? <Link to='/settings/edit-profile' className="btn-light rounded-md"> Edit Profile </Link> : " "
                                        }


                                    </div>
                                    <AboutUser className="max-md:hidden" bio={bio} social_links={social_links} joinedAt={joinedAt} />
                                </div>
                                <div className="max-md:mt-12 w-full">
                                    <div className="w-full">
                                        <InPageNavigation
                                            routes={["Experience Shared", "About"]}
                                            defaultHidden={["About"]}
                                        >

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
                                                <LoadMoreBtn state={blogs} fetchDataFunc={getBlogs} />
                                            </>
                                            <AboutUser bio={bio} social_links={social_links} joinedAt={joinedAt} />


                                        </InPageNavigation>
                                    </div>

                                </div>
                            </section>
                            :
                            <ErrorPage />
                }
            </AnimationWrapper>


        </>
    )
}
export default ProfilePage;