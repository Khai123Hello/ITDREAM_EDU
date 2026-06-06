import React from 'react';
import useUncontrolled from '@hooks/useUncontrolled';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';

import styles from './DropdownMenu.module.scss';

function DropdownMenu({
    children,
    open,
    onOpenChange,
    onClose,
    defaultOpen,
    trigger,
    align,
    sideOffset = 5,
    alignOffset,
    className,
    container,
    ...props
}) {
    const [ _open, _onOpenChange ] = useUncontrolled({ value: open, onChange: onOpenChange });

    return (
        <RadixDropdownMenu.Root
            defaultOpen={defaultOpen}
            open={open}
            onOpenChange={(open) => {
                // if (!open) {
                //     onClose?.();
                // }
                _onOpenChange?.(open);
            }}
        >
            {!!trigger && <Trigger>{trigger}</Trigger>}
            <DropdownMenu.Portal container={container}>
                <DropdownMenu.Content
                    {...props}
                    align={align}
                    alignOffset={alignOffset}
                    sideOffset={sideOffset}
                    className={className}
                >
                    {children}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </RadixDropdownMenu.Root>
    );
}

function Trigger({ children, className, onMouseEnter, onMouseLeave, ...props }) {
    return (
        <RadixDropdownMenu.Trigger
            {...props}
            className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            asChild
        >
            {children}
        </RadixDropdownMenu.Trigger>
    );
}

function Item({ children, className, ...props }) {
    return (
        <RadixDropdownMenu.Item {...props} className={classNames(styles.item, className)}>
            {children}
        </RadixDropdownMenu.Item>
    );
}

DropdownMenu.Trigger = Trigger;
DropdownMenu.Label = RadixDropdownMenu.Label;
DropdownMenu.Content = RadixDropdownMenu.Content;
DropdownMenu.Arrow = RadixDropdownMenu.Arrow;
DropdownMenu.Portal = RadixDropdownMenu.Portal;
DropdownMenu.Group = RadixDropdownMenu.Group;
DropdownMenu.Item = Item;
DropdownMenu.ItemIndicator = RadixDropdownMenu.ItemIndicator;
DropdownMenu.CheckboxItem = RadixDropdownMenu.CheckboxItem;
DropdownMenu.RadioGroup = RadixDropdownMenu.RadioGroup;
DropdownMenu.RadioItem = RadixDropdownMenu.RadioItem;
DropdownMenu.Separator = RadixDropdownMenu.Separator;
DropdownMenu.Sub = RadixDropdownMenu.Sub;
DropdownMenu.SubTrigger = RadixDropdownMenu.SubTrigger;
DropdownMenu.SubContent = RadixDropdownMenu.SubContent;

export default DropdownMenu;
