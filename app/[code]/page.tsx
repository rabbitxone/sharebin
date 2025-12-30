import { redirect, notFound } from 'next/navigation';
import { connectToDb } from '@/lib/db';
import { Link } from '@/models/Link';

export default async function RedirectPage({ params }: { params: Promise<{code: string}> }) {
    const { code } = await params;
    await connectToDb();

    const link = await Link.findOneAndUpdate(
        { code },
        { $inc: { clicks: 1 } }
    );

    if(!link) notFound();
    redirect(link.url);
}