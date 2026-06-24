import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import useTaskHierarchy from '@hooks/useTaskHierarchy';
import TaskDoingPage from '@modules/layout/desktop/simulation/TaskDoingPage';
import { message } from 'antd';

const parseSubtaskName = (name = '') => {
    const match = name.match(/^SUB_T(\d+)_S(\d+)(_.*)?$/);
    if (!match) return null;

    const suffix = match[3] || '';
    return {
        parentOrder: parseInt(match[1], 10),
        subtaskOrder: parseInt(match[2], 10),
        suffix,
        requiresFileUpload: suffix === '_FILE' || suffix === '_FILE_TEXT',
        requiresTextResponse: suffix === '_TEXT' || suffix === '_FILE_TEXT',
    };
};

const isFilePath = (str = '') => {
    if (!str || typeof str !== 'string') return false;
    const trimmed = str.trim();
    const noSpaces = !/\s/.test(trimmed);
    const hasExtension = /\.[a-zA-Z0-9]{2,5}$/.test(trimmed);
    const isUrlOrPath = trimmed.startsWith('/') || trimmed.startsWith('http://') || trimmed.startsWith('https://');
    return noSpaces && (hasExtension || isUrlOrPath);
};

const getSubmissionAnswer = (submission = {}) => submission.answer || submission.answear || '';

const getSubmissions = (progressDetail = {}) => {
    if (Array.isArray(progressDetail?.studentSubmission?.content)) {
        return progressDetail.studentSubmission.content;
    }
    if (Array.isArray(progressDetail?.studentSubmission)) {
        return progressDetail.studentSubmission;
    }
    if (Array.isArray(progressDetail?.content)) {
        return progressDetail.content;
    }
    return [];
};

const normalizeQuestionId = (id) => (id != null && id !== '' ? String(id) : null);

const getSubmissionQuestionId = (submission = {}) => {
    if (submission.taskQuestionId != null) {
        return normalizeQuestionId(submission.taskQuestionId);
    }

    const taskQuestion = submission.taskQuestion;
    if (taskQuestion == null) {
        return null;
    }

    if (typeof taskQuestion === 'object') {
        return normalizeQuestionId(taskQuestion.id ?? taskQuestion.taskQuestionId);
    }

    return normalizeQuestionId(taskQuestion);
};

const isQuizSubmissionCorrect = (submission = {}, correctAnswersMap = {}) => {
    if (submission.isCorrect === true || submission.isCorrect === 1) {
        return true;
    }
    if (submission.isCorrect === false || submission.isCorrect === 0) {
        return false;
    }

    const questionId = getSubmissionQuestionId(submission);
    const answer = getSubmissionAnswer(submission);

    if (questionId && correctAnswersMap[questionId] !== undefined) {
        return correctAnswersMap[questionId] === answer;
    }

    // Chỉ lưu đáp án khi học viên trả lời đúng; API có thể không trả isCorrect
    return questionId != null && Boolean(answer);
};

const extractQuizBlocks = (content) => {
    if (!content || typeof content !== 'string') return [];

    try {
        const blocks = JSON.parse(content.trim());
        if (!Array.isArray(blocks)) return [];
        return blocks.filter((block) => block?.type === 'quiz');
    } catch {
        return [];
    }
};

const normalizeQuestionText = (text = '') => (typeof text === 'string' ? text.trim() : '');

const buildQuestionMap = (questions = []) => {
    const map = {};
    if (!Array.isArray(questions)) return map;

    questions.forEach((q) => {
        const key = normalizeQuestionText(q.question);
        if (key && q.id != null) {
            map[key] = String(q.id);
        }
    });

    return map;
};

const getQuestionIdFromMap = (questionMap = {}, questionText) => {
    const key = normalizeQuestionText(questionText);
    return key ? (questionMap[key] ?? null) : null;
};

/**
 * TaskDoingContainer
 * Manages task doing flow:
 * - Fetch task progress for current enrollment
 * - Map task data from task_progress API response
 * - Handle task lifecycle (start, complete, reset)
 * - Manage step navigation within subtasks
 *
 * Progress Init (Case 1.1): If studentList returns empty, auto-create progress for first parent task + first subtask.
 * Progress Resume (Case 1.2): If studentList has data, find SUB_Tx_Sy with highest x, y to resume.
 * Complete (Case 2): On "Continue", validate freeform + quiz submissions before calling complete API.
 * Reset (Case 3): Call reset API to clear all answers, then refetch.
 */
function TaskDoingContainer() {
    const { id: simulationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Persist simulationEnrollmentId & companyLogo vào sessionStorage để không bị mất khi reload trang
    const sessionKey = `taskDoing-${simulationId}`;
    const getSessionData = () => {
        try {
            return JSON.parse(sessionStorage.getItem(sessionKey)) || {};
        } catch {
            return {};
        }
    };

    const [ simulationEnrollmentId, setSimulationEnrollmentId ] = useState(
        () => getSessionData().simulationEnrollmentId || null,
    );

    const companyLogo = (() => {
        const fromState = location.state?.companyLogo;
        if (fromState) {
            sessionStorage.setItem(
                sessionKey,
                JSON.stringify({
                    ...getSessionData(),
                    companyLogo: fromState,
                }),
            );
            return fromState;
        }
        return getSessionData().companyLogo;
    })();

    // Show enrollment success notification on reload if it was shown during enrollment
    React.useEffect(() => {
        if (simulationEnrollmentId && sessionStorage.getItem(`enrollmentSuccess-${simulationId}`)) {
            message.success('Đăng ký tham gia dự án thành công!');
            // Clear the flag to avoid showing it again on subsequent loads
            sessionStorage.removeItem(`enrollmentSuccess-${simulationId}`);
        }
    }, [ simulationEnrollmentId, simulationId ]);

    // State management
    const [ selectedParentTaskId, setSelectedParentTaskId ] = useState(
        () => getSessionData().selectedParentTaskId || null,
    );
    const [ selectedSubtaskId, setSelectedSubtaskId ] = useState(() => getSessionData().selectedSubtaskId || null);

    React.useEffect(() => {
        if (selectedParentTaskId !== null || selectedSubtaskId !== null) {
            sessionStorage.setItem(
                sessionKey,
                JSON.stringify({
                    ...getSessionData(),
                    selectedParentTaskId,
                    selectedSubtaskId,
                }),
            );
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
        false,
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
        false,
    );

    // Create task progress when starting a new task
    const { execute: createTaskProgress } = useFetch(
        apiConfig.taskProgress.create,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Complete task progress
    const { execute: completeTaskProgress } = useFetch(
        apiConfig.taskProgress.complete,
        {
            mappingData: (res) => res.data || {},
        },
        false,
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
        false,
    );

    // Fetch task progress detail (for submissions)
    const {
        data: progressDetail,
        loading: progressDetailLoading,
        execute: fetchProgressDetail,
        setData: setProgressDetail,
    } = useFetch(
        apiConfig.taskProgress.studentGet,
        {
            pathParams: { id: '' },
            mappingData: (res) => res.data || {},
        },
        false,
    );

    const { profile } = useAuth();
    const [ isGeneratingCert, setIsGeneratingCert ] = useState(false);

    const { execute: uploadFile } = useFetch(apiConfig.file.upload, {}, false);
    const { execute: createQuizHistory } = useFetch(apiConfig.questionQuizHistory.create, {}, false);
    const { execute: uploadCertificate } = useFetch(apiConfig.file.uploadCertificate, {}, false);
    const { execute: fetchAchievements } = useFetch(apiConfig.achievement.studentList, {}, false);
    const { execute: updateAchievement } = useFetch(apiConfig.achievement.update, {}, false);
    const { execute: fetchTaskQuestions } = useFetch(
        apiConfig.taskQuestion.studentList,
        {
            mappingData: (res) => res.data?.content || [],
        },
        false,
    );

    // Fetch simulation detail
    const { data: simulationDetail, execute: fetchSimulationDetail } = useFetch(
        apiConfig.simulation.studentGet,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Check enrollment status (to get overall progress/completion)
    const {
        data: enrollmentData,
        loading: enrollmentLoading,
        execute: checkEnrollment,
    } = useFetch(
        apiConfig.simulationEnrollment.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Comments state & fetches
    const [ showComments, setShowComments ] = useState(false);

    const {
        data: commentsData,
        loading: commentsLoading,
        execute: fetchComments,
    } = useFetch(
        apiConfig.comment.userList,
        {
            params: { taskId: selectedSubtaskId || '', size: 1000 },
            mappingData: (res) => res.data || {},
        },
        false,
    );

    const { execute: createCommentApi } = useFetch(
        apiConfig.comment.create,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    const { execute: updateCommentApi } = useFetch(
        apiConfig.comment.update,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Load simulation detail and check enrollment status on mount
    React.useEffect(() => {
        if (simulationId) {
            fetchSimulationDetail({
                pathParams: { id: simulationId },
            });
            checkEnrollment({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [ simulationId, fetchSimulationDetail, checkEnrollment ]);

    // State to store mapping of question text to question ID
    const [ questionMap, setQuestionMap ] = useState({});
    // Đáp án quiz đã xác nhận đúng trên UI, dùng khi progressDetail chưa kịp refetch
    const [ localQuizAnswers, setLocalQuizAnswers ] = useState({});

    // Tiến độ được tạo cục bộ (tránh race condition khi API refetch chưa phản hồi xong)
    const [ localProgressMap, setLocalProgressMap ] = useState({});
    const [ isContinuing, setIsContinuing ] = useState(false);
    const initializingProgressRef = React.useRef(false);
    const creatingProgressTasksRef = React.useRef(new Set());
    const attemptedProgressCreationRef = React.useRef(new Set());

    // Clear attempted progress creations when enrollment ID changes
    React.useEffect(() => {
        attemptedProgressCreationRef.current.clear();
    }, [ simulationEnrollmentId ]);

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

    const hasCompleted = useMemo(() => {
        if (enrollmentData?.content) {
            const enrollment = enrollmentData.content.find((e) => e.simulation?.id === parseInt(simulationId));
            return enrollment?.progress === 100;
        }
        return false;
    }, [ enrollmentData, simulationId ]);

    // Đồng bộ simulationEnrollmentId từ dữ liệu checkEnrollment
    React.useEffect(() => {
        if (enrollmentData?.content) {
            const enrollment = enrollmentData.content.find((e) => e.simulation?.id === parseInt(simulationId));
            if (enrollment?.id) {
                setSimulationEnrollmentId(enrollment.id);
                sessionStorage.setItem(
                    sessionKey,
                    JSON.stringify({
                        ...getSessionData(),
                        simulationEnrollmentId: enrollment.id,
                    }),
                );
            } else {
                setSimulationEnrollmentId(null);
            }
        }
    }, [ enrollmentData, simulationId, sessionKey ]);

    const progressList = useMemo(() => taskProgressData?.content || [], [ taskProgressData ]);

    // Đồng bộ và dọn dẹp local progress khi dữ liệu chính thức từ server đã tải về
    React.useEffect(() => {
        if (progressList.length > 0) {
            setLocalProgressMap((prev) => {
                const next = { ...prev };
                let changed = false;
                progressList.forEach((progress) => {
                    const taskId = progress.task?.id;
                    if (taskId && next[taskId]) {
                        delete next[taskId];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }
    }, [ progressList ]);

    // Map task progress by task ID (gộp tiến độ cục bộ)
    const taskProgressMap = useMemo(() => {
        const progressMap = { ...localProgressMap };

        progressList.forEach((progress) => {
            const task = progress.task || {};
            const taskId = task.id;
            progressMap[taskId] = {
                taskProgressId: progress.id,
                status: progress.status, // 'not_started', 'in_progress', 'completed'
                errorCount: progress.errorCount || 0,
                task: progress.task,
            };
        });

        return progressMap;
    }, [ progressList, localProgressMap ]);

    const taskProgressMapRef = React.useRef({});
    taskProgressMapRef.current = taskProgressMap;

    // Get parent tasks and subtasks for the selected parent task
    const { parentTasks, defaultSelectedParentId, subtasks } = useTaskHierarchy(taskListData, selectedParentTaskId);

    // Danh sách phẳng được sắp xếp đúng thứ tự của tất cả subtask trong simulation
    const allSubtasksOrdered = useMemo(() => {
        const list = taskListData?.content || [];
        const subtaskList = list.filter((t) => t && t.kind === 2);
        const parentOrderMap = {};
        parentTasks.forEach((p, idx) => {
            parentOrderMap[p.id] = idx;
        });

        return subtaskList.sort((a, b) => {
            const pAId = a.parent?.id || a.parentId || a.taskId;
            const pBId = b.parent?.id || b.parentId || b.taskId;
            const orderA = parentOrderMap[pAId] ?? 999;
            const orderB = parentOrderMap[pBId] ?? 999;
            if (orderA !== orderB) {
                return orderA - orderB;
            }
            return (a.orderInParent || 0) - (b.orderInParent || 0);
        });
    }, [ taskListData, parentTasks ]);

    // Get selected parent task details
    const selectedParentTask = useMemo(() => {
        return parentTasks.find((t) => t.id === defaultSelectedParentId);
    }, [ parentTasks, defaultSelectedParentId ]);

    const initializedProgressRef = React.useRef(false);
    const appliedResumeRef = React.useRef(false);

    const ensureTaskProgress = useCallback(
        async (taskId) => {
            if (!taskId) return null;

            const existing = taskProgressMapRef.current[taskId];
            if (existing?.taskProgressId) {
                return existing;
            }

            const result = await createTaskProgress({
                dataBody: {
                    simulationEnrollmentId,
                    taskId,
                },
            });

            const progressId =
                result?.id ||
                result?.data?.id ||
                (typeof result?.data === 'number' || typeof result?.data === 'string' ? result.data : null);

            if (progressId) {
                const newProgress = {
                    taskProgressId: progressId,
                    status: result?.status || result?.data?.status || 'in_progress',
                    errorCount: result?.errorCount || result?.data?.errorCount || 0,
                    task: result?.task || result?.data?.task || { id: taskId },
                };
                setLocalProgressMap((prev) => ({
                    ...prev,
                    [taskId]: newProgress,
                }));
                return newProgress;
            }
            if (result?.result === false || result?.message) {
                return result;
            }
            return null;
        },
        [ createTaskProgress, simulationEnrollmentId ],
    );

    /**
     * Case 1.1: Nếu studentList trả về rỗng (Học viên chưa làm Simulation),
     * tự động tạo tiến độ cho Task Cha đầu tiên và Task Con đầu tiên của nó.
     */
    React.useEffect(() => {
        if (
            initializedProgressRef.current ||
            initializingProgressRef.current ||
            !simulationEnrollmentId ||
            taskListLoading ||
            progressLoading ||
            parentTasks.length === 0 ||
            !taskProgressData
        ) {
            return;
        }

        const initializeFirstProgress = async () => {
            initializingProgressRef.current = true;

            // Nếu progressList đã có dữ liệu, không cần tạo mới tiến độ đầu tiên
            if (progressList.length > 0) {
                initializedProgressRef.current = true;
                initializingProgressRef.current = false;
                return;
            }

            const firstParentTask = parentTasks[0];
            const firstSubtask = subtasks[0];

            if (!firstParentTask || !firstSubtask) {
                initializingProgressRef.current = false;
                return;
            }

            try {
                // Tạo tiến độ cho Task Cha đầu tiên
                const resParent = await ensureTaskProgress(firstParentTask.id);
                // Tạo tiến độ cho Task Con đầu tiên của Task Cha đó
                const resSub = await ensureTaskProgress(firstSubtask.id);

                if (resParent?.result === false || resSub?.result === false) {
                    const errMsg =
                        resParent?.message || resSub?.message || 'Không thể khởi tạo tiến độ bài học. Vui lòng thử lại';
                    message.error(errMsg);
                } else {
                    setSelectedParentTaskId(firstParentTask.id);
                    setSelectedSubtaskId(firstSubtask.id);
                    refetchProgress({
                        params: { simulationEnrollmentId },
                    });
                }
            } catch {
                message.error('Không thể khởi tạo tiến độ bài học. Vui lòng thử lại');
            } finally {
                initializedProgressRef.current = true;
                initializingProgressRef.current = false;
            }
        };

        initializeFirstProgress();
    }, [
        ensureTaskProgress,
        parentTasks,
        progressList,
        progressLoading,
        refetchProgress,
        simulationEnrollmentId,
        subtasks,
        taskListLoading,
        taskProgressData,
    ]);

    /**
     * Case 1.2: Nếu studentList đã có dữ liệu, tìm tiến trình gần nhất
     * bằng cách tìm SUB_Tx_Sy có x, y cao nhất để resume đúng vị trí.
     */
    React.useEffect(() => {
        if (
            appliedResumeRef.current ||
            progressList.length === 0 ||
            parentTasks.length === 0 ||
            !taskListData ||
            allSubtasksOrdered.length === 0
        ) {
            return;
        }

        // Sort: parentOrder tăng dần, subtaskOrder tăng dần
        const sortedProgress = progressList
            .map((progress) => ({
                progress,
                parsed: parseSubtaskName(progress.task?.name),
            }))
            .filter((item) => item.parsed)
            .sort((a, b) => {
                if (a.parsed.parentOrder !== b.parsed.parentOrder) {
                    return a.parsed.parentOrder - b.parsed.parentOrder;
                }
                return a.parsed.subtaskOrder - b.parsed.subtaskOrder;
            });

        if (sortedProgress.length === 0) {
            return;
        }

        // Phần tử cuối cùng có x, y cao nhất
        const latestItem = sortedProgress[sortedProgress.length - 1];
        let latestTask = latestItem.progress.task;
        const isCompleted = latestItem.progress.status === 'completed';

        if (!latestTask?.id) {
            return;
        }

        appliedResumeRef.current = true;

        // Sửa BUG-05: Nếu task cuối đã hoàn thành, nhảy tới subtask chưa hoàn thành tiếp theo
        if (isCompleted) {
            const idx = allSubtasksOrdered.findIndex((s) => s.id === latestTask.id);
            if (idx !== -1 && idx < allSubtasksOrdered.length - 1) {
                const nextTask = allSubtasksOrdered[idx + 1];
                ensureTaskProgress(nextTask.id);
                latestTask = nextTask;
            }
        }

        const parentId = latestTask.parent?.id || latestTask.parentId || latestTask.taskId;

        if (parentId) {
            setSelectedParentTaskId(parentId);
        }
        setSelectedSubtaskId(latestTask.id);
    }, [ parentTasks, progressList, taskListData, allSubtasksOrdered, ensureTaskProgress ]);

    // Tự động đảm bảo có progress khi người dùng chọn bất kỳ subtask nào (Giải quyết triệt để lỗi Tiến độ nhiệm vụ chưa sẵn sàng)
    React.useEffect(() => {
        if (
            selectedSubtaskId &&
            simulationEnrollmentId &&
            taskProgressData &&
            !progressLoading &&
            !creatingProgressTasksRef.current.has(selectedSubtaskId) &&
            !attemptedProgressCreationRef.current.has(selectedSubtaskId)
        ) {
            const existing = taskProgressMap[selectedSubtaskId];
            if (!existing) {
                attemptedProgressCreationRef.current.add(selectedSubtaskId);
                creatingProgressTasksRef.current.add(selectedSubtaskId);
                ensureTaskProgress(selectedSubtaskId)
                    .then((res) => {
                        if (res && res.result === false) {
                            message.error(res.message || 'Không thể tạo tiến độ cho nhiệm vụ này. Vui lòng thử lại.');
                        } else {
                            refetchProgress({
                                params: { simulationEnrollmentId },
                            });
                        }
                    })
                    .catch(() => {
                        message.error('Không thể tạo tiến độ cho nhiệm vụ này. Vui lòng thử lại.');
                    })
                    .finally(() => {
                        creatingProgressTasksRef.current.delete(selectedSubtaskId);
                    });
            }
        }
    }, [
        selectedSubtaskId,
        simulationEnrollmentId,
        taskProgressData,
        progressLoading,
        ensureTaskProgress,
        taskProgressMap,
        refetchProgress,
    ]);

    // Handle subtask selection automatically on parent task or subtasks list changes
    React.useEffect(() => {
        if (subtasks.length > 0) {
            const exists = subtasks.some((s) => s.id === selectedSubtaskId);
            if (!selectedSubtaskId || !exists) {
                setSelectedSubtaskId(subtasks[0].id);
            }
        } else {
            setSelectedSubtaskId(null);
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

    React.useEffect(() => {
        setLocalQuizAnswers({});
    }, [ selectedSubtaskId ]);

    // Fetch task questions and build question mapping when selectedSubtaskId changes
    React.useEffect(() => {
        if (selectedSubtaskId) {
            fetchTaskQuestions({
                params: { taskId: selectedSubtaskId },
            })
                .then((response) => {
                    if (!response || response?.result === false) {
                        setQuestionMap({});
                        return;
                    }

                    setQuestionMap(buildQuestionMap(response?.data?.content));
                })
                .catch(() => {
                    setQuestionMap({});
                });
        } else {
            setQuestionMap({});
        }
    }, [ selectedSubtaskId, fetchTaskQuestions ]);

    // Fetch comments when subtask selection changes
    React.useEffect(() => {
        if (selectedSubtaskId) {
            fetchComments({
                params: { taskId: selectedSubtaskId, size: 1000 },
            });
        }
    }, [ selectedSubtaskId, fetchComments ]);

    const handleCreateComment = useCallback(
        async (content, parentId = 0) => {
            if (!selectedSubtaskId) {
                message.error('Không tìm thấy nhiệm vụ hiện tại');
                return;
            }
            try {
                const res = await createCommentApi({
                    dataBody: {
                        content,
                        parentId,
                        taskId: selectedSubtaskId,
                    },
                });
                if (res?.result !== false) {
                    message.success('Đăng bình luận thành công!');
                    fetchComments({
                        params: { taskId: selectedSubtaskId, size: 1000 },
                    });
                } else {
                    message.error(res?.message || 'Không thể đăng bình luận. Vui lòng thử lại.');
                }
            } catch {
                message.error('Có lỗi xảy ra khi đăng bình luận.');
            }
        },
        [ selectedSubtaskId, createCommentApi, fetchComments ],
    );

    const handleUpdateComment = useCallback(
        async (id, content) => {
            if (!selectedSubtaskId) return;
            try {
                const res = await updateCommentApi({
                    dataBody: {
                        id,
                        content,
                    },
                });
                if (res?.result !== false) {
                    message.success('Cập nhật bình luận thành công!');
                    fetchComments({
                        params: { taskId: selectedSubtaskId, size: 1000 },
                    });
                } else {
                    message.error(res?.message || 'Không thể cập nhật bình luận. Vui lòng thử lại.');
                }
            } catch {
                message.error('Có lỗi xảy ra khi cập nhật bình luận.');
            }
        },
        [ selectedSubtaskId, updateCommentApi, fetchComments ],
    );

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

    const isLastSubtaskOverall = useMemo(() => {
        if (parentTasks.length === 0 || subtasks.length === 0 || !selectedParentTask) return false;
        const activeParentIndex = parentTasks.findIndex((task) => task.id === selectedParentTask.id);
        const isLastParent = activeParentIndex === parentTasks.length - 1;
        const isLastSub = activeSubtaskIndex === subtasks.length - 1;
        return isLastParent && isLastSub;
    }, [ parentTasks, selectedParentTask, subtasks, activeSubtaskIndex ]);

    const activeSubtaskIndexOverall = useMemo(() => {
        return allSubtasksOrdered.findIndex((s) => s.id === selectedSubtaskId);
    }, [ allSubtasksOrdered, selectedSubtaskId ]);

    const canGoBack = activeSubtaskIndexOverall > 0;
    const canGoNext = activeSubtaskIndex >= 0;

    // Handle back button (Sửa BUG-07: Quay lại xuyên suốt qua các parent task)
    const handleBack = useCallback(() => {
        if (canGoBack && activeSubtaskIndexOverall > 0) {
            const prevSubtask = allSubtasksOrdered[activeSubtaskIndexOverall - 1];
            const prevParentId = prevSubtask.parent?.id || prevSubtask.parentId || prevSubtask.taskId;
            if (prevParentId) {
                setSelectedParentTaskId(prevParentId);
            }
            setSelectedSubtaskId(prevSubtask.id);
        }
    }, [ canGoBack, activeSubtaskIndexOverall, allSubtasksOrdered ]);

    // Load progress detail when taskProgressId changes
    // Khi vừa chuyển sang Task con có task Question, phải kiểm tra phần này liền để hiện phần trả lời trước đó
    React.useEffect(() => {
        if (currentSubtaskProgress?.taskProgressId) {
            fetchProgressDetail({
                pathParams: { id: currentSubtaskProgress.taskProgressId },
            });
        } else {
            setProgressDetail(null);
        }
    }, [ currentSubtaskProgress?.taskProgressId, fetchProgressDetail, setProgressDetail ]);

    // Parse subtask name để xác định loại nhiệm vụ
    const subtaskName = subtaskDetail?.name || '';
    const parsedSubtaskName = useMemo(() => parseSubtaskName(subtaskName), [ subtaskName ]);
    const requiresFileUpload = parsedSubtaskName?.requiresFileUpload || false;
    const requiresTextResponse = parsedSubtaskName?.requiresTextResponse || false;

    // Extract và sắp xếp submissions từ data.content của studentGet (Sắp xếp tăng dần theo thời gian/id để phần tử mới nhất ở cuối)
    const submissions = useMemo(() => {
        const rawSubmissions = getSubmissions(progressDetail);
        return [ ...rawSubmissions ].sort((a, b) => {
            const timeA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
            const timeB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
            if (timeA !== timeB) {
                return timeA - timeB;
            }
            return (a.id || 0) - (b.id || 0);
        });
    }, [ progressDetail ]);

    // Tìm câu trả lời file đã nộp mới nhất (Sửa tìm đáp án mới nhất)
    const previousFile = useMemo(() => {
        if (!requiresFileUpload) return null;
        const found = [ ...submissions ].reverse().find((s) => !s.taskQuestion && isFilePath(getSubmissionAnswer(s)));
        return found ? getSubmissionAnswer(found) : null;
    }, [ submissions, requiresFileUpload ]);

    // Tìm câu trả lời text đã nộp mới nhất (Sửa tìm đáp án mới nhất)
    const previousText = useMemo(() => {
        if (!requiresTextResponse) return '';
        const found = [ ...submissions ].reverse().find((s) => !s.taskQuestion && !isFilePath(getSubmissionAnswer(s)));
        return found ? getSubmissionAnswer(found) : '';
    }, [ submissions, requiresTextResponse ]);

    // Extract quiz blocks từ content của subtask
    const quizBlocks = useMemo(() => extractQuizBlocks(subtaskDetail?.content), [ subtaskDetail?.content ]);

    // Bản đồ đáp án đúng lấy từ blocks để làm quiz correctness fallback (Sửa BUG-10)
    const correctAnswersMap = useMemo(() => {
        const map = {};
        quizBlocks.forEach((block) => {
            const questionId = getQuestionIdFromMap(questionMap, block.question);
            if (questionId) {
                const correctOpt = (block.options || []).find((o) => o.answer === true);
                if (correctOpt) {
                    map[questionId] = correctOpt.option || correctOpt.value || '';
                }
            }
        });
        return map;
    }, [ quizBlocks, questionMap ]);

    // Map quiz submissions theo taskQuestionId (chỉ câu đã có taskQuestion.id mới là trắc nghiệm) (Sửa BUG-10)
    const quizSubmissionMap = useMemo(() => {
        const map = {};
        submissions.forEach((submission) => {
            const questionId = getSubmissionQuestionId(submission);
            if (questionId) {
                map[questionId] = {
                    answer: getSubmissionAnswer(submission),
                    isCorrect: isQuizSubmissionCorrect(submission, correctAnswersMap),
                };
            }
        });

        Object.entries(localQuizAnswers).forEach(([ questionId, data ]) => {
            if (!map[questionId]) {
                map[questionId] = data;
            }
        });

        return map;
    }, [ submissions, localQuizAnswers ]);

    // Kiểm tra xem toàn bộ câu hỏi trắc nghiệm đã được trả lời đúng chưa
    const hasRequiredQuizSubmissions = useMemo(() => {
        if (quizBlocks.length === 0) {
            return true;
        }

        return quizBlocks.every((block) => {
            const questionId = getQuestionIdFromMap(questionMap, block.question);
            return questionId && quizSubmissionMap[questionId] && quizSubmissionMap[questionId].isCorrect;
        });
    }, [ quizBlocks, quizSubmissionMap, questionMap ]);

    // Handle file upload - lưu file vào studentSubmission
    const handleFileUpload = useCallback(
        async (file) => {
            if (hasCompleted) return;
            if (!currentSubtaskProgress?.taskProgressId) {
                message.error('Tiến độ nhiệm vụ chưa sẵn sàng. Vui lòng thử lại!');
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
        },
        [ currentSubtaskProgress, uploadFile, createQuizHistory, fetchProgressDetail, hasCompleted ],
    );

    // Handle text response submit - lưu câu trả lời text vào studentSubmission
    const handleTextResponseSubmit = useCallback(
        async (text) => {
            if (hasCompleted) return;
            if (!currentSubtaskProgress?.taskProgressId) {
                message.error('Tiến độ nhiệm vụ chưa sẵn sàng. Vui lòng thử lại!');
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
        },
        [ currentSubtaskProgress, createQuizHistory, fetchProgressDetail, hasCompleted ],
    );

    /**
     * Nộp câu hỏi trắc nghiệm - chỉ nộp khi học viên đã bấm đúng đáp án (isCorrect = true)
     * Gắn với studentTaskProgressId và taskQuestionId của câu hỏi trắc nghiệm
     */
    const handleQuizAnswerSubmit = useCallback(
        async ({ taskQuestionId, answer, isCorrect }) => {
            if (hasCompleted) return;
            if (!currentSubtaskProgress?.taskProgressId) {
                message.error('Tiến độ nhiệm vụ chưa sẵn sàng. Vui lòng thử lại!');
                return;
            }

            if (!taskQuestionId) {
                message.error('Không tìm thấy câu hỏi để lưu đáp án');
                return;
            }

            const normalizedQuestionId = String(taskQuestionId);
            setLocalQuizAnswers((prev) => ({
                ...prev,
                [normalizedQuestionId]: { answer, isCorrect },
            }));

            try {
                const submitRes = await createQuizHistory({
                    dataBody: {
                        studentTaskProgressId: currentSubtaskProgress.taskProgressId,
                        taskQuestionId,
                        answer,
                        isCorrect,
                    },
                });
                if (submitRes?.result === false) {
                    setLocalQuizAnswers((prev) => {
                        const next = { ...prev };
                        delete next[normalizedQuestionId];
                        return next;
                    });
                    message.error('Có lỗi xảy ra khi lưu đáp án!');
                    return;
                }

                if (isCorrect) {
                    message.success('Lưu đáp án đúng thành công!');
                } else {
                    message.warning('Đáp án chưa chính xác, vui lòng thử lại!');
                }

                fetchProgressDetail({
                    pathParams: { id: currentSubtaskProgress.taskProgressId },
                });
            } catch (err) {
                setLocalQuizAnswers((prev) => {
                    const next = { ...prev };
                    delete next[normalizedQuestionId];
                    return next;
                });
                message.error('Có lỗi xảy ra khi lưu đáp án!');
            }
        },
        [ currentSubtaskProgress, createQuizHistory, fetchProgressDetail, hasCompleted ],
    );

    /**
     * Validate điều kiện trước khi hoàn thành Task Con:
     * - Nếu Task Con yêu cầu nộp File hoặc Text: kiểm tra xem đã nộp chưa
     * - Nếu Task Con có câu hỏi trắc nghiệm: kiểm tra xem đã trả lời đúng chưa
     */
    const validateCurrentSubtask = useCallback(() => {
        if (requiresFileUpload && !previousFile) {
            message.warning('Vui lòng nộp file trước khi tiếp tục');
            return false;
        }

        if (requiresTextResponse && !previousText) {
            message.warning('Vui lòng nộp câu trả lời trước khi tiếp tục');
            return false;
        }

        if (!hasRequiredQuizSubmissions) {
            message.warning('Vui lòng trả lời đúng các câu hỏi trắc nghiệm trước khi tiếp tục');
            return false;
        }

        return true;
    }, [ hasRequiredQuizSubmissions, previousFile, previousText, requiresFileUpload, requiresTextResponse ]);

    const getSubtasksForParent = useCallback(
        (parentTaskId) => {
            const list = taskListData?.content || [];
            return list
                .filter(
                    (t) =>
                        t &&
                        t.kind === 2 &&
                        (t.parent?.id === parentTaskId || t.parentId === parentTaskId || t.taskId === parentTaskId),
                )
                .sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0));
        },
        [ taskListData ],
    );

    /**
     * Case 2: Xử lý bấm nút Tiếp tục
     * 1. Validate điều kiện nộp bài (file/text/quiz)
     * 2. Nếu đã nộp đủ, gọi complete cho Task Con hiện tại
     * 3. Nếu còn Task Con tiếp theo trong Task Cha: chuyển sang Task Con tiếp theo, tạo tiến độ mới nếu cần
     * 4. Nếu đây là Task Con cuối của Task Cha: complete Task Cha, tìm Task Cha tiếp theo
     * 5. Nếu không còn Task Cha tiếp theo: thông báo hoàn thành toàn bộ
     */
    const handleContinue = useCallback(async () => {
        if (isContinuing) return;
        if (!selectedSubtaskId || !selectedParentTask) {
            message.error('Không tìm thấy nhiệm vụ hiện tại');
            return;
        }

        setIsContinuing(true);
        try {
            if (hasCompleted) {
                const nextSubtask = subtasks[activeSubtaskIndex + 1];
                if (nextSubtask) {
                    setSelectedSubtaskId(nextSubtask.id);
                    return;
                }

                const activeParentIndex = parentTasks.findIndex((task) => task.id === selectedParentTask.id);
                const nextParentTask = parentTasks[activeParentIndex + 1];

                if (!nextParentTask) {
                    navigate(`/simulations/${simulationId}/completed`);
                    return;
                }

                const nextParentSubtasks = getSubtasksForParent(nextParentTask.id);
                const firstNextSubtask = nextParentSubtasks[0];

                setSelectedParentTaskId(nextParentTask.id);
                setSelectedSubtaskId(firstNextSubtask?.id || null);
                return;
            }

            if (!currentSubtaskProgress?.taskProgressId) {
                message.error('Tiến độ nhiệm vụ chưa sẵn sàng. Vui lòng thử lại!');
                return;
            }

            if (!validateCurrentSubtask()) {
                return;
            }

            // Complete Task Con hiện tại
            await completeTaskProgress({
                dataBody: { taskId: selectedSubtaskId },
            });

            // Kiểm tra còn Task Con tiếp theo không
            const nextSubtask = subtasks[activeSubtaskIndex + 1];
            if (nextSubtask) {
                // Tạo tiến độ cho Task Con tiếp theo nếu chưa có
                await ensureTaskProgress(nextSubtask.id);
                setSelectedSubtaskId(nextSubtask.id);
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
                return;
            }

            // Đây là Task Con cuối cùng của Task Cha hiện tại -> Complete Task Cha
            await completeTaskProgress({
                dataBody: { taskId: selectedParentTask.id },
            });

            const activeParentIndex = parentTasks.findIndex((task) => task.id === selectedParentTask.id);
            const nextParentTask = parentTasks[activeParentIndex + 1];

            // Không còn Task Cha tiếp theo -> Hoàn thành toàn bộ mô phỏng
            if (!nextParentTask) {
                refetchProgress({
                    params: { simulationEnrollmentId },
                });

                // Sửa BUG-06: Refetch enrollment để cập nhật ngay trạng thái hasCompleted = true lên UI
                checkEnrollment({
                    params: { simulationId: parseInt(simulationId) },
                });

                setIsGeneratingCert(true);
                let filePath = null;
                try {
                    const simulationTitle =
                        simulationDetail?.title || selectedParentTask?.simulation?.title || 'Bài mô phỏng';
                    const username = profile?.username || '';

                    // 1. Lấy danh sách thành tựu của học viên trước
                    const achRes = await fetchAchievements();
                    const achievements = achRes?.data?.content || achRes?.content || [];
                    const currentAch = achievements.find((ach) => ach.simulation?.id === parseInt(simulationId, 10));

                    filePath = currentAch?.filePath;

                    if (!filePath) {
                        // 2. Tạo chứng chỉ nếu chưa có
                        const certRes = await uploadCertificate({
                            dataBody: {
                                simulationTitle,
                                username,
                            },
                        });

                        filePath = certRes?.data?.filePath || certRes?.filePath;
                        if (!filePath) {
                            throw new Error('Không nhận được tệp chứng chỉ từ máy chủ.');
                        }

                        if (currentAch) {
                            // 3. Cập nhật đường dẫn chứng chỉ vào thành tựu
                            await updateAchievement({
                                dataBody: {
                                    id: currentAch.id,
                                    filePath,
                                },
                            });
                        }
                    }

                    message.success('Chúc mừng bạn đã hoàn thành toàn bộ bài mô phỏng!');
                } catch (certErr) {
                    message.error('Hoàn thành bài mô phỏng nhưng không thể tạo chứng chỉ. Vui lòng thử lại sau.');
                } finally {
                    setIsGeneratingCert(false);
                    navigate(`/simulations/${simulationId}/completed`);
                }
                return;
            }

            // Tạo tiến độ cho Task Cha tiếp theo và Task Con đầu tiên của nó
            const nextParentSubtasks = getSubtasksForParent(nextParentTask.id);
            const firstNextSubtask = nextParentSubtasks[0];

            await ensureTaskProgress(nextParentTask.id);
            if (firstNextSubtask) {
                await ensureTaskProgress(firstNextSubtask.id);
            }

            setSelectedParentTaskId(nextParentTask.id);
            setSelectedSubtaskId(firstNextSubtask?.id || null);
            refetchProgress({
                params: { simulationEnrollmentId },
            });
        } catch (err) {
            message.error('Có lỗi xảy ra khi lưu tiến độ. Vui lòng thử lại');
        } finally {
            setIsContinuing(false);
        }
    }, [
        activeSubtaskIndex,
        completeTaskProgress,
        currentSubtaskProgress?.taskProgressId,
        ensureTaskProgress,
        getSubtasksForParent,
        parentTasks,
        refetchProgress,
        selectedParentTask,
        selectedSubtaskId,
        simulationEnrollmentId,
        subtasks,
        validateCurrentSubtask,
        profile,
        uploadCertificate,
        fetchAchievements,
        updateAchievement,
        simulationId,
        simulationDetail,
        hasCompleted,
        isContinuing,
        navigate,
        checkEnrollment,
    ]);

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
        companyLogo:
            companyLogo ||
            simulationDetail?.educator?.organization?.logoUrl ||
            selectedParentTask?.simulation?.educator?.organization?.logoUrl,

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
        hasCompleted,
        isLastSubtask: isLastSubtaskOverall,

        // Navigation
        canGoBack,
        canGoNext,
        onBack: handleBack,
        onNext: handleContinue,

        // Submission
        requiresFileUpload,
        requiresTextResponse,
        previousFile,
        previousText,
        onFileChange: handleFileUpload,
        onTextResponseSubmit: handleTextResponseSubmit,
        quizSubmissionMap,
        questionMap,
        onQuizAnswerSubmit: handleQuizAnswerSubmit,

        // Profile details
        profile,

        // Certificate and congrats
        isGeneratingCert,
        isContinuing,

        // Comments
        comments: commentsData?.content || [],
        commentsLoading,
        showComments,
        setShowComments,
        onSendComment: handleCreateComment,
        onUpdateComment: handleUpdateComment,
    };

    const loading =
        progressLoading ||
        detailLoading ||
        taskListLoading ||
        progressDetailLoading ||
        enrollmentLoading ||
        !enrollmentData;
    const error = progressError || detailError || taskListError;

    // Show error if checkEnrollment finished and no simulationEnrollmentId is found
    if (!loading && !simulationEnrollmentId) {
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
