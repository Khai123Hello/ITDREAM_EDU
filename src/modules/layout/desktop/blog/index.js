import React, { useMemo, useState } from 'react';

import styles from './index.module.scss';

function BlogListDesktop({ categories, blogs, loading, selectedCategory, onCategoryChange }) {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 8;

    const filteredBlogs = useMemo(() => {
        if (!selectedCategory) return blogs;
        return blogs.filter((blog) => blog.category?.id === selectedCategory);
    }, [blogs, selectedCategory]);

    const paginatedBlogs = useMemo(() => {
        const start = currentPage * itemsPerPage;
        return filteredBlogs.slice(start, start + itemsPerPage);
    }, [filteredBlogs, currentPage]);

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);

    return (
        <div className={styles.blogListContainer}>
            {/* TOP BANNER */}
            <div className={styles.topBanner}>
                Sign up to explore latest blogs and insights.
                <button className={styles.btnSignup}>Sign Up</button>
            </div>

            {/* HERO */}
            <section className={styles.hero}>
                <h1>Read Our Latest Blog Posts</h1>
                <p>Tips, insights, and resources to help you build your career</p>
            </section>

            {/* CATEGORIES FILTER */}
            <section className={styles.categoriesSection}>
                <div className={styles.categoryFilter}>
                    <button
                        className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
                        onClick={() => {
                            onCategoryChange(null);
                            setCurrentPage(0);
                        }}
                    >
                        All Posts
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
                            onClick={() => {
                                onCategoryChange(cat.id);
                                setCurrentPage(0);
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </section>

            {/* ARTICLES GRID */}
            <section className={styles.articlesSection}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#6b7a90' }}>Loading posts...</p>
                ) : paginatedBlogs.length > 0 ? (
                    <>
                        <div className={styles.articlesGrid}>
                            {paginatedBlogs.map((blog) => (
                                <a href={`/blog/${blog.id}`} key={blog.id} className={styles.articleCard}>
                                    <div className={styles.articleThumbWrap}>
                                        {blog.image && (
                                            <img src={blog.image} alt={blog.name} className={styles.articleThumb} />
                                        )}
                                        {!blog.image && (
                                            <div className={styles.articleThumbPlaceholder}>
                                                {blog.name?.charAt(0) || '📝'}
                                            </div>
                                        )}
                                        {blog.category && (
                                            <span className={styles.tagOverlay}>
                                                {blog.category.name.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <h3>{blog.name}</h3>
                                    <p>{blog.subject}</p>
                                    <div className={styles.articleMeta}>
                                        {blog.educator?.profileAccountDto?.avatar && (
                                            <img
                                                src={blog.educator.profileAccountDto.avatar}
                                                alt="educator"
                                                className={styles.authorAvatar}
                                            />
                                        )}
                                        <div>
                                            <div className={styles.authorName}>
                                                {blog.educator?.profileAccountDto?.fullName || 'Author'}
                                            </div>
                                            {blog.educator?.organization && (
                                                <div className={styles.orgName}>{blog.educator.organization.name}</div>
                                            )}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                >
                                    ‹
                                </button>
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
                                        onClick={() => setCurrentPage(i)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    className={styles.pageBtn}
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage === totalPages - 1}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', color: '#6b7a90' }}>No posts found</p>
                )}
            </section>

            {/* POPULAR ARTICLES - DEMO */}
            <section className={styles.popularSection}>
                <h2 className={styles.sectionHeader}>Popular Articles</h2>
                <div className={styles.popularGrid}>
                    {[
                        {
                            id: 1,
                            title: 'How to Build a Winning Resume',
                            excerpt: 'Learn the essential tips for creating a resume that stands out to employers...',
                            category: 'Career Tips',
                            author: 'Sarah Johnson',
                            org: 'LinkedIn Learning',
                            date: 'May 15, 2026',
                        },
                        {
                            id: 2,
                            title: 'Top Interview Questions and Answers',
                            excerpt: 'Master the most common interview questions and how to answer them effectively...',
                            category: 'Interview Prep',
                            author: 'Michael Chen',
                            org: 'Career Coach Pro',
                            date: 'May 10, 2026',
                        },
                        {
                            id: 3,
                            title: 'Negotiating Your Salary Package',
                            excerpt: 'A comprehensive guide to salary negotiation strategies that actually work...',
                            category: 'Career Tips',
                            author: 'Emma Davis',
                            org: 'HR Insights',
                            date: 'May 8, 2026',
                        },
                    ].map((article) => (
                        <div key={article.id} className={styles.popularCard}>
                            <div className={styles.popularCardContent}>
                                <span className={styles.popularCategory}>{article.category}</span>
                                <h3>{article.title}</h3>
                                <p>{article.excerpt}</p>
                                <div className={styles.popularMeta}>
                                    <span className={styles.author}>{article.author}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.org}>{article.org}</span>
                                    <span className={styles.dot}>•</span>
                                    <span className={styles.date}>{article.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default BlogListDesktop;
