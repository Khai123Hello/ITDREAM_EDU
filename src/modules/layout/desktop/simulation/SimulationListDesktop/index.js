import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined } from '@ant-design/icons';
import { DEFAULT_PAGE_SIZE } from '@constants';
import SimulationCard from '@components/common/elements/SimulationCard';
import { Empty, Input, Pagination, Spin } from 'antd';

import styles from './index.module.scss';

const LEVEL_OPTIONS = [
    { value: 1, label: 'Cơ bản' },
    { value: 2, label: 'Trung cấp' },
    { value: 3, label: 'Nâng cao' },
];

const DURATION_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'under1h', label: 'Dưới 60 phút' },
    { value: '1to2h', label: '1 - 2 giờ' },
    { value: '2to4h', label: '2 - 4 giờ' },
    { value: 'over4h', label: 'Trên 4 giờ' },
];

const parseDurationInHours = (durationStr) => {
    if (!durationStr) return 0;
    const lower = durationStr.toLowerCase();
    
    // Check if it contains minutes
    if (lower.includes('phút') || lower.includes('min')) {
        const mins = parseInt(lower.replace(/\D/g, ''), 10) || 0;
        return mins / 60;
    }
    
    // Extract numbers
    const numbers = lower.match(/\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return 0;
    
    if (numbers.length === 1) {
        return parseFloat(numbers[0]);
    }
    
    // If range like "3-4 giờ", take average
    const start = parseFloat(numbers[0]);
    const end = parseFloat(numbers[1]);
    return (start + end) / 2;
};

// Reusable Dropdown Select Component to mimic Forage's pill-style selectors
const DropdownFilter = ({ label, value, options, onChange }) => {
    const [ isOpen, setIsOpen ] = useState(false);
    const ref = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);
    const displayLabel = selectedOption ? selectedOption.label : 'Tất cả';
    const isFiltered = value !== undefined && value !== 'all';

    return (
        <div className={styles.dropdownFilterWrapper} ref={ref}>
            <button
                type="button"
                className={`${styles.dropdownBtn} ${isFiltered ? styles.dropdownBtnActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={styles.dropdownLabel}>{label}</span>
                <span className={styles.dropdownValue}>{displayLabel}</span>
                <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowOpen : ''}`}>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className={styles.dropdownMenuCustom}>
                    {options.map((opt) => (
                        <button
                            type="button"
                            key={opt.value}
                            className={`${styles.dropdownItemCustom} ${
                                (opt.value === value || (value === undefined && opt.value === 'all'))
                                    ? styles.dropdownItemActive
                                    : ''
                            }`}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

function SimulationListDesktop({
    simulations = [],
    categories = [],
    organizations = [],
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
    
    // Local filter states for horizontal filters
    const [ activeQuickFilter, setActiveQuickFilter ] = useState('all');
    const [ localDuration, setLocalDuration ] = useState('all');

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

    const handleFilterUpdate = useCallback(
        (key, value) => {
            const val = value === 'all' ? undefined : value;
            onFilterChange({ ...filters, [key]: val });
        },
        [ filters, onFilterChange ],
    );

    const handleClearFilters = useCallback(() => {
        setSearchValue('');
        setActiveQuickFilter('all');
        setLocalDuration('all');
        onFilterChange({
            title: '',
            level: undefined,
            categoryId: undefined,
            organizationId: undefined,
            avgStar: undefined,
            sort: 'createdDate,desc',
        });
    }, [ onFilterChange ]);

    const handleCardClick = useCallback(
        (id) => {
            navigate(`/simulations/${id}`);
        },
        [ navigate ],
    );

    const categoryOptions = useMemo(() => {
        const list = Array.isArray(categories) ? categories.map((cat) => ({ value: cat.id, label: cat.name })) : [];
        return [ { value: 'all', label: 'Tất cả' }, ...list ];
    }, [ categories ]);

    const organizationOptions = useMemo(() => {
        const list = Array.isArray(organizations) ? organizations.map((org) => ({ value: org.id, label: org.name })) : [];
        return [ { value: 'all', label: 'Tất cả' }, ...list ];
    }, [ organizations ]);

    const levelOptions = useMemo(() => {
        return [ { value: 'all', label: 'Tất cả' }, ...LEVEL_OPTIONS ];
    }, []);

    // Apply local filters (Quick filters and local duration filter)
    const processedList = useMemo(() => {
        let list = simulations || [];

        // 1. Quick Filters
        if (activeQuickFilter === 'under60') {
            list = list.filter((sim) => parseDurationInHours(sim.duration) < 1);
        } else if (activeQuickFilter === 'hiring') {
            // Mock hiring for even IDs
            list = list.filter((sim) => sim.id % 2 === 0);
        }

        // 2. Dropdown duration filter
        if (localDuration && localDuration !== 'all') {
            list = list.filter((sim) => {
                const hours = parseDurationInHours(sim.duration);
                if (localDuration === 'under1h') return hours < 1;
                if (localDuration === '1to2h') return hours >= 1 && hours <= 2;
                if (localDuration === '2to4h') return hours > 2 && hours <= 4;
                if (localDuration === 'over4h') return hours > 4;
                return true;
            });
        }

        return list;
    }, [ simulations, activeQuickFilter, localDuration ]);

    const total = processedList.length;
    const current = pagination.current || 1;
    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE;

    const paginatedList = useMemo(() => {
        const startIndex = (current - 1) * pageSize;
        return processedList.slice(startIndex, startIndex + pageSize);
    }, [ processedList, current, pageSize ]);

    const hasActiveFilters = !!(
        filters.title ||
        filters.level ||
        filters.categoryId ||
        filters.organizationId ||
        activeQuickFilter !== 'all' ||
        localDuration !== 'all'
    );

    return (
        <div className={styles.simulationListPage}>
            {/* HERO */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>Mô phỏng công việc</h1>
                    <p className={styles.heroSubtitle}>
                        Khám phá các chương trình mô phỏng công việc thực tế từ các doanh nghiệp hàng đầu để rèn luyện
                        kỹ năng thực chiến và kết nối với các cơ hội việc làm IT.
                    </p>
                </div>
            </section>

            {/* MAIN LAYOUT */}
            <div className={styles.layoutWrapper}>
                <div className={styles.filterSectionHorizontal}>
                    {/* BỘ LỌC NHANH */}
                    <div className={styles.quickFilterContainer}>
                        <span className={styles.quickFilterLabel}>BỘ LỌC NHANH</span>
                        <div className={styles.quickFilterPills}>
                            <button
                                type="button"
                                className={`${styles.quickPill} ${activeQuickFilter === 'all' ? styles.quickPillActive : ''}`}
                                onClick={() => {
                                    setActiveQuickFilter('all');
                                    setLocalDuration('all');
                                }}
                            >
                                Tất cả
                            </button>
                            <button
                                type="button"
                                className={`${styles.quickPill} ${activeQuickFilter === 'new' ? styles.quickPillActive : ''}`}
                                onClick={() => {
                                    setActiveQuickFilter('new');
                                    handleFilterUpdate('sort', 'createdDate,desc');
                                }}
                            >
                                Mới
                            </button>
                            <button
                                type="button"
                                className={`${styles.quickPill} ${activeQuickFilter === 'under60' ? styles.quickPillActive : ''}`}
                                onClick={() => setActiveQuickFilter('under60')}
                            >
                                Dưới 60 phút
                            </button>
                            <button
                                type="button"
                                className={`${styles.quickPill} ${activeQuickFilter === 'hiring' ? styles.quickPillActive : ''}`}
                                onClick={() => setActiveQuickFilter('hiring')}
                            >
                                Đang tuyển dụng
                            </button>
                        </div>
                    </div>

                    {/* HORIZONTAL DROPDOWNS */}
                    <div className={styles.dropdownFiltersRow}>
                        <DropdownFilter
                            label="Lĩnh vực"
                            value={filters.categoryId ?? 'all'}
                            options={categoryOptions}
                            onChange={(val) => handleFilterUpdate('categoryId', val)}
                        />
                        <DropdownFilter
                            label="Mức độ"
                            value={filters.level ?? 'all'}
                            options={levelOptions}
                            onChange={(val) => handleFilterUpdate('level', val)}
                        />
                        <DropdownFilter
                            label="Tổ chức"
                            value={filters.organizationId ?? 'all'}
                            options={organizationOptions}
                            onChange={(val) => handleFilterUpdate('organizationId', val)}
                        />
                        <DropdownFilter
                            label="Thời lượng"
                            value={localDuration}
                            options={DURATION_OPTIONS}
                            onChange={(val) => setLocalDuration(val)}
                        />

                        {/* Elegant Search Bar inline with filters */}
                        <div className={styles.inlineSearch}>
                            <Input
                                prefix={<SearchOutlined className={styles.searchIcon} />}
                                placeholder="Tìm kiếm tên bài..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                onPressEnter={handleSearchClick}
                                allowClear
                                className={styles.inlineSearchInput}
                            />
                        </div>

                        {hasActiveFilters && (
                            <button className={styles.clearBtnInline} onClick={handleClearFilters}>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>

                {/* RIGHT CONTENT (Now full width) */}
                <main className={styles.mainContent}>
                    <div className={styles.topBar}>
                        <div className={styles.resultCount}>
                            Hiển thị <strong>{total === 0 ? 0 : `1 – ${Math.min(pageSize, total)}`}</strong> trong số{' '}
                            <strong>{total}</strong> mô phỏng công việc
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <Spin size="large" />
                        </div>
                    ) : error ? (
                        <div className={styles.errorContainer}>
                            <Empty description="Lỗi tải dữ liệu" />
                            <button className={styles.retryBtn} onClick={onRetry}>
                                Thử lại
                            </button>
                        </div>
                    ) : paginatedList.length === 0 ? (
                        <div className={styles.emptyContainer}>
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Không tìm thấy bài mô phỏng nào phù hợp với bộ lọc"
                            />
                            {hasActiveFilters && (
                                <button className={styles.clearBtnLarge} onClick={handleClearFilters}>
                                    Xóa bộ lọc
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className={styles.grid}>
                                {paginatedList.map((sim) => (
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
                                    current={current}
                                    pageSize={pageSize}
                                    total={total}
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
                </main>
            </div>
        </div>
    );
}

export default SimulationListDesktop;

