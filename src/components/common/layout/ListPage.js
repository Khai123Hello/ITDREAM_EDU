import React from 'react';
import Card from '@components/common/elements/Card';
import LoadingComponent from '@components/common/loading/LoadingComponent';

function ListPage({ searchForm, actionBar, baseTable, loading = false, children, title, style }) {
    return (
        <Card style={style}>
            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                    <LoadingComponent />
                </div>
            )}
            {!loading && (
                <div>
                    {title && <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>{title}</div>}
                    <div>
                        {searchForm}
                        <div style={{ margin: '16px 0' }}>{actionBar}</div>
                        <div style={{ margin: '16px 0' }}>{baseTable}</div>
                    </div>
                    {children}
                </div>
            )}
        </Card>
    );
}

export default ListPage;
