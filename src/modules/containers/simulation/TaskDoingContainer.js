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
    // Get simulationEnrollmentId from location state or route
    const simulationEnrollmentId = location.state?.simulationEnrollmentId;
    const companyLogo = location.state?.companyLogo;

    // State management
    const [selectedParentTaskId, setSelectedParentTaskId] = useState(null);
    const [selectedSubtaskId, setSelectedSubtaskId] = useState(null);

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

    // Load task list on mount
    React.useEffect(() => {
        if (simulationId) {
            fetchTaskList({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [simulationId, fetchTaskList]);

    // Load task progress on mount
    React.useEffect(() => {
        if (simulationEnrollmentId) {
            refetchProgress({
                params: { simulationEnrollmentId },
            });
        }
    }, [simulationEnrollmentId, refetchProgress]);

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
    }, [taskProgressData]);

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
    }, [defaultSelectedParentId, subtasks, selectedSubtaskId]);

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
    }, [selectedSubtaskId, fetchSubtaskDetail, setSubtaskDetail]);

    // Get current subtask progress info
    const currentSubtaskProgress = useMemo(() => {
        if (!selectedSubtaskId) return null;
        return taskProgressMap[selectedSubtaskId] || null;
    }, [selectedSubtaskId, taskProgressMap]);

    // Handle parent task selection
    const handleSelectParentTask = useCallback((parentTaskId) => {
        setSelectedParentTaskId(parentTaskId);
    }, []);

    // Calculate active index and canGoBack / canGoNext
    const activeSubtaskIndex = useMemo(() => {
        return subtasks.findIndex((s) => s.id === selectedSubtaskId);
    }, [subtasks, selectedSubtaskId]);

    const canGoBack = activeSubtaskIndex > 0;
    const canGoNext = activeSubtaskIndex >= 0 && activeSubtaskIndex < subtasks.length - 1;

    // Handle back button
    const handleBack = useCallback(() => {
        if (canGoBack) {
            setSelectedSubtaskId(subtasks[activeSubtaskIndex - 1].id);
        }
    }, [canGoBack, subtasks, activeSubtaskIndex]);

    // Handle next button
    const handleNext = useCallback(() => {
        if (canGoNext) {
            setSelectedSubtaskId(subtasks[activeSubtaskIndex + 1].id);
        }
    }, [canGoNext, subtasks, activeSubtaskIndex]);

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
    }, [selectedSubtaskId, simulationEnrollmentId, createTaskProgress, refetchProgress]);

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
    }, [selectedSubtaskId, simulationEnrollmentId, completeTaskProgress, refetchProgress]);

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
    }, [selectedSubtaskId, simulationEnrollmentId, resetTaskProgress, refetchProgress]);

    // Handle file upload
    const handleFileUpload = useCallback(() => {
        // TODO: Implement file upload to submission endpoint
    }, []);

    // Get selected parent task details
    const selectedParentTask = useMemo(() => {
        return parentTasks.find((t) => t.id === defaultSelectedParentId);
    }, [parentTasks, defaultSelectedParentId]);

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
        onFileChange: handleFileUpload,
        onStartTask: handleStartTask,
        onCompleteTask: handleCompleteTask,
        onResetTask: handleResetTask,
    };

    const loading = progressLoading || detailLoading || taskListLoading;
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
