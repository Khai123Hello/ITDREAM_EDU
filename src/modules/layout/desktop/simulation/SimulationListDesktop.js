import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import SimulationCard from '@components/common/elements/SimulationCard';
import { Empty, Input, Pagination, Select, Spin } from 'antd';

import styles from './index.module.scss';

const LEVEL_OPTIONS = [
    { value: 1, label: 'Cơ bản' },
    { value: 2, label: 'Trung cấp' },
    { value: 3, label: 'Nâng cao' },
];

const QUICK_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'new', label: 'Mới nhất' },
    { key: 'short', label: 'Dưới 60 phút' },
    { key: 'hiring', label: 'Đang tuyển dụng' },
];

const SORT_OPTIONS = [
    { value: 'popular', label: 'Phổ biến nhất' },
    { value: 'newest', label: 'Mới nhất' },
    { value: 'rating', label: 'Đánh giá cao' },
    { value: 'short', label: 'Thời lượng ngắn' },
];

function SimulationListDesktop({
    simulations = [],
    categories = [],
    loading,
    error,
    onRetry,
    filters = {},
    onFilterChange,
    pagination = {},
    onPaginationChange,
}) {
    const navigate = useNavigate();
    const [ searchValue, setSearchValue ] = useState(filters.title || '');
    const [ activeQuick, setActiveQuick ] = useState('all');
    const [ sortBy, setSortBy ] = useState('popular');
    const searchTimeout = React.useRef(null);

    const handleSearchChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSearchValue(value);
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            searchTimeout.current = setTimeout(() => {
                onFilterChange({ ...filters, title: value });
            }, 500);
        },
        [ filters, onFilterChange ],
    );

    const handleSearchClick = useCallback(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        onFilterChange({ ...filters, title: searchValue });
    }, [ filters, onFilterChange, searchValue ]);

    const handleLevelChange = useCallback(
        (value) => {
            onFilterChange({ ...filters, level: value });
        },
        [ filters, onFilterChange ],
    );

    const handleCategoryChange = useCallback(
        (value) => {
            onFilterChange({ ...filters, categoryId: value });
        },
        [ filters, onFilterChange ],
    );

    const handleCardClick = useCallback(
        (id) => {
            navigate(`/simulations/${id}`);
        },
        [ navigate ],
    );

    const categoryOptions = useMemo(
        () => (Array.isArray(categories) ? categories.map((cat) => ({ value: cat.id, label: cat.name })) : []),
        [ categories ],
    );

    const total = pagination.total || 0;
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || 16;
    const resultStart = total === 0 ? 0 : (current - 1) * pageSize + 1;
    const resultEnd = Math.min(current * pageSize, total);

    return (
        <div className={styles.container}>
            {/* HERO */}
            <section className={styles.hero}>
                <p className={styles.heroLabel}>Nền tảng học tập</p>
                <h1 className={styles.heroTitle}>Các bài mô phỏng</h1>
                <p className={styles.heroSubtitle}>
                    Khám phá các bài mô phỏng thực tế từ doanh nghiệp hàng đầu để rèn luyện kỹ năng và nổi bật với nhà tuyển
                    dụng.
                </p>

                {/* SEARCH BAR */}
                <div className={styles.searchWrap}>
                    <div className={styles.searchBox}>
                        <Input
                            prefix={<SearchOutlined />}
                            placeholder="Tìm kiếm bài mô phỏng..."
                            value={searchValue}
                            onChange={handleSearchChange}
                            allowClear
                        />
                    </div>

                    <Select
                        placeholder="Độ khó"
                        value={filters.level || undefined}
                        onChange={handleLevelChange}
                        options={LEVEL_OPTIONS}
                        allowClear
                        className={styles.selectFilter}
                    />

                    <Select
                        placeholder="Danh mục"
                        value={filters.categoryId || undefined}
                        onChange={handleCategoryChange}
                        options={categoryOptions}
                        allowClear
                        className={styles.selectFilter}
                    />

                    <button className={styles.searchBtn} onClick={handleSearchClick}>
                        <svg
                            width="16"
                            height="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        Tìm kiếm
                    </button>
                </div>
            </section>

            {/* FILTER PILLS BAR */}
            <section className={styles.filtersSection}>
                <div className={styles.filterRow}>
                    {QUICK_FILTERS.map((f) => (
                        <button
                            key={f.key}
                            className={`${styles.filterPill} ${activeQuick === f.key ? styles.active : ''}`}
                            onClick={() => setActiveQuick(f.key)}
                        >
                            {f.label}
                            {f.key === 'all' && total > 0 && <span className={styles.tabCount}>{total}</span>}
                        </button>
                    ))}

                    <div className={styles.filterDivider} />

                    <button className={styles.filterChip}>Ngành nghề ▾</button>
                    <button className={styles.filterChip}>Lĩnh vực ▾</button>
                    <button className={styles.filterChip}>Tổ chức ▾</button>
                    <button className={styles.filterChip}>Thời lượng ▾</button>
                </div>
            </section>

            {/* CONTENT */}
            <section className={styles.contentSection}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Spin />
                    </div>
                ) : error ? (
                    <div className={styles.errorContainer}>
                        <Empty description="Lỗi tải dữ liệu" />
                        <button className={styles.retryBtn} onClick={onRetry}>
                            Thử lại
                        </button>
                    </div>
                ) : simulations.length === 0 ? (
                    <div className={styles.emptyContainer}>
                        <Empty description="Không tìm thấy bài mô phỏng nào" />
                    </div>
                ) : (
                    <>
                        <div className={styles.resultRow}>
                            <p className={styles.resultCount}>
                                Hiển thị{' '}
                                <strong>
                                    {resultStart}&ndash;{resultEnd}
                                </strong>{' '}
                                trong <strong>{total}</strong> bài mô phỏng
                            </p>
                            <select
                                className={styles.sortSelect}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.grid}>
                            {Array.isArray(simulations) &&
                                simulations.map((sim) => (
                                    <div key={sim.id} className={styles.gridItem}>
                                        <SimulationCard
                                            id={sim.id}
                                            title={sim.title}
                                            thumbnail={sim.thumbnail}
                                            level={sim.level}
                                            duration={sim.duration}
                                            totalParticipant={sim.totalParticipant}
                                            avgStar={sim.avgStar}
                                            organization={{
                                                name: sim.educator?.organization?.name,
                                                shortName: sim.educator?.organization?.shortName,
                                                logoUrl: sim.educator?.organization?.logoUrl,
                                            }}
                                            category={sim.category?.name || 'N/A'}
                                            onClick={() => handleCardClick(sim.id)}
                                        />
                                    </div>
                                ))}
                        </div>

                        <div className={styles.paginationContainer}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={onPaginationChange}
                                showSizeChanger={false}
                                locale={{
                                    items_per_page: '/ trang',
                                    jump_to: 'Đi đến',
                                    jump_to_confirm: 'xác nhận',
                                    page: '',
                                }}
                            />
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default SimulationListDesktop;
