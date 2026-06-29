import { forwardRef, useEffect, useRef } from 'react';
import React from 'react';
import useCallbackRef from '@hooks/useCallbackRef';
import createCtx from '@utils/create-ctx';
import classNames from 'classnames';
import Autoplay from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

import styles from './Carousel.module.scss';
const [ CarouselProvider, useCarouselRef ] = createCtx('Carousel');

function Carousel({
    options,
    children,
    onInit,
    onChange,
    onScroll,
    onSettle,
    onResize,
    className,
    slidesToScroll = 1,
    slidesToShow,
    slideSpacing = '1rem',
    loop = true,
    dragFree = false,
    autoplay = true,
    breakpoints = {},
    watchDrag = true,
    active = true,
    startIndex = 0,
    ...props
}) {
    const autoplayPlugin = useRef(autoplay && Autoplay({ delay: 10000, stopOnInteraction: false, ...autoplay }));
    const [ ref, api ] = useEmblaCarousel(
        { loop, active, slidesToScroll, breakpoints, dragFree, watchDrag, startIndex, inViewThreshold: 0.01, ...props },
        [ autoplayPlugin.current ].filter(Boolean),
    );

    const onInitCallback = useCallbackRef(onInit);
    const onChangeCallback = useCallbackRef(onChange);
    const onScrollCallback = useCallbackRef(onScroll);
    const onSettleCallback = useCallbackRef(onSettle);
    const onResizeCallback = useCallbackRef(onResize);

    useEffect(() => {
        if (!api) return;

        const withAutoplayReset =
            (fn) =>
                (...args) => {
                    autoplay && autoplayPlugin?.current?.reset?.();
                    return fn(...args);
                };

        api.scrollTo = withAutoplayReset(api.scrollTo);
        api.scrollNext = withAutoplayReset(api.scrollNext);
        api.canScrollPrev = withAutoplayReset(api.canScrollPrev);

        onInitCallback?.(api, autoplayPlugin.current);

        onInitCallback && api.on('reInit', onInitCallback);
        onChangeCallback && api.on('select', onChangeCallback);
        onScrollCallback && api.on('scroll', onScrollCallback);
        onSettleCallback && api.on('settle', onSettleCallback);
        onResizeCallback && api.on('resize', onResizeCallback);

        return () => {
            onInitCallback && api.off('reInit', onInitCallback);
            onChangeCallback && api.off('select', onChangeCallback);
            onScrollCallback && api.off('scroll', onScrollCallback);
            onSettleCallback && api.off('settle', onSettleCallback);
            onResizeCallback && api.off('resize', onResizeCallback);
        };
    }, [ api, autoplayPlugin, autoplay ]);

    useEffect(() => {
        if (!api) return;

        const handleDisableDrag = () => {
            const disableDraggable = api.internalEngine().scrollSnaps.length <= 1;
            const draggable = api.internalEngine().options.watchDrag === true;

            if (draggable && disableDraggable) {
                api.reInit({ watchDrag: false });
            } else if (!draggable && !disableDraggable) {
                api.reInit({ watchDrag: true });
            }
        };
        // handleDisableDrag();

        // api.on("resize", handleDisableDrag);
        // api.on("slidesChanged", handleDisableDrag);

        return () => {
            api.off('resize', handleDisableDrag);
        };
    }, [ api ]);

    return (
        <div
            {...props}
            style={{
                '--slice-size': `${isNaN(parseInt(slidesToShow)) ? 'auto' : (1 / slidesToShow) * 100 + '%'}`,
                '--slide-spacing': slideSpacing,
            }}
            data-slides-to-show={slidesToShow}
            className={classNames(styles.root, className)}
        >
            <CarouselProvider carouselRef={ref}>{children}</CarouselProvider>
        </div>
    );
}

function Viewport({ children, className, ...props }) {
    const { carouselRef } = useCarouselRef();

    return (
        <div {...props} ref={carouselRef} className={classNames(classNames(styles.viewport, className))}>
            {children}
        </div>
    );
}

function Container({ children, className, ...props }) {
    return (
        <div {...props} className={classNames(styles.container, className)}>
            {children}
        </div>
    );
}

const Slide = forwardRef(({ children, className, ...props }, ref) => {
    return (
        <div ref={ref} {...props} className={classNames(styles.slide, className)}>
            {children}
        </div>
    );
});

Slide.displayName = 'Slide';

Carousel.Viewport = Viewport;
Carousel.Container = Container;
Carousel.Slide = Slide;

export default Carousel;
