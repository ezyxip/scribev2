'use client'

import { useState, useMemo } from 'react';
import { 
  Slide, 
  Paper, 
  InputBase, 
  IconButton, 
  Box, 
  styled,
  alpha 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Cell } from "@/utils/cell-ui";
import { useCellTypes } from "@/wrappers/cell-types-wrapper";

export type EditorBottomPanelProps = {
    isVisible: boolean,
    addCell: (cell: Cell, type: string) => void
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ScrollContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  gap: '8px',
  padding: '4px',
  scrollbarWidth: 'thin',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
});

const CellTypeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  minWidth: '100px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
}));

export const EditorBottomPanel = (props: EditorBottomPanelProps) => {
    const types = useCellTypes();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredTypes = useMemo(() => {
      if (!searchQuery) return types;
      return types.filter(cell => 
        cell.id.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [types, searchQuery]);

    return (
      <Slide direction="up" in={props.isVisible} mountOnEnter unmountOnExit>
        <StyledPaper elevation={4}>
          {searchOpen ? (
            <SearchContainer>
              <InputBase
                placeholder="Search cell types..."
                autoFocus
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ ml: 1, flex: 1 }}
              />
              <IconButton onClick={() => {
                setSearchQuery('');
                setSearchOpen(false);
              }}>
                <CloseIcon />
              </IconButton>
            </SearchContainer>
          ) : (
            <Box display="flex" justifyContent="flex-end">
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            </Box>
          )}
          
          <ScrollContainer>
            {filteredTypes.map((cell) => (
              <CellTypeCard 
                key={cell.id}
                elevation={2}
                onClick={() => props.addCell(cell, cell.id)}
              >
                {cell.id}
              </CellTypeCard>
            ))}
          </ScrollContainer>
        </StyledPaper>
      </Slide>
    );
};