import React from 'react';
import { useParams } from 'react-router-dom';
import apiConfig from '@constants/apiConfig';
import useFetch from '@hooks/useFetch';
import AppFooter from '@modules/layout/common/AppFooter';
import AppHeader from '@modules/layout/common/desktop/AppHeader';
import BlogDetailDesktop from '@modules/layout/desktop/blog/detail';

function BlogDetailContainer() {
    const { id } = useParams();

    const { data: blog, loading } = useFetch(apiConfig.blog.studentGet, {
        params: { id },
        mappingData: (res) => res.data || null,
    });

    return (
        <>
            <AppHeader />
            <BlogDetailDesktop blog={blog} loading={loading} />
            <AppFooter />
        </>
    );
}

export default BlogDetailContainer;
