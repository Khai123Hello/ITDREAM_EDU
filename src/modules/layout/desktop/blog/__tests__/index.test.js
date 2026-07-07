import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import BlogListDesktop from '../index';

// Mock window.scrollTo since react-scripts test running in jsdom doesn't have it
beforeAll(() => {
    window.scrollTo = jest.fn();
});

const mockCategories = [
    { id: 1, name: 'Công nghệ' },
    { id: 2, name: 'Hướng nghiệp' },
];

const mockBlogs = [
    {
        id: 1,
        name: 'Học ReactJS hiệu quả',
        subject: 'ReactJS cho người mới bắt đầu',
        content: 'Nội dung hướng dẫn ReactJS...',
        category: { id: 1, name: 'Công nghệ' },
        createdDate: '2026-07-01T00:00:00Z',
    },
    {
        id: 2,
        name: 'Chọn ngành học IT',
        subject: null, // Test null fields
        content: undefined, // Test undefined fields
        category: { id: 2, name: 'Hướng nghiệp' },
        createdDate: '2026-07-02T00:00:00Z',
    },
];

describe('BlogListDesktop Search Functionality', () => {
    test('renders blogs list and filters by search query safely', () => {
        const onCategoryChange = jest.fn();
        const onSortChange = jest.fn();

        render(
            <BlogListDesktop
                categories={mockCategories}
                blogs={mockBlogs}
                urlBase=""
                loading={false}
                selectedCategory={null}
                onCategoryChange={onCategoryChange}
                sort="createdDate,desc"
                onSortChange={onSortChange}
            />,
        );

        // Check if both blogs are rendered initially
        expect(screen.getByText('Học ReactJS hiệu quả')).toBeInTheDocument();
        expect(screen.getByText('Chọn ngành học IT')).toBeInTheDocument();

        // Perform search
        const searchInput = screen.getByPlaceholderText('Tìm kiếm bài viết...');
        fireEvent.change(searchInput, { target: { value: 'React' } });

        // 'Học ReactJS hiệu quả' should remain, but 'Chọn ngành học IT' should be filtered out
        expect(screen.getByText('Học ReactJS hiệu quả')).toBeInTheDocument();
        expect(screen.queryByText('Chọn ngành học IT')).not.toBeInTheDocument();
    });

    test('does not crash when searching and blog contains null or undefined properties', () => {
        const onCategoryChange = jest.fn();
        const onSortChange = jest.fn();

        render(
            <BlogListDesktop
                categories={mockCategories}
                blogs={mockBlogs}
                urlBase=""
                loading={false}
                selectedCategory={null}
                onCategoryChange={onCategoryChange}
                sort="createdDate,desc"
                onSortChange={onSortChange}
            />,
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm bài viết...');
        // Search for a query that won't match, causing it to check all properties
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.queryByText('Học ReactJS hiệu quả')).not.toBeInTheDocument();
        expect(screen.queryByText('Chọn ngành học IT')).not.toBeInTheDocument();
        expect(screen.getByText('Không tìm thấy bài viết nào')).toBeInTheDocument();
    });
});
