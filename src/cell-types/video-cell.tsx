import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Stack,
  Slider,
  CircularProgress,
  Dialog,
  DialogContent,
  Chip
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Videocam as VideoIcon,
  Upload as UploadIcon,
  Fullscreen as FullscreenIcon
} from '@mui/icons-material';
import { Cell, CellProps } from '@/utils/cell-ui';
import { supabase } from '@/utils/supabase-client';

// Типы для видеофайлов
interface VideoItem {
  url: string;
  name: string;
  duration?: number;
  thumbnail?: string;
}

// Состояние ячейки
interface VideoCellState {
  videos: VideoItem[];
  isLoading: boolean;
  currentVideoIndex?: number;
  isPlaying: boolean;
  progress: number;
  isFullscreen: boolean;
}

const VideoCellEditor = (props: CellProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localState, setLocalState] = useState({
    isPlaying: false,
    progress: 0
  });

  // Синхронизация состояния видео
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setLocalState(prev => ({
        ...prev,
        progress: (video.currentTime / video.duration) * 100 || 0
      }));
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleVideoEnd);
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    props.changeState({ ...props.state, isLoading: true });

    try {
      const newVideos = await Promise.all(
        files.map(async (file): Promise<VideoItem> => {
          // Проверка типа файла
          if (!file.type.startsWith('video/')) {
            throw new Error('Неверный формат файла');
          }

          const fileExt = file.name.split('.').pop();
          const fileName = `video_${Date.now()}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('videos')
            .upload(fileName, file);
          
          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('videos')
            .getPublicUrl(fileName);

          // Генерируем превью и длительность
          const { duration, thumbnail } = await getVideoMetadata(file);

          return {
            url: publicUrl,
            name: file.name,
            duration,
            thumbnail
          };
        })
      );

      props.changeState({
        ...props.state,
        videos: [...props.state.videos, ...newVideos],
        isLoading: false
      });
    } catch (error) {
      console.error('Upload error:', error);
      props.changeState({ ...props.state, isLoading: false });
    }
  };

  const getVideoMetadata = (file: File): Promise<{ duration: number; thumbnail: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = () => {
        // Создаем превью
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext('2d')!;
        
        // Устанавливаем время для превью (секунда 1)
        video.currentTime = 1;
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg');
          
          resolve({
            duration: video.duration,
            thumbnail
          });
          
          URL.revokeObjectURL(video.src);
        };
      };
    });
  };

  const handleDeleteVideo = async (index: number) => {
    const videoToDelete = props.state.videos[index];
    const fileName = videoToDelete.url.split('/').pop();

    try {
      props.changeState({ ...props.state, isLoading: true });
      
      await supabase.storage
        .from('videos')
        .remove([fileName || '']);

      const updatedVideos = [...props.state.videos];
      updatedVideos.splice(index, 1);

      props.changeState({
        ...props.state,
        videos: updatedVideos,
        currentVideoIndex: undefined,
        isPlaying: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Delete error:', error);
      props.changeState({ ...props.state, isLoading: false });
    }
  };

  const togglePlay = (index: number) => {
    const video = videoRef.current;
    if (!video) return;

    const isSameVideo = props.state.currentVideoIndex === index;

    if (isSameVideo && props.state.isPlaying) {
      video.pause();
      props.changeState({ ...props.state, isPlaying: false });
    } else {
      video.src = props.state.videos[index].url;
      video.currentTime = (props.state.progress / 100) * video.duration || 0;
      video.play();
      props.changeState({ 
        ...props.state, 
        currentVideoIndex: index,
        isPlaying: true 
      });
    }
  };

  const handleVideoEnd = () => {
    props.changeState({ ...props.state, isPlaying: false, progress: 0 });
  };

  const handleProgressChange = (_: Event, value: number | number[]) => {
    const progress = Array.isArray(value) ? value[0] : value;
    props.changeState({ ...props.state, progress });

    const video = videoRef.current;
    if (video && props.state.currentVideoIndex !== undefined) {
      video.currentTime = (progress / 100) * video.duration;
    }
  };

  const toggleFullscreen = () => {
    props.changeState({ 
      ...props.state, 
      isFullscreen: !props.state.isFullscreen 
    });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Скрытый video элемент для управления воспроизведением */}
      <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        playsInline
      />

      {props.state.isLoading ? (
        <Box display="flex" justifyContent="center" p={2}>
          <CircularProgress />
        </Box>
      ) : props.state.videos.length > 0 ? (
        <Stack spacing={2}>
          {props.state.videos.map((video: { url: string; name: string; duration: number; thumbnail: string }, index: number) => (
            <Box key={video.url} sx={{ 
              p: 2, 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              position: 'relative'
            }}>
              {/* Превью видео */}
              <Box
                sx={{
                  position: 'relative',
                  backgroundColor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '16/9',
                  mb: 1
                }}
                onClick={() => togglePlay(index)}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt="Превью"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: props.state.currentVideoIndex === index && props.state.isPlaying ? 0 : 1,
                      transition: 'opacity 0.3s'
                    }}
                  />
                )}
                
                {props.state.currentVideoIndex === index && props.state.isPlaying && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <IconButton color="primary" size="large">
                      <PauseIcon fontSize="large" />
                    </IconButton>
                  </Box>
                )}

                {!(props.state.currentVideoIndex === index && props.state.isPlaying) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconButton color="primary" size="large">
                      <PlayIcon fontSize="large" />
                    </IconButton>
                  </Box>
                )}

                <Chip
                  label={formatTime(video.duration)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white'
                  }}
                />
              </Box>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontWeight: 500 }}>
                    {video.name}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => toggleFullscreen()}
                  size="small"
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => handleDeleteVideo(index)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>

              {props.state.currentVideoIndex === index && (
                <Box sx={{ mt: 1 }}>
                  <Slider
                    value={props.state.progress}
                    onChange={handleProgressChange}
                    size="small"
                  />
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      ) : (
        <Typography color="textSecondary" align="center" sx={{ py: 2 }}>
          Видео не добавлены
        </Typography>
      )}

      <Button
        component="label"
        variant="outlined"
        startIcon={<UploadIcon />}
        fullWidth
        sx={{ mt: 2 }}
      >
        Загрузить видео
        <input
          type="file"
          hidden
          accept="video/*"
          onChange={handleVideoUpload}
          multiple
        />
      </Button>

      {/* Полноэкранный режим */}
      <Dialog
        open={props.state.isFullscreen}
        onClose={toggleFullscreen}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            overflow: 'hidden',
            height: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
          {props.state.currentVideoIndex !== undefined && (
            <video
              src={props.state.videos[props.state.currentVideoIndex].url}
              controls
              autoPlay
              style={{
                width: '100%',
                maxHeight: '100%',
                outline: 'none'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const VideoCellViewer = (props: CellProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [localState, setLocalState] = useState({
    isPlaying: false,
    progress: 0,
    currentVideoIndex: undefined as number | undefined,
    isFullscreen: false
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setLocalState(prev => ({
        ...prev,
        progress: (video.currentTime / video.duration) * 100 || 0
      }));
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', handleVideoEnd);
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, []);

  const togglePlay = (index: number) => {
    const video = videoRef.current;
    if (!video) return;

    const isSameVideo = localState.currentVideoIndex === index;

    if (isSameVideo && localState.isPlaying) {
      video.pause();
      setLocalState(prev => ({ ...prev, isPlaying: false }));
    } else {
      video.src = props.state.videos[index].url;
      video.currentTime = (localState.progress / 100) * video.duration || 0;
      video.play();
      setLocalState({ 
        currentVideoIndex: index,
        isPlaying: true,
        progress: localState.progress,
        isFullscreen: true
      });
    }
  };

  const toggleFullscreen = () => {
    setLocalState(prev => ({ 
      ...prev, 
      isFullscreen: !prev.isFullscreen 
    }));
  };

  const handleVideoEnd = () => {
    setLocalState(prev => ({ ...prev, isPlaying: false, progress: 0 }));
  };

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Box sx={{ width: '100%' }}>
      <video 
        ref={videoRef} 
        style={{ display: 'none' }} 
        playsInline
      />

      {props.state.videos.length > 0 ? (
        <Stack spacing={1}>
          {props.state.videos.map((video: { url: string; name: string; duration: number; thumbnail: string }, index: number) => (
            <Box key={video.url} sx={{ 
              p: 1, 
              border: '1px solid', 
              borderColor: 'divider',
              borderRadius: 1,
              position: 'relative'
            }}>
              {/* Превью видео */}
              <Box
                sx={{
                  position: 'relative',
                  backgroundColor: 'black',
                  borderRadius: 1,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '16/9',
                  mb: 1
                }}
                onClick={() => togglePlay(index)}
              >
                {video.thumbnail && (
                  <img
                    src={video.thumbnail}
                    alt="Превью"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: localState.currentVideoIndex === index && localState.isPlaying ? 0 : 1,
                      transition: 'opacity 0.3s'
                    }}
                  />
                )}
                
                {localState.currentVideoIndex === index && localState.isPlaying && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.5)'
                    }}
                  >
                    <IconButton color="primary" size="medium">
                      <PauseIcon fontSize="medium" />
                    </IconButton>
                  </Box>
                )}

                {!(localState.currentVideoIndex === index && localState.isPlaying) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconButton color="primary" size="medium">
                      <PlayIcon fontSize="medium" />
                    </IconButton>
                  </Box>
                )}

                <Chip
                  label={formatTime(video.duration)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white'
                  }}
                />
              </Box>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography noWrap variant="body2">
                    {video.name}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() => toggleFullscreen()}
                  size="small"
                >
                  <FullscreenIcon fontSize="small" />
                </IconButton>
              </Stack>

              {localState.currentVideoIndex === index && (
                <Box sx={{ mt: 1 }}>
                  <Slider
                    value={localState.progress}
                    size="small"
                    sx={{ cursor: 'default', pointerEvents: 'none' }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1 }}>
          <VideoIcon color="disabled" fontSize="small" />
          <Typography variant="body2" color="textSecondary">
            Видео не добавлено
          </Typography>
        </Stack>
      )}

      {/* Полноэкранный режим */}
      <Dialog
        open={localState.isFullscreen}
        onClose={toggleFullscreen}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            overflow: 'hidden',
            height: '90vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', alignItems: 'center', height: '100%' }}>
          {localState.currentVideoIndex !== undefined && (
            <video
              src={props.state.videos[localState.currentVideoIndex].url}
              controls
              autoPlay
              style={{
                width: '100%',
                maxHeight: '100%',
                outline: 'none'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export const VideoCell: Cell = {
  id: "video-cell",
  RenderInEditor: VideoCellEditor,
  RenderInViewer: VideoCellViewer,
  TopPanelFilling: () => null,
  state: {
    videos: [],
    isLoading: false,
    isPlaying: false,
    progress: 0,
    isFullscreen: false
  }
};