import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import { USER_KIND_STUDENT } from '@constants/index';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import SimulationDetailDesktop from '@modules/layout/desktop/simulation/SimulationDetailDesktop';
import { getCacheUserKind } from '@services/userService';
import { message } from 'antd';

export const FEEDBACKS_PAGE_SIZE = 5;
export const INITIAL_PAGE = 0;

/**
 * SimulationDetailContainer
 * Fetch simulation data (uses student_get if authenticated, guestDetail otherwise)
 * Check enrollment status and handle enrollment
 * Handle navigation to task doing page
 */
function SimulationDetailContainer() {
    const { id: simulationId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [simulationEnrollmentId, setSimulationEnrollmentId] = useState(null);
    const [feedbacksPage, setFeedbacksPage] = useState(INITIAL_PAGE);
    const [allFeedbacks, setAllFeedbacks] = useState([]);

    // Fetch simulation detail - guest version
    const {
        data: guestSimulationData,
        loading: guestLoading,
        error: guestError,
        execute: fetchGuest,
    } = useFetch(
        apiConfig.simulation.guestDetail,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Fetch simulation detail - student version
    const {
        data: studentSimulationData,
        loading: studentLoading,
        error: studentError,
        execute: fetchStudent,
    } = useFetch(
        apiConfig.simulation.studentGet,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Check enrollment status
    const { data: enrollmentData, execute: checkEnrollment } = useFetch(
        apiConfig.simulationEnrollment.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Enroll to simulation
    const { execute: enrollToSimulation } = useFetch(
        apiConfig.simulationEnrollment.create,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Fetch feedback list
    const {
        data: feedbacksData,
        loading: feedbacksLoading,
        execute: fetchFeedbacks,
    } = useFetch(
        apiConfig.feedback.clientList,
        {
            mappingData: (res) => res.data || {},
        },
        false, // Don't auto-fetch
    );

    // Update allFeedbacks when feedbacksData changes
    React.useEffect(() => {
        if (feedbacksData?.content) {
            if (feedbacksPage === INITIAL_PAGE) {
                setAllFeedbacks(feedbacksData.content);
            } else {
                setAllFeedbacks((prev) => {
                    // Prevent duplicate appends in strict mode or rapid calls
                    const newItems = feedbacksData.content.filter((item) => !prev.some((p) => p.id === item.id));
                    return [...prev, ...newItems];
                });
            }
        } else if (feedbacksPage === INITIAL_PAGE) {
            setAllFeedbacks([]);
        }
    }, [feedbacksData, feedbacksPage]);

    const handleLoadMoreFeedbacks = useCallback(() => {
        const nextPage = feedbacksPage + 1;
        setFeedbacksPage(nextPage);
        fetchFeedbacks({
            params: { simulationId: parseInt(simulationId), page: nextPage, size: FEEDBACKS_PAGE_SIZE },
        });
    }, [feedbacksPage, simulationId, fetchFeedbacks]);

    // Create feedback
    const { execute: createReview } = useFetch(
        apiConfig.feedback.create,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Update feedback
    const { execute: updateReview } = useFetch(
        apiConfig.feedback.update,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Determine which data to use
    const simulationData = isAuthenticated ? studentSimulationData : guestSimulationData;
    const loading = isAuthenticated ? studentLoading : guestLoading;
    const error = isAuthenticated ? studentError : guestError;

    // Fetch tasks for this simulation (always guest view)
    const {
        data: guestTasksData,
        loading: guestTasksLoading,
        error: guestTasksError,
        execute: fetchGuestTasks,
    } = useFetch(
        apiConfig.task.guestList,
        {
            mappingData: (res) => (res.data && res.data.content ? res.data.content : []),
        },
        false,
    );

    const tasks = guestTasksData || [];
    const tasksLoading = guestTasksLoading;
    const tasksError = guestTasksError;

    // Fetch simulation on mount
    React.useEffect(() => {
        if (simulationId) {
            const pathParams = { id: simulationId };

            if (isAuthenticated) {
                fetchStudent({ pathParams });
            } else {
                fetchGuest({ pathParams });
            }
        }
    }, [simulationId, isAuthenticated, fetchStudent, fetchGuest]);

    // Fetch tasks when simulationId changes
    React.useEffect(() => {
        if (!simulationId) return;

        const params = { simulationId: parseInt(simulationId) };
        fetchGuestTasks({ params });
    }, [simulationId, fetchGuestTasks]);

    // Check enrollment and feedback status on mount if authenticated
    React.useEffect(() => {
        if (simulationId) {
            setFeedbacksPage(INITIAL_PAGE);
            setAllFeedbacks([]);
            fetchFeedbacks({
                params: { simulationId: parseInt(simulationId), page: INITIAL_PAGE, size: FEEDBACKS_PAGE_SIZE },
            });
            if (isAuthenticated) {
                checkEnrollment({
                    params: { simulationId: parseInt(simulationId) },
                });
            }
        }
    }, [isAuthenticated, simulationId, checkEnrollment, fetchFeedbacks]);

    // Check if already enrolled and get simulationEnrollmentId
    React.useEffect(() => {
        if (enrollmentData?.content) {
            const enrollment = enrollmentData.content.find((e) => e.simulation?.id === parseInt(simulationId));
            if (enrollment) {
                setIsEnrolled(true);
                setSimulationEnrollmentId(enrollment.id);
            } else {
                setIsEnrolled(false);
                setSimulationEnrollmentId(null);
            }
        }
    }, [enrollmentData, simulationId]);

    const handleRetry = useCallback(() => {
        if (simulationId) {
            const pathParams = { id: simulationId };

            if (isAuthenticated) {
                fetchStudent({ pathParams });
            } else {
                fetchGuest({ pathParams });
            }
            setFeedbacksPage(INITIAL_PAGE);
            setAllFeedbacks([]);
            fetchFeedbacks({
                params: { simulationId: parseInt(simulationId), page: INITIAL_PAGE, size: FEEDBACKS_PAGE_SIZE },
            });
        }
        if (isAuthenticated) {
            checkEnrollment({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [simulationId, isAuthenticated, fetchStudent, fetchGuest, checkEnrollment, fetchFeedbacks]);

    // Handle enrollment button click
    const handleEnroll = useCallback(async () => {
        if (!isAuthenticated) {
            // Not logged in - should not reach here as button should show login instead
            navigate('/login');
            return;
        }

        // Check if user is a student
        const userKind = getCacheUserKind();
        if (userKind !== USER_KIND_STUDENT) {
            message.error('Chỉ học viên mới có thể tham gia dự án này');
            return;
        }

        setEnrollmentLoading(true);
        try {
            const result = await enrollToSimulation({
                dataBody: { simulationId: parseInt(simulationId) },
            });

            const enrollmentId =
                result?.id ||
                result?.data?.id ||
                (typeof result?.data === 'number' || typeof result?.data === 'string' ? result.data : null);
            const isSuccess = result?.result === true || Boolean(enrollmentId);

            if (isSuccess) {
                message.success('Đăng ký tham gia dự án thành công!');
                setIsEnrolled(true);
                setSimulationEnrollmentId(enrollmentId);
                // Refresh enrollment data
                checkEnrollment({
                    params: { simulationId: parseInt(simulationId) },
                });

                // Store enrollment success flag for TaskDoing page to show notification on reload
                sessionStorage.setItem(`enrollmentSuccess-${simulationId}`, 'true');

                // Navigate to task doing page with simulationEnrollmentId immediately
                navigate(`/simulations/${simulationId}/task`, {
                    state: {
                        companyLogo: simulationData?.educator?.organization?.logoUrl,
                    },
                });
            } else {
                message.error(result?.message || 'Đăng ký thất bại. Vui lòng thử lại');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại');
        } finally {
            setEnrollmentLoading(false);
        }
    }, [simulationId, isAuthenticated, enrollToSimulation, checkEnrollment, navigate, simulationData]);

    // Handle login button click
    const handleLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    // Check if user is a student (for UI logic)
    const isStudent = useMemo(() => {
        if (!isAuthenticated) return false;
        const userKind = getCacheUserKind();
        return userKind === USER_KIND_STUDENT;
    }, [isAuthenticated]);

    // Handle start/continue task
    const handleStartTask = useCallback(() => {
        if (!isAuthenticated) {
            message.error('Vui lòng đăng nhập để bắt đầu bài tập');
            return;
        }

        if (!isEnrolled || !simulationEnrollmentId) {
            message.error('Vui lòng đăng ký tham gia dự án trước');
            return;
        }

        // Navigate to task doing page with simulationEnrollmentId
        navigate(`/simulations/${simulationId}/task`, {
            state: {
                companyLogo: simulationData?.educator?.organization?.logoUrl,
            },
        });
    }, [simulationId, isAuthenticated, isEnrolled, simulationEnrollmentId, navigate, simulationData]);

    const hasCompleted = useMemo(() => {
        if (enrollmentData?.content) {
            const enrollment = enrollmentData.content.find((e) => e.simulation?.id === parseInt(simulationId));
            return enrollment?.progress === 100;
        }
        return false;
    }, [enrollmentData, simulationId]);

    const handleSubmitReview = useCallback(
        async ({ content, star }) => {
            try {
                const result = await createReview({
                    data: {
                        content,
                        simulationId: parseInt(simulationId),
                        star,
                    },
                });
                const isSuccess = result?.result === true || result?.code === 'SUCCESS' || (result && !result.error);
                if (isSuccess) {
                    message.success('Gửi cảm nhận thành công!');
                    handleRetry();
                    return true;
                } else {
                    message.error(result?.message || 'Gửi cảm nhận thất bại');
                    return false;
                }
            } catch (err) {
                message.error('Gửi cảm nhận thất bại');
                return false;
            }
        },
        [simulationId, createReview, handleRetry],
    );

    const handleUpdateReview = useCallback(
        async ({ id, content, star }) => {
            try {
                const result = await updateReview({
                    data: {
                        id,
                        content,
                        star,
                    },
                });
                const isSuccess = result?.result === true || result?.code === 'SUCCESS' || (result && !result.error);
                if (isSuccess) {
                    message.success('Cập nhật cảm nhận thành công!');
                    handleRetry();
                    return true;
                } else {
                    message.error(result?.message || 'Cập nhật cảm nhận thất bại');
                    return false;
                }
            } catch (err) {
                message.error('Cập nhật cảm nhận thất bại');
                return false;
            }
        },
        [updateReview, handleRetry],
    );

    return (
        <SimulationDetailDesktop
            simulation={simulationData || {}}
            tasks={tasks}
            loading={loading || tasksLoading}
            error={error || tasksError}
            onRetry={handleRetry}
            isAuthenticated={isAuthenticated}
            isStudent={isStudent}
            isEnrolled={isEnrolled}
            enrollmentLoading={enrollmentLoading}
            onEnroll={handleEnroll}
            onLogin={handleLogin}
            onStartTask={handleStartTask}
            feedbacks={allFeedbacks}
            feedbacksLoading={feedbacksLoading}
            hasMoreFeedbacks={
                feedbacksData?.totalPages !== undefined
                    ? feedbacksData.totalPages > feedbacksPage + 1
                    : feedbacksData?.content?.length === FEEDBACKS_PAGE_SIZE
            }
            onLoadMoreFeedbacks={handleLoadMoreFeedbacks}
            hasCompleted={hasCompleted}
            onSubmitReview={handleSubmitReview}
            onUpdateReview={handleUpdateReview}
        />
    );
}

export default SimulationDetailContainer;
