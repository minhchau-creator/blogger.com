import { useContext, useState, useEffect, useRef } from "react";
import { EditorContext } from "../pages/editor.pages";
import axios from "axios";
import { toast } from "react-hot-toast";

const TagAutocomplete = ({ tagLimit = 10 }) => {
    const { blog, blog: { tags }, setBlog } = useContext(EditorContext);
    const [inputValue, setInputValue] = useState("");
    const [allTags, setAllTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Fetch all tags on mount
    useEffect(() => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/all-tags")
            .then(({ data }) => {
                setAllTags(data.tags || []);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);

    // Filter suggestions based on input
    useEffect(() => {
        if (inputValue.trim().length > 0) {
            const filtered = allTags
                .filter(item => 
                    item.tag.toLowerCase().includes(inputValue.toLowerCase()) &&
                    !tags.includes(item.tag)
                )
                .slice(0, 10); // Show max 10 suggestions
            
            setSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [inputValue, allTags, tags]);

    // Normalize tag
    const normalizeTag = (tag) => {
        return tag
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .slice(0, 20); // Max 20 chars
    };

    // Add tag
    const addTag = (tagToAdd) => {
        const normalizedTag = normalizeTag(tagToAdd);

        // Validation
        if (!normalizedTag.length) {
            return;
        }

        if (normalizedTag.length < 2) {
            toast.error("Tag must be at least 2 characters");
            return;
        }

        if (tags.length >= tagLimit) {
            toast.error(`You can add max ${tagLimit} tags`);
            return;
        }

        if (tags.includes(normalizedTag)) {
            toast.error("Tag already added");
            return;
        }

        // Add tag
        setBlog({ ...blog, tags: [...tags, normalizedTag] });
        setInputValue("");
        setShowSuggestions(false);
        setActiveSuggestionIndex(0);
        inputRef.current?.focus();
    };

    // Handle input change
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setActiveSuggestionIndex(0);
    };

    // Handle key down
    const handleKeyDown = (e) => {
        if (e.keyCode === 13) { // Enter
            e.preventDefault();
            
            if (showSuggestions && suggestions.length > 0) {
                // Add selected suggestion
                addTag(suggestions[activeSuggestionIndex].tag);
            } else if (inputValue.trim().length > 0) {
                // Add custom tag
                addTag(inputValue);
            }
        } else if (e.keyCode === 188) { // Comma
            e.preventDefault();
            if (inputValue.trim().length > 0) {
                addTag(inputValue);
            }
        } else if (e.keyCode === 40) { // Arrow Down
            e.preventDefault();
            if (showSuggestions && activeSuggestionIndex < suggestions.length - 1) {
                setActiveSuggestionIndex(activeSuggestionIndex + 1);
            }
        } else if (e.keyCode === 38) { // Arrow Up
            e.preventDefault();
            if (showSuggestions && activeSuggestionIndex > 0) {
                setActiveSuggestionIndex(activeSuggestionIndex - 1);
            }
        } else if (e.keyCode === 27) { // Escape
            setShowSuggestions(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (tag) => {
        addTag(tag);
    };

    // Remove tag
    const handleTagRemove = (tagToRemove) => {
        setBlog({ ...blog, tags: tags.filter(t => t !== tagToRemove) });
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(e.target) &&
                inputRef.current &&
                !inputRef.current.contains(e.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div>
            <p className="text-dark-grey mb-2 mt-9">
                Topics - ( Helps in searching and ranking your blog post )
            </p>

            <div className="relative input-box pl-2 py-2 pb-4">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type to search or add new tag (press Enter or comma)"
                        className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => inputValue.trim().length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
                    />

                    {/* Suggestions Dropdown */}
                    {showSuggestions && (
                        <div
                            ref={suggestionsRef}
                            className="absolute z-10 w-full bg-white border border-grey rounded-lg shadow-lg max-h-60 overflow-y-auto mt-1"
                        >
                            {suggestions.map((item, index) => (
                                <div
                                    key={index}
                                    className={`px-4 py-3 cursor-pointer hover:bg-grey/50 flex items-center justify-between ${
                                        index === activeSuggestionIndex ? 'bg-grey/30' : ''
                                    }`}
                                    onClick={() => handleSuggestionClick(item.tag)}
                                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                                >
                                    <div className="flex items-center gap-2">
                                        <i className="fi fi-rr-tag text-dark-grey text-sm"></i>
                                        <span className="capitalize">{item.tag}</span>
                                    </div>
                                    <span className="text-xs text-dark-grey bg-grey px-2 py-1 rounded-full">
                                        {item.count} {item.count === 1 ? 'blog' : 'blogs'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Tags */}
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                        <div
                            key={i}
                            className="relative group px-4 py-2 bg-grey rounded-full inline-flex items-center gap-2 hover:bg-grey/80 transition-all"
                        >
                            <span className="capitalize text-sm">{tag}</span>
                            <button
                                className="w-5 h-5 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
                                onClick={() => handleTagRemove(tag)}
                                type="button"
                            >
                                <i className="fi fi-br-cross text-xs"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between mt-1 mb-4">
                <p className="text-dark-grey text-sm">
                    <i className="fi fi-rr-info mr-1"></i>
                    Press Enter or comma to add. {tagLimit - tags.length} tags left
                </p>
                {tags.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setBlog({ ...blog, tags: [] })}
                        className="text-sm text-dark-grey hover:text-black"
                    >
                        Clear all
                    </button>
                )}
            </div>
        </div>
    );
};

export default TagAutocomplete;
