import React from 'react';
import { Link } from 'react-router-dom';

import styles from './AppFooter.module.scss';

const AppFooter = () => {
    return (
        <footer className={styles['lp-footer']}>
            <div className={styles['lp-footer__brand']}>
                <p className={styles['lp-footer__logo']}>💡 ITDream</p>

                <p className={styles['lp-footer__mission']}>
                    Sứ mệnh của chúng tôi là giúp sinh viên IT Việt Nam tìm được công việc trong mơ.
                </p>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Dành Cho Sinh Viên</p>

                <Link to="/simulations">Xem Dự Án</Link>
                <Link to="/jobs">Tìm Việc Làm IT</Link>
                <Link to="/simulations">Lập Trình Web</Link>
                <Link to="/simulations">Data & AI</Link>
                <Link to="/simulations">Mobile Development</Link>
                <Link to="/simulations">DevOps & Cloud</Link>
                <Link to="/simulations">Cybersecurity</Link>
                <Link to="/blog">Blog Công Nghệ</Link>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Dành Cho Doanh Nghiệp</p>

                <Link to="/login">Đăng Nhập</Link>
                <Link to="/login">Tài Nguyên Tuyển Dụng</Link>
                <Link to="/login">Đăng Ký Demo</Link>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Dành Cho Giảng Viên</p>

                <Link to="/login">Đăng Nhập</Link>
                <Link to="/login">Tài Nguyên Giảng Dạy</Link>
                <Link to="/login">Đăng Ký Hợp Tác</Link>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Về ITDream</p>

                <Link to="/">Câu Chuyện Của Chúng Tôi</Link>
                <Link to="/">Tuyển Dụng</Link>
                <Link to="/">Câu Hỏi Thường Gặp</Link>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Hỗ Trợ</p>

                <Link to="/">Trung Tâm Trợ Giúp</Link>
                <Link to="/policy">Chính Sách Bảo Mật</Link>
                <Link to="/policy">Điều Khoản Sử Dụng</Link>
                <Link to="/">Liên Hệ</Link>
                <Link to="/">Sơ Đồ Trang</Link>
            </div>
        </footer>
    );
};

export default AppFooter;
