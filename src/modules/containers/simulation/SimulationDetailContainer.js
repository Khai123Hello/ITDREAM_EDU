import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import { USER_KIND_STUDENT } from '@constants/index';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import SimulationDetailDesktop from '@modules/layout/desktop/simulation/SimulationDetailDesktop';
import { getCacheUserKind } from '@services/userService';
import { message } from 'antd';

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
    const [ isEnrolled, setIsEnrolled ] = useState(false);
    const [ enrollmentLoading, setEnrollmentLoading ] = useState(false);
    const [ simulationEnrollmentId, setSimulationEnrollmentId ] = useState(null);

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
    }, [ simulationId, isAuthenticated, fetchStudent, fetchGuest ]);

    // Fetch tasks when simulationId changes
    React.useEffect(() => {
        if (!simulationId) return;

        const params = { simulationId: parseInt(simulationId) };
        fetchGuestTasks({ params });
    }, [ simulationId, fetchGuestTasks ]);

    // Check enrollment status on mount if authenticated
    React.useEffect(() => {
        if (isAuthenticated && simulationId) {
            checkEnrollment({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [ isAuthenticated, simulationId, checkEnrollment ]);

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
    }, [ enrollmentData, simulationId ]);

    const handleRetry = useCallback(() => {
        if (simulationId) {
            const pathParams = { id: simulationId };

            if (isAuthenticated) {
                fetchStudent({ pathParams });
            } else {
                fetchGuest({ pathParams });
            }
        }
        if (isAuthenticated) {
            checkEnrollment({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [ simulationId, isAuthenticated, fetchStudent, fetchGuest, checkEnrollment ]);

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

            if (result && result.id) {
                message.success('Đăng ký tham gia dự án thành công!');
                setIsEnrolled(true);
                setSimulationEnrollmentId(result.id);
                // Refresh enrollment data
                checkEnrollment({
                    params: { simulationId: parseInt(simulationId) },
                });
                
                // Store enrollment success flag for TaskDoing page to show notification on reload
                sessionStorage.setItem(`enrollmentSuccess-${simulationId}`, 'true');
            } else {
                message.error(result?.message || 'Đăng ký thất bại. Vui lòng thử lại');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại');
        } finally {
            setEnrollmentLoading(false);
        }
    }, [ simulationId, isAuthenticated, enrollToSimulation, checkEnrollment, navigate ]);

    // Handle login button click
    const handleLogin = useCallback(() => {
        navigate('/login');
    }, [ navigate ]);

    // Check if user is a student (for UI logic)
    const isStudent = useMemo(() => {
        if (!isAuthenticated) return false;
        const userKind = getCacheUserKind();
        return userKind === USER_KIND_STUDENT;
    }, [ isAuthenticated ]);

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
                simulationEnrollmentId,
                companyLogo: simulationData?.educator?.organization?.logoUrl,
            },
        });
    }, [ simulationId, isAuthenticated, isEnrolled, simulationEnrollmentId, navigate, simulationData ]);

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
        />
    );
}

export default SimulationDetailContainer;
