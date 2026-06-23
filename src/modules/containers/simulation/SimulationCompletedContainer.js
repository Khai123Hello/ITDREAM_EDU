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
    const [isGeneratingCert, setIsGeneratingCert] = useState(false);
    const [hasTried, setHasTried] = useState(false);

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
        }
    }, [simulationId, fetchSimulationDetail, fetchAchievements]);

    const currentAch = useMemo(() => {
        if (!achievementsData) return null;
        return achievementsData.find((ach) => ach.simulation?.id === parseInt(simulationId, 10));
    }, [achievementsData, simulationId]);

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
                    const username =
                        profile?.username ||
                        profile?.account?.username ||
                        currentAch.student?.profileAccountDto?.username ||
                        '';

                    // 1. Tạo chứng chỉ
                    const certRes = await uploadCertificate({
                        dataBody: {
                            simulationTitle,
                            username,
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
        />
    );
}

export default SimulationCompletedContainer;
