import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
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

    // State management
    const [ selectedParentTaskId, setSelectedParentTaskId ] = useState(null);
    const [ selectedSubtaskId, setSelectedSubtaskId ] = useState(null);

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

    // Fetch subtasks of a parent task
    const {
        data: subtaskListData,
        loading: subtaskListLoading,
        error: subtaskListError,
        execute: fetchSubtasks,
    } = useFetch(
        apiConfig.task.studentList,
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
    }, [ simulationId, fetchTaskList ]);

    // Load task progress on mount
    React.useEffect(() => {
        if (simulationEnrollmentId) {
            refetchProgress({
                params: { simulationEnrollmentId },
            });
        }
    }, [ simulationEnrollmentId, refetchProgress ]);

    // Filter parent tasks from simulation tasks list
    const { parentTasks, taskProgressMap } = useMemo(() => {
        const taskList = taskListData?.content || [];
        const progressList = taskProgressData?.content || [];
        const parents = [];
        const progressMap = {};

        taskList.forEach((task) => {
            if (task.kind === 1) {
                parents.push(task);
            }
        });

        progressList.forEach((progress) => {
            const task = progress.task || {};
            const taskId = task.id;
            progressMap[taskId] = {
                taskProgressId: progress.id,
                status: progress.status, // 'not_started', 'in_progress', 'completed'
                errorCount: progress.errorCount || 0,
            };
        });

        return {
            parentTasks: parents.sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0)),
            taskProgressMap: progressMap,
        };
    }, [ taskListData, taskProgressData ]);

    // Auto-select first parent task on load
    const defaultSelectedParentId = useMemo(() => {
        if (!selectedParentTaskId && parentTasks.length > 0) {
            return parentTasks[0].id;
        }
        return selectedParentTaskId;
    }, [ parentTasks, selectedParentTaskId ]);

    // Fetch subtasks list when parent task changes
    React.useEffect(() => {
        if (simulationId && defaultSelectedParentId) {
            fetchSubtasks({
                params: {
                    simulationId: parseInt(simulationId),
                    parentId: defaultSelectedParentId,
                },
            });
        }
    }, [ simulationId, defaultSelectedParentId, fetchSubtasks ]);

    // Filter and sort subtasks kind = 2
    const subtasks = useMemo(() => {
        const list = subtaskListData?.content || [];
        return list
            .filter((t) => t.kind === 2)
            .sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0));
    }, [ subtaskListData ]);

    // Auto-select first subtask when subtasks list changes
    React.useEffect(() => {
        if (subtasks.length > 0) {
            setSelectedSubtaskId(subtasks[0].id);
        } else {
            setSelectedSubtaskId(null);
        }
    }, [ subtasks ]);

    // Fetch selected subtask details when selectedSubtaskId changes
    React.useEffect(() => {
        if (selectedSubtaskId) {
            fetchSubtaskDetail({
                pathParams: { id: selectedSubtaskId },
            });
        }
    }, [ selectedSubtaskId, fetchSubtaskDetail ]);

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

    // Handle file upload
    const handleFileUpload = useCallback(() => {
        // TODO: Implement file upload to submission endpoint
    }, []);

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
        companyLogo: selectedParentTask?.simulation?.educator?.organization?.logoUrl,

        // Subtask navigation
        subtasks: subtasks,
        selectedSubtaskId: selectedSubtaskId,
        onSelectSubtask: setSelectedSubtaskId,

        // Content
        pageTitle: selectedParentTask?.title || 'Nhiệm vụ',
        taskHeading: subtaskDetail?.title || 'Đang tải...',
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

    const loading = progressLoading || detailLoading || taskListLoading || subtaskListLoading;
    const error = progressError || detailError || taskListError || subtaskListError;

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
                if (defaultSelectedParentId) {
                    fetchSubtasks({
                        params: {
                            simulationId: parseInt(simulationId),
                            parentId: defaultSelectedParentId,
                        },
                    });
                }
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
