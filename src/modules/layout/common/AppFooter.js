import React from 'react';

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

                <a href="#">Xem Dự Án</a>
                <a href="#">Tìm Việc Làm IT</a>
                <a href="#">Lập Trình Web</a>
                <a href="#">Data & AI</a>
                <a href="#">Mobile Development</a>
                <a href="#">DevOps & Cloud</a>
                <a href="#">Cybersecurity</a>
                <a href="#">Blog Công Nghệ</a>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Dành Cho Doanh Nghiệp</p>

                <a href="#">Đăng Nhập</a>
                <a href="#">Tài Nguyên Tuyển Dụng</a>
                <a href="#">Đăng Ký Demo</a>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Dành Cho Giảng Viên</p>

                <a href="#">Đăng Nhập</a>
                <a href="#">Tài Nguyên Giảng Dạy</a>
                <a href="#">Đăng Ký Hợp Tác</a>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Về ITDream</p>

                <a href="#">Câu Chuyện Của Chúng Tôi</a>
                <a href="#">Tuyển Dụng</a>
                <a href="#">Câu Hỏi Thường Gặp</a>
            </div>

            <div className={styles['lp-footer__col']}>
                <p className={styles['lp-footer__heading']}>Hỗ Trợ</p>

                <a href="#">Trung Tâm Trợ Giúp</a>
                <a href="#">Chính Sách Bảo Mật</a>
                <a href="#">Điều Khoản Sử Dụng</a>
                <a href="#">Liên Hệ</a>
                <a href="#">Sơ Đồ Trang</a>
            </div>
        </footer>
    );
};

export default AppFooter;
