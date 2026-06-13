import React, { useMemo, useState } from 'react';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import BlogListDesktop from '@modules/layout/desktop/blog';

function BlogListContainer() {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const catParams = useMemo(() => ({ kind: 2, page: 0, size: 100, paged: true }), []);
    const blogParams = useMemo(() => ({ page: 0, size: 100, paged: true }), []);

    const { data: categoriesData, loading: catLoading } = useFetch(apiConfig.category.autoComplete, {
        immediate: true,
        params: catParams,
        mappingData: (res) => res.data?.content || [],
    });

    const { data: blogsRes, loading: blogLoading } = useFetch(apiConfig.blog.studentList, {
        immediate: true,
        params: blogParams,
        mappingData: (res) => res || {},
    });

    return (
        <>
            <AppHeader />
            <BlogListDesktop
                categories={categoriesData || []}
                blogs={blogsRes?.data?.content || []}
                urlBase={blogsRes?.urlBase || ''}
                loading={catLoading || blogLoading}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
            />
            <AppFooter />
        </>
    );
}

export default BlogListContainer;
