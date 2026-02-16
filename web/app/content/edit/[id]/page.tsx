'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ContentForm from '@/app/components/content/ContentForm';
import { useUpdateContentMutation } from '@/lib/features/admin/adminApi';
import { useGetContentQuery } from '@/lib/features/content/contentApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import { toast, Toaster } from 'react-hot-toast';

export default function EditContentPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: contentList } = useGetContentQuery({});
    const [updateContent, { isLoading: isUpdating }] = useUpdateContentMutation();
    const { data: clubs } = useGetClubsQuery(undefined);

    const content = contentList?.find((c: any) => c.id === id);
    const categories = ['News', 'Transfer', 'Match'];

    const handleSubmit = async (data: any) => {
        try {
            await updateContent({ id, ...data }).unwrap();
            toast.success('Article updated successfully!');
            setTimeout(() => router.push('/content'), 1500);
        } catch (error) {
            toast.error('Failed to update article.');
        }
    };

    if (!content && contentList) {
        return <div className="p-20 text-center font-black text-[#132A5B]">Article not found</div>;
    }

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <ContentForm
                title="Edit Article"
                content={content}
                clubs={clubs || []}
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={isUpdating}
            />
        </div>
    );
}
