import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import BlogPostCard from "../components/blog-post.component";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import PageWrapper from "../components/page-wrapper.component";

const UserProfilePage = () => {

    let { id: profileId } = useParams();

    let [profile, setProfile] = useState(null);
    let [blogs, setBlogs] = useState(null);
    let [loading, setLoading] = useState(true);

    const fetchUserProfile = () => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", { username: profileId })
        .then(({ data: user }) => {
            setProfile(user);
            getBlogs({ user_id: user._id });
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })

    }

    const getBlogs = ({ page = 1, user_id }) => {

        user_id = user_id == undefined ? profile._id : user_id;

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { author: user_id, page })
        .then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { author: user_id }
            })

            formatedData.user_id = user_id;
            setBlogs(formatedData);
            setLoading(false);

        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })

    }

    useEffect(() => {

        resetStates();
        fetchUserProfile();

    }, [profileId])

    const resetStates = () => {
        setProfile(null);
        setBlogs(null);
        setLoading(true);
    }

    return (
        <PageWrapper>
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    profile == null ? 
                        <NoDataMessage message="User not found" />
                    :
                    <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap-12">

                        <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%] md:pl-8 md:border-l border-grey md:sticky md:top-[100px] md:py-10">

                            <img src={profile.personal_info.profile_img} className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32" />

                            <h1 className="text-2xl font-medium">@{profile.personal_info.username}</h1>

                            <p className="text-xl capitalize h-6">{profile.personal_info.fullname}</p>

                            <p className="text-dark-grey">
                                {blogs && blogs.totalDocs !== undefined ? blogs.totalDocs : 0} Blogs - {profile.account_info.total_reads.toLocaleString()} Reads
                            </p>

                            <div className="flex gap-4 mt-2">
                                <div className="flex flex-col items-center">
                                    <h2 className="text-2xl font-bold text-dark-grey">
                                        {blogs && blogs.totalDocs !== undefined ? blogs.totalDocs : 0}
                                    </h2>
                                    <p className="text-dark-grey text-sm">Total Blogs</p>
                                </div>
                                <div className="h-full w-[1px] bg-grey"></div>
                                <div className="flex flex-col items-center">
                                    <h2 className="text-2xl font-bold text-dark-grey">
                                        {blogs && blogs.results ? 
                                            blogs.results.reduce((total, blog) => total + blog.activity.total_likes, 0).toLocaleString()
                                            : '0'
                                        }
                                    </h2>
                                    <p className="text-dark-grey text-sm">Total Likes</p>
                                </div>
                            </div>

                            {
                                profile.social_links && Object.keys(profile.social_links).length > 0 &&
                                <div className="flex gap-4 mt-4">
                                    {
                                        Object.keys(profile.social_links).map((key) => {
                                            let link = profile.social_links[key];

                                            return link ? 
                                                <a key={key} href={link} target="_blank" rel="noopener noreferrer">
                                                    <i className={"fi " + (key != 'website' ? "fi-brands-" + key : "fi-rr-globe") + " text-2xl hover:text-black"}></i>
                                                </a> : ""
                                        })
                                    }
                                </div>
                            }

                            {
                                profile.personal_info.bio &&
                                <p className="text-xl leading-7">{profile.personal_info.bio}</p>
                            }

                        </div>

                        <div className="max-md:mt-12 w-full">

                            <h1 className="text-2xl font-medium mb-8">Published Blogs</h1>

                            {
                                blogs == null ? <Loader /> :
                                    blogs.results.length ?
                                        blogs.results.map((blog, i) => {
                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.1 }}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                            </AnimationWrapper>
                                        })
                                    : <NoDataMessage message="No blogs published" />
                            }

                            <LoadMoreDataBtn state={blogs} fetchDataFun={getBlogs} />

                        </div>

                    </section>
            }
        </AnimationWrapper>
        </PageWrapper>
    )
}

export default UserProfilePage;
