import { useState } from 'react';

export function useCopyToClipboard(timeout = 2000) {
    const [isCopied, setIsCopied] = useState(false);

    const copy = async (text: string) => {
        if(!text) return;
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), timeout);
        })
    }

    return { isCopied, copy };
}