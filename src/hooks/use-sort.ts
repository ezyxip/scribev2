import { useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import { SortOption, SortOrder } from "@/app/profile/page";

export const useSort = () => {
    const [sortBy, setSortBy] = useState<SortOption>("lastActiveAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [mobileSortAnchor, setMobileSortAnchor] = useState<null | HTMLElement>(null);

    const handleSortChange = (e: SelectChangeEvent<SortOption>) => {
        setSortBy(e.target.value as SortOption);
    };

    const handleOrderChange = (e: SelectChangeEvent<SortOrder>) => {
        setSortOrder(e.target.value as SortOrder);
    };

    const handleMobileSortOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
        setMobileSortAnchor(event.currentTarget);
    };

    const handleMobileSortClose = () => {
        setMobileSortAnchor(null);
    };

    const handleMobileSortSelect = (option: SortOption) => {
        setSortBy(option);
        handleMobileSortClose();
    };

    const handleMobileOrderToggle = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    };

    return {
        sortBy,
        sortOrder,
        mobileSortAnchor,
        handleSortChange,
        handleOrderChange,
        handleMobileSortOpen,
        handleMobileSortClose,
        handleMobileSortSelect,
        handleMobileOrderToggle,
    };
};