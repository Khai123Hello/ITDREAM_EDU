import React from 'react';

import styles from './detail.module.scss';

function BlogDetailDesktop({ blog, loading }) {
    if (loading) {
        return (
            <div className={styles.blogDetail}>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7a90' }}>Loading blog post...</div>
            </div>
        );
    }

    if (!blog) {
        return (
            <div className={styles.blogDetail}>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7a90' }}>Blog post not found</div>
            </div>
        );
    }

    const { name, image, category, content, educator, subject } = blog;

    return (
        <div className={styles.blogDetail}>
            {/* HERO SECTION */}
            <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <h1>{name}</h1>
                    <p>{subject}</p>
                    <div className={styles.metaRow}>
                        {category && <span className={styles.category}>{category.name}</span>}
                        {educator?.profileAccountDto && (
                            <div className={styles.author}>
                                {educator.profileAccountDto.avatar && (
                                    <img
                                        src={educator.profileAccountDto.avatar}
                                        alt="author"
                                        className={styles.avatar}
                                    />
                                )}
                                <div>
                                    <div className={styles.authorName}>{educator.profileAccountDto.fullName}</div>
                                    {educator.organization && (
                                        <div className={styles.orgName}>{educator.organization.name}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {image && <img src={image} alt={name} className={styles.heroImage} />}
            </section>

            {/* CONTENT SECTION */}
            <section className={styles.contentSection}>
                <div className={styles.contentWrapper}>
                    <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </section>

            {/* AUTHOR BIO */}
            {educator && (
                <section className={styles.authorSection}>
                    <div className={styles.authorCard}>
                        {educator.profileAccountDto?.avatar && (
                            <img
                                src={educator.profileAccountDto.avatar}
                                alt="author"
                                className={styles.authorBioAvatar}
                            />
                        )}
                        <div className={styles.authorBio}>
                            <h3>About {educator.profileAccountDto?.fullName}</h3>
                            {educator.organization && (
                                <p className={styles.organization}>
                                    {educator.organization.name}
                                    {educator.organization.hotline && <> • {educator.organization.hotline}</>}
                                </p>
                            )}
                            {educator.profileAccountDto?.email && (
                                <p className={styles.email}>Email: {educator.profileAccountDto.email}</p>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* RELATED POSTS - DEMO */}
            <section className={styles.relatedSection}>
                <h2 className={styles.sectionHeader}>Related Posts</h2>
                <div className={styles.relatedGrid}>
                    {[
                        {
                            id: 101,
                            title: 'Mastering Soft Skills in the Workplace',
                            excerpt: 'Discover how developing soft skills can elevate your career...',
                            category: 'Career Tips',
                        },
                        {
                            id: 102,
                            title: 'The Future of Remote Work',
                            excerpt: 'What to expect in the evolving landscape of remote employment...',
                            category: 'Career Trends',
                        },
                        {
                            id: 103,
                            title: 'Networking Strategies That Work',
                            excerpt: 'Proven techniques for building meaningful professional relationships...',
                            category: 'Career Tips',
                        },
                        {
                            id: 104,
                            title: 'Personal Branding for Professionals',
                            excerpt: 'Build your professional brand and stand out in your industry...',
                            category: 'Personal Development',
                        },
                    ].map((post) => (
                        <a key={post.id} href={`/blog/${post.id}`} className={styles.relatedCard}>
                            <div className={styles.relatedThumb} />
                            <span className={styles.relatedCategory}>{post.category}</span>
                            <h3>{post.title}</h3>
                            <p>{post.excerpt}</p>
                        </a>
                    ))}
                </div>
            </section>

            {/* SUCCESS STORIES - DEMO */}
            <section className={styles.storiesSection}>
                <h2 className={styles.sectionHeader}>Success Stories</h2>
                <div className={styles.storiesGrid}>
                    {[
                        {
                            id: 1,
                            name: 'Alex Johnson',
                            role: 'Software Engineer at Google',
                            quote: 'These career resources helped me land my dream job. The advice was practical and actionable.',
                            initial: 'A',
                        },
                        {
                            id: 2,
                            name: 'Maria Garcia',
                            role: 'Product Manager at Microsoft',
                            quote: 'The interview preparation guide was invaluable. I felt confident going into every interview.',
                            initial: 'M',
                        },
                        {
                            id: 3,
                            name: 'James Lee',
                            role: 'Data Analyst at Amazon',
                            quote: 'Amazing resources that truly made a difference in my career transition. Highly recommended!',
                            initial: 'J',
                        },
                    ].map((story) => (
                        <div key={story.id} className={styles.storyCard}>
                            <div className={styles.storyAvatar}>{story.initial}</div>
                            <p className={styles.storyQuote}>&quot;{story.quote}&quot;</p>
                            <h4 className={styles.storyName}>{story.name}</h4>
                            <p className={styles.storyRole}>{story.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default BlogDetailDesktop;
