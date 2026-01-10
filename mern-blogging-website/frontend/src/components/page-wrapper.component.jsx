import { useContext } from "react";
import MobileSidebar from "./mobile-sidebar.component";
import { MobileSidebarContext } from "../App";

const PageWrapper = ({ children, categories = [], onApplyFilters = () => {} }) => {
    const { mobileSidebarOpen, setMobileSidebarOpen } = useContext(MobileSidebarContext);

    return (
        <>
            <MobileSidebar 
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
                categories={categories}
                onApplyFilters={onApplyFilters}
            />
            {children}
        </>
    );
};

export default PageWrapper;
