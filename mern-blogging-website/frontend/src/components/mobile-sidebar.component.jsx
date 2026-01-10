import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const MobileSidebar = ({ isOpen, onClose, categories, onApplyFilters }) => {
    
    const navigate = useNavigate();
    const [selectedTags, setSelectedTags] = useState([]);

    // Close sidebar when clicking outside
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Reset selected tags when sidebar opens
    useEffect(() => {
        if (isOpen) {
            setSelectedTags([]);
        }
    }, [isOpen]);

    const handleTagToggle = (tag) => {
        setSelectedTags(prev => {
            if (prev.includes(tag)) {
                return prev.filter(t => t !== tag);
            } else {
                return [...prev, tag];
            }
        });
    };

    const handleApplyFilters = () => {
        if (selectedTags.length > 0) {
            onApplyFilters(selectedTags);
        }
        onClose();
    };

    const handleWriteClick = () => {
        navigate('/editor');
        onClose();
    };

    return (
        <>
            {/* Backdrop/Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[280px] bg-white z-50 transition-transform duration-300 ease-in-out transform md:hidden overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-grey sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-grey flex items-center justify-center">
                        <i className="fi fi-rr-cross text-2xl"></i>
                    </button>
                </div>

                <div className="p-5">
                    
                    {/* Write Button */}
                    <button 
                        onClick={handleWriteClick}
                        className="w-full bg-black text-white rounded-lg py-3 px-4 flex items-center gap-3 mb-6 hover:bg-opacity-90"
                    >
                        <i className="fi fi-rr-file-edit text-xl"></i>
                        <span className="font-medium">Write a Blog</span>
                    </button>

                    {/* Categories Section */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <i className="fi fi-rr-apps text-xl"></i>
                            Filter by Topics
                            {selectedTags.length > 0 && (
                                <span className="text-sm bg-purple text-white px-2 py-1 rounded-full">
                                    {selectedTags.length}
                                </span>
                            )}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {categories && categories.map((category, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleTagToggle(category)}
                                    className={`px-4 py-2 rounded-full text-sm capitalize transition-all ${
                                        selectedTags.includes(category)
                                            ? 'bg-black text-white'
                                            : 'bg-grey hover:bg-grey/80'
                                    }`}
                                >
                                    {category}
                                    {selectedTags.includes(category) && (
                                        <i className="fi fi-rr-check ml-2"></i>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Apply Filters Button */}
                    {selectedTags.length > 0 && (
                        <button
                            onClick={handleApplyFilters}
                            className="w-full bg-purple text-white rounded-lg py-3 px-4 font-medium hover:bg-opacity-90 mb-4"
                        >
                            Apply Filters ({selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''})
                        </button>
                    )}

                    {/* Clear Filters Button */}
                    {selectedTags.length > 0 && (
                        <button
                            onClick={() => setSelectedTags([])}
                            className="w-full bg-grey text-dark-grey rounded-lg py-2 px-4 text-sm hover:bg-grey/80"
                        >
                            Clear All
                        </button>
                    )}

                </div>
            </div>
        </>
    );
};

export default MobileSidebar;
