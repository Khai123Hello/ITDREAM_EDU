import React, { useMemo, useState } from 'react';
import classNames from 'classnames';

import styles from './index.module.scss';

function BlogListDesktop({ categories, blogs, urlBase, loading, selectedCategory, onCategoryChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 8;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        return `${urlBase}${imagePath}`;
    };

    // Filter blogs based on category selection and search query
    const filteredBlogs = useMemo(() => {
        let result = blogs || [];
        if (selectedCategory) {
            result = result.filter((blog) => blog.category?.id === selectedCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (blog) =>
                    blog.name?.toLowerCase().includes(query) ||
                    blog.subject?.toLowerCase().includes(query) ||
                    blog.content?.toLowerCase().includes(query),
            );
        }
        return result;
    }, [blogs, selectedCategory, searchQuery]);

    // Total pages calculation
    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

    // Paginated blogs list
    const paginatedBlogs = useMemo(() => {
        const start = currentPage * itemsPerPage;
        return filteredBlogs.slice(start, start + itemsPerPage);
    }, [filteredBlogs, currentPage]);

    // Determine the featured blog on the first page
    const featuredBlog = currentPage === 0 ? filteredBlogs[0] : null;
    const gridBlogs = currentPage === 0 ? paginatedBlogs.slice(1) : paginatedBlogs;

    const handleCategoryClick = (catId) => {
        onCategoryChange(catId);
        setCurrentPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setCurrentPage(0);
    };

    return (
        <div className={styles.blogListContainer}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                    <span className={styles.heroTag}>ITDream Knowledge Hub</span>
                    <h1>Cẩm nang kiến thức & Xu hướng công nghệ</h1>
                    <p>
                        Cập nhật những tin tức mới nhất, hướng nghiệp thực tế và chia sẻ chuyên môn từ các chuyên gia.
                    </p>

                    {/* SEARCH INPUT */}
                    <div className={styles.searchContainer}>
                        <div className={styles.searchInputWrapper}>
                            <svg
                                className={styles.searchIcon}
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Tìm kiếm bài viết theo tiêu đề, chủ đề..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            {searchQuery && (
                                <button className={styles.clearSearchBtn} onClick={handleClearSearch}>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CATEGORIES NAVIGATION */}
            <section className={styles.categoriesSection}>
                <div className={styles.categoriesContainer}>
                    <button
                        className={classNames(styles.categoryBtn, { [styles.active]: !selectedCategory })}
                        onClick={() => handleCategoryClick(null)}
                    >
                        Tất cả bài viết
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
            </section>

            {/* ARTICLES CONTAINER */}
            <section className={styles.articlesSection}>
                {loading ? (
                    <div className={styles.loadingWrapper}>
                        <div className={styles.spinner}></div>
                        <p>Đang tải danh sách bài viết...</p>
                    </div>
                ) : filteredBlogs.length > 0 ? (
                    <div className={styles.contentContainer}>
                        {/* FEATURED POST */}
                        {featuredBlog && (
                            <a href={`/blog/${featuredBlog.id}`} className={styles.featuredCard}>
                                <div className={styles.featuredImageWrapper}>
                                    {featuredBlog.image ? (
                                        <img
                                            src={getImageUrl(featuredBlog.image)}
                                            alt={featuredBlog.name}
                                            className={styles.featuredImage}
                                        />
                                    ) : (
                                        <div className={styles.featuredImagePlaceholder}>
                                            <span>📝</span>
                                        </div>
                                    )}
                                    {featuredBlog.category && (
                                        <span className={styles.categoryBadgeOverlay}>
                                            {featuredBlog.category.name}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.featuredContent}>
                                    <div className={styles.tagRow}>
                                        <span className={styles.featuredIndicator}>Bài viết nổi bật</span>
                                    </div>
                                    <h2 className={styles.featuredTitle}>{featuredBlog.name}</h2>
                                    <p className={styles.featuredExcerpt}>{featuredBlog.subject}</p>

                                    <div className={styles.authorMeta}>
                                        <div className={styles.authorAvatarWrapper}>
                                            {featuredBlog.educator?.profileAccountDto?.avatar ? (
                                                <img
                                                    src={getImageUrl(featuredBlog.educator.profileAccountDto.avatar)}
                                                    alt="author"
                                                    className={styles.authorAvatar}
                                                />
                                            ) : (
                                                <div className={styles.authorAvatarFallback}>
                                                    {featuredBlog.educator?.profileAccountDto?.fullName?.charAt(0) ||
                                                        'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div className={styles.authorDetails}>
                                            <span className={styles.authorName}>
                                                {featuredBlog.educator?.profileAccountDto?.fullName ||
                                                    'Chuyên gia ITDream'}
                                            </span>
                                            {featuredBlog.educator?.organization && (
                                                <span className={styles.orgName}>
                                                    {featuredBlog.educator.organization.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className={styles.readMoreLink}>
                                        Đọc bài viết
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                        >
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                            <polyline points="12 5 19 12 12 19"></polyline>
                                        </svg>
                                    </span>
                                </div>
                            </a>
                        )}

                        {/* ARTICLES GRID */}
                        {gridBlogs.length > 0 && (
                            <div className={styles.articlesGrid}>
                                {gridBlogs.map((blog) => (
                                    <a href={`/blog/${blog.id}`} key={blog.id} className={styles.articleCard}>
                                        <div className={styles.cardImageWrapper}>
                                            {blog.image ? (
                                                <img
                                                    src={getImageUrl(blog.image)}
                                                    alt={blog.name}
                                                    className={styles.cardImage}
                                                />
                                            ) : (
                                                <div className={styles.cardImagePlaceholder}>
                                                    <span>📝</span>
                                                </div>
                                            )}
                                            {blog.category && (
                                                <span className={styles.cardCategoryBadge}>{blog.category.name}</span>
                                            )}
                                        </div>
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.cardTitle}>{blog.name}</h3>
                                            <p className={styles.cardExcerpt}>{blog.subject}</p>
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
                                                            {blog.educator?.profileAccountDto?.fullName?.charAt(0) ||
                                                                'U'}
                                                        </div>
                                                    )}
                                                    <div className={styles.authorDetailsMini}>
                                                        <span className={styles.authorNameMini}>
                                                            {blog.educator?.profileAccountDto?.fullName || 'Chuyên gia'}
                                                        </span>
                                                        {blog.educator?.organization && (
                                                            <span className={styles.orgNameMini}>
                                                                {blog.educator.organization.shortName ||
                                                                    blog.educator.organization.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className={styles.paginationContainer}>
                                <button
                                    className={styles.pageArrowBtn}
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <div className={styles.pageNumbers}>
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            className={classNames(styles.pageNumberBtn, {
                                                [styles.active]: currentPage === i,
                                            })}
                                            onClick={() => setCurrentPage(i)}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className={styles.pageArrowBtn}
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>🔍</div>
                        <h3>Không tìm thấy bài viết nào</h3>
                        <p>Vui lòng thử tìm kiếm bằng từ khóa khác hoặc chuyển sang danh mục khác.</p>
                        <button className={styles.resetSearchBtn} onClick={handleClearSearch}>
                            Xem tất cả bài viết
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}

export default BlogListDesktop;
