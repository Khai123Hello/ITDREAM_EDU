import React, { forwardRef, useImperativeHandle, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import noData from '@assets/images/no-data.png';
import NoData from '@assets/images/no-data.png';
import useDevices from '@hooks/useDevices';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import classNames from 'classnames';

import Loading from '../../loading/LoadingComponent';

import styles from './Table.module.scss';
const columnHelper = createColumnHelper();

const emptyArray = [];

const getCommonPinningStyles = (column, shadow, isHeader) => {
    const isPinned = column.getIsPinned();

    return {
        left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
        right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
        position: isPinned ? 'sticky' : 'relative',
        zIndex: isPinned ? 1 : 0,
        background: !isHeader ? '#fff' : undefined,
    };
};

const Table = forwardRef(
    (
        {
            data,
            columns = [],
            noDataWithoutFilter = false,
            className,
            classNameRow,
            actions,
            isLoading = false,
            rowSelection,
            enableMultiRowSelection = false,
            scrollX = false,
            scrollY = false,
            onClickTableCell = () => {},
            rowKey = 'id',
            withActionColumn = true,
            expandable = false,
            expanded,
            onExpandedChange,
            getSubRows,
            renderSubComponent,
        },
        ref,
    ) => {
        const [selected, setRowSelection] = useState({});
        const { isMobile } = useDevices();
        const columnsDefine = useMemo(
            () =>
                columns.map((column, index) => ({
                    ...columnHelper.accessor(column?.dataIndex, {
                        header: column.title,
                        id: column.key || `column-${index}`,
                        cell: column?.cell
                            ? column?.cell
                            : (value) =>
                                  column.render?.(value.getValue(), value.row.original, column.dataIndex) ||
                                  value.getValue(),
                    }),
                    pin: column.pin,
                })),
            [columns],
        );

        const table = useReactTable({
            data: data || emptyArray,
            columns: columnsDefine,
            state: {
                expanded: expandable ? expanded : undefined,
                rowSelection: rowSelection?.selectedRowKeys ? rowSelection?.selectedRowKeys : selected,
            },
            onExpandedChange: expandable ? onExpandedChange : undefined,
            getCoreRowModel: getCoreRowModel(),
            enableMultiRowSelection,
            onRowSelectionChange: (row) => {
                setRowSelection(row);
                rowSelection?.onChange(row);
            },
            getRowId: (originalRow, index) => {
                return originalRow?.[rowKey] || index; // Use rowKey prop instead of 'id'
            },
            ...(expandable ? { getExpandedRowModel: getExpandedRowModel(), getSubRows: getSubRows } : {}),
        });

        useImperativeHandle(ref, () => {
            return {
                getRowSelection: () => table.getState().rowSelection,
            };
        }, []);

        return !data?.length ? (
            <div className={styles.noData}>
                <img alt="no-data" src={NoData} width={60} height={60} />
                <div className={styles.text}>Chưa có dữ liệu</div>
            </div>
        ) : (
            <div
                className={classNames(styles.wrapper, className, {
                    [styles.scrollX]: scrollX,
                })}
                style={{ ...(scrollY ? { maxHeight: scrollY, overflowY: 'auto' } : {}) }}
            >
                <table
                    style={{
                        ...(scrollX ? { width: 'max-content', minWidth: '100%' } : {}),
                        border: 'none',
                    }}
                >
                    <colgroup>
                        {columns?.map(({ width }, index) => (
                            <col key={index} style={{ width }} />
                        ))}
                    </colgroup>
                    {!isMobile && (
                        <thead className={styles.header}>
                            {table?.getHeaderGroups() &&
                                table?.getHeaderGroups()?.map((headerGroup) => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            if (header.column.columnDef.pin && !header.column.getIsPinned()) {
                                                header.column.pin('right');
                                            }
                                            return (
                                                <th
                                                    align={columns[header.index]?.align || 'left'}
                                                    className={styles.cell}
                                                    key={header.id}
                                                    style={{
                                                        ...getCommonPinningStyles(header.column, null, true),
                                                    }}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                              header.column.columnDef.header,
                                                              header.getContext(),
                                                          )}
                                                </th>
                                            );
                                        })}
                                        {withActionColumn && actions?.length && (
                                            <th align="center" className={styles.cell}>
                                                <FormattedMessage
                                                    defaultMessage="Thao tác"
                                                    description=""
                                                    id="components.Common.Table.Table.action"
                                                />
                                            </th>
                                        )}
                                    </tr>
                                ))}
                        </thead>
                    )}
                    <tbody className={styles.body}>
                        {noDataWithoutFilter ? (
                            <tr className={styles.row}>
                                <td className={styles.cell} colSpan="100%">
                                    <div className={styles.noData}>
                                        <img alt="no-data" src="/images/common/no-data.png" width={100} height={100} />
                                        <div className={styles.text}>Chưa có dữ liệu</div>
                                    </div>
                                </td>
                            </tr>
                        ) : table?.getRowModel()?.rows?.length > 0 ? (
                            table?.getRowModel()?.rows.map((row, index) => (
                                <React.Fragment key={`${row.id}_${row.depth}_${index}`}>
                                    <tr
                                        className={classNames(styles.row, {
                                            [styles.disabledRow]: row.original.disabled,
                                            [classNameRow]: row?.original?.enable,
                                        })}
                                        // key={`${row.id}_${row.depth}_${index}`}
                                    >
                                        {row.getVisibleCells().map((cell, index) => (
                                            <td
                                                style={{ ...getCommonPinningStyles(cell.column, true) }}
                                                onClick={() => {
                                                    !row.original.disabled &&
                                                        columns[index]?.type !== 'action' &&
                                                        onClickTableCell(row);
                                                }}
                                                align={columns[index]?.align || 'left'}
                                                width={columns[index]?.width || 'auto'}
                                                className={classNames({
                                                    [styles.cell]: true,
                                                    [styles.nonePadding]: columns[index]?.nonePadding,
                                                    [styles.disabledCell]: row.original.disabled,
                                                })}
                                                key={`${row.id}_${cell.id}`}
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                        {/* {withActionColumn && actions?.length && (
                                        <td align="center" className={styles.cell} width={100}>
                                            <TableAction data={row.original} actions={actions} />
                                        </td>
                                    )} */}
                                    </tr>
                                    {row.getIsExpanded() && expandable && (
                                        <tr>
                                            <td colSpan={columns.length + (withActionColumn ? 1 : 0)}>
                                                {renderSubComponent && renderSubComponent({ row })}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr className={styles.row}>
                                <td className={styles.cell} colSpan="100%">
                                    <div className={styles.noData}>
                                        <img alt="no-data" src={noData} width={100} height={100} />
                                        <div className={styles.text}>
                                            <FormattedMessage
                                                defaultMessage="Không tìm thấy dữ liệu phù hợp"
                                                description=""
                                                id="components.Common.Empty.Empty.message"
                                            />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {isLoading && (
                    <div className={styles.loading}>
                        <Loading show={isLoading} />
                    </div>
                )}
            </div>
        );
    },
);

Table.displayName = 'Table';

export default Table;
