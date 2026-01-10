import { useState } from "react";

const InPageNavigation = ({ routes, defaultActiveIndex = 0, children }) => {

    const [activeTab, setActiveTab] = useState(defaultActiveIndex);

    return (
        <>
            <div className="relative mb-6 sm:mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
                {
                    routes.map((route, i) => {
                        return (
                            <button 
                                key={i} 
                                className={"p-3 px-4 sm:p-4 sm:px-5 capitalize text-sm sm:text-base whitespace-nowrap " + (activeTab == i ? "text-black border-b-2 border-black" : "text-dark-grey")}
                                onClick={() => setActiveTab(i)}
                            >
                                {route}
                            </button>
                        )
                    })
                }
            </div>

            {Array.isArray(children) ? children[activeTab] : children}
        </>
    )
}

export default InPageNavigation;
