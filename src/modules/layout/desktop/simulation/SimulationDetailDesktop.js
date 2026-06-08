import React, { useMemo, useState } from 'react';
import { AppConstants } from '@constants';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import { Empty, Spin } from 'antd';

import TaskPanel from './TaskPanel';

import styles from './detail.module.scss';

const parseOverviewData = (overviewStr) => {
    const fallbackTemplate = {
        introduction: '',
        bager: [ 'Tự học theo tốc độ riêng', '1–2 giờ', 'Không có điểm số', 'Không có bài kiểm tra nào', 'Giới thiệu' ],
        content: '',
        skills: [ 'Chú ý chi tiết', 'Giải quyết vấn đề', 'Giao tiếp', 'Tư duy phản biện', 'Làm việc nhóm' ],
    };
    if (!overviewStr) return fallbackTemplate;
    if (typeof overviewStr === 'object') {
        return {
            introduction: overviewStr.introduction || '',
            bager: Array.isArray(overviewStr.bager) ? overviewStr.bager : (Array.isArray(overviewStr.barger) ? overviewStr.barger : fallbackTemplate.bager),
            content: overviewStr.content || '',
            skills: Array.isArray(overviewStr.skills) ? overviewStr.skills : fallbackTemplate.skills,
        };
    }
    try {
        const parsed = JSON.parse(overviewStr);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return {
                introduction: parsed.introduction || parsed.hero?.description || '',
                bager: Array.isArray(parsed.bager)
                    ? parsed.bager
                    : (Array.isArray(parsed.barger)
                        ? parsed.barger
                        : (Array.isArray(parsed.hero?.badges) ? parsed.hero.badges : fallbackTemplate.bager)),
                content: parsed.content || parsed.intro?.content || '',
                skills: Array.isArray(parsed.skills)
                    ? parsed.skills
                    : fallbackTemplate.skills,
            };
        }
    } catch (e) {
        // ignore
    }
    return { ...fallbackTemplate, content: overviewStr };
};

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:image')) {
        return path;
    }
    return `${AppConstants.contentRootUrl}${path}`;
};

const getVideoUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `${AppConstants.contentRootUrl}${path}`;
};

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

    // ✅ FIX: chỉ lấy id của subtask đầu tiên (kind=2), không dùng task cha (kind=1)
    const defaultActiveTaskId = useMemo(() => {
        if (activeTaskId) return activeTaskId;
        if (!tasks.length) return null;

        // Tìm task cha đầu tiên (kind=1), sắp xếp theo orderInParent
        const firstParent = tasks
            .filter((t) => t.kind === 1)
            .sort((a, b) => (a.orderInParent ?? 0) - (b.orderInParent ?? 0))[0];

        if (!firstParent) return null;

        // Tìm subtask đầu tiên (kind=2) thuộc task cha đó
        const firstSub = tasks
            .filter((t) => t.kind === 2 && t.parent?.id === firstParent.id)
            .sort((a, b) => (a.orderInParent ?? 0) - (b.orderInParent ?? 0))[0];

        // Trả về id subtask đầu tiên; fallback về task cha nếu không có sub
        return firstSub?.id ?? firstParent.id;
    }, [ tasks, activeTaskId ]);

    // ✅ FIX: đếm task cha (kind=1) để hiển thị số nhiệm vụ đúng
    const parentTaskCount = useMemo(
        () => tasks.filter((t) => t.kind === 1).length,
        [ tasks ],
    );

    const overviewData = useMemo(() => parseOverviewData(simulation.overview), [ simulation.overview ]);

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
        // ✅ FIX: dùng parentTaskCount thay vì tasks.length
        { key: 'tasks',    label: `Nhiệm vụ${parentTaskCount ? ` (${parentTaskCount})` : ''}` },
        { key: 'reviews',  label: 'Đánh giá' },
    ];

    return (
        <>
            <AppHeader />
            <div className={styles.page}>

                {/* ══ HERO ══ */}
                <section className={styles.hero}>
                    <div className={styles.heroBg}>
                        {simulation.thumbnail
                            ? <img src={getImageUrl(simulation.thumbnail)} alt="" className={styles.heroBgImg} />
                            : <div className={styles.heroBgGradient} />
                        }
                        <div className={styles.heroBgOverlay} />
                    </div>

                    <div className={styles.heroInner}>
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
                                {simulation?.description || simulation?.notice || 'Trải nghiệm các tình huống công việc thực tế'}
                            </p>

                            <div className={styles.heroMeta}>
                                {(simulation.category?.name || simulation.category?.label) && (
                                    <>
                                        <span className={styles.heroMetaItem}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                            </svg>
                                            {simulation.category?.name || simulation.category?.label}
                                        </span>
                                        <span className={styles.heroMetaDot} />
                                    </>
                                )}
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
                                    // ✅ FIX: hiển thị số task cha, không phải tổng tasks
                                    ? `${parentTaskCount} nhiệm vụ · ${simulation?.duration || ''}`
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
                                    <h2 className={styles.sectionTitle} style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                        Tại sao nên hoàn thành bài mô phỏng công việc này?
                                    </h2>
                                    {overviewData.introduction && (
                                        <div
                                            className={styles.bodyText}
                                            dangerouslySetInnerHTML={{ __html: overviewData.introduction }}
                                        />
                                    )}

                                    <div className={styles.tagRow}>
                                        {overviewData.bager && overviewData.bager.length > 0 ? (
                                            overviewData.bager.map((badge, idx) => (
                                                <span key={idx} className={styles.tagOutline}>
                                                    {badge}
                                                </span>
                                            ))
                                        ) : (
                                            <>
                                                <span className={styles.tag}>⏱ {simulation.duration || '3–4 giờ'}</span>
                                                <span className={styles.tag}>Không tính điểm</span>
                                                <span className={styles.tag}>Không áp lực</span>
                                                <span className={styles.tagOutline}>{getLevelLabel(simulation.level)}</span>
                                            </>
                                        )}
                                    </div>
                                </section>

                                {overviewData.content && (
                                    <section className={styles.section}>
                                        <div
                                            className={styles.bodyText}
                                            dangerouslySetInnerHTML={{ __html: overviewData.content }}
                                        />
                                    </section>
                                )}

                                {simulation.videoPath && (
                                    <section className={styles.section}>
                                        <h2 className={styles.sectionTitle}>Video giới thiệu</h2>
                                        <div style={{ position: 'relative', width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                                            <video
                                                controls
                                                style={{ width: '100%', display: 'block' }}
                                                key={simulation.videoPath}
                                            >
                                                <source src={getVideoUrl(simulation.videoPath)} />
                                                Trình duyệt của bạn không hỗ trợ phát video.
                                            </video>
                                        </div>
                                    </section>
                                )}
                            </div>

                            {/* SKILLS SIDEBAR */}
                            <aside className={styles.overviewSidebar}>
                                <div className={styles.sideCard}>
                                    <div className={styles.sideCardTitle}>Kỹ năng bạn sẽ thực hành</div>
                                    <div className={styles.skillPills}>
                                        {overviewData.skills && overviewData.skills.length > 0 ? (
                                            overviewData.skills.map((s) => (
                                                <span key={s} className={styles.skillPill}>{s}</span>
                                            ))
                                        ) : (
                                            <span style={{ opacity: 0.5, fontSize: 13 }}>Chưa có kỹ năng nào.</span>
                                        )}
                                    </div>
                                    {overviewData.skills && overviewData.skills.length > 5 && (
                                        <button className={styles.sideCardLink}>Xem tất cả kỹ năng →</button>
                                    )}
                                </div>

                                <div className={styles.sideCard}>
                                    <div className={styles.sideCardTitle}>Thông tin</div>
                                    <div className={styles.infoList}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.infoLabel}>Thời gian</span>
                                            <span className={styles.infoVal}>{simulation?.duration || '—'}</span>
                                        </div>
                                        {(simulation.category?.name || simulation.category?.label) && (
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>Chuyên ngành</span>
                                                <span className={styles.infoVal}>{simulation.category?.name || simulation.category?.label}</span>
                                            </div>
                                        )}
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
                                            {/* ✅ FIX: hiển thị số task cha */}
                                            <span className={styles.infoVal}>{parentTaskCount}</span>
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