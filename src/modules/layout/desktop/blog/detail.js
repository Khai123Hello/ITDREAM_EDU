import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TableOfContents from '@components/common/editor/TableOfContents';
import TipTapJsonRenderer from '@components/common/editor/TipTapJsonRenderer';
import classNames from 'classnames';

import styles from './detail.module.scss';

// Estimate reading time from content string or TipTap JSON
function estimateReadingTime(content) {
    if (!content) return 1;
    let plainText = content;
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        const extractText = (node) => {
            if (!node) return '';
            if (node.text) return node.text + ' ';
            if (node.content) return node.content.map(extractText).join('');
            return '';
        };
        if (parsed.chapters) {
            plainText = parsed.chapters.map((ch) => extractText(JSON.parse(ch.content || '{}'))).join(' ');
        } else {
            plainText = extractText(parsed);
        }
    } catch (_) {
        plainText = content.replace(/[#*_{}[\]()|`<>]/g, ' ');
    }
    const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
}

// Parse content — may be chapters JSON or plain content
function parseContentData(content) {
    if (!content) return { type: 'simple', content: '' };
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;
        if (parsed.chapters && Array.isArray(parsed.chapters)) {
            return { type: 'chapters', chapters: parsed.chapters };
        }
    } catch (_) {
        /* not JSON */
    }
    return { type: 'simple', content };
}

// ─── Reading Progress Bar ───
function ReadingProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const updateProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        return () => window.removeEventListener('scroll', updateProgress);
    }, []);

    return (
        <div className={styles.readingProgressWrap}>
            <div className={styles.readingProgressBar} style={{ width: `${progress}%` }} />
        </div>
    );
}

// ─── Chapter Navigator ───
function ChapterNavigator({ chapters, activeIndex, onSelect }) {
    if (!chapters || chapters.length <= 1) return null;
    return (
        <div className={styles.chapterNav}>
            <p className={styles.chapterNavLabel}>📚 Mục lục chương</p>
            <div className={styles.chapterList}>
                {chapters.map((ch, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={classNames(styles.chapterBtn, { [styles.chapterBtnActive]: idx === activeIndex })}
                        onClick={() => onSelect(idx)}
                    >
                        <span className={styles.chapterNum}>{idx + 1}</span>
                        <span className={styles.chapterTitle}>{ch.title || `Phần ${idx + 1}`}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Related Article Card (compact) ───
function RelatedCard({ article, getImageUrl }) {
    return (
        <a href={`/blog/${article.id}`} className={styles.relatedCompactCard}>
            <div className={styles.relatedCompactThumb}>
                {article.image ? (
                    <img
                        src={getImageUrl(article.image)}
                        alt={article.name}
                        className={styles.relatedCompactImg}
                        loading="lazy"
                    />
                ) : (
                    <div className={styles.relatedCompactPlaceholder}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    </div>
                )}
            </div>
            <div className={styles.relatedCompactInfo}>
                {article.category && <span className={styles.relatedCompactCat}>{article.category.name}</span>}
                <p className={styles.relatedCompactTitle}>{article.name}</p>
                <span className={styles.relatedCompactLink}>Đọc bài →</span>
            </div>
        </a>
    );
}

function BlogDetailDesktop({ blog, urlBase, loading, relatedBlogs = [] }) {
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState('');
    const [activeChapter, setActiveChapter] = useState(0);
    const articleRef = useRef(null);

    const parsedContent = blog ? parseContentData(blog.content) : null;
    const isChaptered = parsedContent?.type === 'chapters';
    const chapters = isChaptered ? parsedContent.chapters : null;
    const currentContent = isChaptered ? chapters[activeChapter]?.content || '' : parsedContent?.content || '';

    // IntersectionObserver for TOC tracking
    useEffect(() => {
        if (!blog || !currentContent) return;
        const headingElements = document.querySelectorAll(
            '.tfo-blocks-content h1, .tfo-blocks-content h2, .tfo-blocks-content h3',
        );

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                });
            },
            { rootMargin: '0px 0px -60% 0px', threshold: 0.1 },
        );

        headingElements.forEach((el) => observer.observe(el));
        return () => headingElements.forEach((el) => observer.unobserve(el));
    }, [blog, currentContent, activeChapter]);

    // Reset to top when switching chapters
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveId('');
    }, [activeChapter]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
            return imagePath;
        }
        return `${urlBase}${imagePath}`;
    };

    if (loading) {
        return (
            <div className={styles.blogDetailContainer}>
                <div className={styles.loadingWrapper}>
                    <div className={styles.spinner} />
                    <p>Đang tải chi tiết bài viết...</p>
                </div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className={styles.blogDetailContainer}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📝</div>
                    <h3>Không tìm thấy bài viết</h3>
                    <p>Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
                    <button className={styles.resetBtn} onClick={() => navigate('/blog')}>
                        Quay lại danh sách Blog
                    </button>
                </div>
            </div>
        );
    }

    const { name, image, category, content, educator, subject, modifiedDate, createdDate } = blog;

    const readingTime = estimateReadingTime(content);

    const displayDate =
        modifiedDate || createdDate
            ? new Date(modifiedDate || createdDate).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
              })
            : new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });

    const hasSidebar = relatedBlogs.length > 0;

    return (
        <>
            {/* Reading Progress */}
            <ReadingProgressBar />

            <div className={styles.blogDetailContainer}>
                {/* MAIN LAYOUT */}
                <div className={classNames(styles.mainLayout, { [styles.mainLayoutNoSidebar]: !hasSidebar })}>
                    {/* LEFT SIDEBAR: TOC + Chapter Navigator */}
                    <aside className={styles.tocSidebar}>
                        <ChapterNavigator chapters={chapters} activeIndex={activeChapter} onSelect={setActiveChapter} />
                        <TableOfContents content={currentContent} activeId={activeId} />
                    </aside>

                    {/* CENTER CONTENT AREA */}
                    <article className={styles.contentArea} ref={articleRef}>
                        {/* BACK BUTTON */}
                        <button className={styles.backBtn} onClick={() => navigate('/blog')}>
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                            Quay lại danh sách Blog
                        </button>

                        {/* BREADCRUMB */}
                        <nav className={styles.breadcrumb}>
                            <span className={styles.breadcrumbLink} onClick={() => navigate('/')}>
                                Trang chủ
                            </span>
                            <span className={styles.breadcrumbSep}>/</span>
                            <span className={styles.breadcrumbLink} onClick={() => navigate('/blog')}>
                                Blog
                            </span>
                            {category && (
                                <>
                                    <span className={styles.breadcrumbSep}>/</span>
                                    <span className={styles.breadcrumbCurrent}>{category.name}</span>
                                </>
                            )}
                        </nav>

                        {/* ARTICLE HEADER */}
                        <header className={styles.articleHeader}>
                            <div className={styles.subjectPillRow}>
                                {subject && <span className={styles.subjectPill}>{subject}</span>}
                                {category && <span className={styles.categoryTag}>{category.name}</span>}
                            </div>

                            <h1 className={styles.articleTitle}>{name}</h1>

                            {educator && (
                                <div className={styles.authorMeta}>
                                    <div className={styles.authorAvatarWrapper}>
                                        {educator.profileAccountDto?.avatar || educator.account?.avatar ? (
                                            <img
                                                src={getImageUrl(
                                                    educator.profileAccountDto?.avatar || educator.account?.avatar,
                                                )}
                                                alt="author"
                                                className={styles.authorAvatar}
                                            />
                                        ) : (
                                            <div className={styles.authorAvatarFallback}>
                                                {(
                                                    educator.account?.fullName ||
                                                    educator.profileAccountDto?.fullName ||
                                                    'U'
                                                ).charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.authorDetails}>
                                        <span className={styles.authorName}>
                                            {educator.account?.fullName ||
                                                educator.profileAccountDto?.fullName ||
                                                'Chuyên gia ITDream'}
                                        </span>
                                        {educator.organization && (
                                            <span className={styles.orgName}>{educator.organization.name}</span>
                                        )}
                                    </div>
                                    <span className={styles.divider}>•</span>
                                    <time dateTime={modifiedDate || createdDate} className={styles.readTime}>
                                        {displayDate}
                                    </time>
                                    <span className={styles.divider}>•</span>
                                    <span className={styles.readTime}>⏱ {readingTime} phút đọc</span>
                                </div>
                            )}
                        </header>

                        {/* COVER IMAGE */}
                        {image && (
                            <div className={styles.coverImageWrapper}>
                                <img src={getImageUrl(image)} alt={name} className={styles.coverImage} />
                            </div>
                        )}

                        {/* CHAPTER INDICATOR (if multi-chapter) */}
                        {isChaptered && chapters.length > 1 && (
                            <div className={styles.chapterIndicator}>
                                <div className={styles.chapterIndicatorInner}>
                                    <span className={styles.chapterIndicatorNum}>
                                        Phần {activeChapter + 1} / {chapters.length}
                                    </span>
                                    <span className={styles.chapterIndicatorTitle}>
                                        {chapters[activeChapter]?.title}
                                    </span>
                                </div>
                                <div className={styles.chapterNavBtns}>
                                    {activeChapter > 0 && (
                                        <button
                                            type="button"
                                            className={styles.chapterNavArrow}
                                            onClick={() => setActiveChapter((i) => i - 1)}
                                        >
                                            ← Trước
                                        </button>
                                    )}
                                    {activeChapter < chapters.length - 1 && (
                                        <button
                                            type="button"
                                            className={classNames(styles.chapterNavArrow, styles.chapterNavArrowNext)}
                                            onClick={() => setActiveChapter((i) => i + 1)}
                                        >
                                            Tiếp theo →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* CONTENT BODY */}
                        <section className={styles.articleBody}>
                            <div className={styles.richContent}>
                                <TipTapJsonRenderer content={currentContent} />
                            </div>
                        </section>

                        {/* CHAPTER NAV BOTTOM */}
                        {isChaptered && chapters.length > 1 && (
                            <div className={styles.chapterNavBottom}>
                                {activeChapter > 0 ? (
                                    <button
                                        type="button"
                                        className={styles.chapterNavBottomBtn}
                                        onClick={() => setActiveChapter((i) => i - 1)}
                                    >
                                        <span className={styles.chapterNavDir}>← Phần trước</span>
                                        <span className={styles.chapterNavName}>
                                            {chapters[activeChapter - 1]?.title}
                                        </span>
                                    </button>
                                ) : (
                                    <div />
                                )}
                                {activeChapter < chapters.length - 1 && (
                                    <button
                                        type="button"
                                        className={classNames(
                                            styles.chapterNavBottomBtn,
                                            styles.chapterNavBottomBtnNext,
                                        )}
                                        onClick={() => setActiveChapter((i) => i + 1)}
                                    >
                                        <span className={styles.chapterNavDir}>Phần tiếp theo →</span>
                                        <span className={styles.chapterNavName}>
                                            {chapters[activeChapter + 1]?.title}
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* AUTHOR BIO CARD */}
                        {educator && (
                            <section className={styles.authorSection}>
                                <div className={styles.authorCard}>
                                    <div className={styles.authorCardAvatarWrapper}>
                                        {educator.profileAccountDto?.avatar || educator.account?.avatar ? (
                                            <img
                                                src={getImageUrl(
                                                    educator.profileAccountDto?.avatar || educator.account?.avatar,
                                                )}
                                                alt="author avatar"
                                                className={styles.authorCardAvatar}
                                            />
                                        ) : (
                                            <div className={styles.authorCardAvatarFallback}>
                                                {(
                                                    educator.account?.fullName ||
                                                    educator.profileAccountDto?.fullName ||
                                                    'U'
                                                ).charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.authorCardInfo}>
                                        <span className={styles.authorCardSubtitle}>TÁC GIẢ BÀI VIẾT</span>
                                        <h3>{educator.account?.fullName || educator.profileAccountDto?.fullName}</h3>
                                        {educator.organization && (
                                            <p className={styles.authorCardOrg}>
                                                Giảng viên tại <strong>{educator.organization.name}</strong>
                                                {educator.organization.hotline && (
                                                    <span> • Hotline: {educator.organization.hotline}</span>
                                                )}
                                            </p>
                                        )}
                                        {(educator.profileAccountDto?.email || educator.account?.email) && (
                                            <div className={styles.authorCardEmail}>
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                >
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                    <polyline points="22,6 12,13 2,6" />
                                                </svg>
                                                {educator.profileAccountDto?.email || educator.account?.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </article>

                    {/* RIGHT SIDEBAR — Related articles */}
                    {hasSidebar && (
                        <aside className={styles.sidebar}>
                            <div className={styles.relatedWidget}>
                                <div className={styles.relatedWidgetHeader}>
                                    <h4>
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.2"
                                        >
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                            <line x1="16" y1="13" x2="8" y2="13" />
                                            <line x1="16" y1="17" x2="8" y2="17" />
                                        </svg>
                                        Bài viết liên quan
                                    </h4>
                                    {category && <span className={styles.relatedWidgetCat}>{category.name}</span>}
                                </div>
                                <div className={styles.relatedWidgetList}>
                                    {relatedBlogs.map((article) => (
                                        <RelatedCard key={article.id} article={article} getImageUrl={getImageUrl} />
                                    ))}
                                </div>
                                <a href="/blog" className={styles.relatedWidgetMore}>
                                    Xem tất cả bài viết →
                                </a>
                            </div>
                        </aside>
                    )}
                </div>

                {/* RELATED POSTS BOTTOM — grid khi không có sidebar */}
                {!hasSidebar && relatedBlogs.length === 0 && <div className={styles.relatedSectionEmpty} />}
            </div>
        </>
    );
}

export default BlogDetailDesktop;
