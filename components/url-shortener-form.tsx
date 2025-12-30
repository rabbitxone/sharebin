"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { shortenUrl } from "@/actions/shorten-url";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import {
    IconCopy,
    IconCheck,
    IconLink,
    IconAlertCircle,
    IconLoader
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export default function UrlShortenerForm() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [shortUrl, setShortUrl] = useState("");
    const { isCopied, copy } = useCopyToClipboard();

    const { execute, isPending, result } = useAction(shortenUrl, {
        onSuccess: ({ data }) => {
            if(data?.code) {
                const fullShortUrl = `${window.location.origin}/${data.code}`;
                setShortUrl(fullShortUrl);
                setIsDialogOpen(true);
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        execute({
            url: formData.get("url") as string,
            customCode: formData.get("customCode") as string || undefined
        });
    };

    return (
        <div className="max-w-xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconLink size={24} /> URL Shortener
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                name="url"
                                placeholder="Paste your long URL here..."
                                required
                                type="url"
                            />
                            <Input
                                name="customCode"
                                placeholder="Set your own alias (optional)"
                            />
                        </div>

                        {result.serverError && (
                            <Alert variant="destructive">
                                <IconAlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{result.serverError}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? ( <><IconLoader className="animate-spin" /> Please wait...</> ) : "Shorten URL"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Here's your shortened URL :)</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full max-w-100">
                            <AspectRatio ratio={1 / 1} className="bg-white p-2 border flex items-center justify-center">
                                <QRCodeCanvas value={shortUrl} size={240} />
                            </AspectRatio>
                        </div>

                        <div className="flex w-full items-center space-x-2">
                            <Input value={shortUrl} readOnly disabled className="bg-muted" />
                            <Button size="icon" onClick={() => copy(shortUrl)}>
                                {isCopied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                            </Button>
                        </div>

                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}