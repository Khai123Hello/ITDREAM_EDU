import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import BlogDetailDesktop from '@modules/layout/desktop/blog/detail';

function BlogDetailContainer() {
    const { id } = useParams();

    const { data: blogRes, loading } = useFetch(apiConfig.blog.studentGet, {
        immediate: true,
        pathParams: { id },
        mappingData: (res) => res || null,
    });

    const blogListParams = useMemo(() => ({ page: 0, size: 100, paged: true }), []);

    const { data: blogsRes } = useFetch(apiConfig.blog.studentList, {
        immediate: true,
        params: blogListParams,
        mappingData: (res) => res || {},
    });

    // Get related blogs: same category, exclude current blog
    const blog = blogRes?.data || null;
    const urlBase = blogRes?.urlBase || blogsRes?.urlBase || '';
    const allBlogs = blogsRes?.data?.content || [];

    const relatedBlogs = useMemo(() => {
        if (!blog || !allBlogs.length) return [];
        return allBlogs
            .filter(
                (b) =>
                    b.id !== blog.id &&
                    b.category?.id &&
                    blog.category?.id &&
                    b.category.id === blog.category.id,
            )
            .slice(0, 4);
    }, [ blog, allBlogs ]);

    return (
        <>
            <AppHeader />
            <BlogDetailDesktop
                blog={blog}
                urlBase={urlBase}
                loading={loading}
                relatedBlogs={relatedBlogs}
            />
            <AppFooter />
        </>
    );
}

export default BlogDetailContainer;
