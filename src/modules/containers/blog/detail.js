import React from 'react';
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

    return (
        <>
            <AppHeader />
            <BlogDetailDesktop blog={blogRes?.data || null} urlBase={blogRes?.urlBase || ''} loading={loading} />
            <AppFooter />
        </>
    );
}

export default BlogDetailContainer;
