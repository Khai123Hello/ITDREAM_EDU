import React, { Component } from 'react';
import * as rdd from 'react-device-detect';
import ErrorImage from '@assets/images/error_boundary.png';

import styles from './ErrorBoundary.module.scss';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { zoomError: false };
    }

    componentDidCatch(error, info) {
        // Ghi nhận thông tin lỗi
        //console.error(error, info);
    }

    componentDidMount() {
        this.checkZoomLevel();
        window.addEventListener('resize', this.checkZoomLevel);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.checkZoomLevel);
    }

    checkZoomLevel = () => {
        // const zoomLevel = Math.round(window.devicePixelRatio * 100); // Tính mức thu phóng
        const zoomLevel = Math.round((window.innerWidth / window.screen.width) * 100); // Tính mức thu phóng
        const isMobile = rdd.isMobile;
        if (!isMobile && zoomLevel < 51) {
            this.setState({ zoomError: true });
        } else {
            this.setState({ zoomError: false });
        }
    };

    render() {
        const { zoomError } = this.state;

        if (zoomError) {
            return (
                <div className={styles.wrapper}>
                    <img src={ErrorImage} style={{ width: '200px' }} alt="Error" />
                    <div className={styles.title}>Đã vượt quá mức thu phóng</div>
                    <span className={styles.subTitle}>
                        Mức thu phóng trình duyệt của bạn cao hơn 100%. Vui lòng đặt lại về 100% và tải lại trang.
                    </span>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
