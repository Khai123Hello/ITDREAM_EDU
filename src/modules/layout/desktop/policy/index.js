import React from 'react';
import { TbFileText, TbLock, TbMail, TbShieldCheck, TbTrash, TbUserCheck } from 'react-icons/tb';
import { Link } from 'react-router-dom';

import styles from './index.module.scss';

const sections = [
    {
        icon: TbShieldCheck,
        title: '1. Thông tin chúng tôi thu thập',
        content:
            'Khi bạn đăng ký tài khoản ITDream, chúng tôi thu thập các thông tin cá nhân cần thiết bao gồm: họ tên, tên đăng nhập, email, số điện thoại, ngày sinh và mật khẩu (được mã hóa). Ngoài ra, chúng tôi có thể thu thập thông tin về quá trình học tập và kết quả bài mô phỏng của bạn trên nền tảng.',
    },
    {
        icon: TbLock,
        title: '2. Cách chúng tôi sử dụng thông tin',
        content:
            'Thông tin của bạn được sử dụng để: (a) tạo và quản lý tài khoản ITDream; (b) cung cấp dịch vụ bài mô phỏng và đánh giá kết quả; (c) gửi thông báo về các bài mô phỏng mới và cập nhật nền tảng; (d) kết nối bạn với nhà tuyển dụng khi bạn tham gia chương trình giới thiệu việc làm; (e) cải thiện trải nghiệm người dùng và phát triển nền tảng.',
    },
    {
        icon: TbUserCheck,
        title: '3. Chia sẻ thông tin với bên thứ ba',
        content:
            'ITDream cam kết không bán thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp: (a) bạn đồng ý chia sẻ thông tin với nhà tuyển dụng tiềm năng; (b) theo yêu cầu của cơ quan pháp luật có thẩm quyền; (c) với các đối tác cung cấp dịch vụ hỗ trợ nền tảng (lưu trữ dữ liệu, email) và chỉ trong phạm vi cần thiết.',
    },
    {
        icon: TbMail,
        title: '4. Email và thông báo',
        content:
            'Chúng tôi có thể gửi email cho bạn về các cập nhật nền tảng, bài mô phỏng mới, và cơ hội việc làm phù hợp. Bạn có thể hủy đăng ký nhận email tiếp thị bất kỳ lúc nào bằng cách nhấp vào liên kết hủy đăng ký ở cuối email. Tuy nhiên, bạn sẽ vẫn nhận được các email liên quan đến tài khoản và dịch vụ thiết yếu.',
    },
    {
        icon: TbTrash,
        title: '5. Quyền truy cập và xóa dữ liệu',
        content:
            'Bạn có quyền truy cập, chỉnh sửa và xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua trang hồ sơ cá nhân. Khi yêu cầu xóa tài khoản, chúng tôi sẽ xóa toàn bộ dữ liệu cá nhân của bạn khỏi hệ thống trong vòng 30 ngày, ngoại trừ các dữ liệu được yêu cầu lưu giữ theo quy định pháp luật.',
    },
    {
        icon: TbFileText,
        title: '6. Thay đổi chính sách',
        content:
            'ITDream có quyền cập nhật chính sách bảo mật này bất kỳ lúc nào. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email hoặc thông báo trên nền tảng. Việc bạn tiếp tục sử dụng ITDream sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách cập nhật.',
    },
];

const PolicyDesktop = () => {
    return (
        <div className={styles.policyPage}>
            <div className={styles.container}>
                <div className={styles.headerSimple}>
                    <TbShieldCheck className={styles.headerIcon} />
                    <h1 className={styles.title}>Chính sách bảo mật</h1>
                    <p className={styles.subtitle}>
                        ITDream cam kết bảo vệ thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng
                        tôi thu thập, sử dụng và bảo vệ dữ liệu của bạn.
                    </p>
                    <p className={styles.effective}>Có hiệu lực từ ngày 01 tháng 06 năm 2026</p>
                </div>

                <div className={styles.sections}>
                    {sections.map((section, index) => {
                        const Icon = section.icon;
                        return (
                            <div key={index} className={styles.section}>
                                <div className={styles.sectionIcon}>
                                    <Icon />
                                </div>
                                <div className={styles.sectionContent}>
                                    <h2 className={styles.sectionTitle}>{section.title}</h2>
                                    <p className={styles.sectionText}>{section.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.footerSimple}>
                    <p>
                        Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua
                        email:{' '}
                        <a href="mailto:privacy@itdream.edu.vn" className={styles.link}>
                            privacy@itdream.edu.vn
                        </a>
                    </p>
                    <Link to="/register" className={styles.backLink}>
                        ← Quay lại trang đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PolicyDesktop;
