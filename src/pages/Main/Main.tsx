import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Container,
  Typography,
  Stack,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Divider,
  Box,
  List,
  ListItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Chip,
  GlobalStyles,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
} from '@mui/material';
import {
  Star,
  Bolt,
  PersonAdd,
  School,
  Close as CloseIcon,
  Add as AddIcon,
  Sort as SortIcon,
  Settings as SettingsIcon,
  CloudDownload as BackupIcon,
  CloudUpload as RestoreIcon,
  DeleteForever as ClearIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import LsGigiService from '@/app/service/LsGigiService';
import { Class } from '@/types/class';
import { Student } from '@/types/student';
import { useAppDispatch, useAppSelector } from '@/app/store';
import { changeMode } from '@/features/user/userSlice';

const gigiService = new LsGigiService();

type SortOrder = 'none' | 'asc' | 'desc';

const Main = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.user.mode);
  
  const [classList, setClassList] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('none');

  const [isClassDialogOpen, setIsClassDialogOpen] = useState(false);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isDeleteClassDialogOpen, setIsDeleteClassDialogOpen] = useState(false);
  const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);
  const [restoreDataStr, setRestoreDataStr] = useState('');

  const classInputRef = useRef<HTMLInputElement>(null);
  const studentInputRef = useRef<HTMLInputElement>(null);
  const deleteClassInputRef = useRef<HTMLInputElement>(null);
  const deleteStudentInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadClasses = async () => {
    const list = await gigiService.getClassList();
    setClassList(list);
    if (list.length > 0) {
      if (!selectedClass || !list.find(c => c.id === selectedClass.id)) {
        setSelectedClass(list[0]);
      }
    } else {
      setSelectedClass(null);
    }
  };

  const loadStudents = async (classId: string) => {
    const list = await gigiService.getStudentListOf(classId);
    setStudents(list);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadStudents(selectedClass.id);
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Focus management
  useEffect(() => {
    if (isClassDialogOpen) {
      setTimeout(() => classInputRef.current?.focus(), 100);
    }
  }, [isClassDialogOpen]);

  useEffect(() => {
    if (isStudentDialogOpen) {
      setTimeout(() => studentInputRef.current?.focus(), 100);
    }
  }, [isStudentDialogOpen]);

  useEffect(() => {
    if (isDeleteClassDialogOpen) {
      setTimeout(() => deleteClassInputRef.current?.focus(), 100);
    }
  }, [isDeleteClassDialogOpen]);

  useEffect(() => {
    if (isDeleteStudentDialogOpen) {
      setTimeout(() => deleteStudentInputRef.current?.focus(), 100);
    }
  }, [isDeleteStudentDialogOpen]);

  const handleCreateClass = async () => {
    if (!newClassName) return;
    const newCls = await gigiService.createClass({
      name: newClassName,
      year: new Date().getFullYear(),
      semester: 1,
      maxMerit: 10,
      maxPenalty: 10,
    });
    setNewClassName('');
    setIsClassDialogOpen(false);
    await loadClasses();
    setSelectedClass(newCls);
  };

  const handleAddStudent = async () => {
    if (!selectedClass || !newStudentName) return;
    await gigiService.addStudentTo(selectedClass.id, {
      id: '', // Will be generated
      name: newStudentName,
      point: 0,
    });
    setNewStudentName('');
    setIsStudentDialogOpen(false);
    loadStudents(selectedClass.id);
  };

  const handleUpdatePoint = async (studentId: string, delta: number) => {
    if (!selectedClass) return;

    let targetStudent: Student | null = null;
    setStudents(prev => {
      const newList = [...prev];
      const index = newList.findIndex(s => s.id === studentId);
      if (index !== -1) {
        targetStudent = { ...newList[index], point: newList[index].point + delta };
        newList[index] = targetStudent;
      }
      return newList;
    });

    if (targetStudent) {
      await gigiService.updateStudentTo(selectedClass.id, targetStudent);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete || deleteConfirmName !== classToDelete.name) return;
    await gigiService.deleteClass(classToDelete.id);
    setDeleteConfirmName('');
    setClassToDelete(null);
    setIsDeleteClassDialogOpen(false);
    await loadClasses();
  };

  const handleDeleteStudent = async () => {
    if (!selectedClass || !studentToDelete || deleteConfirmName !== studentToDelete.name) return;
    await gigiService.deleteStudentFrom(selectedClass.id, studentToDelete.id);
    setDeleteConfirmName('');
    setStudentToDelete(null);
    setIsDeleteStudentDialogOpen(false);
    loadStudents(selectedClass.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void, disabled: boolean = false) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      action();
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => {
      if (prev === 'none') return 'desc';
      if (prev === 'desc') return 'asc';
      return 'none';
    });
  };

  const sortedStudents = useMemo(() => {
    if (sortOrder === 'none') return students;
    
    return [...students].sort((a, b) => {
      if (sortOrder === 'asc') return a.point - b.point;
      return b.point - a.point;
    });
  }, [students, sortOrder]);

  const handleBackup = async () => {
    const data = await gigiService.backupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}_${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    
    link.href = url;
    link.download = `GigiBoard_${dateStr}.gigi`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setRestoreDataStr(result);
        setIsRestoreConfirmOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  const handleRestore = async () => {
    try {
      await gigiService.restoreData(restoreDataStr);
      setIsRestoreConfirmOpen(false);
      setIsSettingsOpen(false);
      await loadClasses();
      alert('데이터가 성공적으로 복원되었습니다.');
    } catch (err) {
      alert('데이터 복원에 실패했습니다. 올바른 형식인지 확인해 주세요.');
    }
  };

  const handleClearData = async () => {
    await gigiService.clearData();
    setIsClearConfirmOpen(false);
    setIsSettingsOpen(false);
    await loadClasses();
    alert('모든 데이터가 초기화되었습니다.');
  };

  const renderPoints = (point: number) => {
    const isPenalty = point < 0;
    const count = Math.min(Math.abs(point), 15);
    const icons = [];

    for (let i = 0; i < count; i++) {
      if (isPenalty) {
        icons.push(
          <Bolt 
            key={i} 
            sx={{ 
              color: '#ff9800', 
              animation: i === count - 1 ? 'lightningStrike 0.4s ease-out' : 'none'
            }} 
            fontSize="small" 
          />
        );
      } else {
        icons.push(
          <Star 
            key={i} 
            sx={{ 
              color: '#ffc107',
              animation: i === count - 1 ? 'starRotate 0.6s ease-in-out' : 'none'
            }} 
            fontSize="small" 
          />
        );
      }
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 200 }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', pr: 1 }}>
          {isPenalty && icons}
        </Box>
        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderWidth: 1 }} />
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
          {!isPenalty && point > 0 && icons}
        </Box>
      </Box>
    );
  };

  return (
    <Container sx={{ py: 4, position: 'relative' }}>
      <GlobalStyles styles={{
        '@keyframes lightningStrike': {
          '0%': { transform: 'translateY(-20px) scaleY(1.5)', opacity: 0 },
          '50%': { opacity: 1 },
          '100%': { transform: 'translateY(0) scaleY(1)', opacity: 1 },
        },
        '@keyframes starRotate': {
          '0%': { transform: 'rotateZ(0deg) scale(0)', opacity: 0 },
          '100%': { transform: 'rotateZ(360deg) scale(1)', opacity: 1 },
        }
      }} />
      
      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
        <IconButton onClick={() => setIsSettingsOpen(true)} size="large">
          <SettingsIcon />
        </IconButton>
      </Box>

      <Stack direction="row" justifyContent="center" alignItems="center" mb={6}>
        <Typography variant="h3" component="h1" fontWeight="bold">
          Gigi Board
        </Typography>
      </Stack>

      {classList.length > 0 ? (
        <Stack spacing={4}>
          <Box>
            <Typography variant="h6" gutterBottom color="text.secondary">
              클래스 선택
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              {classList.map((cls) => (
                <Chip
                  key={cls.id}
                  label={cls.name}
                  onClick={() => setSelectedClass(cls)}
                  onDelete={() => {
                    setClassToDelete(cls);
                    setIsDeleteClassDialogOpen(true);
                  }}
                  deleteIcon={<CloseIcon />}
                  variant={selectedClass?.id === cls.id ? 'filled' : 'outlined'}
                  color={selectedClass?.id === cls.id ? 'primary' : 'default'}
                  sx={{ px: 1, py: 2.5, fontSize: '1rem', fontWeight: selectedClass?.id === cls.id ? 'bold' : 'normal' }}
                />
              ))}
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsClassDialogOpen(true)}
                sx={{
                  borderRadius: '16px',
                  border: '1px dashed',
                  px: 2,
                  py: 0.6,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  color: 'text.secondary',
                  '&:hover': {
                    border: '1px dashed',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                클래스 추가
              </Button>
            </Stack>
          </Box>

          {selectedClass && (
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h5" fontWeight="bold">{selectedClass.name} 학생 명단</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={sortOrder !== 'none' ? 'contained' : 'outlined'}
                      startIcon={<SortIcon />}
                      onClick={toggleSortOrder}
                      color="secondary"
                      sx={{ borderRadius: 2 }}
                    >
                      {sortOrder === 'none' ? '정렬' : sortOrder === 'desc' ? '높은순' : '낮은순'}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => setIsStudentDialogOpen(true)}
                      sx={{ borderRadius: 2 }}
                    >
                      학생 추가
                    </Button>
                  </Stack>
                </Stack>

                <List disablePadding>
                  {sortedStudents.map((student) => (
                    <ListItem
                      key={student.id}
                      component={Paper}
                      variant="outlined"
                      sx={{ 
                        mb: 1.5, 
                        display: 'flex', 
                        alignItems: 'center', 
                        borderRadius: 2,
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.01)' }
                      }}
                    >
                      <Stack direction="row" alignItems="center" sx={{ width: 130 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setStudentToDelete(student);
                            setIsDeleteStudentDialogOpen(true);
                          }}
                          sx={{ mr: 0.5 }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body1" fontWeight="bold" noWrap>
                          {student.name}
                        </Typography>
                      </Stack>

                      <IconButton
                        color="warning"
                        onClick={() => handleUpdatePoint(student.id, -1)}
                        size="medium"
                        sx={{ border: '1px solid rgba(255, 152, 0, 0.2)', mx: 1 }}
                      >
                        <Bolt />
                      </IconButton>

                      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        {renderPoints(student.point)}
                      </Box>

                      <IconButton
                        sx={{ 
                          color: '#ffc107', 
                          border: '1px solid rgba(255, 193, 7, 0.2)',
                          mx: 1 
                        }}
                        onClick={() => handleUpdatePoint(student.id, 1)}
                        size="medium"
                      >
                        <Star />
                      </IconButton>

                      <Box sx={{ width: 50, textAlign: 'right', ml: 1 }}>
                        <Typography variant="h6" color={student.point > 0 ? 'primary' : student.point < 0 ? 'warning' : 'text.secondary'}>
                          {student.point > 0 ? `+${student.point}` : student.point}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                  {students.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" py={6}>
                      등록된 학생이 없습니다. '학생 추가' 버튼을 눌러주세요.
                    </Typography>
                  )}
                </List>
              </CardContent>
            </Card>
          )}
        </Stack>
      ) : (
        <Box textAlign="center" py={12}>
          <School sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            등록된 클래스가 없습니다.
          </Typography>
          <Typography color="text.disabled" mb={4}>
            클래스를 먼저 등록하여 학생들의 점수를 관리해보세요.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setIsClassDialogOpen(true)}
            sx={{ borderRadius: 2, px: 4 }}
          >
            첫 클래스 만들기
          </Button>
        </Box>
      )}

      {/* Settings Drawer */}
      <Drawer
        anchor="right"
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      >
        <Box sx={{ width: 300, p: 3 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">설정</Typography>
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>테마 설정</Typography>
          <List>
            <ListItem 
              secondaryAction={
                <Switch
                  edge="end"
                  onChange={() => dispatch(changeMode())}
                  checked={themeMode === 'dark'}
                />
              }
            >
              <ListItemIcon>
                {themeMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />}
              </ListItemIcon>
              <ListItemText primary="다크 모드" />
            </ListItem>
          </List>

          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>데이터 관리</Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleBackup}>
                <ListItemIcon><BackupIcon /></ListItemIcon>
                <ListItemText primary="데이터 백업 (.gigi)" secondary="현재 상태를 파일로 저장" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => fileInputRef.current?.click()}>
                <ListItemIcon><RestoreIcon /></ListItemIcon>
                <ListItemText primary="데이터 복원 (.gigi)" secondary="파일로부터 데이터 복구" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setIsClearConfirmOpen(true)} sx={{ color: 'error.main' }}>
                <ListItemIcon><ClearIcon color="error" /></ListItemIcon>
                <ListItemText primary="데이터 초기화" secondary="모든 데이터 삭제" />
              </ListItemButton>
            </ListItem>
          </List>
          
          <input
            type="file"
            accept=".gigi"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </Box>
      </Drawer>

      {/* Create Class Dialog */}
      <Dialog open={isClassDialogOpen} onClose={() => setIsClassDialogOpen(false)}>
        <DialogTitle>새 클래스 등록</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={classInputRef}
            margin="dense"
            label="클래스 이름"
            fullWidth
            variant="outlined"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCreateClass, !newClassName)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsClassDialogOpen(false)}>취소</Button>
          <Button onClick={handleCreateClass} variant="contained" disabled={!newClassName}>
            등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog
        open={isDeleteClassDialogOpen}
        onClose={() => {
          setIsDeleteClassDialogOpen(false);
          setDeleteConfirmName('');
          setClassToDelete(null);
        }}
      >
        <DialogTitle>클래스 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText color="error" gutterBottom>
            이 클래스와 모든 학생 정보가 삭제되며 되돌릴 수 없습니다.
          </DialogContentText>
          <DialogContentText>
            삭제를 원하시면 클래스 이름 <strong>{classToDelete?.name}</strong>을 입력하세요.
          </DialogContentText>
          <TextField
            inputRef={deleteClassInputRef}
            margin="dense"
            label="클래스 이름 입력"
            fullWidth
            variant="outlined"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleDeleteClass, deleteConfirmName !== classToDelete?.name)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteClassDialogOpen(false);
              setDeleteConfirmName('');
              setClassToDelete(null);
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteClass}
            color="error"
            variant="contained"
            disabled={deleteConfirmName !== classToDelete?.name}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={isStudentDialogOpen} onClose={() => setIsStudentDialogOpen(false)}>
        <DialogTitle>학생 추가</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={studentInputRef}
            margin="dense"
            label="학생 이름"
            fullWidth
            variant="outlined"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleAddStudent, !newStudentName)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsStudentDialogOpen(false)}>취소</Button>
          <Button onClick={handleAddStudent} variant="contained" disabled={!newStudentName}>
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Student Dialog */}
      <Dialog
        open={isDeleteStudentDialogOpen}
        onClose={() => {
          setIsDeleteStudentDialogOpen(false);
          setDeleteConfirmName('');
          setStudentToDelete(null);
        }}
      >
        <DialogTitle>학생 삭제</DialogTitle>
        <DialogContent>
          <DialogContentText>
            삭제를 원하시면 학생 이름 <strong>{studentToDelete?.name}</strong>을 입력하세요.
          </DialogContentText>
          <TextField
            inputRef={deleteStudentInputRef}
            margin="dense"
            label="학생 이름 입력"
            fullWidth
            variant="outlined"
            value={deleteConfirmName}
            onChange={(e) => setDeleteConfirmName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleDeleteStudent, deleteConfirmName !== studentToDelete?.name)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setIsDeleteStudentDialogOpen(false);
              setDeleteConfirmName('');
              setStudentToDelete(null);
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteStudent}
            color="error"
            variant="contained"
            disabled={deleteConfirmName !== studentToDelete?.name}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onClose={() => setIsRestoreConfirmOpen(false)}>
        <DialogTitle>데이터 복원 확인</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            파일로부터 데이터를 복원하면 **현재 기록된 모든 데이터가 삭제되고 파일의 내용으로 대체됩니다.**
            정말로 진행하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsRestoreConfirmOpen(false)}>취소</Button>
          <Button onClick={handleRestore} variant="contained" color="error">복원 실행</Button>
        </DialogActions>
      </Dialog>

      {/* Clear Confirmation Dialog */}
      <Dialog open={isClearConfirmOpen} onClose={() => setIsClearConfirmOpen(false)}>
        <DialogTitle>전체 데이터 초기화</DialogTitle>
        <DialogContent>
          <DialogContentText color="error">
            **모든 클래스와 학생 정보가 영구적으로 삭제됩니다.** 이 작업은 되돌릴 수 없습니다.
            정말로 초기화하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsClearConfirmOpen(false)}>취소</Button>
          <Button onClick={handleClearData} variant="contained" color="error">전체 삭제</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Main;
