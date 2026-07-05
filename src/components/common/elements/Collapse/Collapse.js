import React from 'react';
import useUncontrolled from '@hooks/useUncontrolled';
import * as Collapsible from '@radix-ui/react-collapsible';

import styles from './Collapse.module.scss';
const Collapse = ({ open, children, trigger, onOpenChange, ...props }) => {
    const [ _open, _onOpenChange ] = useUncontrolled({ value: open, onChange: onOpenChange });
    return (
        <Collapsible.Root className="CollapsibleRoot" open={_open} onOpenChange={_onOpenChange} {...props}>
            {trigger}
            <Collapsible.Content className={styles.collapsibleContent}>{children}</Collapsible.Content>
        </Collapsible.Root>
    );
};

const Trigger = ({ children }) => <Collapsible.Trigger asChild>{children}</Collapsible.Trigger>;

Collapse.Trigger = Trigger;

export default Collapse;
