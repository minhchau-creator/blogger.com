import { useParams } from "react-router-dom";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState, useContext } from "react";
import Loader from "../components/loader.component";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/nodata.component";
import LoadMoreDataBtn from "../components/load-more.component";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
import BlogPostCard from "../components/blog-post.component";
import UserCard from "../components/usercard.component";
import PageWrapper from "../components/page-wrapper.component";

const SearchPage = () => {

    let { query } = useParams();

    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);
    let [sortBy, setSortBy] = useState('latest');

    const searchBlogs = ({ page = 1, create_new_arr = false }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page, sort_by: sortBy })
        .then(async ({ data }) => {
            
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { query },
                create_new_arr
            })

            setBlogs(formatedData);
        })
        .catch(err => {
            console.log(err);
        })

    }

    const fetchUsers = () => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
        .then(({ data: { users } }) => {
            setUsers(users);
        })
        .catch(err => {
            console.log(err);
        })

    }

    useEffect(() => {
        
        resetState();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();

    }, [query, sortBy])

    const resetState = () => {
        setBlogs(null);
        setUsers(null);
    }

    const handleSortChange = (newSort) => {
        // Không cho phép bỏ chọn option đang active
        if (sortBy === newSort) {
            return;
        }
        setSortBy(newSort);
        setBlogs(null);
    }

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ?
                            users.map((user, i) => {
                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                    <UserCard user={user} />
                                </AnimationWrapper>
                            })
                        : <NoDataMessage message="No user found" />
                }
            </>
        )
    }

    return (
        <PageWrapper>
            <section className="h-cover flex justify-center gap-6 md:gap-10">
            <div className="w-full">
                
                {
                    blogs == null ? <Loader /> :
                        <>
                            <h1 className="font-medium text-lg sm:text-xl mb-3 sm:mb-4">Search Results for "{query}"</h1>
                            
                            {/* Sort Filter Bar */}
                            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 border-b border-grey pb-3 sm:pb-4 overflow-x-auto">
                                <button 
                                    onClick={() => handleSortChange('latest')}
                                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full capitalize whitespace-nowrap text-sm sm:text-base ${sortBy === 'latest' ? 'bg-black text-white' : 'bg-grey text-dark-grey hover:bg-grey/80'}`}
                                >
                                    <i className="fi fi-rr-clock mr-1 sm:mr-2"></i>
                                    Latest
                                </button>
                                <button 
                                    onClick={() => handleSortChange('likes')}
                                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full capitalize whitespace-nowrap text-sm sm:text-base ${sortBy === 'likes' ? 'bg-black text-white' : 'bg-grey text-dark-grey hover:bg-grey/80'}`}
                                >
                                    <i className="fi fi-rr-heart mr-1 sm:mr-2"></i>
                                    Most Liked
                                </button>
                                <button 
                                    onClick={() => handleSortChange('comments')}
                                    className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full capitalize whitespace-nowrap text-sm sm:text-base ${sortBy === 'comments' ? 'bg-black text-white' : 'bg-grey text-dark-grey hover:bg-grey/80'}`}
                                >
                                    <i className="fi fi-rr-comment-alt mr-1 sm:mr-2"></i>
                                    Most Commented
                                </button>
                            </div>

                            {
                                blogs.results.length ?
                                    <>
                                        {
                                            blogs.results.map((blog, i) => {
                                                return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.1 }}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrapper>
                                            })
                                        }

                                        <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />
                                    </>
                                : <NoDataMessage message="No blogs published" />
                            }
                        </>
                }

            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-4 md:pl-8 pt-3 max-md:hidden">

                <h1 className="font-medium text-lg md:text-xl mb-6 md:mb-8">User related to search <i className="fi fi-rr-user mt-1"></i></h1>

                <UserCardWrapper />

            </div>

        </section>
        </PageWrapper>
    )
}

export default SearchPage;