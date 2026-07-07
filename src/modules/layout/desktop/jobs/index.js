import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TipTapJsonRenderer from '@components/common/editor/TipTapJsonRenderer';
import LoadingComponent from '@components/common/loading/LoadingComponent';
import { AppConstants } from '@constants';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import { getDownloadUrl } from '@utils';
import { message } from 'antd';
import classNames from 'classnames';
import dayjs from 'dayjs';

import styles from './index.module.scss';

const getJobTags = (job) => {
    const tags = [];
    if (job.type === 1) {
        tags.push('SỰ KIỆN');
    } else if (job.type === 2) {
        tags.push('CÔNG VIỆC');
    } else if (job.type === 3) {
        tags.push('MẠNG LƯỚI TÀI NĂNG');
    }

    const roleTypeLabels = {
        1: 'THỰC TẬP',
        2: 'BÁN THỜI GIAN',
        3: 'TOÀN THỜI GIAN',
        4: 'THỰC TẬP & BÁN THỜI GIAN',
        5: 'THỰC TẬP & TOÀN THỜI GIAN',
        6: 'BÁN THỜI GIAN & TOÀN THỜI GIAN',
        7: 'TẤT CẢ VAI TRÒ',
    };
    if (job.roleType && roleTypeLabels[job.roleType]) {
        tags.push(roleTypeLabels[job.roleType]);
    }
    return tags;
};

const getOrgLogo = (job) => {
    const logo =
        job?.educator?.organization?.logoUrl ||
        job?.educator?.profileAccountDto?.avatar ||
        job?.educator?.account?.avatar;
    if (!logo) return null;
    return logo.startsWith('http') ? logo : `${AppConstants.contentRootUrl}${logo}`;
};

const getPlainTextFromTipTap = (content) => {
    if (!content) return '';
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            const extractText = (node) => {
                if (!node) return '';
                if (node.text) return node.text + ' ';
                if (node.content) return node.content.map(extractText).join('');
                return '';
            };
            return extractText(parsed).trim();
        } catch (e) {
            return content;
        }
    }
    return content;
};

function JobsDesktop() {
    const navigate = useNavigate();
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [selectedTab, setSelectedTab] = useState('all'); // 'all', 'saved'

    // Dropdown filters
    const [opportunityFilter, setOpportunityFilter] = useState('Tất cả');
    const [roleFilter, setRoleFilter] = useState('Tất cả');
    const [selectedProvinceId, setSelectedProvinceId] = useState(null);
    const [selectedWardId, setSelectedWardId] = useState(null);

    // Fetch provinces on mount
    const { data: provinces } = useFetch(apiConfig.nation.client_list, {
        params: { kind: 1, page: 0, size: 200 },
        mappingData: (res) => res.data?.content || [],
        immediate: true,
    });

    // Fetch wards dynamically based on province
    const [wards, setWards] = useState([]);
    const { execute: fetchWards } = useFetch(apiConfig.nation.client_list, {
        immediate: false,
    });

    useEffect(() => {
        if (selectedProvinceId) {
            fetchWards({
                params: { kind: 2, parentId: selectedProvinceId, page: 0, size: 200 },
                onCompleted: (res) => {
                    setWards(res?.data?.content || []);
                },
            });
            setSelectedWardId(null);
        } else {
            setWards([]);
            setSelectedWardId(null);
        }
    }, [selectedProvinceId, fetchWards]);

    const handleSelectJob = (jobId) => {
        setSelectedJobId(jobId);
    };

    // Mapped query parameters for the main job list
    const queryParams = useMemo(() => {
        const params = {
            page: 0,
            size: 100, // Fetch a reasonably large list since there is no pagination UI
        };

        if (opportunityFilter !== 'Tất cả') params.type = parseInt(opportunityFilter);
        if (roleFilter !== 'Tất cả') params.roleType = parseInt(roleFilter);
        if (selectedProvinceId) params.provinceId = selectedProvinceId;
        if (selectedWardId) params.wardId = selectedWardId;

        return params;
    }, [opportunityFilter, roleFilter, selectedProvinceId, selectedWardId]);

    // Fetch saved job IDs on mount
    const { data: savedJobIdsResponse, execute: fetchSavedJobs } = useFetch(apiConfig.job.listSaveJob, {
        mappingData: (res) => res.data?.jobPostIds || [],
        immediate: true,
    });
    const savedJobIds = savedJobIdsResponse || [];
    const savedCount = savedJobIds.length;

    // Main jobs list fetcher
    const {
        data: jobsResponse,
        loading: listLoading,
        execute: fetchJobs,
    } = useFetch(apiConfig.job.guestList, {
        params: queryParams,
        mappingData: (res) => res.data || {},
    });

    // Load jobs on query parameters change
    useEffect(() => {
        fetchJobs();
    }, [queryParams, fetchJobs]);

    // Active job details resolver
    const jobs = jobsResponse?.content || [];

    // Filter by tab: if tab is 'saved', filter in memory
    const filteredJobs = useMemo(() => {
        if (selectedTab === 'saved') {
            return jobs.filter((job) => savedJobIds.includes(job.id));
        }
        return jobs;
    }, [jobs, selectedTab, savedJobIds]);

    const activeJob = useMemo(() => {
        return filteredJobs.find((job) => job.id === selectedJobId) || filteredJobs[0] || null;
    }, [filteredJobs, selectedJobId]);

    const {
        data: activeJobDetail,
        loading: detailLoading,
        execute: fetchJobDetail,
    } = useFetch(apiConfig.job.guestGet, {
        mappingData: (res) => res.data || null,
        immediate: false,
    });

    useEffect(() => {
        if (activeJob?.id) {
            fetchJobDetail({
                pathParams: { id: activeJob.id },
            });
        }
    }, [activeJob?.id, fetchJobDetail]);

    const displayJob = activeJobDetail && activeJobDetail.id === activeJob?.id ? activeJobDetail : activeJob;

    // Reset selected job if it gets filtered out of the list
    useEffect(() => {
        if (selectedJobId && filteredJobs.length > 0 && !filteredJobs.some((j) => j.id === selectedJobId)) {
            setSelectedJobId(null);
        }
    }, [filteredJobs, selectedJobId]);

    // Toggle save job action
    const { execute: callSaveJob } = useFetch(apiConfig.job.saveJob, {}, false);
    const handleToggleSaveJob = (e, jobId) => {
        e.stopPropagation();
        const isSaved = savedJobIds.includes(jobId);
        const newSavedIds = isSaved ? savedJobIds.filter((id) => id !== jobId) : [...savedJobIds, jobId];

        callSaveJob({
            dataBody: { jobPostIds: newSavedIds },
            onCompleted: () => {
                fetchSavedJobs(); // Refresh saved jobs list from backend
                message.success(isSaved ? 'Đã bỏ lưu cơ hội việc làm' : 'Đã lưu cơ hội việc làm');
            },
            onError: (err) => {
                message.error(err?.message || 'Không thể cập nhật trạng thái lưu.');
            },
        });
    };

    return (
        <div className={styles.jobsContainer}>
            {/* HERO */}
            <div className={styles.hero}>
                <h1>Cơ hội thực tập, vị trí dành cho người mới bắt đầu sự nghiệp và cơ hội kết nối.</h1>
                <p>
                    Khám phá các cơ hội thực tập, việc làm dành cho sinh viên sắp tốt nghiệp và các sự kiện độc quyền từ
                    các công ty hàng đầu trên ITDream, được thiết kế riêng cho sinh viên đại học và những người mới bắt
                    đầu sự nghiệp.
                </p>
            </div>

            {/* FILTER BAR */}
            <div className={styles.filterBar}>
                <div className={styles.filterTabs}>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'all' })}
                        onClick={() => {
                            setSelectedTab('all');
                            setSelectedJobId(null);
                        }}
                    >
                        Tất cả
                    </button>
                    <button
                        className={classNames(styles.tabBtn, { [styles.active]: selectedTab === 'saved' })}
                        onClick={() => {
                            setSelectedTab('saved');
                            setSelectedJobId(null);
                        }}
                    >
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M17 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M9 7h6M9 11h6M9 15h4"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                        Đã lưu ({savedCount})
                    </button>
                </div>

                <div className={styles.filterDropdowns}>
                    <div className={styles.selectWrapper}>
                        <select
                            value={opportunityFilter}
                            onChange={(e) => setOpportunityFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại cơ hội: Tất cả</option>
                            <option value="1">Sự kiện</option>
                            <option value="2">Tuyển dụng</option>
                            <option value="3">Mạng lưới tài năng</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Loại vai trò: Tất cả</option>
                            <option value="1">Thực tập</option>
                            <option value="2">Bán thời gian</option>
                            <option value="3">Toàn thời gian</option>
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            value={selectedProvinceId || 'Tất cả'}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedProvinceId(val === 'Tất cả' ? null : parseInt(val));
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Tỉnh / Thành phố: Tất cả</option>
                            {provinces?.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.selectWrapper}>
                        <select
                            disabled={!selectedProvinceId}
                            value={selectedWardId || 'Tất cả'}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedWardId(val === 'Tất cả' ? null : parseInt(val));
                            }}
                            className={styles.filterSelect}
                        >
                            <option value="Tất cả">Địa chỉ phụ thuộc: Tất cả</option>
                            {wards?.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.resultCount}>
                {listLoading
                    ? 'Đang tải...'
                    : `Hiển thị 1–${filteredJobs.length} trong số ${filteredJobs.length} cơ hội`}
            </div>

            {/* MAIN LAYOUT */}
            <div className={classNames(styles.mainLayout, { [styles.panelOpen]: activeJob !== null })}>
                {/* LEFT: JOB LIST */}
                <div className={styles.jobList}>
                    {listLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', width: '100%' }}>
                            <LoadingComponent />
                        </div>
                    ) : filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                className={classNames(styles.jobCard, {
                                    [styles.selected]:
                                        selectedJobId === job.id || (!selectedJobId && activeJob?.id === job.id),
                                })}
                                onClick={() => handleSelectJob(job.id)}
                            >
                                <div className={styles.cardTop}>
                                    <div className={styles.companyNameText}>
                                        {job.educator?.organization?.name ||
                                            job.educator?.profileAccountDto?.fullName ||
                                            'ITDream'}
                                    </div>
                                    <div className={styles.cardTags}>
                                        {getJobTags(job).map((tag, i) => (
                                            <span
                                                key={i}
                                                className={classNames(styles.tag, {
                                                    [styles.tagEvent]: tag === 'SỰ KIỆN',
                                                    [styles.tagJob]: tag === 'CÔNG VIỆC',
                                                })}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.cardTitle}>{job.title}</div>
                                {job.content && (
                                    <div className={styles.cardDesc}>
                                        {(() => {
                                            const plainText = getPlainTextFromTipTap(job.content);
                                            return plainText.length > 120
                                                ? plainText.substring(0, 120) + '...'
                                                : plainText;
                                        })()}
                                    </div>
                                )}
                                <div className={styles.cardMeta}>
                                    {(job.address || job.province?.name) && (
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <path
                                                    d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                />
                                                <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            {job.address?.toLowerCase() === 'online'
                                                ? 'Online'
                                                : job.province?.name || ''}
                                        </span>
                                    )}
                                    {((job.type === 1 && job.date) || (job.type !== 1 && job.endDate)) && (
                                        <span>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                <path
                                                    d="M12 7v5l3 3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            {job.type === 1
                                                ? dayjs(job.date).format('DD/MM/YYYY')
                                                : `Hạn: ${dayjs(job.endDate).format('DD/MM/YYYY')}`}
                                        </span>
                                    )}
                                    <button
                                        className={classNames(styles.saveBtn, {
                                            [styles.saved]: savedJobIds.includes(job.id),
                                        })}
                                        onClick={(e) => handleToggleSaveJob(e, job.id)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noJobs}>Không tìm thấy cơ hội việc làm nào phù hợp.</div>
                    )}
                </div>

                {/* RIGHT: DETAIL PANEL */}
                <div className={styles.rightColumn}>
                    {displayJob ? (
                        <div className={classNames(styles.detailPanel, styles.visible)}>
                            <div
                                className={styles.detailHeroImg}
                                style={{
                                    backgroundImage: displayJob.image
                                        ? `url(${displayJob.image.startsWith('http') ? displayJob.image : `${AppConstants.contentRootUrl}${displayJob.image}`})`
                                        : 'linear-gradient(135deg, #0f2042, #1b3564)',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    height: '180px',
                                }}
                            />

                            <div className={styles.detailBody}>
                                <div className={styles.detailTags}>
                                    {getJobTags(displayJob).map((tag, i) => (
                                        <span
                                            key={i}
                                            className={classNames(styles.tag, {
                                                [styles.tagEvent]: tag === 'SỰ KIỆN',
                                                [styles.tagJob]: tag === 'CÔNG VIỆC',
                                            })}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className={styles.detailTitle}>{displayJob.title}</div>

                                {/* ORGANIZATION & AUTHOR DETAILS */}
                                {displayJob.educator?.organization?.name && (
                                    <div className={styles.authorSection}>
                                        {getOrgLogo(displayJob) && (
                                            <img src={getOrgLogo(displayJob)} alt="logo" className={styles.orgLogo} />
                                        )}
                                        <div className={styles.authorInfo}>
                                            <div className={styles.orgName}>
                                                {displayJob.educator.organization.name}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {((displayJob.type === 1 && displayJob.date) ||
                                    (displayJob.type !== 1 && displayJob.endDate)) && (
                                        <div className={styles.detailMetaRow}>
                                            <svg viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                                                <path
                                                    d="M12 7v5l3 3"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <span className={styles.label}>
                                                {displayJob.type === 1 ? 'Ngày tổ chức:' : 'Hạn chót ứng tuyển:'}
                                            </span>{' '}
                                            {displayJob.type === 1
                                                ? dayjs(displayJob.date).format('DD/MM/YYYY')
                                                : dayjs(displayJob.endDate).format('DD/MM/YYYY')}
                                        </div>
                                    )}
                                {(displayJob.address || displayJob.province?.name) && (
                                    <div className={styles.detailMetaRow}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="1.5" />
                                        </svg>
                                        <span className={styles.label}>Địa điểm làm việc:</span>{' '}
                                        {displayJob.address?.toLowerCase() === 'online'
                                            ? 'Online'
                                            : `${displayJob.address ? `${displayJob.address}, ` : ''}${displayJob.province?.name || ''}`}
                                    </div>
                                )}
                                {/* {displayJob.notice && (
                                    <div className={classNames(styles.detailMetaRow, styles.eligibilityRow)}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                        <span>{displayJob.notice}</span>
                                    </div>
                                )} */}

                                <div className={styles.actionBtns}>
                                    <button
                                        className={styles.btnPrimary}
                                        onClick={() => {
                                            if (displayJob.jobUrl) {
                                                window.open(displayJob.jobUrl, '_blank');
                                            } else {
                                                message.warning('Không tìm thấy đường dẫn tuyển dụng.');
                                            }
                                        }}
                                    >
                                        <svg
                                            width="14"
                                            height="14"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            style={{ marginRight: 6 }}
                                        >
                                            <path
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        Đăng ký ngay
                                    </button>
                                </div>

                                <div className={styles.detailDescWrapper}>
                                    {detailLoading && !activeJobDetail ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                            <LoadingComponent />
                                        </div>
                                    ) : (
                                        displayJob.content && <TipTapJsonRenderer content={displayJob.content} />
                                    )}
                                </div>

                                {/* SIMULATIONS */}
                                {displayJob.simulations && displayJob.simulations.length > 0 && (
                                    <>
                                        <hr className={styles.divider} />
                                        <div className={styles.detailSectionTitle}>Mô phỏng công việc liên quan</div>
                                        <p className={styles.simulationIntro}>
                                            Hãy tìm hiểu cách thức công việc được thực hiện để nổi bật trong các buổi
                                            phỏng vấn. Cho đội ngũ thấy rằng bạn có những kỹ năng cần thiết để thành
                                            công trong công việc.
                                        </p>

                                        {displayJob.simulations.map((sim) => (
                                            <div
                                                key={sim.id}
                                                className={styles.simCard}
                                                style={{ marginBottom: 12 }}
                                                onClick={() => navigate(`/simulations/${sim.id}`)}
                                            >
                                                <div
                                                    className={styles.simThumb}
                                                    style={{
                                                        backgroundImage: sim.thumbnail
                                                            ? `url(${sim.thumbnail.startsWith('http') ? sim.thumbnail : `${AppConstants.contentRootUrl}${sim.thumbnail}`})`
                                                            : 'none',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center',
                                                    }}
                                                >
                                                    {!sim.thumbnail &&
                                                        (sim.category?.name?.substring(0, 7).toUpperCase() || '')}
                                                </div>
                                                <div className={styles.simInfo}>
                                                    <div className={styles.simLabel}>{sim.category?.name || ''}</div>
                                                    <div className={styles.simName}>{sim.title}</div>
                                                    <div className={styles.simMeta}>
                                                        <span>Giới thiệu</span>
                                                        <div className={styles.simDots}>
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 1,
                                                                })}
                                                            />
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 2,
                                                                })}
                                                            />
                                                            <div
                                                                className={classNames(styles.dot, {
                                                                    [styles.filled]: (sim.level || 0) >= 3,
                                                                })}
                                                            />
                                                        </div>
                                                        <span>{sim.duration || '2-3 giờ'}</span>
                                                    </div>
                                                    {(sim.totalParticipant !== undefined ||
                                                        (sim.avgStar !== undefined && sim.avgStar > 0)) && (
                                                            <div className={styles.simExtraMeta}>
                                                                {sim.totalParticipant !== undefined && (
                                                                    <span>👤 {sim.totalParticipant} học viên</span>
                                                                )}
                                                                {sim.avgStar !== undefined && sim.avgStar > 0 && (
                                                                    <span>⭐ {sim.avgStar} / 5</span>
                                                                )}
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.upsellPanel}>
                            <h3>Tăng cơ hội tuyển dụng của bạn</h3>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Hoàn thành bài mô phỏng công việc liên kết để nhận huy hiệu ưu tiên nộp đơn.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>
                                    Chia sẻ thành tích trực tiếp với đội ngũ tuyển dụng của doanh nghiệp đối tác.
                                </span>
                            </div>
                            <div className={styles.upsellItem}>
                                <span className={styles.check}>✓</span>
                                <span>Tạo ấn tượng sâu sắc hơn thông qua các kỹ năng thực tế đã được kiểm chứng.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JobsDesktop;
