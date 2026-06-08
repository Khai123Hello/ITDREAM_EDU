import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import routes from '@routes';
import cls from 'classnames';

// import DropdownMenu from '@/components/Common/DropdownMenu';
// import NextLink from '@/components/Common/NextLink';
// import IconMenu from '@/public/icons/menu.svg';
import styles from './Breadcrumb.module.scss';
function Separator({ symbol, className }) {
    return <span className={cls(styles.breadcrumbSeparator, className)}>{symbol ?? '/'}</span>;
}

const Item = function Item({ className, index, data = {}, renderItem, ...props }) {
    if (renderItem) {
        return renderItem(data, {
            className: cls(styles.item, className),
            index,
            title: data.label,
            ...props,
        });
    }

    const Component = data?.link ? (props) => <Link {...props} to={data.link} href={data.link} /> : 'div';

    return (
        <Component {...props} title={data.label} className={cls(styles.item, className)}>
            {data.label}
        </Component>
    );
};

function Breadcrumb({
    data = [],
    className,
    classNames = {},
    role,
    separator,
    renderItem,
    style,
    ignoreSingle = true,
    maxItems = 5,
}) {
    const dropdownContainer = useRef();

    const roleBasedBreadcrumb = [ data?.find((item) => item) ];

    const breadcrumb = roleBasedBreadcrumb?.data || data;

    // if (breadcrumb.length < 1 && ignoreSingle) return null;

    const dropdownCrumbs = breadcrumb.length > maxItems ? breadcrumb.slice(1, -3) : null;
    const visibleCrumbs = breadcrumb;

    return (
        <div ref={dropdownContainer} className={cls(styles.breadcrumbWrapper, className, classNames.wrapper)}>
            <Item
                data={{
                    label: 'Trang chủ',
                    link: routes.homePage.path,
                }}
                className={classNames.item}
                renderItem={renderItem}
                style={style}
            />
            {breadcrumb.length >= 1 && <Separator symbol={separator} className={classNames.separator} />}

            {/* {!!dropdownCrumbs?.length && (
                <>
                    <DropdownMenu
                        align="start"
                        container={dropdownContainer.current}
                        className={styles.dropdownCrumbs}
                        trigger={
                            <div className={cls(styles.dropdownTrigger)}>
                                <IconMenu />
                            </div>
                        }
                    >
                        {dropdownCrumbs.map((crumb, index) => (
                            <DropdownMenu.Item key={index}>
                                <Item
                                    data={crumb}
                                    renderItem={renderItem}
                                    className={cls(styles.dropdownItem, classNames.item)}
                                    data-is-dropdown={true}
                                >
                                    {crumb.label}
                                </Item>
                            </DropdownMenu.Item>
                        ))}
                    </DropdownMenu>
                    <Separator symbol={separator} className={classNames.separator} />
                </>
            )} */}
            {visibleCrumbs.map((item, index) => (
                <React.Fragment key={index}>
                    <Item
                        key={index}
                        data={item}
                        style={style}
                        className={classNames.item}
                        index={index}
                        renderItem={renderItem}
                        data-last-visible={index === visibleCrumbs.length - 1}
                    />
                    {index !== visibleCrumbs.length - 1 && (
                        <Separator symbol={separator} className={classNames.separator} style={style} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}

export default Breadcrumb;
