import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useTaskHierarchy from '@hooks/useTaskHierarchy';
import TaskDoingPage from '@modules/layout/desktop/simulation/TaskDoingPage';
import { message } from 'antd';

/**
 * TaskDoingContainer
 * Manages task doing flow:
 * - Fetch task progress for current enrollment
 * - Map task data from task_progress API response
 * - Handle task lifecycle (start, complete, reset)
 * - Manage step navigation within subtasks
 */
function TaskDoingContainer() {
    const { id: simulationId } = useParams();
    const location = useLocation();

    // Persist simulationEnrollmentId & companyLogo vào sessionStorage để không bị mất khi reload trang
    const sessionKey = `taskDoing-${simulationId}`;
    const getSessionData = () => {
        try {
            return JSON.parse(sessionStorage.getItem(sessionKey)) || {};
        } catch {
            return {};
        }
    };

    const simulationEnrollmentId = (() => {
        const fromState = location.state?.simulationEnrollmentId;
        if (fromState) {
            sessionStorage.setItem(sessionKey, JSON.stringify({ ...getSessionData(), simulationEnrollmentId: fromState, companyLogo: location.state?.companyLogo }));
            return fromState;
        }
        return getSessionData().simulationEnrollmentId;
    })();

    const companyLogo = location.state?.companyLogo || getSessionData().companyLogo;

    // State management
    const [ selectedParentTaskId, setSelectedParentTaskId ] = useState(() => getSessionData().selectedParentTaskId || null);
    const [ selectedSubtaskId, setSelectedSubtaskId ] = useState(() => getSessionData().selectedSubtaskId || null);

    React.useEffect(() => {
        if (selectedParentTaskId !== null || selectedSubtaskId !== null) {
            sessionStorage.setItem(sessionKey, JSON.stringify({
                ...getSessionData(),
                selectedParentTaskId,
                selectedSubtaskId,
            }));
        }
    }, [ selectedParentTaskId, selectedSubtaskId, sessionKey ]);

    // Load task list for sidebar
    const {
        data: taskListData,
        loading: taskListLoading,
        error: taskListError,
        execute: fetchTaskList,
    } = useFetch(
        apiConfig.task.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Fetch task progress list for current enrollment
    const {
        data: taskProgressData,
        loading: progressLoading,
        error: progressError,
        execute: refetchProgress,
    } = useFetch(
        apiConfig.taskProgress.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Create task progress when starting a new task
    const { execute: createTaskProgress } = useFetch(
        apiConfig.taskProgress.create,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Complete task progress
    const { execute: completeTaskProgress } = useFetch(
        apiConfig.taskProgress.complete,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Reset task progress
    const { execute: resetTaskProgress } = useFetch(
        apiConfig.taskProgress.reset,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Fetch selected subtask detail
    const {
        data: subtaskDetail,
        loading: detailLoading,
        error: detailError,
        execute: fetchSubtaskDetail,
        setData: setSubtaskDetail,
    } = useFetch(
        apiConfig.task.studentGet,
        {
            pathParams: { id: selectedSubtaskId || '' },
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Fetch task progress detail (for submissions)
    const {
        data: progressDetail,
        loading: progressDetailLoading,
        execute: fetchProgressDetail,
    } = useFetch(
        apiConfig.taskProgress.studentGet,
        {
            pathParams: { id: '' },
            mappingData: (res) => res.data || {},
        },
        false,
    );

    const { execute: uploadFile } = useFetch(apiConfig.file.upload, {}, false);
    const { execute: createQuizHistory } = useFetch(apiConfig.questionQuizHistory.create, {}, false);

    // Load task list on mount
    React.useEffect(() => {
        if (simulationId) {
            fetchTaskList({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [ simulationId, fetchTaskList ]);

    // Load task progress on mount
    React.useEffect(() => {
        if (simulationEnrollmentId) {
            refetchProgress({
                params: { simulationEnrollmentId },
            });
        }
    }, [ simulationEnrollmentId, refetchProgress ]);

    // Map task progress by task ID
    const taskProgressMap = useMemo(() => {
        const progressList = taskProgressData?.content || [];
        const progressMap = {};

        progressList.forEach((progress) => {
            const task = progress.task || {};
            const taskId = task.id;
            progressMap[taskId] = {
                taskProgressId: progress.id,
                status: progress.status, // 'not_started', 'in_progress', 'completed'
                errorCount: progress.errorCount || 0,
            };
        });

        return progressMap;
    }, [ taskProgressData ]);

    // Get parent tasks and subtasks for the selected parent task
    const { parentTasks, defaultSelectedParentId, subtasks } = useTaskHierarchy(taskListData, selectedParentTaskId);

    // eslint-disable-next-line no-console
    console.log('Danh sách Task Con (Subtasks):', subtasks);

    // Handle subtask selection automatically on parent task or subtasks list changes
    const prevParentIdRef = React.useRef(defaultSelectedParentId);
    React.useEffect(() => {
        const parentChanged = prevParentIdRef.current !== defaultSelectedParentId;
        prevParentIdRef.current = defaultSelectedParentId;

        if (parentChanged) {
            // Reset and select the first subtask of the new parent
            if (subtasks.length > 0) {
                setSelectedSubtaskId(subtasks[0].id);
            } else {
                setSelectedSubtaskId(null);
            }
        } else {
            // If parent didn't change but subtask list updated (e.g. initial load)
            // or if there is no current selection, or the selection is not in the subtasks list
            if (subtasks.length > 0) {
                const exists = subtasks.some((s) => s.id === selectedSubtaskId);
                if (!selectedSubtaskId || !exists) {
                    setSelectedSubtaskId(subtasks[0].id);
                }
            } else {
                setSelectedSubtaskId(null);
            }
        }
    }, [ defaultSelectedParentId, subtasks, selectedSubtaskId ]);

    // Fetch selected subtask details when selectedSubtaskId changes
    React.useEffect(() => {
        if (selectedSubtaskId) {
            setSubtaskDetail(null);
            fetchSubtaskDetail({
                pathParams: { id: selectedSubtaskId },
            });
        } else {
            setSubtaskDetail(null);
        }
    }, [ selectedSubtaskId, fetchSubtaskDetail, setSubtaskDetail ]);

    // Get current subtask progress info
    const currentSubtaskProgress = useMemo(() => {
        if (!selectedSubtaskId) return null;
        return taskProgressMap[selectedSubtaskId] || null;
    }, [ selectedSubtaskId, taskProgressMap ]);

    // Handle parent task selection
    const handleSelectParentTask = useCallback((parentTaskId) => {
        setSelectedParentTaskId(parentTaskId);
    }, []);

    // Calculate active index and canGoBack / canGoNext
    const activeSubtaskIndex = useMemo(() => {
        return subtasks.findIndex((s) => s.id === selectedSubtaskId);
    }, [ subtasks, selectedSubtaskId ]);

    const canGoBack = activeSubtaskIndex > 0;
    const canGoNext = activeSubtaskIndex >= 0 && activeSubtaskIndex < subtasks.length - 1;

    // Handle back button
    const handleBack = useCallback(() => {
        if (canGoBack) {
            setSelectedSubtaskId(subtasks[activeSubtaskIndex - 1].id);
        }
    }, [ canGoBack, subtasks, activeSubtaskIndex ]);

    // Handle next button
    const handleNext = useCallback(() => {
        if (canGoNext) {
            setSelectedSubtaskId(subtasks[activeSubtaskIndex + 1].id);
        }
    }, [ canGoNext, subtasks, activeSubtaskIndex ]);

    // Handle start task
    const handleStartTask = useCallback(async () => {
        if (!selectedSubtaskId) {
            message.error('Không thể bắt đầu bài tập');
            return;
        }

        try {
            const result = await createTaskProgress({
                dataBody: {
                    simulationEnrollmentId,
                    taskId: selectedSubtaskId,
                },
            });

            if (result && result.id) {
                message.success('Bắt đầu bài tập thành công!');
                // Refresh progress data
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
            } else {
                message.error('Không thể bắt đầu bài tập. Vui lòng thử lại');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại');
        }
    }, [ selectedSubtaskId, simulationEnrollmentId, createTaskProgress, refetchProgress ]);

    // Handle complete task
    const handleCompleteTask = useCallback(async () => {
        if (!selectedSubtaskId) {
            message.error('Không thể hoàn thành bài tập');
            return;
        }

        try {
            const result = await completeTaskProgress({
                dataBody: { taskId: selectedSubtaskId },
            });

            if (result && result.id) {
                message.success('Hoàn thành bài tập thành công!');
                // Refresh progress data
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
            } else {
                message.error('Không thể hoàn thành bài tập. Vui lòng thử lại');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại');
        }
    }, [ selectedSubtaskId, simulationEnrollmentId, completeTaskProgress, refetchProgress ]);

    // Handle reset task
    const handleResetTask = useCallback(async () => {
        if (!selectedSubtaskId) {
            message.error('Không thể đặt lại bài tập');
            return;
        }

        try {
            const result = await resetTaskProgress({
                dataBody: { taskId: selectedSubtaskId },
            });

            if (result && result.id) {
                message.success('Đặt lại bài tập thành công!');
                // Refresh progress data
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
            } else {
                message.error('Không thể đặt lại bài tập. Vui lòng thử lại');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại');
        }
    }, [ selectedSubtaskId, simulationEnrollmentId, resetTaskProgress, refetchProgress ]);

    // Load progress detail when taskProgressId changes
    React.useEffect(() => {
        if (currentSubtaskProgress?.taskProgressId) {
            fetchProgressDetail({
                pathParams: { id: currentSubtaskProgress.taskProgressId },
            });
        }
    }, [ currentSubtaskProgress?.taskProgressId, fetchProgressDetail ]);

    // Parse subtask name
    const subtaskName = subtaskDetail?.name || '';
    const { requiresFileUpload, requiresTextResponse } = useMemo(() => {
        const match = subtaskName.match(/^SUB_T(\d+)_S(\d+)(_.*)?$/);
        if (match) {
            const suffix = match[3] || '';
            return {
                requiresFileUpload: suffix === '_FILE' || suffix === '_FILE_TEXT',
                requiresTextResponse: suffix === '_TEXT' || suffix === '_FILE_TEXT',
            };
        }
        return {
            requiresFileUpload: false,
            requiresTextResponse: false,
        };
    }, [ subtaskName ]);

    // Extract previous submissions
    const submissions = useMemo(() => {
        return progressDetail?.studentSubmission?.content || [];
    }, [ progressDetail ]);

    const previousFile = useMemo(() => {
        if (!requiresFileUpload) return null;
        const found = submissions.find((s) => !s.taskQuestion && (s.answer?.includes('/') || s.answer?.includes('.')));
        return found ? found.answer : null;
    }, [ submissions, requiresFileUpload ]);

    const previousText = useMemo(() => {
        if (!requiresTextResponse) return '';
        const found = submissions.find((s) => !s.taskQuestion && !(s.answer?.includes('/') || s.answer?.includes('.')));
        return found ? found.answer : '';
    }, [ submissions, requiresTextResponse ]);

    // Handle file upload
    const handleFileUpload = useCallback(async (file) => {
        if (!currentSubtaskProgress?.taskProgressId) {
            message.error('Vui lòng bắt đầu nhiệm vụ trước khi nộp bài!');
            return;
        }
        try {
            const uploadRes = await uploadFile({
                data: {
                    file,
                    type: 'DOCUMENT',
                },
            });
            if (uploadRes?.result === true) {
                const filePath = uploadRes.data.filePath;
                // Save to student submission
                const submitRes = await createQuizHistory({
                    dataBody: {
                        studentTaskProgressId: currentSubtaskProgress.taskProgressId,
                        taskQuestionId: null,
                        answer: filePath,
                        isCorrect: true,
                    },
                });
                if (submitRes) {
                    message.success('Tải file lên và lưu bài làm thành công!');
                    fetchProgressDetail({
                        pathParams: { id: currentSubtaskProgress.taskProgressId },
                    });
                }
            } else {
                message.error('Tải file lên thất bại. Vui lòng thử lại!');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra khi tải file!');
        }
    }, [ currentSubtaskProgress, uploadFile, createQuizHistory, fetchProgressDetail ]);

    // Handle text response submit
    const handleTextResponseSubmit = useCallback(async (text) => {
        if (!currentSubtaskProgress?.taskProgressId) {
            message.error('Vui lòng bắt đầu nhiệm vụ trước khi nộp bài!');
            return;
        }
        try {
            const submitRes = await createQuizHistory({
                dataBody: {
                    studentTaskProgressId: currentSubtaskProgress.taskProgressId,
                    taskQuestionId: null,
                    answer: text,
                    isCorrect: true,
                },
            });
            if (submitRes) {
                message.success('Lưu câu trả lời thành công!');
                fetchProgressDetail({
                    pathParams: { id: currentSubtaskProgress.taskProgressId },
                });
            }
        } catch (err) {
            message.error('Có lỗi xảy ra khi lưu câu trả lời!');
        }
    }, [ currentSubtaskProgress, createQuizHistory, fetchProgressDetail ]);

    // Get selected parent task details
    const selectedParentTask = useMemo(() => {
        return parentTasks.find((t) => t.id === defaultSelectedParentId);
    }, [ parentTasks, defaultSelectedParentId ]);

    // Determine task status display
    const getTaskStatus = () => {
        if (!currentSubtaskProgress) {
            return 'not_started';
        }
        return currentSubtaskProgress.status;
    };

    // Prepare props for TaskDoingPage
    const pageProps = {
        // Sidebar
        taskNumber: parentTasks.indexOf(selectedParentTask) + 1,
        taskLabel: selectedParentTask?.title || 'Nhiệm vụ',
        taskDescription: selectedParentTask?.description || '',
        companyLogo: companyLogo || selectedParentTask?.simulation?.educator?.organization?.logoUrl,

        // Subtask navigation
        subtasks: subtasks,
        selectedSubtaskId: selectedSubtaskId,
        onSelectSubtask: setSelectedSubtaskId,

        // Content
        pageTitle: selectedParentTask?.title || 'Nhiệm vụ',
        taskHeading: subtasks.length > 0 ? subtaskDetail?.title || 'Đang tải...' : 'Không Có Bài Học',
        taskBody: subtaskDetail?.content || '',
        taskDescriptionContent: subtaskDetail?.description || '',
        mediaPath: subtaskDetail?.imagePath || subtaskDetail?.videoPath || subtaskDetail?.filePath,
        urlBase: subtaskDetail?.urlBase,

        // Progress info
        taskProgress: currentSubtaskProgress,
        taskStatus: getTaskStatus(),
        errorCount: currentSubtaskProgress?.errorCount || 0,

        // Navigation
        canGoBack,
        canGoNext,
        onBack: handleBack,
        onNext: handleNext,
        requiresFileUpload,
        requiresTextResponse,
        previousFile,
        previousText,
        onFileChange: handleFileUpload,
        onTextResponseSubmit: handleTextResponseSubmit,
        onStartTask: handleStartTask,
        onCompleteTask: handleCompleteTask,
        onResetTask: handleResetTask,
    };

    const loading = progressLoading || detailLoading || taskListLoading || progressDetailLoading;
    const error = progressError || detailError || taskListError;

    // Show error if no simulationEnrollmentId
    if (!simulationEnrollmentId) {
        return (
            <TaskDoingPage
                {...pageProps}
                loading={false}
                error="Không tìm thấy thông tin đăng ký. Vui lòng quay lại và đăng ký dự án."
                onRetry={() => {}}
                parentTasks={[]}
                selectedParentTaskId={null}
                onSelectParentTask={() => {}}
            />
        );
    }

    return (
        <TaskDoingPage
            {...pageProps}
            loading={loading}
            error={error}
            onRetry={() => {
                fetchTaskList({
                    params: { simulationId: parseInt(simulationId) },
                });
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
                if (selectedSubtaskId) {
                    fetchSubtaskDetail({
                        pathParams: { id: selectedSubtaskId },
                    });
                }
            }}
            parentTasks={parentTasks}
            selectedParentTaskId={defaultSelectedParentId}
            onSelectParentTask={handleSelectParentTask}
        />
    );
}

export default TaskDoingContainer;
