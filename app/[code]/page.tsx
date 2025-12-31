import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
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

    const ua = (await headers()).get('user-agent') || '';
    
    let target = link.url;
    for (const [os, osUrl] of Object.entries(link.osUrls || {})) {
        switch(os) {
            case 'windows':
                if (ua.includes('Windows')) target = osUrl as string;
                break;
            case 'linux':
                if (ua.includes('Linux') || ua.includes('X11')) target = osUrl as string;
                break;
            case 'macos':
                if (ua.includes('Macintosh') || ua.includes('Mac OS X')) target = osUrl as string;
                break;
            case 'android':
                if (ua.includes('Android')) target = osUrl as string;
                break;
            case 'ios':
                if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) target = osUrl as string;
                break;
            case 'chromeos':
                if (ua.includes('CrOS')) target = osUrl as string;
                break;
        }
    }

    redirect(target);
}