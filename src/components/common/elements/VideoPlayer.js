import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ReactPlayer from 'react-player/lazy';
import { toast } from 'react-toastify';
import enSub from '@assets/subtitles/en.vtt';
import viSub from '@assets/subtitles/vi.vtt';
import { getYoutubeVideoID, isSafari } from '@utils';

import NotificationElement from '../form/NotificationElement';
const message = defineMessages({
    complete: 'Video Completed !!!',
    subtitles: {
        en: {
            id: 'components.elements.videoplayer.subtitle.en',
            defaultMessage: 'English',
        },
        vi: {
            id: 'components.elements.videoplayer.subtitle.vi',
            defaultMessage: 'Vietnamese',
        },
    },
});

function VideoPlayer({ url, width, height, style, autoPlay = true, muted = false, className, subtitles }) {
    const intl = useIntl();
    const handleVideoEnded = () => {
        toast.success(intl.formatMessage(message.complete));
    };

    const renderPlayer = useMemo(() => {
        const youtubeId = getYoutubeVideoID(url);

        if (youtubeId) {
            return (
                <>
                    <ReactPlayer
                        url={`https://www.youtube.com/embed/${youtubeId}?autoplay=${Number(autoPlay)}&mute=${Number(
                            muted,
                        )}`}
                        style={{ width: width || '100%', height: height || '100%', border: 0, ...style }}
                        className={className}
                        onEnded={handleVideoEnded}
                        width="100%"
                        height="100%"
                        playing={true}
                        controls={true}
                        config={{
                            youtube: {
                                playerVars: { showinfo: 1 },
                            },
                        }}
                    />
                    <NotificationElement />
                </>
            );
        }

        return (
            <>
                <video
                    className={className}
                    autoPlay={autoPlay}
                    muted={muted}
                    style={{ width: width || '100%', height: height || '100%', ...style }}
                    controls
                    src={!isSafari && url}
                    onEnded={handleVideoEnded}
                >
                    <source src={url} type="video/mp4" />
                    <source src={url} type="video/m4v" />

                    <track
                        label={intl.formatMessage(message.subtitles.en)}
                        kind="subtitles"
                        srcLang="en"
                        src={enSub}
                        default
                    />
                    <track label={intl.formatMessage(message.subtitles.vi)} kind="subtitles" srcLang="vi" src={viSub} />
                </video>
                <NotificationElement />
            </>
        );
    }, [url]);

    return <>{renderPlayer}</>;
}

export default VideoPlayer;
