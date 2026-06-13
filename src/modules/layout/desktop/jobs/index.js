import React, { useMemo, useState } from 'react';
import classNames from 'classnames';

import styles from './index.module.scss';

const MOCK_JOBS = [
    {
        id: 'baker2',
        company: 'Baker McKenzie.',
        title: "Bakers' Dozen 2 (Diễn ra qua Zoom)",
        desc: 'Hỏi đáp về đơn xin thực tập làm sáng: Giải đáp mọi thắc mắc của bạn – Buổi 1',
        tags: ['SẮP TỚI', 'SỰ KIỆN'],
        tagType: 'event',
        location: 'Ảo',
        country: 'Toàn cầu',
        opportunityType: 'Sự kiện',
        roleType: 'Thực tập sinh',
        field: 'Pháp luật',
        date: 'Vào ngày 16 tháng 6 năm 2026',
        detailTitle: "Bakers' Dozen 2 (Diễn ra qua Zoom)",
        detailDesc:
            "Hiện tại chúng tôi đang mở đơn đăng ký cho đợt thực tập Bakers' Dozen. Vui lòng tham gia buổi Hỏi đáp để tìm hiểu thêm về quy trình tuyển dụng và phỏng vấn của chúng tôi.",
        simulation: {
            category: 'Pháp luật',
            name: 'Luật Thương mại',
            duration: '4–5 giờ',
            dots: 1,
        },
        achievements: ['Đoạn trích sơ yếu lý lịch', 'Mẹo phỏng vấn', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #0f2042, #1b3564, #1a56db)',
        isRecommended: true,
    },
    {
        id: 'slaughter',
        company: 'SLAUGHTER AND MAY',
        title: 'Hỏi đáp về đơn xin hợp đồng đào tạo – Thứ Ba, ngày 16 tháng 6 năm 2026',
        desc: 'Tìm hiểu thêm về quy trình nộp đơn và phỏng vấn của chúng tôi!',
        tags: ['SẮP TỚI', 'SỰ KIỆN'],
        tagType: 'event',
        location: 'Ảo',
        country: 'Anh Quốc',
        opportunityType: 'Sự kiện',
        roleType: 'Chính thức',
        field: 'Pháp luật',
        date: 'Ngày 17 tháng 6 năm 2026',
        detailTitle: 'Hỏi đáp về đơn xin hợp đồng đào tạo – Thứ Ba, ngày 16 tháng 6 năm 2026',
        detailDesc:
            'Hiện tại chúng tôi đang mở đơn đăng ký cho đợt thực tập theo hợp đồng tháng 9 năm 2028/tháng 3 năm 2029. Vị trí này dành cho sinh viên luật năm cuối, sinh viên dự bị ngành luật và sinh viên tốt nghiệp ngành luật, và hạn nộp đơn sẽ kết thúc vào thứ Sáu ngày 3 tháng 7.\n\nĐể tìm hiểu thêm về quy trình nộp đơn và phỏng vấn của chúng tôi, hãy đăng ký tham gia buổi Hỏi đáp về Hợp đồng Đào tạo diễn ra vào Thứ Ba, ngày 16 tháng 6, từ 1 giờ chiều đến 2 giờ chiều.',
        simulation: {
            category: 'Pháp luật',
            name: 'Luật Thương mại',
            duration: '4–5 giờ',
            dots: 1,
        },
        achievements: ['Đoạn trích sơ yếu lý lịch', 'Mẹo phỏng vấn', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
        isRecommended: true,
    },
    {
        id: 'kpmg',
        company: 'KPMG',
        title: 'Hãy làm chủ câu chuyện của bạn – Sự kiện LGBTQIA+ của KPMG',
        desc: 'Bạn được trân trọng mời tham dự sự kiện "Làm chủ câu chuyện của chính mình" – Một sự kiện dành cho cộng đồng LGBTQIA+ do KPMG tổ chức.',
        tags: ['SẮP TỚI', 'SỰ KIỆN'],
        tagType: 'event',
        location: 'Ảo',
        country: 'Toàn cầu',
        opportunityType: 'Sự kiện',
        roleType: 'Thực tập sinh',
        field: 'Tư vấn',
        date: 'Vào ngày 18 tháng 6 năm 2026',
        detailTitle: 'Hãy làm chủ câu chuyện của bạn – Sự kiện LGBTQIA+ của KPMG',
        detailDesc:
            'Bạn được trân trọng mời tham dự sự kiện "Làm chủ câu chuyện của chính mình" – Một sự kiện dành cho cộng đồng LGBTQIA+ do KPMG tổ chức để lắng nghe các chuyên gia chia sẻ câu chuyện vượt qua thách thức và khẳng định bản thân.',
        simulation: {
            category: 'Tư vấn',
            name: 'Phát triển Kỹ năng Tư vấn',
            duration: '3–4 giờ',
            dots: 2,
        },
        achievements: ['Mẹo phỏng vấn', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #00338d, #0056b3, #389cfb)',
        isRecommended: false,
    },
    {
        id: 'baker3',
        company: 'Baker McKenzie.',
        title: "Bakers' Dozen 3 (Diễn ra qua Zoom)",
        desc: 'Cuộc sống của một luật sư toàn cầu tại Bakers',
        tags: ['SẮP TỚI', 'SỰ KIỆN'],
        tagType: 'event',
        location: 'Ảo',
        country: 'Toàn cầu',
        opportunityType: 'Sự kiện',
        roleType: 'Thực tập sinh',
        field: 'Pháp luật',
        date: 'Vào ngày 19 tháng 6 năm 2026',
        detailTitle: "Bakers' Dozen 3 (Diễn ra qua Zoom)",
        detailDesc:
            'Khám phá cuộc sống làm việc thực tế tại văn phòng luật sư toàn cầu Baker McKenzie, nơi bạn sẽ được tham gia vào các giao dịch xuyên quốc gia.',
        simulation: {
            category: 'Pháp luật',
            name: 'Luật Thương mại',
            duration: '4–5 giờ',
            dots: 1,
        },
        achievements: ['Đoạn trích sơ yếu lý lịch', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #0f2042, #1b3564, #1a56db)',
        isRecommended: false,
    },
    {
        id: 'baker4',
        company: 'Baker McKenzie.',
        title: "Bakers' Dozen 4 (Diễn ra qua Zoom)",
        desc: 'Hỏi đáp với đối tác',
        tags: ['SẮP TỚI', 'SỰ KIỆN'],
        tagType: 'event',
        location: 'Ảo',
        country: 'Toàn cầu',
        opportunityType: 'Sự kiện',
        roleType: 'Thực tập sinh',
        field: 'Pháp luật',
        date: 'Vào ngày 26 tháng 6 năm 2026',
        detailTitle: "Bakers' Dozen 4 (Diễn ra qua Zoom)",
        detailDesc:
            'Cơ hội có một không hai để trò chuyện trực tiếp và hỏi đáp các thắc mắc của bạn với các đối tác cấp cao của Baker McKenzie.',
        simulation: {
            category: 'Pháp luật',
            name: 'Luật Thương mại',
            duration: '4–5 giờ',
            dots: 3,
        },
        achievements: ['Mẹo phỏng vấn', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #0f2042, #1b3564, #1a56db)',
        isRecommended: false,
    },
    {
        id: 'whitecase',
        company: 'WHITE & CASE',
        title: 'Chương trình thực tập hè Sydney 2026',
        desc: 'Đã đến lúc bạn tạo dấu ấn riêng.',
        tags: ['CÔNG VIỆC'],
        tagType: 'job',
        location: 'Úc',
        country: 'Úc',
        opportunityType: 'Công việc',
        roleType: 'Thực tập sinh',
        field: 'Pháp luật',
        date: 'Hạn chót là ngày 13 tháng 7 năm 2026',
        detailTitle: 'Chương trình thực tập hè Sydney 2026',
        detailDesc:
            'Chương trình thực tập hè Sydney 2026 của White & Case mang đến cho bạn cơ hội tham gia các giao dịch thực tế lớn, làm việc với đội ngũ luật sư hàng đầu thế giới.',
        simulation: {
            category: 'Pháp luật',
            name: 'Luật Toàn cầu',
            duration: '5–6 giờ',
            dots: 2,
        },
        achievements: ['Đoạn trích sơ yếu lý lịch', 'Giấy chứng nhận', 'Kỹ năng'],
        bannerGradient: 'linear-gradient(135deg, #1a1a2e, #333, #0d2b5e)',
        isRecommended: false,
    },
];

function JobsDesktop() {
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [savedJobIds, setSavedJobIds] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'recommended', 'saved', 'applied'

    // Dropdown filters
    const [opportunityFilter, setOpportunityFilter] = useState('Tất cả');
    const [countryFilter, setCountryFilter] = useState('Tất cả');
    const [companyFilter, setCompanyFilter] = useState('Tất cả');
    const [roleFilter, setRoleFilter] = useState('Tất cả');
    const [fieldFilter, setFieldFilter] = useState('Tất cả');

    const handleSelectJob = (jobId) => {
        setSelectedJobId(jobId);
    };

    const handleToggleSaveJob = (e, jobId) => {
        e.stopPropagation();
        setSavedJobIds((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    };

    const handleApplyJob = (jobId) => {
        setAppliedJobIds((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
    };

    const getAchievementIcon = (achievementName) => {
        switch (achievementName) {
            case 'Đoạn trích sơ yếu lý lịch':
                return (
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );
            case 'Mẹo phỏng vấn':
                return (
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.82m2.56-5.84a14.982 14.982 0 00-6.16 12.12A14.98 14.98 0 0014.37 8.41m-2.56 5.96a14.926 14.926 0 00-5.84 2.56"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );
            case 'Giấy chứng nhận':
                return (
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );
            case 'Kỹ năng':
                return (
                    <svg viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Filter logic
    const filteredJobs = useMemo(() => {
        return MOCK_JOBS.filter((job) => {
            // Tab filter
            if (selectedTab === 'recommended' && !job.isRecommended) return false;
            if (selectedTab === 'saved' && !savedJobIds.includes(job.id)) return false;
            if (selectedTab === 'applied' && !appliedJobIds.includes(job.id)) return false;

            // Dropdown filters
            if (opportunityFilter !== 'Tất cả' && job.opportunityType !== opportunityFilter) return false;
            if (countryFilter !== 'Tất cả' && job.country !== countryFilter) return false;
            if (companyFilter !== 'Tất cả' && job.company !== companyFilter) return false;
            if (roleFilter !== 'Tất cả' && job.roleType !== roleFilter) return false;
            if (fieldFilter !== 'Tất cả' && job.field !== fieldFilter) return false;

            return true;
        });
    }, [
        selectedTab,
        savedJobIds,
        appliedJobIds,
        opportunityFilter,
        countryFilter,
        companyFilter,
        roleFilter,
        fieldFilter,
    ]);

    // Active job details
    const activeJob = useMemo(() => {
        return MOCK_JOBS.find((job) => job.id === selectedJobId) || null;
    }, [selectedJobId]);

    return (
        <div className={styles.jobsContainer}>
            {/* HERO */}
            <div className={styles.hero}>
                <h1>Cơ hội thực tập, vị trí dành cho người mới bắt đầu sự nghiệp và cơ hội kết nối.</h1>
                <p>
                    Khám phá các cơ hội thực tập, việc làm dành cho sinh viên sắp tốt nghiệp và các sự kiện độc quyền từ
                    các công ty hàng đầu trên ITDream, được thiết kế riêng cho sinh viên đại học và những người mới bắt
                    đầu sự nghiệp.
                </p>
            </div>

            {/* FILTER BAR */}
            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'all' })}
                        onClick={() => {
                            setSelectedTab('all');
                            setSelectedJobId(null);
                        }}
                    >
                        Tất cả
                    </button>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'recommended' })}
                        onClick={() => {
                            setSelectedTab('recommended');
                            setSelectedJobId(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </svg>
                        Khuyến khích
                    </button>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'saved' })}
                        onClick={() => {
                            setSelectedTab('saved');
                            setSelectedJobId(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M9 7h6M9 11h6M9 15h4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Đã lưu ({savedJobIds.length})
                    </button>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'applied' })}
                        onClick={() => {
                            setSelectedTab('applied');
                            setSelectedJobId(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </svg>
                        Đã áp dụng ({appliedJobIds.length})
                    </button>
                </div>

                <div className={styles.filterDropdowns}>
                    <div className={styles.selectWrapper}>
                        <select
                            value={opportunityFilter}
                            onChange={(e) => setOpportunityFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại cơ hội: Tất cả</option>
                            <option value="Sự kiện">Sự kiện</option>
                            <option value="Công việc">Công việc</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Quốc gia: Tất cả</option>
                            <option value="Toàn cầu">Toàn cầu</option>
                            <option value="Anh Quốc">Anh Quốc</option>
                            <option value="Úc">Úc</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Công ty: Tất cả</option>
                            <option value="Baker McKenzie.">Baker McKenzie.</option>
                            <option value="SLAUGHTER AND MAY">SLAUGHTER AND MAY</option>
                            <option value="KPMG">KPMG</option>
                            <option value="WHITE & CASE">WHITE & CASE</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại vai trò: Tất cả</option>
                            <option value="Thực tập sinh">Thực tập sinh</option>
                            <option value="Chính thức">Chính thức</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={fieldFilter}
                            onChange={(e) => setFieldFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Lĩnh vực: Tất cả</option>
                            <option value="Pháp luật">Pháp luật</option>
                            <option value="Tư vấn">Tư vấn</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.resultCount}>
                Hiển thị 1–{filteredJobs.length} trong số {filteredJobs.length} cơ hội
            </div>

            {/* MAIN LAYOUT */}
            <div className={classNames(styles.mainLayout, { [styles.panelOpen]: activeJob !== null })}>
                {/* LEFT: JOB LIST */}
                <div className={styles.jobList}>
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className={classNames(styles.jobCard, {
                                    [styles.selected]: selectedJobId === job.id,
                                })}
                                onClick={() => handleSelectJob(job.id)}
                            >
                                <div className={styles.cardTop}>
                                    <div className={styles.companyNameText}>{job.company}</div>
                                    <div className={styles.cardTags}>
                                        {job.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className={classNames(styles.tag, {
                                                    [styles.tagSoon]: tag === 'SẮP TỚI',
                                                    [styles.tagEvent]: tag === 'SỰ KIỆN',
                                                    [styles.tagJob]: tag === 'CÔNG VIỆC',
                                                })}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.cardTitle}>{job.title}</div>
                                <div className={styles.cardDesc}>{job.desc}</div>
                                <div className={styles.cardMeta}>
                                    <span>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        {job.location}
                                    </span>
                                    <span>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                            <path
                                                d="M12 7v5l3 3"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        {job.date}
                                    </span>
                                    <button
                                        className={classNames(styles.saveBtn, {
                                            [styles.saved]: savedJobIds.includes(job.id),
                                        })}
                                        onClick={(e) => handleToggleSaveJob(e, job.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noJobs}>Không tìm thấy cơ hội việc làm nào phù hợp.</div>
                    )}
                </div>

                {/* RIGHT: DETAIL PANEL */}
                <div className={styles.rightColumn}>
                    {activeJob ? (
                        <div className={classNames(styles.detailPanel, styles.visible)}>
                            <div className={styles.detailHeroImg} style={{ background: activeJob.bannerGradient }}>
                                <div className={styles.logoOverlay}>{activeJob.company}</div>
                            </div>

                            <div className={styles.detailBody}>
                                <div className={styles.detailTags}>
                                    {activeJob.tags.map((tag, i) => (
                                        <span
                                            key={i}
                                            className={classNames(styles.tag, {
                                                [styles.tagSoon]: tag === 'SẮP TỚI',
                                                [styles.tagEvent]: tag === 'SỰ KIỆN',
                                                [styles.tagJob]: tag === 'CÔNG VIỆC',
                                            })}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.detailTitle}>{activeJob.detailTitle}</div>

                                <div className={styles.detailMetaRow}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                        <path
                                            d="M12 7v5l3 3"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className={styles.label}>Ngày:</span> {activeJob.date}
                                </div>
                                <div className={styles.detailMetaRow}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                        <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    <span className={styles.label}>Địa điểm làm việc:</span> {activeJob.location}
                                </div>
                                <div className={classNames(styles.detailMetaRow, styles.eligibilityRow)}>
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path
                                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        />
                                    </svg>
                                    Chỉ công dân và thường trú nhân <strong>được hưởng quyền làm việc</strong>.
                                </div>

                                <div className={styles.actionBtns}>
                                    <button
                                        className={classNames(styles.btnPrimary, {
                                            [styles.applied]: appliedJobIds.includes(activeJob.id),
                                        })}
                                        onClick={() => handleApplyJob(activeJob.id)}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                            <path
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        {appliedJobIds.includes(activeJob.id) ? 'Hủy ứng tuyển' : 'Đăng ký'}
                                    </button>
                                    <button
                                        className={classNames(styles.btnSecondary, {
                                            [styles.appliedActive]: appliedJobIds.includes(activeJob.id),
                                        })}
                                        onClick={() => handleApplyJob(activeJob.id)}
                                    >
                                        {appliedJobIds.includes(activeJob.id) ? 'Tôi đã đăng ký' : 'Chưa đăng ký'}
                                    </button>
                                </div>

                                <div className={styles.detailDescWrapper}>
                                    {activeJob.detailDesc.split('\n\n').map((para, i) => (
                                        <p key={i} className={styles.detailDesc}>
                                            {para}
                                        </p>
                                    ))}
                                </div>

                                <hr className={styles.divider} />

                                {/* SIMULATIONS */}
                                <div className={styles.detailSectionTitle}>Mô phỏng công việc liên quan</div>
                                <p className={styles.simulationIntro}>
                                    Hãy tìm hiểu cách thức công việc được thực hiện để nổi bật trong các buổi phỏng vấn.
                                    Cho đội ngũ tại {activeJob.company} thấy rằng bạn có những kỹ năng cần thiết để
                                    thành công trong công việc.
                                </p>

                                <div className={styles.simCard}>
                                    <div className={styles.simThumb}>
                                        {activeJob.simulation.category.substring(0, 7).toUpperCase()}
                                    </div>
                                    <div className={styles.simInfo}>
                                        <div className={styles.simLabel}>{activeJob.simulation.category}</div>
                                        <div className={styles.simName}>{activeJob.simulation.name}</div>
                                        <div className={styles.simMeta}>
                                            <span>Giới thiệu</span>
                                            <div className={styles.simDots}>
                                                <div
                                                    className={classNames(styles.dot, {
                                                        [styles.filled]: activeJob.simulation.dots >= 1,
                                                    })}
                                                />
                                                <div
                                                    className={classNames(styles.dot, {
                                                        [styles.filled]: activeJob.simulation.dots >= 2,
                                                    })}
                                                />
                                                <div
                                                    className={classNames(styles.dot, {
                                                        [styles.filled]: activeJob.simulation.dots >= 3,
                                                    })}
                                                />
                                            </div>
                                            <span>{activeJob.simulation.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <hr className={styles.divider} />

                                {/* ACHIEVEMENTS */}
                                <div className={styles.detailSectionTitle}>Thành tích có sẵn</div>
                                <p className={styles.simulationIntro}>
                                    Đây là những thành tích bạn có thể đạt được khi hoàn thành các bài mô phỏng công
                                    việc liên kết. Chúng sẽ giúp bạn có lợi thế hơn.
                                </p>
                                <div className={styles.achievementsGrid}>
                                    {activeJob.achievements.map((ach, i) => (
                                        <div key={i} className={styles.achievementItem}>
                                            {getAchievementIcon(ach)}
                                            {ach}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.upsellPanel}>
                            <h3>Tăng cơ hội tuyển dụng của bạn</h3>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Hoàn thành bài mô phỏng công việc liên kết để nhận huy hiệu ưu tiên nộp đơn.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Chia sẻ thành tích trực tiếp với đội ngũ tuyển dụng của doanh nghiệp đối tác.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>Tạo ấn tượng sâu sắc hơn thông qua các kỹ năng thực tế đã được kiểm chứng.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobsDesktop;
