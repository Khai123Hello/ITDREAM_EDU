import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import useFetchAction from '@hooks/useFetchAction';
import { accountActions } from '@store/actions';
import { getDownloadUrl } from '@utils';
import { Button, Modal, Spin } from 'antd';
import { toast } from 'sonner';

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
    categories = [],
    loading,
}) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const name = profile?.fullName || profile?.account?.fullName || '';
    const [ dismissedOrgs, setDismissedOrgs ] = useState([]);
    const [ dismissedCardKeys, setDismissedCardKeys ] = useState([]);
    const [ dismissedRecSimIds, setDismissedRecSimIds ] = useState([]);

    const [ selectedSpecs, setSelectedSpecs ] = useState([]);
    const [ selectedOrgs, setSelectedOrgs ] = useState([]);

    const { execute: executeUpdateProfile, loading: updatingPreferences } = useFetch(apiConfig.student.clientUpdate);
    const { execute: executeGetProfile } = useFetchAction(accountActions.getProfile);

    const [ previewModalVisible, setPreviewModalVisible ] = useState(false);
    const [ previewLoading, setPreviewLoading ] = useState(false);
    const [ previewUrl, setPreviewUrl ] = useState(null);
    const [ currentDownloadUrl, setCurrentDownloadUrl ] = useState(null);
    const [ currentFileName, setCurrentFileName ] = useState('');

    const toggleSpec = (id) => {
        if (selectedSpecs.includes(id)) {
            setSelectedSpecs(selectedSpecs.filter((s) => s !== id));
        } else {
            setSelectedSpecs([ ...selectedSpecs, id ]);
        }
    };

    const toggleOrg = (id) => {
        if (selectedOrgs.includes(id)) {
            setSelectedOrgs(selectedOrgs.filter((o) => o !== id));
        } else {
            setSelectedOrgs([ ...selectedOrgs, id ]);
        }
    };

    const handleSavePreferences = () => {
        if (selectedSpecs.length === 0 && selectedOrgs.length === 0) {
            toast.error('Vui lòng chọn ít nhất một chuyên ngành hoặc tổ chức yêu thích.');
            return;
        }

        const payloadPreferences = [];
        selectedSpecs.forEach((specId) => {
            payloadPreferences.push({ specializationId: specId });
        });
        selectedOrgs.forEach((orgId) => {
            payloadPreferences.push({ organizationId: orgId });
        });

        executeUpdateProfile({
            data: {
                avatarPath: profile?.avatar || profile?.avatarPath || '',
                fullname: name || profile?.fullName || profile?.account?.fullName || '',
                phone: profile?.phone || profile?.account?.phone || '',
                birthday: profile?.birthday || profile?.account?.birthday || null,
                username: profile?.username || profile?.account?.username || '',
                preferences: payloadPreferences,
            },
            onCompleted: (res) => {
                if (res?.result === true) {
                    toast.success('Lưu sở thích thành công!');
                    if (executeGetProfile) {
                        executeGetProfile()
                            .then(() => {
                                window.location.reload();
                            })
                            .catch(() => {
                                window.location.reload();
                            });
                    } else {
                        dispatch(accountActions.getProfile());
                        window.location.reload();
                    }
                } else {
                    toast.error(res?.message || 'Có lỗi xảy ra khi lưu sở thích. Vui lòng thử lại.');
                }
            },
            onError: () => {
                toast.error('Có lỗi xảy ra khi lưu sở thích. Vui lòng thử lại.');
            },
        });
    };

    const userPrefs = profile?.preferences || [];
    const showPreferenceSetup = userPrefs.length === 0;

    const categoriesList = Array.isArray(categories) ? categories : categories?.content || [];
    const organizationsList = Array.isArray(organizations) ? organizations : organizations?.content || [];

    if (showPreferenceSetup) {
        return (
            <div className={styles.container}>
                <main className={styles.main}>
                    <div className={styles.prefContainer}>
                        <div className={styles.prefHeader}>
                            <span className={styles.prefHeaderIcon}>🎯</span>
                            <h2>Cá nhân hóa trải nghiệm học tập của bạn</h2>
                            <p>
                                Để gợi ý các bài mô phỏng dự án phù hợp nhất với định hướng và mục tiêu nghề nghiệp, vui
                                lòng lựa chọn chuyên ngành và tổ chức bạn quan tâm.
                            </p>
                        </div>

                        <div className={styles.prefSection}>
                            <h3>1. Chuyên ngành bạn quan tâm</h3>
                            <p className={styles.prefSectionDesc}>
                                Chọn một hoặc nhiều chuyên ngành để chúng tôi gợi ý lộ trình phù hợp.
                            </p>
                            <div className={styles.prefPillGrid}>
                                {categoriesList.map((cat) => {
                                    const isSelected = selectedSpecs.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            className={`${styles.prefPill} ${isSelected ? styles.prefPillSelected : ''}`}
                                            onClick={() => toggleSpec(cat.id)}
                                        >
                                            {cat.name}
                                            {isSelected && <span className={styles.pillCheck}> ✓</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.prefSection}>
                            <h3>2. Tổ chức bạn muốn học hỏi</h3>
                            <p className={styles.prefSectionDesc}>
                                Chọn các tổ chức đối tác mà bạn quan tâm đến cơ hội thực tập và làm việc.
                            </p>
                            <div className={styles.orgSelectionGrid}>
                                {organizationsList.map((org) => {
                                    const isSelected = selectedOrgs.includes(org.id);
                                    const logoUrl = org.logoUrl
                                        ? org.logoUrl.startsWith('http')
                                            ? org.logoUrl
                                            : `${enrolledUrlBase || ''}${org.logoUrl}`
                                        : null;
                                    const orgName = org.shortName || org.name || 'Tổ chức';

                                    return (
                                        <div
                                            key={org.id}
                                            className={`${styles.orgSelectCard} ${isSelected ? styles.orgSelectCardSelected : ''}`}
                                            onClick={() => toggleOrg(org.id)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && toggleOrg(org.id)}
                                        >
                                            <div className={styles.orgSelectLogo}>
                                                {logoUrl ? (
                                                    <img src={logoUrl} alt={orgName} />
                                                ) : (
                                                    <div className={styles.orgSelectLogoText}>
                                                        {orgName.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.orgSelectInfo}>
                                                <h4>{orgName}</h4>
                                                <p>{org.description || 'Đối tác tổ chức đáng tin cậy.'}</p>
                                            </div>
                                            <div className={styles.orgSelectCheckbox}>
                                                <div
                                                    className={`${styles.customCheckbox} ${isSelected ? styles.customCheckboxChecked : ''}`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.prefActions}>
                            <button
                                type="button"
                                className={styles.btnSubmitPref}
                                disabled={updatingPreferences}
                                onClick={handleSavePreferences}
                            >
                                {updatingPreferences ? (
                                    <>
                                        <Spin
                                            indicator={<LoadingOutlined style={{ fontSize: 16, color: '#fff' }} spin />}
                                        />{' '}
                                        Đang lưu...
                                    </>
                                ) : (
                                    'Lưu sở thích & Bắt đầu học'
                                )}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

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

    const preferences = profile?.preferences || [];
    const hasSpecialization = preferences.some((p) => p.specializationId && String(p.specializationId) !== '0');
    const hasOrganization = preferences.some((p) => p.organizationId && String(p.organizationId) !== '0');

    const completionStatus = [ hasFullName, hasEmail, hasSpecialization, hasOrganization ];
    const hasPhone = profile?.phone || profile?.account?.phone;
    if (hasPhone) {
        completionStatus.push(true);
    }

    const completedCount = completionStatus.filter(Boolean).length;
    const totalRequired = completionStatus.length;
    const completenessPercentage = Math.round((completedCount / totalRequired) * 100);
    const missingCount = totalRequired - completedCount;
    const isProfileComplete = completedCount === totalRequired;

    // Filter enrolled simulations in progress (progress < 100)
    const activeEnrolledSims = enrolledSims.filter((item) => item.progress < 100);

    // Calculate recommended simulations based on preferences
    const enrolledIds = enrolledSims.map((item) => item.simulation?.id).filter(Boolean);
    const nonEnrolledSims = allSimulations.filter((sim) => !enrolledIds.includes(sim.id));

    const prefSpecIds = preferences
        .map((p) => p.specializationId)
        .filter(Boolean)
        .map(String);
    const prefOrgIds = preferences
        .map((p) => p.organizationId)
        .filter(Boolean)
        .map(String);

    const hasPreferences = prefSpecIds.length > 0 || prefOrgIds.length > 0;

    let recommendedSims = [];

    if (hasPreferences) {
        recommendedSims = nonEnrolledSims.filter((sim) => {
            const matchesSpec = sim.category?.id && prefSpecIds.includes(String(sim.category.id));
            const matchesOrg =
                sim.educator?.organization?.id && prefOrgIds.includes(String(sim.educator.organization.id));
            return matchesSpec || matchesOrg;
        });

        console.log('--- DEBUG FILTERING ---');
        console.log('1. prefSpecIds:', prefSpecIds);
        console.log('2. prefOrgIds:', prefOrgIds);
        console.log(
            '3. nonEnrolledSims:',
            nonEnrolledSims.map((s) => ({ id: s.id, categoryId: s.category?.id, title: s.title })),
        );
        console.log(
            '4. recommendedSims results:',
            recommendedSims.map((s) => s.title),
        );
        console.log('-----------------------');

        recommendedSims = recommendedSims.slice(0, 3);
    } else {
        recommendedSims = nonEnrolledSims.slice(0, 3);
    }

    const filteredRecommendedSims = recommendedSims.filter((sim) => !dismissedRecSimIds.includes(sim.id));

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
            key: 'profile',
            badgeDots,
            title: 'Hồ sơ của bạn chưa hoàn thiện',
            description: `Cần cập nhật thêm ${missingCount} thông tin để hoàn thiện hồ sơ học tập.`,
            link: '/profile',
            linkText: 'Cập nhật hồ sơ',
        });
    }

    // 2. Active simulations to resume
    activeEnrolledSims.slice(0, 1).forEach((item) => {
        const sim = item.simulation || {};
        const org = sim.educator?.organization || {};
        dynamicCards.push({
            key: `resume_${item.id}`,
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
            key: `rec_${sim.id}`,
            recommended: true,
            company: org.shortName || org.name || 'Tổ chức',
            role: sim.title,
            link: `/simulations/${sim.id}`,
            linkText: 'Bắt đầu',
            simId: sim.id,
        });
    });

    const filteredDynamicCards = dynamicCards.filter((card) => !dismissedCardKeys.includes(card.key));

    const handleDismissCard = (key) => {
        setDismissedCardKeys([ ...dismissedCardKeys, key ]);
    };

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <div className={styles.welcomeBanner}>
                    <div className={styles.welcomeInfo}>
                        <h1 className={styles.greeting}>Xin chào{name ? `, ${name}!` : '!'}</h1>
                        <p className={styles.welcomeSubtitle}>
                            Chào mừng bạn quay trở lại. Hãy cùng tiếp tục nâng cao chuyên môn và cơ hội nghề nghiệp của
                            mình nhé!
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    <div className={styles.statsCard}>
                        <div className={`${styles.statsIcon} ${styles.iconLearning}`}>📚</div>
                        <div className={styles.statsContent}>
                            <span className={styles.statsNumber}>{activeEnrolledSims.length}</span>
                            <span className={styles.statsLabel}>Bài mô phỏng đang học</span>
                        </div>
                    </div>
                    <div className={styles.statsCard}>
                        <div className={`${styles.statsIcon} ${styles.iconCompleted}`}>🏆</div>
                        <div className={styles.statsContent}>
                            <span className={styles.statsNumber}>{achievements.length}</span>
                            <span className={styles.statsLabel}>Chứng chỉ đạt được</span>
                        </div>
                    </div>
                    <div className={styles.statsCard}>
                        <div className={`${styles.statsIcon} ${styles.iconOrgs}`}>💼</div>
                        <div className={styles.statsContent}>
                            <span className={styles.statsNumber}>
                                {organizations.filter((org) => !dismissedOrgs.includes(org.id)).length}
                            </span>
                            <span className={styles.statsLabel}>Đối tác & Tổ chức</span>
                        </div>
                    </div>
                    <div className={`${styles.statsCard} ${styles.statsCardProfile}`}>
                        <div className={`${styles.statsIcon} ${styles.iconProfile}`}>👤</div>
                        <div className={styles.statsContent} style={{ width: '100%' }}>
                            <div className={styles.profileHeaderRow}>
                                <span className={styles.statsLabel}>Hồ sơ cá nhân</span>
                                <span className={styles.profilePercentage}>{completenessPercentage}%</span>
                            </div>
                            <div className={styles.progressBarBgMini}>
                                <div
                                    className={styles.progressBarFillMini}
                                    style={{ width: `${completenessPercentage}%` }}
                                />
                            </div>
                            {!isProfileComplete && (
                                <button className={styles.btnUpdateProfile} onClick={() => navigate('/profile')}>
                                    Cập nhật ngay <span className={styles.chevronMini}></span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {filteredDynamicCards.length > 0 && (
                    <div className={styles.topCards}>
                        {filteredDynamicCards.map((card, idx) => (
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
                                        Gợi ý học tập
                                    </div>
                                )}
                                {card.resume && <div className={styles.recommendedBadge}>Tiếp tục học phần</div>}
                                <div className={styles.companyName}>{card.company}</div>
                                <div className={styles.roleText}>{card.role}</div>
                                {card.title && <h4 className={styles.topCardTitle}>{card.title}</h4>}
                                {card.description && <p className={styles.topCardDesc}>{card.description}</p>}
                                <div className={styles.cardActions}>
                                    <button className={styles.btnDismiss} onClick={() => handleDismissCard(card.key)}>
                                        Bỏ qua
                                    </button>
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
                            <span className={styles.sectionIcon}>🚀</span> Bài mô phỏng cần tiếp tục
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
                                        <div style={{ flex: 1 }}>
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
                        ) : filteredRecommendedSims.length === 0 ? (
                            <div className={styles.emptyBox}>Chưa có bài mô phỏng gợi ý phù hợp.</div>
                        ) : (
                            filteredRecommendedSims.map((sim) => {
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
                                                <button
                                                    className={styles.btnDismiss}
                                                    onClick={() =>
                                                        setDismissedRecSimIds([ ...dismissedRecSimIds, sim.id ])
                                                    }
                                                >
                                                    Bỏ qua
                                                </button>
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
                                        <div style={{ flex: 1 }}>
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
                                <div style={{ flex: 1 }}>
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
                            <span className={styles.sectionIcon}>💼</span> Đối tác & Tổ chức
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
                                        <div style={{ flex: 1 }}>
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
