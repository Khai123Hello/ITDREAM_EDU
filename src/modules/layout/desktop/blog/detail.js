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
    // Try parse JSON and extract text
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
            <p className={styles.chapterNavLabel}>📚 Chapters</p>
            <div className={styles.chapterList}>
                {chapters.map((ch, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={classNames(styles.chapterBtn, { [styles.chapterBtnActive]: idx === activeIndex })}
                        onClick={() => onSelect(idx)}
                    >
                        <span className={styles.chapterNum}>{idx + 1}</span>
                        <span className={styles.chapterTitle}>{ch.title || `Chapter ${idx + 1}`}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function BlogDetailDesktop({ blog, urlBase, loading }) {
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
                    <div className={styles.spinner}></div>
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

    const { name, image, category, content, educator, subject, subjects, modifiedDate, createdDate } = blog;

    const readingTime = estimateReadingTime(content);

    const displayDate =
        modifiedDate || createdDate
            ? new Date(modifiedDate || createdDate).toLocaleDateString('vi-VN', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
              })
            : new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' });

    // Related articles
    const relatedArticles =
        subjects?.content && subjects.content.length > 0 && subjects.content[0] !== null
            ? subjects.content
            : [
                  {
                      id: 101,
                      name: 'Kỹ năng mềm quyết định sự thành công trong công việc',
                      subject: 'Khám phá tầm quan trọng của kỹ năng giao tiếp, làm việc nhóm và giải quyết vấn đề...',
                      category: { name: 'Kỹ năng nghề nghiệp' },
                      image: null,
                  },
                  {
                      id: 102,
                      name: 'Xu hướng làm việc từ xa và mô hình Hybrid năm 2026',
                      subject:
                          'Những thay đổi lớn trong cách các doanh nghiệp vận hành và cách tối ưu hiệu suất làm việc...',
                      category: { name: 'Xu hướng công nghệ' },
                      image: null,
                  },
                  {
                      id: 103,
                      name: 'Xây dựng thương hiệu cá nhân cho lập trình viên',
                      subject: 'Làm thế nào để tạo hồ sơ GitHub nổi bật, viết blog kỹ thuật và kết nối hiệu quả...',
                      category: { name: 'Phát triển bản thân' },
                      image: null,
                  },
              ];

    // Popular articles for sidebar
    const sidebarArticles = [
        { id: 201, title: 'Làm thế nào để viết CV chuyên nghiệp thu hút nhà tuyển dụng?', readTime: '5 phút đọc' },
        { id: 202, title: 'Top câu hỏi phỏng vấn hành vi và cách trả lời STAR', readTime: '7 phút đọc' },
        { id: 203, title: 'Học lập trình bắt đầu từ đâu? Lộ trình chuẩn cho người mới', readTime: '10 phút đọc' },
    ];

    return (
        <>
            {/* Reading Progress */}
            <ReadingProgressBar />

            <div className={styles.blogDetailContainer}>
                {/* MAIN LAYOUT */}
                <div className={styles.mainLayout}>
                    {/* LEFT SIDEBAR: TOC + Chapter Navigator */}
                    <aside className={styles.tocSidebar}>
                        {/* Chapter navigator (if chaptered blog) */}
                        <ChapterNavigator chapters={chapters} activeIndex={activeChapter} onSelect={setActiveChapter} />

                        <TableOfContents content={currentContent} activeId={activeId} />
                    </aside>

                    {/* CENTER CONTENT AREA */}
                    <article className={styles.contentArea} ref={articleRef}>
                        {/* BACK BUTTON */}
                        <button className={styles.backBtn} onClick={() => navigate('/blog')}>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                            >
                                <line x1="19" y1="12" x2="5" y2="12"></line>
                                <polyline points="12 19 5 12 12 5"></polyline>
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
                                    <span className={styles.readTime}>{displayDate}</span>
                                    <span className={styles.divider}>•</span>
                                    <span className={styles.readTime}>{readingTime} phút đọc</span>
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
                                        Chapter {activeChapter + 1} / {chapters.length}
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

                        {/* CHAPTER NAV BOTTOM (if multi-chapter) */}
                        {isChaptered && chapters.length > 1 && (
                            <div className={styles.chapterNavBottom}>
                                {activeChapter > 0 ? (
                                    <button
                                        type="button"
                                        className={styles.chapterNavBottomBtn}
                                        onClick={() => setActiveChapter((i) => i - 1)}
                                    >
                                        <span className={styles.chapterNavDir}>← Chapter trước</span>
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
                                        <span className={styles.chapterNavDir}>Chapter tiếp theo →</span>
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
                                        <p className={styles.authorCardBio}>
                                            Chuyên gia định hướng nghề nghiệp, có hơn 10 năm kinh nghiệm giảng dạy và
                                            đào tạo nguồn nhân lực công nghệ chất lượng cao tại Việt Nam.
                                        </p>
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
                                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                    <polyline points="22,6 12,13 2,6"></polyline>
                                                </svg>
                                                {educator.profileAccountDto?.email || educator.account?.email}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </article>

                    {/* RIGHT STICKY SIDEBAR */}
                    <aside className={styles.sidebar}>
                        {/* NEWSLETTER WIDGET */}
                        <div className={styles.sidebarWidget}>
                            <div className={classNames(styles.widgetHeader, styles.tealBg)}>
                                <h4>Đăng ký Bản tin ITDream</h4>
                            </div>
                            <div className={styles.widgetBody}>
                                <p>Nhận các bài viết chọn lọc về xu hướng công nghệ & cơ hội nghề nghiệp sớm nhất.</p>
                                <div className={styles.newsletterForm}>
                                    <input
                                        type="email"
                                        placeholder="Nhập email của bạn..."
                                        className={styles.newsletterInput}
                                    />
                                    <button className={styles.newsletterBtn}>Đăng ký ngay</button>
                                </div>
                            </div>
                        </div>

                        {/* POPULAR POSTS WIDGET */}
                        <div className={styles.sidebarWidget}>
                            <div className={styles.widgetHeader}>
                                <h4>Bài viết xem nhiều nhất</h4>
                            </div>
                            <div className={styles.widgetBody}>
                                <ul className={styles.popularList}>
                                    {sidebarArticles.map((article, index) => (
                                        <li key={article.id} className={styles.popularItem}>
                                            <span className={styles.popularIndex}>0{index + 1}</span>
                                            <div className={styles.popularItemContent}>
                                                <h5>{article.title}</h5>
                                                <span>{article.readTime}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </aside>
                </div>

                {/* RELATED POSTS BOTTOM SECTION */}
                <section className={styles.relatedSection}>
                    <h2 className={styles.relatedSectionHeader}>Bài viết liên quan</h2>
                    <div className={styles.relatedGrid}>
                        {relatedArticles.map((article) => (
                            <a key={article.id} href={`/blog/${article.id}`} className={styles.relatedCard}>
                                <div className={styles.relatedThumbWrapper}>
                                    {article.image ? (
                                        <img
                                            src={getImageUrl(article.image)}
                                            alt={article.name}
                                            className={styles.relatedThumb}
                                        />
                                    ) : (
                                        <div className={styles.relatedThumbPlaceholder}>
                                            <span>📝</span>
                                        </div>
                                    )}
                                    {article.category && (
                                        <span className={styles.relatedCategoryBadge}>{article.category.name}</span>
                                    )}
                                </div>
                                <div className={styles.relatedCardBody}>
                                    <h3>{article.name}</h3>
                                    <p>{article.subject}</p>
                                    <span className={styles.relatedCardRead}>Đọc bài viết &rarr;</span>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

export default BlogDetailDesktop;
