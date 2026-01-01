"use client";

import React from "react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns"
import { shortenUrl } from "@/actions/shorten-url";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { QRCodeCanvas } from "qrcode.react";
import {
    IconCopy,
    IconCheck,
    IconLink,
    IconAlertCircle,
    IconLoader,
    IconSettings,
    IconCalendarFilled
} from "@tabler/icons-react";
import {
    WindowsIcon,
    macOSIcon,
    LinuxIcon,
    AndroidIcon,
    iOSIcon,
    ChromeOSIcon
} from "@/components/os-icons";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Field, FieldGroup, FieldLabel, FieldSet, FieldDescription } from "@/components/ui/field"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function UrlShortenerForm() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [shortUrl, setShortUrl] = useState("");
    const [expDate, setExpDate] = React.useState<Date>()
    const [clickLimit, setClickLimit] = React.useState<number>()
    const [tempExpDate, setTempExpDate] = React.useState<Date | undefined>(expDate)
    const [tempClickLimit, setTempClickLimit] = React.useState<number | undefined>(clickLimit)
    const [showOsUrls, setShowOsUrls] = useState({
        windows: false,
        macos: false,
        linux: false,
        android: false,
        ios: false,
        chromeos: false
    });

    const osNameMapping = {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        android: "Android",
        ios: "iOS",
        chromeos: "ChromeOS"
    };

    const osIconMap = {
        windows: WindowsIcon,
        macos: macOSIcon,
        linux: LinuxIcon,
        android: AndroidIcon,
        ios: iOSIcon,
        chromeos: ChromeOSIcon
    };

    const { isCopied, copy } = useCopyToClipboard();

    const { execute, isPending, result } = useAction(shortenUrl, {
        onSuccess: ({ data }) => {
            if (data?.code) {
                const fullShortUrl = `${window.location.origin}/${data.code}`;
                setShortUrl(fullShortUrl);
                setIsDialogOpen(true);
                resetForm();
            }
        }
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const osUrls: Record<string, string> = {};

        Object.keys(showOsUrls).forEach(os => {
            if(showOsUrls[os as keyof typeof showOsUrls]) {
                const url = formData.get(`url_${os}`) as string;
                if(url) osUrls[os] = url;
            }
        })

        execute({
            url: formData.get("url") as string,
            osUrls,
            customCode: formData.get("customCode") as string || undefined,
            expirationDate: expDate || undefined,
            clickLimit: clickLimit || undefined
        });
    };

    function handleOpenSettings() {
        setTempExpDate(expDate);
        setTempClickLimit(clickLimit);
        setIsSettingsOpen(true);
    }

    function resetForm() {
        setShowOsUrls({
            windows: false,
            macos: false,
            linux: false,
            android: false,
            ios: false,
            chromeos: false
        });
        setExpDate(undefined);
        setClickLimit(undefined);
        setTempExpDate(undefined);
        setTempClickLimit(undefined);

        const form = document.querySelector("form");
        if (form) form.reset();
    }

    return (
        <div className="max-w-xl mx-auto py-10 px-4 sm:px-0">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconLink size={24} /> URL Shortener
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <FieldGroup>
                            <FieldSet>
                                <div className="space-y-2">
                                    <Field>
                                        <FieldLabel htmlFor="url">Long URL</FieldLabel>
                                        <Input
                                            name="url"
                                            placeholder="Paste your long URL here..."
                                            required
                                            type="url"
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="customCode">Custom Alias</FieldLabel>
                                        <Input
                                            name="customCode"
                                            placeholder="Set your own alias (optional)"
                                            maxLength={30}
                                            pattern="^[a-zA-Z0-9_-]+$"
                                            title="Only letters, numbers, hyphens (-) and underscores (_) are allowed"
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                const t = e.currentTarget as HTMLInputElement;
                                                const sanitized = t.value.replace(/[^a-zA-Z0-9_-]/g, "");
                                                if (sanitized !== t.value) t.value = sanitized;
                                            }}
                                        />
                                    </Field>
                                </div>
                            </FieldSet>
                            <FieldSet>
                                <div className="space-x-1">
                                    {
                                        Object.entries(showOsUrls).map(([os, isVisible]) => {
                                            const osKey = os as keyof typeof osNameMapping;
                                            const OsIcon = osIconMap[osKey];

                                            return (
                                                <Badge key={os} variant={isVisible ? "default" : "outline"} render={<button onClick={(e) => {
                                                    e.preventDefault();
                                                    setShowOsUrls(prev => ({ ...prev, [osKey]: !isVisible }))
                                                }} className="flex items-center gap-1">
                                                    <OsIcon size={16} />
                                                    {osNameMapping[osKey]}
                                                </button>}>{osNameMapping[osKey]}</Badge>
                                            );
                                        })
                                    }
                                </div>

                                {
                                    Object.entries(showOsUrls).map(([os, isVisible]) => {
                                        if (!isVisible) return null;
                                        const osKey = os as keyof typeof osNameMapping;
                                        const OsIcon = osIconMap[osKey];

                                        return (
                                            <Field key={os}>
                                                <FieldLabel htmlFor={`url_${osKey}`}>
                                                    Enter the URL for {osNameMapping[osKey]}
                                                </FieldLabel>
                                                <InputGroup>
                                                    <InputGroupInput
                                                        name={`url_${osKey}`}
                                                        placeholder={`Enter the URL for ${osNameMapping[osKey]}...`}
                                                        type="url"
                                                        // className="pl-1!"
                                                        required
                                                    />
                                                    <InputGroupAddon>
                                                        <InputGroupText>
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <OsIcon size={16} />
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    Users clicking the shortened link on <OsIcon size={14} className="inline-block mb-1 mx-0.5" /> {osNameMapping[osKey]} devices will be redirected to the specified URL
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </InputGroupText>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            </Field>
                                        )
                                    })
                                }
                            </FieldSet>

                            {result.serverError && (
                                <Alert variant="destructive">
                                    <IconAlertCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{result.serverError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-none whitespace-nowrap"
                                    disabled={isPending}
                                    aria-label="Advanced Options"
                                    onClick={handleOpenSettings}
                                >
                                    <IconSettings />
                                    <span className="hidden sm:inline">Advanced Options</span>
                                </Button>
                                <Button type="submit" className="flex-1" disabled={isPending}>
                                    {isPending ? (
                                        <>
                                            <IconLoader className="animate-spin mr-2" /> Please wait...
                                        </>
                                    ) : (
                                        "Shorten URL"
                                    )}
                                </Button>
                            </div>

                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Advanced Options</DialogTitle>
                        <DialogDescription>Configure additional options for your shortened URL</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="expiration">Expiration date</FieldLabel>
                                <FieldDescription>Set a date when the shortened URL will be marked as inactive and will no longer work</FieldDescription>
                                <Popover>
                                    <PopoverTrigger>
                                        <Button
                                            variant="outline"
                                            data-empty={!tempExpDate}
                                            className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                                        >
                                            <IconCalendarFilled />
                                            {tempExpDate ? format(tempExpDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={tempExpDate}
                                            onSelect={(d: Date | undefined) => setTempExpDate(d)}
                                            captionLayout="dropdown"
                                            startMonth={new Date()}
                                            endMonth={new Date(new Date().getFullYear() + 10, new Date().getMonth())}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="clicksLimit">Clicks Limit</FieldLabel>
                                <FieldDescription>Set a maximum number of clicks after which the shortened URL will be marked as inactive</FieldDescription>
                                <Input
                                    name="clicksLimit"
                                    type="number"
                                    min={1}
                                    placeholder="Enter maximum number of clicks (optional)"
                                    value={tempClickLimit ?? ""}
                                    onChange={(e) => {
                                        const v = e.currentTarget.value;
                                        setTempClickLimit(v === "" ? undefined : Math.max(1, Number(v)));
                                    }}
                                />
                            </Field>
                        </FieldGroup>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => {
                            setTempExpDate(undefined);
                            setTempClickLimit(undefined);
                        }}>Clear settings</Button>
                        <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            setExpDate(tempExpDate);
                            setClickLimit(tempClickLimit);
                            setIsSettingsOpen(false);
                        }}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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