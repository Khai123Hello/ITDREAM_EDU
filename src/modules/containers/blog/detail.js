import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useAuth from '@hooks/useAuth';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import BlogDetailDesktop from '@modules/layout/desktop/blog/detail';

function BlogDetailContainer() {
    const { id } = useParams();
    const { isAuthenticated } = useAuth();

    const { data: blogRes, loading: detailLoading } = useFetch(apiConfig.blog.studentGet, {
        immediate: isAuthenticated,
        pathParams: { id },
        mappingData: (res) => res || null,
    });

    const blogListParams = useMemo(() => ({ page: 0, size: 100, paged: true }), []);

    const { data: blogsRes, loading: listLoading } = useFetch(apiConfig.blog.studentList, {
        immediate: true,
        params: blogListParams,
        mappingData: (res) => res || {},
    });

    const loading = isAuthenticated ? detailLoading : listLoading;
    const allBlogs = blogsRes?.data?.content || [];

    const blog = useMemo(() => {
        if (isAuthenticated) {
            return blogRes?.data || null;
        }
        return allBlogs.find((b) => String(b.id) === String(id)) || null;
    }, [isAuthenticated, blogRes, allBlogs, id]);

    const urlBase = blogRes?.urlBase || blogsRes?.urlBase || '';

    const relatedBlogs = useMemo(() => {
        if (!blog || !allBlogs.length) return [];
        return allBlogs
            .filter(
                (b) => b.id !== blog.id && b.category?.id && blog.category?.id && b.category.id === blog.category.id,
            )
            .slice(0, 4);
    }, [blog, allBlogs]);

    return (
        <>
            <AppHeader />
            <BlogDetailDesktop blog={blog} urlBase={urlBase} loading={loading} relatedBlogs={relatedBlogs} />
            <AppFooter />
        </>
    );
}

export default BlogDetailContainer;
