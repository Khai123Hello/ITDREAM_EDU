import React, { useMemo, useState } from 'react';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import BlogListDesktop from '@modules/layout/desktop/blog';

function BlogListContainer() {
    const [ selectedCategory, setSelectedCategory ] = useState(null);

    const catParams = useMemo(() => ({ kind: 2, pageNumber: 0, pageSize: 100, paged: true }), []);
    const blogParams = useMemo(() => ({ pageNumber: 0, pageSize: 100, paged: true }), []);

    const { data: categoriesData, loading: catLoading } = useFetch(apiConfig.category.autoComplete, {
        params: catParams,
        mappingData: (res) => res.data?.content || [],
    });

    const { data: blogsData, loading: blogLoading } = useFetch(apiConfig.blog.studentList, {
        params: blogParams,
        mappingData: (res) => res.data?.content || [],
    });

    return (
        <>
            <AppHeader />
            <BlogListDesktop
                categories={categoriesData || []}
                blogs={blogsData || []}
                loading={catLoading || blogLoading}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
            <AppFooter />
        </>
    );
}

export default BlogListContainer;
