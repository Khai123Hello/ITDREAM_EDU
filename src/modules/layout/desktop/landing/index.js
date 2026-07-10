import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SimulationCard from '@components/common/elements/SimulationCard';
import SliderScroll from '@components/common/elements/SliderScroll';
import { AppConstants } from '@constants';
import useAuth from '@hooks/useAuth';
import { getDownloadUrl } from '@utils';

import styles from './index.module.scss';

const levelText = {
    1: 'Cơ bản',
    2: 'Trung cấp',
    3: 'Nâng cao',
};

const steps = [
    { num: 1, text: 'Đăng ký ITDream và cho chúng tôi biết định hướng nghề nghiệp của bạn.' },
    { num: 2, text: 'Tham gia bài mô phỏng dự án thực tế tại các công ty công nghệ hàng đầu.' },
    { num: 3, text: 'Nộp bài và nhận phản hồi chi tiết cùng chứng chỉ hoàn thành.' },
    { num: 4, text: 'Kết nối trực tiếp với nhà tuyển dụng và cơ hội việc làm IT.' },
];

function LandingPageDesktop({ simulations = [], organizations = [], feedbacks = [], loading, error, onRetry }) {
    const navigate = useNavigate();
    const sliderRef = useRef(null);
    const stepsRef = useRef(null);
    const { isAuthenticated } = useAuth();
    const [ activeIndex, setActiveIndex ] = useState(0);

    const handleStartClick = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    const cards = useMemo(() => simulations || [], [ simulations ]);
    const totalCards = cards.length + 1;

    const handleSelectCard = (id) => {
        navigate(`/simulations/${id}`);
    };

    const handleViewAll = () => {
        navigate('/simulations');
    };

    const handlePrev = () => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    };

    const handleNext = () => {
        if (!sliderRef.current) return;
        sliderRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    };

    const handleScroll = () => {
        if (!sliderRef.current) return;
        const scrollLeft = sliderRef.current.scrollLeft;
        const cardWidth = 320;
        const index = Math.round(scrollLeft / cardWidth);
        setActiveIndex(index);
    };

    const renderCard = (item) => (
        <div key={item.id} className={styles['lp-sim-card']}>
            <SimulationCard
                id={item.id}
                title={item.title}
                thumbnail={item.thumbnail}
                level={item.level}
                duration={item.duration}
                totalParticipant={item.totalParticipant}
                avgStar={item.avgStar}
                organization={item.organization}
                category={item.category?.name || 'N/A'}
                onClick={() => handleSelectCard(item.id)}
            />
        </div>
    );

    const renderSkeleton = () => (
        <div className={styles['lp-sim-slider']}>
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className={`${styles['lp-sim-card']} ${styles['lp-sim-card--skeleton']}`}>
                    <div className={styles['lp-sim-card__thumb']} />
                    <div className={styles['lp-sim-card__body']}>
                        <div className={styles['lp-skeleton-line']} />
                        <div className={styles['lp-skeleton-line']} />
                        <div className={styles['lp-skeleton-line']} />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderError = () => (
        <div className={styles['lp-sim-error']}>
            <p>Không tải được bài mô phỏng.</p>
            <button className={`${styles['lp-btn']} ${styles['lp-btn--outline']}`} onClick={onRetry}>
                Thử lại
            </button>
        </div>
    );

    const renderEmpty = () => <div className={styles['lp-sim-empty']}>Chưa có bài mô phỏng nào</div>;

    const renderDots = () => (
        <div className={styles['lp-sim-dots']}>
            {Array.from({ length: totalCards }).map((_, index) => (
                <button
                    key={index}
                    type="button"
                    className={`${styles['lp-sim-dot']} ${activeIndex === index ? styles['lp-sim-dot--active'] : ''}`}
                    onClick={() => sliderRef.current?.scrollTo({ left: index * 340, behavior: 'smooth' })}
                    aria-label={`Slide ${index + 1}`}
                />
            ))}
        </div>
    );

    return (
        <div className={styles.landingPage}>
            {/* HERO */}
            <section className={styles['lp-hero']}>
                <h1 className={styles['lp-hero__title']}>
                    Chinh phục kỹ năng IT.
                    <br />
                    Bước vào nghề nghiệp mơ ước.
                </h1>
                <p className={styles['lp-hero__subtitle']}>
                    Trải nghiệm thực tế tại các công ty công nghệ hàng đầu Việt Nam với hàng trăm bài mô phỏng miễn phí
                    — không cần kinh nghiệm để bắt đầu.
                </p>
                <button
                    className={`${styles['lp-btn']} ${styles['lp-btn--primary']} ${styles['lp-btn--lg']}`}
                    onClick={handleStartClick}
                >
                    Bắt Đầu Ngay →
                </button>

                <p className={styles['lp-hero__featuring']}>Bài mô phỏng từ các tổ chức liên quan</p>
                <div className={styles['lp-hero__logos']}>
                    {organizations.slice(0, 5).map((org) => (
                        <span key={org.id} className={styles['lp-logo-pill']}>
                            {org.name || org.shortName}
                        </span>
                    ))}
                </div>
            </section>

            {/* CAROUSEL MÔ PHỎNG */}
            <section className={styles['lp-section']}>
                <h2 className={styles['lp-section__title']}>Khám phá các bài mô phỏng miễn phí</h2>
                {loading ? (
                    renderSkeleton()
                ) : error ? (
                    renderError()
                ) : cards.length === 0 ? (
                    renderEmpty()
                ) : (
                    <div className={styles['lp-sims-wrapper']}>
                        <button type="button" className={styles['lp-sim-arrow']} onClick={handlePrev}>
                            ‹
                        </button>
                        <SliderScroll
                            className={styles['lp-sim-slider']}
                            scrollToId={null}
                            ref={sliderRef}
                            onScroll={handleScroll}
                        >
                            {cards.map(renderCard)}
                            <button
                                type="button"
                                className={`${styles['lp-sim-card']} ${styles['lp-sim-card--cta']}`}
                                onClick={handleViewAll}
                                title="Xem tất cả các bài mô phỏng"
                            >
                                <div className={styles['lp-sim-cta']}>
                                    <span className={styles['lp-sim-cta__icon']} aria-hidden="true">
                                        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM241 377c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l87-87-87-87c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0L345 239c9.4 9.4 9.4 24.6 0 33.9L241 377z" />
                                        </svg>
                                    </span>
                                    <span className={styles['lp-sim-cta__label']}>Xem tất cả các bài mô phỏng</span>
                                </div>
                            </button>
                        </SliderScroll>
                        <button type="button" className={styles['lp-sim-arrow']} onClick={handleNext}>
                            ›
                        </button>
                    </div>
                )}
                {!loading && !error && cards.length > 0 && renderDots()}
            </section>

            {/* CÁCH THỨC HOẠT ĐỘNG */}
            <section ref={stepsRef} className={`${styles['lp-section']} ${styles['lp-how']}`}>
                <h2 className={styles['lp-section__title']}>
                    ITDream — Cầu nối từ sinh viên đến kỹ sư IT chuyên nghiệp
                </h2>
                <p className={styles['lp-how__sub']}>
                    Các bài mô phỏng xây dựng kỹ năng thực tế trong môi trường doanh nghiệp, giúp bạn hiểu rõ công việc
                    hàng ngày. Hoàn toàn miễn phí, linh hoạt theo thời gian của bạn.
                </p>
                <div className={styles['lp-steps']}>
                    {steps.map((s) => (
                        <div key={s.num} className={styles['lp-step']}>
                            <div className={styles['lp-step__num']}>{s.num}</div>
                            <p className={styles['lp-step__text']}>{s.text}</p>
                        </div>
                    ))}
                </div>
                <button
                    className={`${styles['lp-btn']} ${styles['lp-btn--primary']}`}
                    onClick={() => stepsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                >
                    ITDream Hoạt Động Như Thế Nào →
                </button>
            </section>

            {/* ĐÁNH GIÁ */}
            {feedbacks.length > 0 && (
                <section className={`${styles['lp-section']} ${styles['lp-testimonials-section']}`}>
                    <h2 className={styles['lp-section__title']}>Nghe từ chính các sinh viên đã thành công.</h2>
                    <div className={styles['lp-testimonials']}>
                        {feedbacks.map((f) => {
                            const studentProfile = f.student?.profileAccountDto || f.student;
                            const fullName = studentProfile?.fullName || f.student?.account?.fullName || 'Học viên';

                            const avatar = studentProfile?.avatar || studentProfile?.avatarPath || '';
                            const avatarUrl = avatar ? getDownloadUrl(avatar) : '';

                            return (
                                <div key={f.id} className={styles['lp-testimonial']}>
                                    <div className={styles['lp-testimonial__avatar']}>
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt={fullName} />
                                        ) : (
                                            (fullName || 'H').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <p className={styles['lp-testimonial__text']}>{f.content}</p>
                                    <p className={styles['lp-testimonial__name']}>{fullName}</p>
                                    <p className={styles['lp-testimonial__landed']}>
                                        {f.simulation?.title ? `Hoàn thành bài mô phỏng: ${f.simulation.title}` : ''}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                    <button
                        className={`${styles['lp-btn']} ${styles['lp-btn--primary']}`}
                        onClick={() => navigate('/simulations')}
                    >
                        Tìm Bài Mô Phỏng →
                    </button>
                </section>
            )}

            {/* KÊU GỌI HÀNH ĐỘNG */}
            <section className={styles['lp-cta']}>
                <div className={styles['lp-cta__content']}>
                    <h2 className={styles['lp-cta__title']}>
                        Chúng tôi tin rằng mọi sinh viên IT đều xứng đáng có cơ hội bình đẳng dựa trên năng lực thực sự.
                    </h2>
                    <p className={styles['lp-cta__sub']}>
                        ITDream ở đây để biến kỹ năng, sự nỗ lực và đam mê của bạn thành cơ hội việc làm thực tế.
                    </p>
                    <button className={`${styles['lp-btn']} ${styles['lp-btn--primary']}`} onClick={handleStartClick}>
                        Đăng Ký Miễn Phí →
                    </button>
                </div>
                <div className={styles['lp-cta__graphic']}>
                    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="60,10 110,85 10,85" fill="#2ecc71" opacity="0.85" />
                        <polygon points="60,30 100,95 20,95" fill="#27ae60" opacity="0.6" />
                        <circle cx="60" cy="55" r="12" fill="white" />
                    </svg>
                </div>
            </section>
        </div>
    );
}

export default LandingPageDesktop;
