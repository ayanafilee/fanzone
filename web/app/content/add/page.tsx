'use client';

import React from 'react';
import ContentForm from '@/app/components/content/ContentForm';
import { useCreateContentMutation } from '@/lib/features/admin/adminApi';
import { useGetClubsQuery } from '@/lib/features/clubs/clubsApi';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

export default function AddContentPage() {
    const router = useRouter();
    const [createContent, { isLoading }] = useCreateContentMutation();
    const { data: clubs } = useGetClubsQuery(undefined);
    const categories = ['News', 'Transfer', 'Match'];

    const handleSubmit = async (data: any) => {
        try {
            await createContent(data).unwrap();
            toast.success('Article published successfully!');
            setTimeout(() => router.push('/content'), 1500);
        } catch (error) {
            toast.error('Failed to publish article. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />
            <ContentForm
                title="Create New Article"
                clubs={clubs || []}
                categories={categories}
                onSubmit={handleSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}
