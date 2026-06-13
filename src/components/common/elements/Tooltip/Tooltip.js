import React from 'react';
import useUncontrolled from '@hooks/useUncontrolled';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import classNames from 'classnames';

import styles from './Tooltip.module.scss';

const Tooltip = ({
    trigger,
    onOpenChange,
    children,
    open,
    className,
    delayDuration = 0,
    skipDelayDuration,
    zIndex,
    container,
    ...props
}) => {
    const [ _open, _onOpenChange ] = useUncontrolled({ value: open, onChange: onOpenChange });
    return (
        <RadixTooltip.Root
            delayDuration={delayDuration}
            skipDelayDuration={skipDelayDuration}
            open={_open}
            onOpenChange={_onOpenChange}
        >
            {!!trigger && <Trigger>{trigger}</Trigger>}
            <RadixTooltip.Portal container={container} sideOffset={1}>
                <RadixTooltip.Content
                    tabIndex="none"
                    className={classNames({
                        [styles.content]: true,
                        [className]: true,
                    })}
                    style={{ zIndex }}
                    sideOffset={20}
                    {...props}
                >
                    {children}
                </RadixTooltip.Content>
            </RadixTooltip.Portal>
        </RadixTooltip.Root>
    );
};

const Trigger = ({ children }) => <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>;
const Provider = ({ children }) => <RadixTooltip.Provider asChild>{children}</RadixTooltip.Provider>;

Tooltip.Trigger = Trigger;
Tooltip.Provider = Provider;

export default Tooltip;
