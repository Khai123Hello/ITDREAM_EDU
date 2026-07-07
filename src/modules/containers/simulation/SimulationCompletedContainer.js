import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import SimulationCompletedPage from '@modules/layout/desktop/simulation/SimulationCompletedPage';
import { message } from 'antd';

function SimulationCompletedContainer() {
    const { id: simulationId } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [ isGeneratingCert, setIsGeneratingCert ] = useState(false);
    const [ hasTried, setHasTried ] = useState(false);

    // Fetch simulation detail
    const {
        data: simulationDetail,
        execute: fetchSimulationDetail,
        loading: simLoading,
    } = useFetch(
        apiConfig.simulation.studentGet,
        {
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Fetch achievements
    const {
        data: achievementsData,
        execute: fetchAchievements,
        loading: achLoading,
    } = useFetch(
        apiConfig.achievement.studentList,
        {
            params: {},
            mappingData: (res) => res.data?.content || res.content || [],
        },
        false,
    );

    // Fetch enrollment
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

    // Fetch task progress
    const {
        data: taskProgressData,
        loading: progressLoading,
        execute: fetchProgress,
    } = useFetch(
        apiConfig.taskProgress.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Fetch reviews
    const {
        data: reviewData,
        loading: reviewLoading,
        execute: fetchReviews,
    } = useFetch(
        apiConfig.reviewSubmission.studentList,
        {
            params: {},
            mappingData: (res) => res.data || {},
        },
        false,
    );

    // Create certificate API
    const { execute: uploadCertificate } = useFetch(apiConfig.file.uploadCertificate, {}, false);

    // Update achievement API
    const { execute: updateAchievement } = useFetch(apiConfig.achievement.update, {}, false);

    useEffect(() => {
        if (simulationId) {
            fetchSimulationDetail({
                pathParams: { id: simulationId },
            });
            fetchAchievements();
            checkEnrollment({
                params: { simulationId: parseInt(simulationId) },
            });
        }
    }, [ simulationId, fetchSimulationDetail, fetchAchievements, checkEnrollment ]);

    const enrollment = useMemo(() => {
        if (!enrollmentData?.content) return null;
        return enrollmentData.content.find((e) => e.simulation?.id === parseInt(simulationId));
    }, [ enrollmentData, simulationId ]);

    const simulationEnrollmentId = enrollment?.id;

    useEffect(() => {
        if (simulationEnrollmentId) {
            fetchProgress({
                params: { simulationEnrollmentId },
            });
            fetchReviews({
                params: { simulationEnrollmentId },
            });
        }
    }, [ simulationEnrollmentId, fetchProgress, fetchReviews ]);

    const subtaskFeedbacks = useMemo(() => {
        if (!taskProgressData?.content || !reviewData?.content) return [];
        const progressList = taskProgressData.content.filter((p) => p.task?.kind === 2);
        const reviews = reviewData.content;
        return progressList
            .map((progress) => {
                const taskReviews = reviews.filter((r) => r.studentTaskProgressId === progress.id);
                return {
                    subtask: progress.task,
                    reviews: taskReviews,
                };
            })
            .filter((item) => item.reviews.length > 0);
    }, [ taskProgressData, reviewData ]);

    const currentAch = useMemo(() => {
        if (!achievementsData) return null;
        return achievementsData.find((ach) => ach.simulation?.id === parseInt(simulationId, 10));
    }, [ achievementsData, simulationId ]);

    // Auto-generate certificate if missing filePath
    useEffect(() => {
        if (simLoading || achLoading || isGeneratingCert || hasTried || !simulationDetail || !currentAch) {
            return;
        }

        if (!currentAch.filePath) {
            const generateAndSaveCert = async () => {
                setHasTried(true);
                setIsGeneratingCert(true);
                try {
                    const simulationTitle = simulationDetail.title || currentAch.simulation?.title || 'Bài mô phỏng';
                    const fullName =
                        profile?.fullName ||
                        profile?.account?.fullName ||
                        currentAch.student?.profileAccountDto?.fullName ||
                        '';

                    // 1. Tạo chứng chỉ
                    const certRes = await uploadCertificate({
                        dataBody: {
                            simulationTitle,
                            fullName,
                        },
                    });

                    const newFilePath = certRes?.data?.filePath || certRes?.filePath;
                    if (!newFilePath) {
                        throw new Error('Không nhận được tệp chứng chỉ từ máy chủ.');
                    }

                    // 2. Cập nhật đường dẫn chứng chỉ vào thành tựu
                    await updateAchievement({
                        dataBody: {
                            id: currentAch.id,
                            filePath: newFilePath,
                        },
                    });

                    message.success('Chứng chỉ hoàn thành đã được tạo thành công!');
                    // 3. Tải lại danh sách thành tựu để cập nhật UI
                    fetchAchievements();
                } catch (err) {
                    message.error('Không thể tự động tạo tệp chứng chỉ PDF. Bạn vẫn có thể xem chứng chỉ giả lập.');
                } finally {
                    setIsGeneratingCert(false);
                }
            };

            generateAndSaveCert();
        }
    }, [
        currentAch,
        simulationDetail,
        simLoading,
        achLoading,
        isGeneratingCert,
        profile,
        uploadCertificate,
        updateAchievement,
        fetchAchievements,
    ]);

    const loading = simLoading || achLoading;
    const feedbacksLoading = progressLoading || reviewLoading || enrollmentLoading;

    const handleBackToDetail = () => {
        navigate(`/simulations/${simulationId}`);
    };

    return (
        <SimulationCompletedPage
            loading={loading}
            isGeneratingCert={isGeneratingCert}
            simulationDetail={simulationDetail}
            currentAch={currentAch}
            profile={profile}
            simulationId={simulationId}
            onBackToDetail={handleBackToDetail}
            subtaskFeedbacks={subtaskFeedbacks}
            feedbacksLoading={feedbacksLoading}
        />
    );
}

export default SimulationCompletedContainer;
