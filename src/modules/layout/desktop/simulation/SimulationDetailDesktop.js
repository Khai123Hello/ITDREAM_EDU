import React, { useMemo, useState } from 'react';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Empty, Spin } from 'antd';

import TaskDetailPanel from './TaskDetailPanel';
import TaskListSidebar from './TaskListSidebar';

import styles from './detail.module.scss';

function SimulationDetailDesktop({
    simulation = {},
    tasks = [],
    loading,
    error,
    onRetry,
    isAuthenticated = false,
    isStudent = false,
    isEnrolled = false,
    enrollmentLoading = false,
    onEnroll = () => {},
    onLogin = () => {},
    onStartTask = () => {},
}) {
    const [ activeTab, setActiveTab ] = useState('overview');
    const [ activeTaskId, setActiveTaskId ] = useState(null);

    // Set first task as active by default
    const defaultActiveTaskId = useMemo(() => {
        if (tasks.length > 0 && !activeTaskId) {
            return tasks[0].id;
        }
        return activeTaskId;
    }, [ tasks, activeTaskId ]);

    const selectedTask = useMemo(() => {
        return tasks.find((t) => t.id === defaultActiveTaskId) || tasks[0] || {};
    }, [ tasks, defaultActiveTaskId ]);

    const handleTaskSelect = (taskId) => {
        setActiveTaskId(taskId);
    };

    const getTaskDisplayNumber = (task) => {
        if (task?.orderInParent === 0) return null;
        if (typeof task?.orderInParent === 'number') return task.orderInParent;
        return null;
    };

    const getLevelLabel = (level) => {
        const levelMap = {
            0: 'Giới thiệu',
            1: 'Cơ bản',
            2: 'Trung cấp',
            3: 'Nâng cao',
        };
        return levelMap[level] || 'Giới thiệu';
    };

    const getStarCount = (avgStar) => {
        return Math.round(avgStar || 0);
    };

    if (loading) {
        return (
            <>
                <AppHeader />
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                    </div>
                </div>
                <AppFooter />
            </>
        );
    }

    if (error) {
        return (
            <>
                <AppHeader />
                <div className={styles.container}>
                    <div className={styles.errorContainer}>
                        <Empty description="Lỗi tải dữ liệu" />
                        <button className={styles.retryBtn} onClick={onRetry}>
                            Thử lại
                        </button>
                    </div>
                </div>
                <AppFooter />
            </>
        );
    }

    return (
        <>
            <AppHeader />
            <div className={styles.container}>
                {/* HERO SECTION */}
                <section className={styles.hero}>
                    {simulation.thumbnail ? (
                        <img src={simulation.thumbnail} alt={simulation.title} className={styles.heroBg} />
                    ) : (
                        <div className={styles.heroBgFallback} />
                    )}
                    <div className={styles.heroOverlay} />

                    <div className={styles.heroContent}>
                        <div className={styles.heroLeft}>
                            {simulation?.educator?.organization?.logoUrl && (
                                <div className={styles.heroForageLogo}>
                                    <img
                                        src={simulation.educator.organization.logoUrl}
                                        alt={simulation.educator.organization.name}
                                        className={styles.forageLogoImg}
                                    />
                                    <span className={styles.forageLogoText}>
                                        {simulation.educator.organization.shortName ||
                                            simulation.educator.organization.name}
                                    </span>
                                </div>
                            )}
                            <h1 className={styles.heroTitle}>{simulation?.title || 'Bài mô phỏng'}</h1>
                            <p className={styles.heroSub}>
                                {simulation?.notice || 'Trải nghiệm các tình huống công việc thực tế'}
                            </p>
                            <div className={styles.heroMeta}>
                                <span>{simulation?.duration || 'Tự hoàn thành'}</span>
                                <span className={styles.metaSep}>·</span>
                                <span>Miễn phí</span>
                                <span className={styles.metaSep}>·</span>
                                <span>{simulation?.totalParticipant || 0} học viên tham gia</span>
                            </div>
                        </div>

                        <div className={styles.heroCard}>
                            <div className={styles.heroCardTitle}>Sẵn Sàng Cho Sự Nghiệp</div>

                            <div className={styles.heroCardItem}>
                                <div className={styles.heroCardCheck}>
                                    <svg viewBox="0 0 10 10" fill="none">
                                        <path
                                            d="M2 5l2 2 4-4"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span>Hoàn thành công việc mô phỏng dự án thực tế. Tự hoàn thành.</span>
                            </div>

                            <div className={styles.heroCardItem}>
                                <div className={styles.heroCardCheck}>
                                    <svg viewBox="0 0 10 10" fill="none">
                                        <path
                                            d="M2 5l2 2 4-4"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span>Nhận chứng chỉ để bổ sung vào hồ sơ năng lực và LinkedIn.</span>
                            </div>

                            {simulation?.avgStar !== undefined && (
                                <div className={styles.heroCardRating}>
                                    <div className={styles.starsRow}>
                                        {Array.from({ length: getStarCount(simulation.avgStar) }).map((_, i) => (
                                            <span key={i} className={styles.star}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.ratingLabel}>
                                        {simulation?.totalParticipant || 0} đánh giá
                                    </div>
                                </div>
                            )}

                            {isEnrolled ? (
                                <button className={`${styles.heroCtaBtn} ${styles.enrolled}`} disabled>
                                    ✓ Bạn đã tham gia
                                </button>
                            ) : !isAuthenticated ? (
                                // Not logged in - show login button
                                <button className={styles.heroCtaBtn} onClick={onLogin} disabled={enrollmentLoading}>
                                    {enrollmentLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                                </button>
                            ) : !isStudent ? (
                                // Logged in but not a student - disable button
                                <button
                                    className={styles.heroCtaBtn}
                                    disabled
                                    title="Chỉ học viên mới có thể tham gia dự án này"
                                >
                                    Không thể tham gia
                                </button>
                            ) : (
                                // Logged in and is a student - enable enrollment
                                <button className={styles.heroCtaBtn} onClick={onEnroll} disabled={enrollmentLoading}>
                                    {enrollmentLoading ? 'Đang xử lý...' : 'Tham gia dự án'}
                                </button>
                            )}

                            {isEnrolled && (
                                <button
                                    className={styles.heroCtaBtn}
                                    onClick={onStartTask}
                                    style={{ background: '#10B981' }}
                                >
                                    Bắt đầu bài mô phỏng
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* TABS NAVIGATION */}
                <div className={styles.tabsNav}>
                    <div
                        className={`${styles.tabNavItem} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Tổng quan
                    </div>
                    <div
                        className={`${styles.tabNavItem} ${activeTab === 'tasks' ? styles.active : ''}`}
                        onClick={() => setActiveTab('tasks')}
                    >
                        Nhiệm vụ
                    </div>
                    <div
                        className={`${styles.tabNavItem} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Đánh giá
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className={styles.mainWrap}>
                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className={styles.twoCol}>
                            <div>
                                {/* Why Section */}
                                <h2 className={styles.whyTitle}>Tại sao bạn nên hoàn thành bài mô phỏng này</h2>
                                <p className={styles.whyBody}>
                                    {simulation.notice ||
                                        'Một cơ hội hoàn hảo để trải nghiệm các công việc thực tế cùng chúng tôi. Thực hành kỹ năng với các nhiệm vụ thực tiễn và tự tin ứng tuyển.'}
                                </p>

                                <div className={styles.whyTags}>
                                    <span className={styles.whyTag}>
                                        Tự hoàn thành <strong>{simulation.duration || '3–4 giờ'}</strong>
                                    </span>
                                    <span className={styles.whyTagSep}>·</span>
                                    <span className={styles.whyTag}>Không tính điểm</span>
                                    <span className={styles.whyTagSep}>·</span>
                                    <span className={styles.whyTag}>Không kiểm tra áp lực</span>
                                    <span className={styles.whyTagSep}>·</span>
                                    <span className={styles.whyTagInfo}>
                                        {getLevelLabel(simulation.level)}
                                        <svg viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <circle cx="6.5" cy="6.5" r="5.5" />
                                            <path d="M6.5 6v3M6.5 4h.01" strokeLinecap="round" />
                                        </svg>
                                    </span>
                                </div>

                                <hr className={styles.divider} />

                                {/* Description */}
                                {simulation.description && (
                                    <>
                                        <p className={styles.whyBody}>{simulation.description}</p>
                                    </>
                                )}

                                {/* How It Works Section */}
                                {simulation?.overview && (
                                    <div className={styles.how}>
                                        <h3 className={styles.howTitle}>Nội dung bạn sẽ học</h3>
                                        <div className={styles.howSteps}>
                                            <p>{simulation.overview}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Skills Sidebar */}
                            <div className={styles.skillsBox}>
                                <div className={styles.skillsBoxTitle}>Các kỹ năng bạn sẽ học và thực hành:</div>
                                <div className={styles.skillPills}>
                                    <span className={styles.skillPill}>Chú ý chi tiết</span>
                                    <span className={styles.skillPill}>Giải quyết vấn đề</span>
                                    <span className={styles.skillPill}>Giao tiếp</span>
                                    <span className={styles.skillPill}>Tư duy phản biện</span>
                                    <span className={styles.skillPill}>Làm việc nhóm</span>
                                </div>
                                <a href="#" className={styles.viewAllSkills}>
                                    Xem tất cả
                                </a>
                            </div>
                        </div>
                    )}

                    {/* TASKS TAB */}
                    {activeTab === 'tasks' && (
                        <div className={styles.tasksSection}>
                            <h2 className={styles.tasksSectionTitle}>Danh sách nhiệm vụ trong chương trình</h2>
                            {tasks && tasks.length > 0 ? (
                                <div className={styles.tasksLayout}>
                                    <TaskListSidebar
                                        tasks={tasks}
                                        activeTaskId={defaultActiveTaskId}
                                        onSelectTask={handleTaskSelect}
                                        getDisplayNumber={getTaskDisplayNumber}
                                    />

                                    <TaskDetailPanel
                                        task={selectedTask}
                                        onStartTask={onStartTask}
                                        onEnroll={onEnroll}
                                        onLogin={onLogin}
                                        isEnrolled={isEnrolled}
                                        isAuthenticated={isAuthenticated}
                                        enrollmentLoading={enrollmentLoading}
                                    />
                                </div>
                            ) : (
                                <Empty description="Không có nhiệm vụ nào" />
                            )}
                        </div>
                    )}

                    {/* REVIEWS TAB */}
                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsSection}>
                            <div className={styles.reviewsWrap}>
                                <div className={styles.reviewsLeft}>
                                    <div className={styles.reviewsLabel}>Đánh giá</div>
                                    <div className={styles.reviewsCount}>{simulation?.totalParticipant || 0}+</div>
                                    <div className={styles.starsRow}>
                                        {Array.from({
                                            length: getStarCount(simulation?.avgStar),
                                        }).map((_, i) => (
                                            <span key={i} className={styles.star}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.reviewsStarLabel}>
                                        {simulation?.avgStar?.toFixed(1) || 0} Sao Đánh giá
                                    </div>
                                </div>
                                <div className={styles.reviewsRight}>
                                    <div className={styles.reviewsRightInner}>
                                        <button className={styles.arrowBtn}>
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M9 11L5 7l4-4" />
                                            </svg>
                                        </button>
                                        <div className={styles.carouselArea}>
                                            <p className={styles.reviewText}>
                                                &quot;Bài mô phỏng rất hấp dẫn và thực tế. Tôi đã học được nhiều
                                                kỹ năng quý giá áp dụng trực tiếp vào công việc.&quot;
                                            </p>
                                            <div className={styles.reviewAuthor}>
                                                – Học viên từ{' '}
                                                {simulation.educator?.organization?.name || 'Cộng đồng của chúng tôi'}
                                            </div>
                                        </div>
                                        <button className={styles.arrowBtn}>
                                            <svg
                                                width="14"
                                                height="14"
                                                viewBox="0 0 14 14"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M5 3l4 4-4 4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* CTA BAR */}
                <div className={styles.ctaBar}>
                    <div className={styles.ctaBarText}>Chưa tìm thấy bài mô phỏng phù hợp?</div>
                    <a href="/" className={styles.browseBtn}>
                        Xem các bài mô phỏng khác →
                    </a>
                </div>
            </div>
            <AppFooter />
        </>
    );
}

export default SimulationDetailDesktop;
