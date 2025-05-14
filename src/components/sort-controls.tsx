import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    SelectChangeEvent,
    Chip,
    useTheme,
} from "@mui/material";
import { Sort, ArrowDownward, ArrowUpward } from "@mui/icons-material";
import { SortOption } from "@/app/profile/page";

type SortControlsProps = {
    isMobile: boolean;
    sortBy: SortOption;
    sortOrder: "asc" | "desc";
    mobileSortAnchor: HTMLElement | null;
    handleSortChange: (e: SelectChangeEvent<SortOption>) => void;
    handleOrderChange: (e: SelectChangeEvent<"asc" | "desc">) => void;
    handleMobileSortOpen: (event: React.MouseEvent<HTMLButtonElement>) => void;
    handleMobileSortClose: () => void;
    handleMobileOrderToggle: () => void;
    handleMobileSortSelect: (option: SortOption) => void;
};

export const SortControls = ({
    isMobile,
    sortBy,
    sortOrder,
    mobileSortAnchor,
    handleSortChange,
    handleOrderChange,
    handleMobileSortOpen,
    handleMobileSortClose,
    handleMobileOrderToggle,
    handleMobileSortSelect,
}: SortControlsProps) => {
    const theme = useTheme();

    // Лейблы для отображения выбранной сортировки
    const sortLabels: Record<SortOption, string> = {
        createdAt: "Дате создания",
        lastActiveAt: "Последней активности",
        title: "Алфавиту",
    };

    return isMobile ? (
        <>
            <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                {/* Кнопка выбора типа сортировки (мобильная) */}
                <Button
                    variant="outlined"
                    startIcon={<Sort />}
                    onClick={handleMobileSortOpen}
                    fullWidth
                >
                    {sortLabels[sortBy]}
                </Button>

                {/* Кнопка переключения порядка (мобильная) */}
                <IconButton
                    onClick={handleMobileOrderToggle}
                    color="primary"
                    sx={{ border: 1, borderColor: "divider" }}
                >
                    {sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
            </Box>

            {/* Мобильное меню сортировки */}
            <Menu
                anchorEl={mobileSortAnchor}
                open={Boolean(mobileSortAnchor)}
                onClose={handleMobileSortClose}
            >
                {Object.entries(sortLabels).map(([key, label]) => (
                    <MenuItem
                        key={key}
                        onClick={() => handleMobileSortSelect(key as SortOption)}
                    >
                        {label}
                        {sortBy === key && (
                            <Chip label="активно" size="small" sx={{ ml: 1 }} />
                        )}
                    </MenuItem>
                ))}
            </Menu>
        </>
    ) : (
        // Десктопная версия
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Селектор типа сортировки */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Сортировать по</InputLabel>
                <Select
                    value={sortBy}
                    onChange={handleSortChange}
                    label="Сортировать по"
                    startAdornment={
                        <Sort fontSize="small" sx={{ mr: 1 }} />
                    }
                >
                    <MenuItem value="createdAt">
                        {sortLabels.createdAt}
                    </MenuItem>
                    <MenuItem value="lastActiveAt">
                        {sortLabels.lastActiveAt}
                    </MenuItem>
                    <MenuItem value="title">{sortLabels.title}</MenuItem>
                </Select>
            </FormControl>

            {/* Селектор порядка сортировки */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Порядок</InputLabel>
                <Select
                    value={sortOrder}
                    onChange={handleOrderChange}
                    label="Порядок"
                >
                    <MenuItem value="asc">По возрастанию</MenuItem>
                    <MenuItem value="desc">По убыванию</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
};