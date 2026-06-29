import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import { getDownloadUrl } from '@utils';
import { Button, Modal, Spin } from 'antd';

import styles from './index.module.scss';

const MOCK_ACHIEVEMENT = {
    icon: '🎯',
    title: 'Bắt đầu sự nghiệp ngay hôm nay',
    description: 'Tham gia mô phỏng dự án để nhận chứng chỉ và làm đẹp hồ sơ của bạn.',
};

function DashboardDesktop({
    profile,
    enrolledSims = [],
    enrolledUrlBase = '',
    achievements = [],
    allSimulations = [],
    organizations = [],
    loading,
}) {
    const navigate = useNavigate();
    const name = profile?.fullName || profile?.account?.fullName || '';
    const [ dismissedOrgs, setDismissedOrgs ] = useState([]);

    const [ previewModalVisible, setPreviewModalVisible ] = useState(false);
    const [ previewLoading, setPreviewLoading ] = useState(false);
    const [ previewUrl, setPreviewUrl ] = useState(null);
    const [ currentDownloadUrl, setCurrentDownloadUrl ] = useState(null);
    const [ currentFileName, setCurrentFileName ] = useState('');

    const handlePreviewCertificate = async (e, downloadUrl, fileName) => {
        e.preventDefault();
        setPreviewModalVisible(true);
        setPreviewLoading(true);
        setPreviewUrl(null);
        setCurrentDownloadUrl(downloadUrl);
        setCurrentFileName(fileName);
        try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setPreviewUrl(objectUrl);
        } catch (error) {
            console.error('Failed to load certificate preview:', error);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleCardClick = (simId) => {
        navigate(`/simulations/${simId}`);
    };

    const handleResumeClick = (e, item, sim) => {
        e.stopPropagation();
        navigate(`/simulations/${sim.id}/task`, {
            state: {
                simulationEnrollmentId: item.id,
                companyLogo: sim.educator?.organization?.logoUrl,
            },
        });
    };

    const hasFullName = !!(profile?.fullName || profile?.account?.fullName);
    const hasEmail = !!(profile?.email || profile?.account?.email);
    const hasPhone = !!(profile?.phone || profile?.account?.phone);

    const preferences = profile?.preferences || [];
    const hasSpecialization = preferences.some((p) => p.specializationId && p.specializationId !== 0);
    const hasOrganization = preferences.some((p) => p.organizationId && p.organizationId !== 0);

    const completionStatus = [ hasFullName, hasEmail, hasPhone, hasSpecialization, hasOrganization ];
    const completedCount = completionStatus.filter(Boolean).length;
    const missingCount = 5 - completedCount;
    const isProfileComplete = completedCount === 5;

    // Filter enrolled simulations in progress (progress < 100)
    const activeEnrolledSims = enrolledSims.filter((item) => item.progress < 100);

    // Calculate recommended simulations based on preferences
    const enrolledIds = enrolledSims.map((item) => item.simulation?.id).filter(Boolean);
    const nonEnrolledSims = allSimulations.filter((sim) => !enrolledIds.includes(sim.id));

    const prefSpecIds = preferences.map((p) => p.specializationId).filter(Boolean);
    const prefOrgIds = preferences.map((p) => p.organizationId).filter(Boolean);

    let recommendedSims = nonEnrolledSims.filter((sim) => {
        const matchesSpec = sim.category?.id && prefSpecIds.includes(sim.category.id);
        const matchesOrg = sim.educator?.organization?.id && prefOrgIds.includes(sim.educator.organization.id);
        return matchesSpec || matchesOrg;
    });

    // Fallback if no matching preferences or no preferences selected
    if (recommendedSims.length === 0) {
        recommendedSims = nonEnrolledSims.slice(0, 3);
    } else {
        recommendedSims = recommendedSims.slice(0, 3);
    }

    // Level label helper
    const getLevelLabel = (level) => {
        const config = {
            1: 'Cơ bản',
            2: 'Trung cấp',
            3: 'Nâng cao',
        };
        return config[level] || 'Cơ bản';
    };

    // Dynamically construct TOP_CARDS
    const dynamicCards = [];

    // 1. Profile incomplete card (only if not completed)
    if (!isProfileComplete) {
        const badgeDots = completionStatus.map((completed) => (completed ? 'completed' : 'empty'));
        dynamicCards.push({
            badgeDots,
            title: 'Hồ sơ của bạn chưa hoàn thiện',
            description: `Bạn cần cập nhật thêm ${missingCount} thông tin để hoàn thiện hồ sơ.`,
            link: '/profile',
            linkText: 'Cập nhật hồ sơ',
        });
    }

    // 2. Active simulations to resume
    activeEnrolledSims.slice(0, 1).forEach((item) => {
        const sim = item.simulation || {};
        const org = sim.educator?.organization || {};
        dynamicCards.push({
            resume: true,
            company: org.shortName || org.name || 'Tổ chức',
            role: sim.title || 'Bài mô phỏng',
            link: `/simulations/${sim.id}/task`,
            linkState: {
                simulationEnrollmentId: item.id,
                companyLogo: org.logoUrl,
            },
            linkText: 'Tiếp tục',
            simId: sim.id,
        });
    });

    // 3. Recommended simulations
    recommendedSims.slice(0, 2).forEach((sim) => {
        const org = sim.educator?.organization || {};
        dynamicCards.push({
            recommended: true,
            company: org.shortName || org.name || 'Tổ chức',
            role: sim.title,
            link: `/simulations/${sim.id}`,
            linkText: 'Bắt đầu',
            simId: sim.id,
        });
    });

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.greeting}>Xin chào{name ? `, ${name}!` : '!'}</h1>

                {dynamicCards.length > 0 && (
                    <div className={styles.topCards}>
                        {dynamicCards.map((card, idx) => (
                            <div key={idx} className={styles.topCard}>
                                {card.badgeDots && (
                                    <div className={styles.badgeRow}>
                                        {card.badgeDots.map((type, i) => (
                                            <div
                                                key={i}
                                                className={`${styles.badgeDot} ${styles[`dot${type.charAt(0).toUpperCase()}${type.slice(1)}`]}`}
                                            />
                                        ))}
                                    </div>
                                )}
                                {card.recommended && (
                                    <div className={styles.recommendedBadge}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                                        </svg>
                                        Gợi ý cho bạn!
                                    </div>
                                )}
                                {card.resume && <div className={styles.recommendedBadge}>Tiếp tục bài mô phỏng</div>}
                                <div className={styles.companyName}>{card.company}</div>
                                <div className={styles.roleText}>{card.role}</div>
                                {card.title && <h4 className={styles.topCardTitle}>{card.title}</h4>}
                                {card.description && <p className={styles.topCardDesc}>{card.description}</p>}
                                <div className={styles.cardActions}>
                                    <button className={styles.btnDismiss}>Bỏ qua</button>
                                    {card.link ? (
                                        <a
                                            className={styles.linkBtn}
                                            href={card.link}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (card.linkState) {
                                                    navigate(card.link, { state: card.linkState });
                                                } else {
                                                    navigate(card.link);
                                                }
                                            }}
                                        >
                                            {card.linkText} <span className={styles.chevron}></span>
                                        </a>
                                    ) : (
                                        <button
                                            className={styles.linkBtn}
                                            onClick={() => card.simId && navigate(`/simulations/${card.simId}`)}
                                        >
                                            Bắt đầu <span className={styles.chevron}></span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.twoCol}>
                    <div>
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🚀</span> Bài mô phỏng còn cần tiếp tục
                        </div>

                        {loading ? (
                            <div className={styles.loadingBox}>Đang tải...</div>
                        ) : activeEnrolledSims.length === 0 ? (
                            <div className={styles.emptyBox}>Bạn không có bài mô phỏng nào cần tiếp tục.</div>
                        ) : (
                            activeEnrolledSims.map((item) => {
                                const sim = item.simulation || {};
                                const org = sim.educator?.organization || {};
                                const orgName = org.shortName || org.name || '';
                                const participantsText = sim.totalParticipant
                                    ? `${sim.totalParticipant.toLocaleString()} người tham gia`
                                    : '';
                                const logoUrl = org.logoUrl
                                    ? org.logoUrl.startsWith('http')
                                        ? org.logoUrl
                                        : `${enrolledUrlBase}${org.logoUrl}`
                                    : null;

                                return (
                                    <div
                                        key={item.id}
                                        className={`${styles.simCard} ${styles.simCardClickable}`}
                                        onClick={() => handleCardClick(sim.id)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCardClick(sim.id)}
                                    >
                                        <div>
                                            <div className={styles.simCardBody}>
                                                <h4>{sim.title || 'Chưa có tiêu đề'}</h4>
                                                <p>{sim.notice || 'Không có mô tả'}</p>
                                                <div className={styles.progressRow}>
                                                    <div className={styles.progressBarBg}>
                                                        <div
                                                            className={styles.progressBarFill}
                                                            style={{ width: `${item.progress || 0}%` }}
                                                        />
                                                    </div>
                                                    <span className={styles.progressPercent}>
                                                        {item.progress || 0}%
                                                    </span>
                                                </div>
                                                {participantsText && (
                                                    <div className={styles.tasksLeft}>{participantsText}</div>
                                                )}
                                            </div>
                                            {item.progress < 100 && (
                                                <div className={styles.cardActions}>
                                                    <button
                                                        className={styles.linkBtn}
                                                        onClick={(e) => handleResumeClick(e, item, sim)}
                                                    >
                                                        Tiếp tục <span className={styles.chevron}></span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {logoUrl ? (
                                            <img src={logoUrl} alt={orgName} className={styles.simLogoImg} />
                                        ) : (
                                            orgName && <div className={styles.simLogo}>{orgName}</div>
                                        )}
                                    </div>
                                );
                            })
                        )}

                        <a
                            className={styles.viewAll}
                            href="/simulations"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/simulations');
                            }}
                        >
                            Tất cả bài mô phỏng <span className={styles.chevron}></span>
                        </a>

                        <div className={styles.sectionTitle} style={{ marginTop: 32 }}>
                            <span className={styles.sectionIcon}>⭐</span> Bài mô phỏng gợi ý
                        </div>

                        {loading ? (
                            <div className={styles.loadingBox}>Đang tải...</div>
                        ) : recommendedSims.length === 0 ? (
                            <div className={styles.emptyBox}>Chưa có bài mô phỏng gợi ý phù hợp.</div>
                        ) : (
                            recommendedSims.map((sim) => {
                                const org = sim.educator?.organization || {};
                                const orgName = org.shortName || org.name || '';
                                const orgInitial = orgName ? orgName.charAt(0).toUpperCase() : '?';
                                const catName = sim.category?.name || 'Chuyên ngành';
                                const lvlLabel = getLevelLabel(sim.level);
                                const durationText = sim.duration ? `${sim.duration} giờ` : '';

                                return (
                                    <div key={sim.id} className={styles.recSimCard}>
                                        <div className={styles.recSimThumb}>
                                            {sim.thumbnail ? (
                                                <img
                                                    src={sim.thumbnail}
                                                    alt={sim.title}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        fontSize: '14px',
                                                    }}
                                                >
                                                    {orgInitial}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.recSimBody}>
                                            <div className={styles.companyName}>{orgName}</div>
                                            <div className={styles.simTitle}>{sim.title}</div>
                                            <div className={styles.recSimMeta}>
                                                <span>📊 {catName}</span>
                                                <span>● {lvlLabel}</span>
                                                {durationText && <span>🕐 {durationText}</span>}
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button className={styles.btnDismiss}>Bỏ qua</button>
                                                <button
                                                    className={styles.linkBtn}
                                                    onClick={() => navigate(`/simulations/${sim.id}`)}
                                                >
                                                    Xem chi tiết <span className={styles.chevron}></span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <a
                            className={styles.viewAll}
                            href="/simulations"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/simulations');
                            }}
                        >
                            Xem tất cả <span className={styles.chevron}></span>
                        </a>
                    </div>

                    <div>
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🏆</span> Thành tích
                        </div>

                        {achievements.length > 0 ? (
                            achievements.map((ach) => {
                                const sim = ach.simulation || {};
                                const filePath = ach.filePath || '';
                                const fullFilePath = getDownloadUrl(filePath);

                                return (
                                    <div key={ach.id} className={styles.achievementCard} style={{ marginBottom: 24 }}>
                                        <div className={styles.trophyIcon}>🎯</div>
                                        <div>
                                            <h4>{sim.title || 'Thành tích'}</h4>
                                            <div className={styles.achievementMeta}>
                                                <p className={styles.achievementDesc}>Chứng chỉ đã hoàn thành</p>
                                                {fullFilePath && (
                                                    <a
                                                        href="#"
                                                        onClick={(e) =>
                                                            handlePreviewCertificate(
                                                                e,
                                                                fullFilePath,
                                                                sim.title || 'Chứng chỉ',
                                                            )
                                                        }
                                                        className={styles.certificateBtn}
                                                    >
                                                        Xem chứng chỉ
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className={styles.achievementCard} style={{ marginBottom: 24 }}>
                                <div className={styles.trophyIcon}>{MOCK_ACHIEVEMENT.icon}</div>
                                <div>
                                    <h4>{MOCK_ACHIEVEMENT.title}</h4>
                                    <p className={styles.achievementDesc}>{MOCK_ACHIEVEMENT.description}</p>
                                    <a
                                        className={styles.viewAll}
                                        href="/simulations"
                                        style={{ textAlign: 'left', display: 'inline-block', marginTop: 0 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate('/simulations');
                                        }}
                                    >
                                        Khám phá bài mô phỏng <span className={styles.chevron}></span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>💼</span> Đối tác doanh nghiệp
                        </div>

                        {organizations
                            .filter((org) => !dismissedOrgs.includes(org.id))
                            .slice(0, 3)
                            .map((org) => {
                                const logoUrl = org.logoUrl
                                    ? org.logoUrl.startsWith('http')
                                        ? org.logoUrl
                                        : `${enrolledUrlBase || ''}${org.logoUrl}`
                                    : null;
                                const orgName = org.shortName || org.name || 'Tổ chức';

                                return (
                                    <div key={org.id} className={styles.jobCard}>
                                        <div>
                                            <h4>Cơ hội việc làm tại {orgName}</h4>
                                            <p>{org.description || `Tham gia mạng lưới nhân tài của ${orgName}.`}</p>
                                            <div className={styles.cardActions}>
                                                <button
                                                    className={styles.btnDismiss}
                                                    onClick={() => setDismissedOrgs([ ...dismissedOrgs, org.id ])}
                                                >
                                                    Không quan tâm
                                                </button>
                                                <button className={styles.linkBtn} onClick={() => navigate('/jobs')}>
                                                    Xem chi tiết <span className={styles.chevron}></span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className={styles.companyBadge} style={{ background: '#fff' }}>
                                            {logoUrl ? (
                                                <img
                                                    src={logoUrl}
                                                    alt={orgName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <div style={{ color: '#000', fontWeight: 'bold' }}>{orgName}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </main>

            <Modal
                title={`Chứng chỉ: ${currentFileName}`}
                open={previewModalVisible}
                onCancel={() => {
                    setPreviewModalVisible(false);
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setPreviewModalVisible(false);
                            if (previewUrl) URL.revokeObjectURL(previewUrl);
                        }}
                    >
                        Đóng
                    </Button>,
                    <Button
                        key="download"
                        type="primary"
                        icon={<DownloadOutlined />}
                        href={currentDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                    >
                        Tải về
                    </Button>,
                ]}
                width={800}
                destroyOnClose
            >
                {previewLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin tip="Đang tải chứng chỉ..." size="large" />
                    </div>
                ) : previewUrl ? (
                    <div
                        style={{
                            width: '100%',
                            aspectRatio: '16 / 9',
                            overflow: 'hidden',
                            position: 'relative',
                            borderRadius: '8px',
                            backgroundColor: '#f0f2f5',
                        }}
                    >
                        <iframe
                            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                            title="Certificate Preview"
                            style={{
                                position: 'absolute',
                                top: '-20%',
                                left: '-20%',
                                width: '140%',
                                height: '140%',
                                border: 'none',
                                display: 'block',
                            }}
                        />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'red' }}>
                        Không thể tải trước chứng chỉ. Vui lòng nhấn Tải về để xem.
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default DashboardDesktop;
