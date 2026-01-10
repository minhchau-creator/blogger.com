import { useState } from "react";

const BlogFilter = ({ onFilterChange }) => {
    const [sortBy, setSortBy] = useState("latest");
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [showDatePicker, setShowDatePicker] = useState(false);

    const handleSortChange = (value) => {
        setSortBy(value);
        onFilterChange({ sortBy: value, dateRange });
    };

    const handleDateChange = (field, value) => {
        const newDateRange = { ...dateRange, [field]: value };
        setDateRange(newDateRange);
        
        // Only apply if both dates are set
        if (newDateRange.from && newDateRange.to) {
            onFilterChange({ sortBy, dateRange: newDateRange });
        }
    };

    const clearDateRange = () => {
        setDateRange({ from: "", to: "" });
        setShowDatePicker(false);
        onFilterChange({ sortBy, dateRange: { from: "", to: "" } });
    };

    return (
        <div className="mb-6 border-b border-grey pb-6">
            <h1 className="font-medium text-xl md:text-2xl mb-4">Explore Blogs</h1>
            
            <div className="flex flex-col gap-4">
                {/* Sort Options */}
                <div>
                    <p className="text-dark-grey text-sm mb-2">Sort by:</p>
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => handleSortChange("latest")}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                sortBy === "latest"
                                    ? "bg-black text-white"
                                    : "bg-grey hover:bg-grey/80"
                            }`}
                        >
                            <i className="fi fi-rr-clock mr-2"></i>
                            Latest
                        </button>
                        <button
                            onClick={() => handleSortChange("likes")}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                sortBy === "likes"
                                    ? "bg-black text-white"
                                    : "bg-grey hover:bg-grey/80"
                            }`}
                        >
                            <i className="fi fi-rr-heart mr-2"></i>
                            Most Liked
                        </button>
                        <button
                            onClick={() => handleSortChange("comments")}
                            className={`px-4 py-2 rounded-full text-sm transition-all ${
                                sortBy === "comments"
                                    ? "bg-black text-white"
                                    : "bg-grey hover:bg-grey/80"
                            }`}
                        >
                            <i className="fi fi-rr-comment-dots mr-2"></i>
                            Most Commented
                        </button>
                    </div>
                </div>

                {/* Date Range Filter */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-dark-grey text-sm">Filter by date:</p>
                        {(dateRange.from || dateRange.to) && (
                            <button
                                onClick={clearDateRange}
                                className="text-xs text-dark-grey hover:text-black"
                            >
                                Clear dates
                            </button>
                        )}
                    </div>
                    
                    <button
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full px-4 py-2 bg-grey hover:bg-grey/80 rounded-lg text-sm text-left flex items-center justify-between transition-all"
                    >
                        <span>
                            {dateRange.from && dateRange.to
                                ? `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                                : "Select date range"}
                        </span>
                        <i className={`fi fi-rr-calendar transition-transform ${showDatePicker ? "rotate-180" : ""}`}></i>
                    </button>

                    {showDatePicker && (
                        <div className="mt-2 p-4 bg-grey/50 rounded-lg space-y-3">
                            <div>
                                <label className="text-xs text-dark-grey mb-1 block">From:</label>
                                <input
                                    type="date"
                                    value={dateRange.from}
                                    onChange={(e) => handleDateChange("from", e.target.value)}
                                    max={dateRange.to || new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 bg-white border border-grey rounded-lg text-sm focus:border-black"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-dark-grey mb-1 block">To:</label>
                                <input
                                    type="date"
                                    value={dateRange.to}
                                    onChange={(e) => handleDateChange("to", e.target.value)}
                                    min={dateRange.from}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-3 py-2 bg-white border border-grey rounded-lg text-sm focus:border-black"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogFilter;
