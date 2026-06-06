import React from 'react';

import styles from './index.module.scss';

const TOP_CARDS = [
    {
        badgeDots: [ 'filled', 'filled2', 'empty', 'empty', 'empty' ],
        title: 'Hồ sơ của bạn chưa hoàn thiện',
        description: 'Hồ sơ đầy đủ giúp bạn có cơ hội kết nối với nhà tuyển dụng.',
        link: '/profile',
        linkText: 'Cập nhật hồ sơ',
    },
    {
        recommended: true,
        company: 'BRITISH AIRWAYS',
        companyClass: 'companyBa',
        role: 'Data Science',
    },
    {
        recommended: true,
        company: 'Skyscanner',
        companyClass: 'companySky',
        role: 'Front-End Software Engineering',
    },
    {
        resume: true,
        company: 'TATA',
        companyClass: 'companyTata',
        role: 'GenAI Powered Data Analytics',
    },
];

const MOCK_RECOMMENDED_SIMS = [
    {
        id: 1,
        thumbLabel: 'BA',
        thumbClass: 'thumbBa',
        company: 'BRITISH AIRWAYS',
        companyClass: 'companyBa',
        title: 'Data Science',
        meta: [ '📊 Data & Analytics', '● Trung cấp', '🕐 3–4 giờ' ],
    },
    {
        id: 2,
        thumbLabel: 'SKY',
        thumbClass: 'thumbSky',
        company: 'Skyscanner',
        companyClass: 'companySky',
        title: 'Front-End Software Engineering',
        meta: [ '💻 Software Engineering', '● Cơ bản', '🕐 1–2 giờ' ],
    },
];

const MOCK_ACHIEVEMENT = {
    icon: '🎯',
    title: 'Bắt đầu sự nghiệp ngay hôm nay',
    description: 'Tham gia mô phỏng dự án để nhận chứng chỉ và làm đẹp hồ sơ của bạn.',
};

const MOCK_JOBS = [
    {
        id: 1,
        title: 'Comcast Talent Network',
        description: 'Nhận thông tin cơ hội việc làm và sự kiện tuyển dụng.',
        company: 'COMCAST',
        companyClass: 'companyComcast',
    },
    {
        id: 2,
        title: 'Siemens Mobility Careers',
        description: 'Khám phá các vị trí đang tuyển dụng.',
        company: 'SIEMENS',
        companyClass: 'companySiemens',
    },
    {
        id: 3,
        title: 'Student Marketeer – Various Locations',
        description: 'Khởi đầu sự nghiệp cùng Red Bull',
        company: 'Red Bull',
        companyClass: 'companyRedbull',
        closeDate: '30/06/2026',
    },
];

function DashboardDesktop({ profile, enrolledSims = [], achievements = [], loading }) {
    const name = profile?.fullName || profile?.account?.fullName || '';

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.greeting}>Xin chào{name ? `, ${name.split(' ')[0]}!` : '!'}</h1>

                <div className={styles.topCards}>
                    {TOP_CARDS.map((card, idx) => (
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
                            <div className={`${styles.companyName} ${styles[card.companyClass] || ''}`}>
                                {card.company}
                            </div>
                            <div className={styles.roleText}>{card.role}</div>
                            {card.title && <h4 className={styles.topCardTitle}>{card.title}</h4>}
                            {card.description && <p className={styles.topCardDesc}>{card.description}</p>}
                            <div className={styles.cardActions}>
                                <button className={styles.btnDismiss}>Bỏ qua</button>
                                {card.link ? (
                                    <a className={styles.linkBtn} href={card.link}>
                                        Cập nhật hồ sơ <span className={styles.chevron}></span>
                                    </a>
                                ) : (
                                    <button className={styles.linkBtn}>
                                        Bắt đầu <span className={styles.chevron}></span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.twoCol}>
                    <div>
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🚀</span> Bài mô phỏng đã đăng ký
                        </div>

                        {loading ? (
                            <div className={styles.loadingBox}>Đang tải...</div>
                        ) : enrolledSims.length === 0 ? (
                            <div className={styles.emptyBox}>Bạn chưa đăng ký bài mô phỏng nào.</div>
                        ) : (
                            enrolledSims.map((item) => {
                                const sim = item.simulation || {};
                                const org = sim.educator?.organization || {};
                                const orgName = org.shortName || org.name || '';
                                const tasksLeft = sim.totalParticipant ? `${sim.totalParticipant} nhiệm vụ` : '';
                                return (
                                    <div key={item.id} className={styles.simCard}>
                                        <div>
                                            <div className={styles.simCardBody}>
                                                <h4>{sim.title || 'Chưa có tiêu đề'}</h4>
                                                <p>{sim.notice || 'Không có mô tả'}</p>
                                                {tasksLeft && <div className={styles.tasksLeft}>{tasksLeft}</div>}
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button className={styles.btnDismiss}>Bỏ qua</button>
                                                <button className={styles.linkBtn}>
                                                    Tiếp tục <span className={styles.chevron}></span>
                                                </button>
                                            </div>
                                        </div>
                                        {orgName && <div className={styles.simLogo}>{orgName}</div>}
                                    </div>
                                );
                            })
                        )}

                        <a className={styles.viewAll} href="/simulations">
                            Tất cả bài mô phỏng <span className={styles.chevron}></span>
                        </a>

                        <div className={styles.sectionTitle} style={{ marginTop: 32 }}>
                            <span className={styles.sectionIcon}>⭐</span> Bài mô phỏng gợi ý
                        </div>

                        {MOCK_RECOMMENDED_SIMS.map((sim) => (
                            <div key={sim.id} className={styles.recSimCard}>
                                <div className={`${styles.recSimThumb} ${styles[sim.thumbClass]}`}>
                                    {sim.thumbLabel}
                                </div>
                                <div className={styles.recSimBody}>
                                    <div className={`${styles.companyName} ${styles[sim.companyClass]}`}>
                                        {sim.company}
                                    </div>
                                    <div className={styles.simTitle}>{sim.title}</div>
                                    <div className={styles.recSimMeta}>
                                        {sim.meta.map((m, i) => (
                                            <span key={i}>{m}</span>
                                        ))}
                                    </div>
                                    <div className={styles.cardActions}>
                                        <button className={styles.btnDismiss}>Bỏ qua</button>
                                        <button className={styles.linkBtn}>
                                            Xem chi tiết <span className={styles.chevron}></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <a className={styles.viewAll} href="/simulations">
                            Xem tất cả <span className={styles.chevron}></span>
                        </a>
                    </div>

                    <div>
                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>🏆</span> Thành tích
                        </div>

                        {achievements.length > 0 ? (
                            achievements.map((ach) => (
                                <div key={ach.id} className={styles.achievementCard} style={{ marginBottom: 24 }}>
                                    <div className={styles.trophyIcon}>🎯</div>
                                    <div>
                                        <h4>{ach.simulation?.title || 'Thành tích'}</h4>
                                        {ach.filePath && (
                                            <p className={styles.achievementDesc}>Chứng chỉ đã hoàn thành</p>
                                        )}
                                    </div>
                                </div>
                            ))
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
                                    >
                                        Khám phá bài mô phỏng <span className={styles.chevron}></span>
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>💼</span> Việc làm phù hợp
                        </div>

                        {MOCK_JOBS.map((job) => (
                            <div key={job.id} className={styles.jobCard}>
                                <div>
                                    <h4>{job.title}</h4>
                                    <p>{job.description}</p>
                                    {job.closeDate && (
                                        <div className={styles.closeDate}>🕐 Đóng vào {job.closeDate}</div>
                                    )}
                                    <div className={styles.cardActions}>
                                        <button className={styles.btnDismiss}>Không quan tâm</button>
                                        <button className={styles.linkBtn}>
                                            Xem chi tiết <span className={styles.chevron}></span>
                                        </button>
                                    </div>
                                </div>
                                <div className={`${styles.companyBadge} ${styles[job.companyClass]}`}>
                                    {job.companyClass === 'companyRedbull' ? (
                                        <div className={styles.redbullBadge}>Red Bull</div>
                                    ) : (
                                        job.company
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default DashboardDesktop;
