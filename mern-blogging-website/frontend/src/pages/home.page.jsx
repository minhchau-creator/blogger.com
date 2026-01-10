import { useEffect, useState, useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import PageWrapper from "../components/page-wrapper.component";
import BlogFilter from "../components/blog-filter.component";

const HomePage = () => {

    let [blogs, setBlogs] = useState(null);
    let [trendingBlogs, setTrendingBlogs] = useState(null);
    let [pageState, setPageState] = useState("home");
    let [selectedTags, setSelectedTags] = useState([]);
    let [allTags, setAllTags] = useState([]);
    let [sortBy, setSortBy] = useState("latest");
    let [dateRange, setDateRange] = useState({ from: "", to: "" });

    let categories = ["programming", "hollywood", "film making", "social media", "cooking", "tech", "finances", "travel"];

    const fetchLatestBlogs = ({ page = 1 }) => {
        let requestData = { page };
        
        // Add sort parameter
        if (sortBy && sortBy !== "latest") {
            requestData.sort_by = sortBy;
        }
        
        // Add date range
        if (dateRange.from && dateRange.to) {
            requestData.dateFrom = dateRange.from;
            requestData.dateTo = dateRange.to;
        }
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", requestData)
        .then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/all-latest-blogs-count"
            });

            setBlogs(formatedData);
        })
        .catch(err => {
            console.log(err);
        });
    }

    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
        .then(async ({ data }) => {

            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-count",
                data_to_send: { tag: pageState }
            });

            setBlogs(formatedData);
        })
        .catch(err => {
            console.log(err);
        });
    }

    const fetchBlogsByMultipleTags = ({ page = 1, tags }) => {
        let requestData = { tags, page };
        
        // Add sort parameter
        if (sortBy && sortBy !== "latest") {
            requestData.sort_by = sortBy;
        }
        
        // Add date range
        if (dateRange.from && dateRange.to) {
            requestData.dateFrom = dateRange.from;
            requestData.dateTo = dateRange.to;
        }
        
        // Use new API endpoint for multiple tags search
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs-by-tags", requestData)
        .then(async ({ data }) => {
            let formatedData = await filterPaginationData({
                state: blogs,
                data: data.blogs,
                page,
                countRoute: "/search-blogs-by-tags-count",
                data_to_send: { tags }
            });

            setBlogs(formatedData);
        })
        .catch(err => {
            console.log(err);
        });
    }

    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
        .then(({ data }) => {
            setTrendingBlogs(data.blogs);
        })
        .catch(err => {
            console.log(err);
        });
    }

    const fetchAllTags = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/all-tags")
        .then(({ data }) => {
            setAllTags(data.tags.map(item => item.tag));
        })
        .catch(err => {
            console.log(err);
        });
    }

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();

        setBlogs(null);
        setSelectedTags([]);

        if (pageState == category) {
            setPageState("home");
            return;
        }

        setPageState(category);
    }

    const handleTagToggleDesktop = (tag) => {
        setSelectedTags(prev => {
            const newTags = prev.includes(tag) 
                ? prev.filter(t => t !== tag)
                : [...prev, tag];
            
            // Auto apply filters when tags change
            if (newTags.length > 0) {
                setPageState("filtered");
                setBlogs(null);
            } else {
                setPageState("home");
                setBlogs(null);
            }
            
            return newTags;
        });
    };

    const handleApplyFilters = (tags) => {
        if (allTags.length === 0) {
            fetchAllTags();
        }

        if (tags.length === 0) {
            setSelectedTags([]);
            setPageState("home");
            setBlogs(null);
            return;
        }

        // Set state and trigger fetch
        setSelectedTags(tags);
        setBlogs(null);
        setPageState("filtered");
        
        // Immediately fetch with the new tags to avoid race conditions
        fetchBlogsByMultipleTags({ page: 1, tags });
    };

    const handleFilterChange = ({ sortBy: newSortBy, dateRange: newDateRange }) => {
        setSortBy(newSortBy);
        setDateRange(newDateRange);
        setBlogs(null); // Trigger refetch
    };

    useEffect(() => {
        // Fetch tags on initial load
        if (allTags.length === 0) {
            fetchAllTags();
        }

        if (pageState == "home") {
            fetchLatestBlogs({ page: 1 });
        } else if (pageState == "filtered" && selectedTags.length > 0) {
            fetchBlogsByMultipleTags({ page: 1, tags: selectedTags });
        } else if (pageState != "home" && pageState != "filtered") {
            fetchBlogsByCategory({ page: 1 });
        }

        if (!trendingBlogs) {
            fetchTrendingBlogs();
        }

    }, [pageState, selectedTags, sortBy, dateRange]);

    return (
        <PageWrapper categories={allTags} onApplyFilters={handleApplyFilters}>
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-6 md:gap-10">
                {/* latest blogs */}
                <div className="w-full">

                    {/* Blog Filter Component */}
                    <BlogFilter onFilterChange={handleFilterChange} />

                    {/* Trending Section - Only on Mobile */}
                    <div className="md:hidden mb-8">
                        <h1 className="font-medium text-lg mb-4 flex items-center gap-2">
                            <i className="fi fi-rr-arrow-trend-up"></i>
                            Trending Now
                        </h1>
                        <div className="space-y-4">
                            {
                                trendingBlogs == null ? <Loader /> :
                                    (
                                        trendingBlogs.length ?
                                            trendingBlogs.slice(0, 3).map((blog, i) => {
                                                return (
                                                    <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                        <MinimalBlogPost blog={blog} index={i} />
                                                    </AnimationWrapper>
                                                );
                                            })
                                            :
                                            <NoDataMessage message="No trending blogs" />
                                    )
                            }
                        </div>
                        <hr className="border-grey my-6" />
                    </div>

                    {/* Active Filters Display */}
                    {selectedTags.length > 0 && (
                        <div className="mb-6 p-4 bg-grey/50 rounded-lg">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium">Filtering by:</span>
                                    {selectedTags.map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-black text-white text-sm rounded-full capitalize">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedTags([]);
                                        setPageState("home");
                                        setBlogs(null);
                                    }}
                                    className="text-sm text-dark-grey hover:text-black"
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>
                    )}

                    {
                        blogs == null ? (
                            <Loader />
                        ) :
                            (
                                blogs.results.length ?
                                    blogs.results.map((blog, i) => {
                                        return (
                                            <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                <BlogPostCard content={blog} author={blog.author.personal_info} />
                                            </AnimationWrapper>
                                        );
                                    })
                                    :
                                    <NoDataMessage message="No blogs published" />
                            )
                    }

                    <LoadMoreDataBtn state={blogs} fetchDataFun={
                        pageState == "home" ? fetchLatestBlogs : 
                        pageState == "filtered" ? (params) => fetchBlogsByMultipleTags({ ...params, tags: selectedTags }) : 
                        fetchBlogsByCategory
                    } />

                </div>

                {/* filters and trending blogs */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-4 md:pl-8 pt-3 max-md:hidden">

                    <div className="flex flex-col gap-6 md:gap-10">

                        <div>
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <h1 className="font-medium text-lg md:text-xl">
                                    Filter by Topics
                                    {selectedTags.length > 0 && blogs && (
                                        <span className="ml-2 text-sm text-dark-grey font-normal">
                                            ({blogs.results?.length || 0} results)
                                        </span>
                                    )}
                                </h1>
                                {selectedTags.length > 0 && (
                                    <button 
                                        onClick={() => {
                                            setSelectedTags([]);
                                            setPageState("home");
                                            setBlogs(null);
                                        }}
                                        className="text-sm text-dark-grey hover:text-black"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {allTags.length === 0 ? (
                                <Loader />
                            ) : (
                                <div className="flex gap-2 md:gap-3 flex-wrap">
                                    {
                                        allTags.map((tag, i) => {
                                            const isSelected = selectedTags.includes(tag);
                                            return (
                                                <button 
                                                    key={i} 
                                                    onClick={() => handleTagToggleDesktop(tag)} 
                                                    className={`tag text-sm md:text-base transition-all ${
                                                        isSelected 
                                                            ? "bg-black text-white" 
                                                            : "bg-grey hover:bg-grey/80"
                                                    }`}
                                                >
                                                    + {tag}
                                                    {isSelected && <i className="fi fi-rr-check ml-2"></i>}
                                                </button>
                                            );
                                        })
                                    }
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="font-medium text-lg md:text-xl mb-6 md:mb-8">Trending <i className="fi fi-rr-arrow-trend-up"></i></h1>

                            {
                                trendingBlogs == null ? <Loader /> :
                                    (
                                        trendingBlogs.length ?
                                            trendingBlogs.map((blog, i) => {
                                                return (
                                                    <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                        <MinimalBlogPost blog={blog} index={i} />
                                                    </AnimationWrapper>
                                                );
                                            })
                                            :
                                            <NoDataMessage message="No trending blogs" />
                                    )
                            }

                        </div>

                    </div>

                </div>

            </section>
        </AnimationWrapper>
        </PageWrapper>
    )
}

export default HomePage;

