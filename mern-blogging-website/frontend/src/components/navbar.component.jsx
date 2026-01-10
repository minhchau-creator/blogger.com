import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../imgs/logo.png";
import { UserContext, NotificationRefreshContext, MobileSidebarContext } from "../App";
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";

const Navbar = () => {

    const [searchBoxVisibility, setSearchBoxVisibility] = useState(false);
    const [userNavPanel, setUserNavPanel] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    const { userAuth, userAuth: { access_token, profile_img } } = useContext(UserContext);
    const { notificationRefreshTrigger } = useContext(NotificationRefreshContext);
    const { setMobileSidebarOpen } = useContext(MobileSidebarContext);

    const navigate = useNavigate();
    const location = useLocation();

    // Ẩn thanh tìm kiếm ở trang signin/signup
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;

        if(e.keyCode == 13 && query.length){
            navigate(`/search/${query}`);
        }
    }

    const handleMouseEnter = () => {
        setUserNavPanel(true);
    }

    const handleMouseLeave = () => {
        setUserNavPanel(false);
    }

    const fetchNotificationCount = () => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/unread-notification-count", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data: { count } }) => {
                setNotificationCount(count);
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    useEffect(() => {
        fetchNotificationCount();

        // Poll for new notifications every 5 seconds
        const interval = setInterval(fetchNotificationCount, 3500);

        return () => clearInterval(interval);
    }, [access_token, notificationRefreshTrigger]);

    return (
        <>
        <nav className="navbar z-50 sticky top-0">

            {/* Hamburger Menu - Only on mobile when not on auth pages */}
            {!isAuthPage && (
                <button 
                    className="md:hidden w-10 h-10 rounded-full bg-grey hover:bg-grey/80 flex items-center justify-center flex-shrink-0"
                    onClick={() => setMobileSidebarOpen(true)}
                >
                    <i className="fi fi-rr-menu-burger text-xl"></i>
                </button>
            )}

            <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <img src={logo} className="w-8 sm:w-10 flex-shrink-0" />
                <span className="font-bold text-lg sm:text-xl md:text-2xl whitespace-nowrap">Blogger.com</span>
            </Link>

            {/* Ẩn thanh tìm kiếm nếu đang ở trang signin/signup */}
            {!isAuthPage && (
                <>
                    {/* Search box cho desktop */}
                    <div className="hidden md:block relative w-full max-w-[600px] mx-6">
                        <input 
                            type="text"
                            placeholder="Search"
                            className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey text-base"
                            onKeyDown={handleSearch}
                        />
                        <i className="fi fi-rr-search absolute left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey pointer-events-none"></i>
                    </div>

                    {/* Search toggle button cho mobile */}
                    <button 
                        className="md:hidden bg-grey w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
                    >
                        <i className="fi fi-rr-search text-lg"></i>
                    </button>

                    {/* Search dropdown cho mobile */}
                    <div className={"absolute md:hidden bg-white w-full left-0 top-full mt-0.5 border-b border-grey py-3 px-[4vw] transition-all " + (searchBoxVisibility ? "show" : "hide") }>
                        <input 
                            type="text"
                            placeholder="Search"
                            className="w-full bg-grey p-3 pl-10 pr-10 rounded-full placeholder:text-dark-grey text-sm"
                            onKeyDown={handleSearch}
                        />
                        <i className="fi fi-rr-search absolute left-[7vw] top-1/2 -translate-y-1/2 text-lg text-dark-grey"></i>
                    </div>
                </>
            )}

            <div className={"flex items-center gap-2 sm:gap-3 md:gap-6 ml-auto"}>
                {!isAuthPage && (
                    <Link to="/editor" className="hidden md:flex gap-2 link">
                        <i className="fi fi-rr-file-edit"></i>
                        <p>Write</p>
                    </Link>
                )}

                {
                    access_token ?
                    <>
                        <Link to="/dashboard/notifications">
                            <button className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-grey relative hover:bg-black/10">
                                <i className="fi fi-rr-bell text-xl sm:text-2xl block mt-1"></i>
                                {
                                    notificationCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red text-white text-xs font-semibold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-[10px] sm:text-xs">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )
                                }
                            </button>
                        </Link>

                        <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                            <button className="w-10 h-10 sm:w-12 sm:h-12 mt-1" onClick={handleUserNavPanel}>
                                <img src={profile_img} className="w-full h-full object-cover rounded-full" />
                            </button>

                            {
                                userNavPanel ? <UserNavigationPanel /> : ""
                            }

                        </div>
                    </>
                    :
                    <>
                        <Link className="btn-dark py-2" to="/signin">
                            Sign In
                        </Link>

                        <Link className="btn-light py-2" to="/signup">
                            Sign Up
                        </Link>
                    </>
                }

            </div>

        </nav>

        <Outlet />
        </>
    )
}

export default Navbar;
