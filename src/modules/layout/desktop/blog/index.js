import React, { useMemo, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Pagination } from 'antd';
import classNames from 'classnames';

import styles from './index.module.scss';

const SORT_OPTIONS = [
    { value: 'createdDate,desc', label: 'Mới nhất' },
    { value: 'createdDate,asc', label: 'Cũ nhất' },
    { value: 'name,asc', label: 'Tên A → Z' },
    { value: 'name,desc', label: 'Tên Z → A' },
];

const ITEMS_PER_PAGE = 16;

// ─── Sort Dropdown ───
function SortDropdown({ value, onChange }) {
    const [ open, setOpen ] = useState(false);
    const ref = useRef(null);

    React.useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

    return (
        <div className={styles.sortDropdownWrapper} ref={ref}>
            <button
                type="button"
                className={styles.sortDropdownBtn}
                onClick={() => setOpen((v) => !v)}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="21" y1="10" x2="7" y2="10" />
                    <line x1="21" y1="6" x2="3" y2="6" />
                    <line x1="21" y1="14" x2="3" y2="14" />
                    <line x1="21" y1="18" x2="7" y2="18" />
                </svg>
                <span>{selected.label}</span>
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 6"
                    fill="none"
                    className={classNames(styles.sortArrow, { [styles.sortArrowOpen]: open })}
                >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && (
                <div className={styles.sortMenu}>
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            className={classNames(styles.sortMenuItem, { [styles.sortMenuItemActive]: opt.value === value })}
                            onClick={() => {
                                onChange(opt.value);
                                setOpen(false);
                            }}
                        >
                            {opt.value === value && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Skeleton Card ───
function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonContent}>
                <div className={styles.skeletonBadge} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonTitleShort} />
                <div className={styles.skeletonExcerpt} />
                <div className={styles.skeletonExcerptShort} />
                <div className={styles.skeletonFooter}>
                    <div className={styles.skeletonAvatar} />
                    <div className={styles.skeletonName} />
                </div>
            </div>
        </div>
    );
}

function BlogListDesktop({ categories, blogs, urlBase, loading, selectedCategory, onCategoryChange, sort, onSortChange }) {
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ quickFilter, setQuickFilter ] = useState('all');
    const [ currentPage, setCurrentPage ] = useState(1);
    const [ localSort, setLocalSort ] = useState(sort || 'createdDate,desc');

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        return `${urlBase}${imagePath}`;
    };

    const handleSortChange = (val) => {
        setLocalSort(val);
        onSortChange && onSortChange(val);
        setCurrentPage(1);
    };

    const handleCategoryClick = (catId) => {
        onCategoryChange(catId);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleQuickFilter = (filter) => {
        setQuickFilter(filter);
        setCurrentPage(1);
    };

    const handleClearAll = () => {
        setSearchQuery('');
        setQuickFilter('all');
        onCategoryChange(null);
        setLocalSort('createdDate,desc');
        setCurrentPage(1);
    };

    // Filter & sort
    const filteredBlogs = useMemo(() => {
        let result = blogs || [];

        if (selectedCategory) {
            result = result.filter((b) => b.category?.id === selectedCategory);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (b) =>
                    b.name?.toLowerCase().includes(q) ||
                    b.subject?.toLowerCase().includes(q) ||
                    b.content?.toLowerCase().includes(q),
            );
        }

        // Quick filter
        const now = Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (quickFilter === 'new') {
            result = result.filter((b) => {
                const d = new Date(b.createdDate || b.modifiedDate || 0).getTime();
                return now - d <= thirtyDaysMs;
            });
        }

        // Sort
        const [ field, dir ] = localSort.split(',');
        result = [ ...result ].sort((a, b) => {
            if (field === 'name') {
                return dir === 'asc'
                    ? (a.name || '').localeCompare(b.name || '', 'vi')
                    : (b.name || '').localeCompare(a.name || '', 'vi');
            }
            // createdDate
            const da = new Date(a.createdDate || a.modifiedDate || 0).getTime();
            const db = new Date(b.createdDate || b.modifiedDate || 0).getTime();
            return dir === 'asc' ? da - db : db - da;
        });

        return result;
    }, [ blogs, selectedCategory, searchQuery, quickFilter, localSort ]);

    const total = filteredBlogs.length;

    const paginatedBlogs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBlogs.slice(start, start + ITEMS_PER_PAGE);
    }, [ filteredBlogs, currentPage ]);

    const hasActiveFilters = !!(searchQuery || selectedCategory || quickFilter !== 'all' || localSort !== 'createdDate,desc');

    const startItem = total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, total);

    return (
        <div className={styles.blogListContainer}>
            {/* HERO */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay} />
                <div className={styles.heroContent}>
                    <span className={styles.heroTag}>ITDream Knowledge Hub</span>
                    <h1>Cẩm nang kiến thức &amp; Xu hướng công nghệ</h1>
                    <p>Cập nhật những tin tức mới nhất, hướng nghiệp thực tế và chia sẻ chuyên môn từ các chuyên gia.</p>
                </div>
            </section>

            {/* FILTER BAR */}
            <section className={styles.filterBar}>
                <div className={styles.filterBarInner}>


                    {/* Category pills */}
                    <div className={styles.categoryPillsRow}>
                        <button
                            className={classNames(styles.categoryBtn, { [styles.active]: !selectedCategory })}
                            onClick={() => handleCategoryClick(null)}
                        >
                            Tất cả danh mục
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={classNames(styles.categoryBtn, { [styles.active]: selectedCategory === cat.id })}
                                onClick={() => handleCategoryClick(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Right controls: sort + search */}
                    <div className={styles.rightControls}>
                        <SortDropdown value={localSort} onChange={handleSortChange} />
                        <div className={styles.searchWrapper}>
                            <Input
                                prefix={<SearchOutlined className={styles.searchIcon} />}
                                placeholder="Tìm kiếm bài viết..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                allowClear
                                className={styles.searchInput}
                            />
                        </div>
                        {hasActiveFilters && (
                            <button type="button" className={styles.clearBtn} onClick={handleClearAll}>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ARTICLES SECTION */}
            <section className={styles.articlesSection}>
                {/* Result count */}
                {!loading && (
                    <div className={styles.resultCountBar}>
                        <span>
                            Hiển thị <strong>{startItem}–{endItem}</strong> trong <strong>{total}</strong> bài viết
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className={styles.articlesGrid}>
                        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <>
                        <div className={styles.articlesGrid}>
                            {paginatedBlogs.map((blog) => (
                                <a href={`/blog/${blog.id}`} key={blog.id} className={styles.articleCard}>
                                    <div className={styles.cardImageWrapper}>
                                        {blog.image ? (
                                            <img
                                                src={getImageUrl(blog.image)}
                                                alt={blog.name}
                                                className={styles.cardImage}
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className={styles.cardImagePlaceholder}>
                                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                    <polyline points="14 2 14 8 20 8" />
                                                    <line x1="16" y1="13" x2="8" y2="13" />
                                                    <line x1="16" y1="17" x2="8" y2="17" />
                                                    <polyline points="10 9 9 9 8 9" />
                                                </svg>
                                            </div>
                                        )}
                                        {blog.category && (
                                            <span className={styles.cardCategoryBadge}>{blog.category.name}</span>
                                        )}
                                    </div>
                                    <div className={styles.cardContent}>
                                        <h3 className={styles.cardTitle}>{blog.name}</h3>
                                        {blog.subject && (
                                            <p className={styles.cardExcerpt}>{blog.subject}</p>
                                        )}
                                        <div className={styles.cardFooter}>
                                            <div className={styles.authorMetaMini}>
                                                {blog.educator?.profileAccountDto?.avatar ? (
                                                    <img
                                                        src={getImageUrl(blog.educator.profileAccountDto.avatar)}
                                                        alt="author"
                                                        className={styles.authorAvatarMini}
                                                    />
                                                ) : (
                                                    <div className={styles.authorAvatarFallbackMini}>
                                                        {blog.educator?.profileAccountDto?.fullName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                                <div className={styles.authorDetailsMini}>
                                                    <span className={styles.authorNameMini}>
                                                        {blog.educator?.profileAccountDto?.fullName || 'Chuyên gia'}
                                                    </span>
                                                    {blog.educator?.organization && (
                                                        <span className={styles.orgNameMini}>
                                                            {blog.educator.organization.shortName || blog.educator.organization.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={styles.readMoreArrow}>
                                                Đọc →
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {total > ITEMS_PER_PAGE && (
                            <div className={styles.paginationContainer}>
                                <Pagination
                                    current={currentPage}
                                    pageSize={ITEMS_PER_PAGE}
                                    total={total}
                                    onChange={(page) => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    showSizeChanger={false}
                                    locale={{ items_per_page: '/ trang' }}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3>Không tìm thấy bài viết nào</h3>
                        <p>Thử tìm kiếm bằng từ khóa khác hoặc chuyển sang danh mục khác.</p>
                        <button className={styles.resetSearchBtn} onClick={handleClearAll}>
                            Xem tất cả bài viết
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default BlogListDesktop;
