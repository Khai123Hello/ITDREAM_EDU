import React, { useMemo, useState } from 'react';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Empty, Spin } from 'antd';

import TaskPanel from './TaskPanel';

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

    const defaultActiveTaskId = useMemo(() => {
        if (tasks.length > 0 && !activeTaskId) return tasks[0].id;
        return activeTaskId;
    }, [ tasks, activeTaskId ]);

    const handleTaskSelect = (taskId) => setActiveTaskId(taskId);

    const getLevelLabel = (level) =>
        ({ 0: 'Giới thiệu', 1: 'Cơ bản', 2: 'Trung cấp', 3: 'Nâng cao' }[level] ?? 'Giới thiệu');

    const getStarCount = (avgStar) => Math.round(avgStar || 0);

    /* ── Loading ── */
    if (loading) return (
        <>
            <AppHeader />
            <div className={styles.stateWrap}>
                <Spin size="large" />
            </div>
            <AppFooter />
        </>
    );

    /* ── Error ── */
    if (error) return (
        <>
            <AppHeader />
            <div className={styles.stateWrap}>
                <Empty description="Không tải được dữ liệu" />
                <button className={styles.retryBtn} onClick={onRetry}>Thử lại</button>
            </div>
            <AppFooter />
        </>
    );

    /* ── CTA button logic ── */
    const renderCtaButton = () => {
        if (isEnrolled) return (
            <button className={`${styles.ctaBtn} ${styles.ctaBtnSuccess}`} onClick={onStartTask}>
                <span className={styles.ctaBtnIcon}>▶</span>
                Tiếp tục học
            </button>
        );
        if (!isAuthenticated) return (
            <button className={styles.ctaBtn} onClick={onLogin} disabled={enrollmentLoading}>
                {enrollmentLoading ? <span className={styles.spinner} /> : null}
                Đăng nhập để tham gia
            </button>
        );
        if (!isStudent) return (
            <button className={`${styles.ctaBtn} ${styles.ctaBtnDisabled}`} disabled>
                Chỉ dành cho học viên
            </button>
        );
        return (
            <button className={styles.ctaBtn} onClick={onEnroll} disabled={enrollmentLoading}>
                {enrollmentLoading ? <span className={styles.spinner} /> : null}
                {enrollmentLoading ? 'Đang xử lý...' : 'Tham gia miễn phí'}
            </button>
        );
    };

    const TABS = [
        { key: 'overview', label: 'Tổng quan' },
        { key: 'tasks',    label: `Nhiệm vụ${tasks.length ? ` (${tasks.length})` : ''}` },
        { key: 'reviews',  label: 'Đánh giá' },
    ];

    return (
        <>
            <AppHeader />
            <div className={styles.page}>

                {/* ══ HERO ══ */}
                <section className={styles.hero}>
                    {/* background */}
                    <div className={styles.heroBg}>
                        {simulation.thumbnail
                            ? <img src={simulation.thumbnail} alt="" className={styles.heroBgImg} />
                            : <div className={styles.heroBgGradient} />
                        }
                        <div className={styles.heroBgOverlay} />
                    </div>

                    <div className={styles.heroInner}>
                        {/* LEFT */}
                        <div className={styles.heroLeft}>
                            {simulation?.educator?.organization?.logoUrl && (
                                <div className={styles.orgBadge}>
                                    <img
                                        src={simulation.educator.organization.logoUrl}
                                        alt={simulation.educator.organization.name}
                                        className={styles.orgLogo}
                                    />
                                    <span className={styles.orgName}>
                                        {simulation.educator.organization.shortName || simulation.educator.organization.name}
                                    </span>
                                </div>
                            )}

                            <h1 className={styles.heroTitle}>
                                {simulation?.title || 'Bài mô phỏng'}
                            </h1>

                            <p className={styles.heroNotice}>
                                {simulation?.notice || 'Trải nghiệm các tình huống công việc thực tế'}
                            </p>

                            <div className={styles.heroMeta}>
                                <span className={styles.heroMetaItem}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
                                        <path d="M7 4.5V7l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                    </svg>
                                    {simulation?.duration || 'Tự hoàn thành'}
                                </span>
                                <span className={styles.heroMetaDot} />
                                <span className={styles.heroMetaItem}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9.5l-3 1.5.5-3.5L2 5l3.5-.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                                    </svg>
                                    Miễn phí
                                </span>
                                <span className={styles.heroMetaDot} />
                                <span className={styles.heroMetaItem}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M2 11c0-2.2 2.2-4 5-4s5 1.8 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                                    </svg>
                                    {simulation?.totalParticipant?.toLocaleString() || 0} học viên
                                </span>
                                {simulation?.avgStar !== undefined && (
                                    <>
                                        <span className={styles.heroMetaDot} />
                                        <span className={styles.heroMetaItem}>
                                            <span className={styles.heroStar}>★</span>
                                            {simulation.avgStar?.toFixed(1)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* RIGHT — Enroll card */}
                        <div className={styles.enrollCard}>
                            <div className={styles.enrollCardBadge}>
                                {isEnrolled ? '✓ Đã tham gia' : getLevelLabel(simulation.level)}
                            </div>

                            <div className={styles.enrollCardTitle}>
                                {isEnrolled ? 'Tiếp tục hành trình' : 'Sẵn sàng bắt đầu?'}
                            </div>

                            <ul className={styles.enrollChecklist}>
                                <li>
                                    <span className={styles.checkIcon}>✓</span>
                                    Hoàn thành công việc dự án thực tế. Tự hoàn thành.
                                </li>
                                <li>
                                    <span className={styles.checkIcon}>✓</span>
                                    Nhận chứng chỉ bổ sung vào hồ sơ & LinkedIn.
                                </li>
                                <li>
                                    <span className={styles.checkIcon}>✓</span>
                                    Không tính điểm, không áp lực.
                                </li>
                            </ul>

                            {renderCtaButton()}

                            <p className={styles.enrollNote}>
                                {isEnrolled
                                    ? `${tasks.length} nhiệm vụ · ${simulation?.duration || ''}`
                                    : 'Hoàn toàn miễn phí · Không cần thẻ tín dụng'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══ TABS ══ */}
                <div className={styles.tabsBar}>
                    <div className={styles.tabsInner}>
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══ CONTENT ══ */}
                <main className={styles.main}>

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className={styles.overviewLayout}>
                            <div className={styles.overviewBody}>
                                <section className={styles.section}>
                                    <h2 className={styles.sectionTitle}>
                                        Tại sao nên hoàn thành bài mô phỏng này?
                                    </h2>
                                    <p className={styles.bodyText}>
                                        {simulation.notice || 'Một cơ hội hoàn hảo để trải nghiệm các công việc thực tế. Thực hành kỹ năng với các nhiệm vụ thực tiễn và tự tin ứng tuyển.'}
                                    </p>

                                    <div className={styles.tagRow}>
                                        <span className={styles.tag}>
                                            ⏱ {simulation.duration || '3–4 giờ'}
                                        </span>
                                        <span className={styles.tag}>Không tính điểm</span>
                                        <span className={styles.tag}>Không áp lực</span>
                                        <span className={styles.tagOutline}>
                                            {getLevelLabel(simulation.level)}
                                        </span>
                                    </div>
                                </section>

                                {simulation.description && (
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Mô tả</h2>
                                        <p className={styles.bodyText}>{simulation.description}</p>
                                    </section>
                                )}

                                {simulation?.overview && (
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Nội dung bạn sẽ học</h2>
                                        <p className={styles.bodyText}>{simulation.overview}</p>
                                    </section>
                                )}

                            </div>

                            {/* SKILLS SIDEBAR */}
                            <aside className={styles.overviewSidebar}>
                                <div className={styles.sideCard}>
                                    <div className={styles.sideCardTitle}>Kỹ năng bạn sẽ thực hành</div>
                                    <div className={styles.skillPills}>
                                        {[ 'Chú ý chi tiết', 'Giải quyết vấn đề', 'Giao tiếp', 'Tư duy phản biện', 'Làm việc nhóm' ].map((s) => (
                                            <span key={s} className={styles.skillPill}>{s}</span>
                                        ))}
                                    </div>
                                    <button className={styles.sideCardLink}>Xem tất cả kỹ năng →</button>
                                </div>

                                <div className={styles.sideCard}>
                                    <div className={styles.sideCardTitle}>Thông tin</div>
                                    <div className={styles.infoList}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Thời gian</span>
                                            <span className={styles.infoVal}>{simulation?.duration || '—'}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Cấp độ</span>
                                            <span className={styles.infoVal}>{getLevelLabel(simulation.level)}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Học viên</span>
                                            <span className={styles.infoVal}>{simulation?.totalParticipant?.toLocaleString() || 0}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Nhiệm vụ</span>
                                            <span className={styles.infoVal}>{tasks.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* TASKS */}
                    {activeTab === 'tasks' && (
                        <div className={styles.tasksLayout}>
                            {tasks.length > 0 ? (
                                <TaskPanel
                                    tasks={tasks}
                                    activeTaskId={defaultActiveTaskId}
                                    onSelectTask={handleTaskSelect}
                                />
                            ) : (
                                <div className={styles.emptyWrap}>
                                    <Empty description="Chưa có nhiệm vụ nào" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* REVIEWS */}
                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsLayout}>
                            <div className={styles.reviewsSummary}>
                                <div className={styles.reviewsScore}>
                                    {simulation?.avgStar?.toFixed(1) || '—'}
                                </div>
                                <div className={styles.reviewsStars}>
                                    {[ 1,2,3,4,5 ].map((n) => (
                                        <span
                                            key={n}
                                            className={n <= getStarCount(simulation?.avgStar) ? styles.starFilled : styles.starEmpty}
                                        >★</span>
                                    ))}
                                </div>
                                <div className={styles.reviewsTotal}>
                                    {simulation?.totalParticipant || 0} đánh giá
                                </div>
                            </div>

                            <div className={styles.reviewsCarousel}>
                                <button className={styles.reviewArrow}>
                                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11L5 7l4-4"/></svg>
                                </button>
                                <blockquote className={styles.reviewQuote}>
                                    <p>&quot;Bài mô phỏng rất hấp dẫn và thực tế. Tôi đã học được nhiều kỹ năng quý giá áp dụng trực tiếp vào công việc.&quot;</p>
                                    <footer>— Học viên từ {simulation.educator?.organization?.name || 'cộng đồng'}</footer>
                                </blockquote>
                                <button className={styles.reviewArrow}>
                                    <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 3l4 4-4 4"/></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                {/* ══ BOTTOM CTA ══ */}
                <div className={styles.bottomCta}>
                    <span>Chưa tìm thấy bài mô phỏng phù hợp?</span>
                    <a href="/" className={styles.bottomCtaLink}>Xem các bài khác →</a>
                </div>
            </div>
            <AppFooter />
        </>
    );
}

export default SimulationDetailDesktop;