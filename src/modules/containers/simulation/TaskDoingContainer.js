import React, { useCallback, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
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

const isQuizSubmissionCorrect = (submission = {}) => {
    if (submission.isCorrect === true || submission.isCorrect === 1) {
        return true;
    }

    // Chỉ lưu đáp án khi học viên trả lời đúng; API có thể không trả isCorrect
    return getSubmissionQuestionId(submission) != null && Boolean(getSubmissionAnswer(submission));
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
    return key ? questionMap[key] ?? null : null;
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
    
    // Show enrollment success notification on reload if it was shown during enrollment
    React.useEffect(() => {
        if (simulationEnrollmentId && sessionStorage.getItem(`enrollmentSuccess-${simulationId}`)) {
            message.success('Đăng ký tham gia dự án thành công!');
            // Clear the flag to avoid showing it again on subsequent loads
            sessionStorage.removeItem(`enrollmentSuccess-${simulationId}`);
        }
    }, [ simulationEnrollmentId, simulationId ]);

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

    const { execute: uploadFile } = useFetch(apiConfig.file.upload, {}, false);
    const { execute: createQuizHistory } = useFetch(apiConfig.questionQuizHistory.create, {}, false);
    const { execute: fetchTaskQuestions } = useFetch(
        apiConfig.taskQuestion.studentList,
        {
            mappingData: (res) => res.data?.content || [],
        },
        false,
    );

    // State to store mapping of question text to question ID
    const [ questionMap, setQuestionMap ] = useState({});
    // Đáp án quiz đã xác nhận đúng trên UI, dùng khi progressDetail chưa kịp refetch
    const [ localQuizAnswers, setLocalQuizAnswers ] = useState({});

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

    const progressList = useMemo(() => taskProgressData?.content || [], [ taskProgressData ]);

    // Map task progress by task ID
    const taskProgressMap = useMemo(() => {
        const progressMap = {};

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
    }, [ progressList ]);

    // Get parent tasks and subtasks for the selected parent task
    const { parentTasks, defaultSelectedParentId, subtasks } = useTaskHierarchy(taskListData, selectedParentTaskId);

    const initializedProgressRef = React.useRef(false);
    const appliedResumeRef = React.useRef(false);

    const ensureTaskProgress = useCallback(async (taskId) => {
        if (!taskId) return null;

        const existing = taskProgressMap[taskId];
        if (existing?.taskProgressId) {
            return existing;
        }

        const result = await createTaskProgress({
            dataBody: {
                simulationEnrollmentId,
                taskId,
            },
        });

        return result?.id ? { taskProgressId: result.id, status: result.status || 'in_progress' } : null;
    }, [ createTaskProgress, simulationEnrollmentId, taskProgressMap ]);

    /**
     * Case 1.1: Nếu studentList trả về rỗng (Học viên chưa làm Simulation),
     * tự động tạo tiến độ cho Task Cha đầu tiên và Task Con đầu tiên của nó.
     */
    React.useEffect(() => {
        if (
            initializedProgressRef.current ||
            !simulationEnrollmentId ||
            taskListLoading ||
            progressLoading ||
            parentTasks.length === 0 ||
            !taskProgressData
        ) {
            return;
        }

        const initializeFirstProgress = async () => {
            initializedProgressRef.current = true;

            // Nếu progressList đã có dữ liệu, không cần tạo mới tiến độ đầu tiên
            if (progressList.length > 0) {
                return;
            }

            const firstParentTask = parentTasks[0];
            const firstSubtask = subtasks[0];

            if (!firstParentTask || !firstSubtask) {
                return;
            }

            try {
                // Tạo tiến độ cho Task Cha đầu tiên
                await ensureTaskProgress(firstParentTask.id);
                // Tạo tiến độ cho Task Con đầu tiên của Task Cha đó
                await ensureTaskProgress(firstSubtask.id);
                setSelectedParentTaskId(firstParentTask.id);
                setSelectedSubtaskId(firstSubtask.id);
                refetchProgress({
                    params: { simulationEnrollmentId },
                });
            } catch {
                message.error('Không thể khởi tạo tiến độ bài học. Vui lòng thử lại');
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
            !taskListData
        ) {
            return;
        }

        // Sort: parentOrder giảm dần, subtaskOrder tăng dần -> phần tử cuối có x cao nhất, y cao nhất trong x đó
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
        const latestTask = latestItem.progress.task;

        if (!latestTask?.id) {
            return;
        }

        appliedResumeRef.current = true;
        const parentId = latestTask.parent?.id || latestTask.parentId || latestTask.taskId;

        if (parentId) {
            setSelectedParentTaskId(parentId);
        }
        setSelectedSubtaskId(latestTask.id);
    }, [ parentTasks, progressList, taskListData ]);

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
            }).then((response) => {
                if (!response || response?.result === false) {
                    setQuestionMap({});
                    return;
                }

                setQuestionMap(buildQuestionMap(response?.data?.content));
            }).catch(() => {
                setQuestionMap({});
            });
        } else {
            setQuestionMap({});
        }
    }, [ selectedSubtaskId, fetchTaskQuestions ]);

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
    const canGoNext = activeSubtaskIndex >= 0;

    // Handle back button
    const handleBack = useCallback(() => {
        if (canGoBack) {
            setSelectedSubtaskId(subtasks[activeSubtaskIndex - 1].id);
        }
    }, [ canGoBack, subtasks, activeSubtaskIndex ]);

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

    // Extract previous submissions từ data.content của studentGet
    const submissions = useMemo(() => {
        return getSubmissions(progressDetail);
    }, [ progressDetail ]);

    // Tìm câu trả lời file đã nộp trước (answear không có taskQuestion)
    const previousFile = useMemo(() => {
        if (!requiresFileUpload) return null;
        const found = submissions.find((s) => !s.taskQuestion && (getSubmissionAnswer(s).includes('/') || getSubmissionAnswer(s).includes('.')));
        return found ? getSubmissionAnswer(found) : null;
    }, [ submissions, requiresFileUpload ]);

    // Tìm câu trả lời text đã nộp trước (answear không có taskQuestion)
    const previousText = useMemo(() => {
        if (!requiresTextResponse) return '';
        const found = submissions.find((s) => !s.taskQuestion && !(getSubmissionAnswer(s).includes('/') || getSubmissionAnswer(s).includes('.')));
        return found ? getSubmissionAnswer(found) : '';
    }, [ submissions, requiresTextResponse ]);

    // Extract quiz blocks từ content của subtask
    const quizBlocks = useMemo(() => extractQuizBlocks(subtaskDetail?.content), [ subtaskDetail?.content ]);

    // Map quiz submissions theo taskQuestionId (chỉ câu đã có taskQuestion.id mới là trắc nghiệm)
    const quizSubmissionMap = useMemo(() => {
        const map = {};
        submissions.forEach((submission) => {
            const questionId = getSubmissionQuestionId(submission);
            if (questionId) {
                map[questionId] = {
                    answer: getSubmissionAnswer(submission),
                    isCorrect: isQuizSubmissionCorrect(submission),
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
    const handleFileUpload = useCallback(async (file) => {
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
    }, [ currentSubtaskProgress, uploadFile, createQuizHistory, fetchProgressDetail ]);

    // Handle text response submit - lưu câu trả lời text vào studentSubmission
    const handleTextResponseSubmit = useCallback(async (text) => {
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
    }, [ currentSubtaskProgress, createQuizHistory, fetchProgressDetail ]);

    /**
     * Nộp câu hỏi trắc nghiệm - chỉ nộp khi học viên đã bấm đúng đáp án (isCorrect = true)
     * Gắn với studentTaskProgressId và taskQuestionId của câu hỏi trắc nghiệm
     */
    const handleQuizAnswerSubmit = useCallback(async ({ taskQuestionId, answer, isCorrect }) => {
        if (!isCorrect) {
            return;
        }

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
            [normalizedQuestionId]: { answer, isCorrect: true },
        }));

        try {
            const submitRes = await createQuizHistory({
                dataBody: {
                    studentTaskProgressId: currentSubtaskProgress.taskProgressId,
                    taskQuestionId,
                    answer,
                    isCorrect: true,
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

            message.success('Lưu đáp án đúng thành công!');
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
    }, [ currentSubtaskProgress, createQuizHistory, fetchProgressDetail ]);

    // Get selected parent task details
    const selectedParentTask = useMemo(() => {
        return parentTasks.find((t) => t.id === defaultSelectedParentId);
    }, [ parentTasks, defaultSelectedParentId ]);

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

    const getSubtasksForParent = useCallback((parentTaskId) => {
        const list = taskListData?.content || [];
        return list
            .filter(
                (t) =>
                    t &&
                    t.kind === 2 &&
                    (t.parent?.id === parentTaskId || t.parentId === parentTaskId || t.taskId === parentTaskId),
            )
            .sort((a, b) => (a.orderInParent || 0) - (b.orderInParent || 0));
    }, [ taskListData ]);

    /**
     * Case 2: Xử lý bấm nút Tiếp tục
     * 1. Validate điều kiện nộp bài (file/text/quiz)
     * 2. Nếu đã nộp đủ, gọi complete cho Task Con hiện tại
     * 3. Nếu còn Task Con tiếp theo trong Task Cha: chuyển sang Task Con tiếp theo, tạo tiến độ mới nếu cần
     * 4. Nếu đây là Task Con cuối của Task Cha: complete Task Cha, tìm Task Cha tiếp theo
     * 5. Nếu không còn Task Cha tiếp theo: thông báo hoàn thành toàn bộ
     */
    const handleContinue = useCallback(async () => {
        if (!selectedSubtaskId || !selectedParentTask) {
            message.error('Không tìm thấy nhiệm vụ hiện tại');
            return;
        }

        if (!currentSubtaskProgress?.taskProgressId) {
            message.error('Tiến độ nhiệm vụ chưa sẵn sàng. Vui lòng thử lại!');
            return;
        }

        if (!validateCurrentSubtask()) {
            return;
        }

        try {
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
                message.success('Bạn đã hoàn thành toàn bộ bài mô phỏng!');
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
