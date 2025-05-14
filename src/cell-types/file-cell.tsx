import { Cell, CellProps } from "@/utils/cell-ui";
import { 
  Box,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Paper,
  Stack,
  Avatar
} from "@mui/material";
import { Upload as UploadIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { supabase } from "@/utils/supabase-client";

interface FileCellState {
  url: string | null;
  name: string;
  isLoading: boolean;
}

const FileCellEditor = (props: CellProps) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    props.changeState({ ...props.state, isLoading: true });

    try {
      // Генерируем уникальное имя файла
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Загружаем файл в Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('files') // Ваш бакет в Supabase
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Получаем публичный URL
      const { data: { publicUrl } } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);

      props.changeState({ 
        url: publicUrl,
        name: file.name,
        isLoading: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      props.changeState({ ...props.state, isLoading: false });
    }
  };

  const handleDelete = async () => {
    if (!props.state.url) return;

    try {
      props.changeState({ ...props.state, isLoading: true });
      
      // Извлекаем путь к файлу из URL
      const filePath = props.state.url.split('/').pop();
      
      // Удаляем файл из Supabase Storage
      const { error } = await supabase.storage
        .from('files')
        .remove([filePath]);

      if (error) throw error;

      props.changeState({ 
        url: null,
        name: '',
        isLoading: false
      });
    } catch (error) {
      console.error('Delete error:', error);
      props.changeState({ ...props.state, isLoading: false });
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {props.state.isLoading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : props.state.url ? (
        <Paper elevation={0} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2 }}>
            <UploadIcon />
          </Avatar>
          <Box flexGrow={1}>
            <Typography noWrap>{props.state.name}</Typography>
            <Typography variant="caption" color="textSecondary">
              {props.state.url}
            </Typography>
          </Box>
          <IconButton onClick={handleDelete} color="error">
            <DeleteIcon />
          </IconButton>
        </Paper>
      ) : (
        <Button
          component="label"
          variant="outlined"
          startIcon={<UploadIcon />}
          fullWidth
        >
          Загрузить файл
          <input
            type="file"
            hidden
            onChange={handleFileUpload}
          />
        </Button>
      )}
    </Box>
  );
};

const FileCellViewer = (props: CellProps) => {
  if (!props.state.url) {
    return (
      <Typography color="textSecondary">Файл не загружен</Typography>
    );
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar>
        <UploadIcon />
      </Avatar>
      <Box>
        <Typography>{props.state.name}</Typography>
        <Button 
          variant="text" 
          size="small"
          onClick={() => window.open(props.state.url!, '_blank')}
        >
          Скачать
        </Button>
      </Box>
    </Stack>
  );
};

export const FileCell: Cell = {
  id: "file-cell",
  RenderInEditor: FileCellEditor,
  RenderInViewer: FileCellViewer,
  TopPanelFilling: () => null,
  state: {
    url: null,
    name: '',
    isLoading: false
  }
};