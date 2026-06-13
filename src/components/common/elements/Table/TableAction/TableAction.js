import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';

import { FONT_FAMILY } from '@/fonts/config';
import MenuIcon from '@/public/icons/menu.svg';

import Button from '../../Button';
import Popover from '../../Popover';

import styles from './TableAction.module.scss';

function TableAction({ data, actions = [], border = false }) {
    const [open, setOpen] = useState(false);
    const [_actions, setActions] = useState(actions);

    useEffect(() => {
        const newActions = actions.map((action) => {
            if (action.showIf) {
                if (!data) {
                    return null;
                }

                if (
                    !action.showIf?.every((item) => {
                        if (Array.isArray(data?.[item.key])) {
                            return data?.[item.key]?.includes(item.value);
                        } else {
                            if (Array.isArray(item.value)) {
                                return item.value.includes(data?.[item.key]);
                            }
                            return data?.[item.key] === item.value;
                        }
                    })
                ) {
                    return null;
                }
            }

            return action;
        });

        setActions([...newActions.filter((item) => item)]);
    }, [actions]);

    const ActionItem = useCallback(
        ({ label, icon, onClick = () => {} }) => (
            <div
                onClick={() => {
                    setOpen(false);
                    onClick(data);
                }}
                className={styles.actionItem}
            >
                <div className={styles.icon}>{icon}</div>
                <span className={FONT_FAMILY.className}>{label}</span>
            </div>
        ),
        [data],
    );

    if (!_actions?.length) {
        return <></>;
    }

    return (
        <div
            className={classNames(styles.wrapper, {
                [styles.border]: border,
            })}
        >
            <Popover
                align="start"
                side="left"
                // sideOffset={-15}
                className={styles.popoverContent}
                open={open}
                onOpenChange={setOpen}
                target={
                    <Popover.Target>
                        <Button type="none" className={styles.actionButton}>
                            <MenuIcon />
                        </Button>
                    </Popover.Target>
                }
            >
                <div className={styles.content}>
                    {_actions.map((action, index) => (
                        <ActionItem key={index} {...action} />
                    ))}
                </div>
            </Popover>
        </div>
    );
}

export default TableAction;
