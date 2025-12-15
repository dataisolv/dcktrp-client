'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DOCUMENT_DIVISION_OPTIONS } from '@/lib/constants';

export interface ChatSettings {
    mode: 'local' | 'global' | 'hybrid' | 'naive' | 'mix' | 'bypass';
    local_k: number;
    global_k: number;
    include_references: boolean;
    division_filter: string[];
    access_filter: string[]; // Always set to ['external']
}

interface ChatSettingsProps {
    settings: ChatSettings;
    onSettingsChange: (settings: ChatSettings) => void;
}

export default function ChatSettingsPanel({ settings, onSettingsChange }: ChatSettingsProps) {
    const [open, setOpen] = useState(false);

    const updateSetting = <K extends keyof ChatSettings>(
        key: K,
        value: ChatSettings[K]
    ) => {
        onSettingsChange({ ...settings, [key]: value });
    };

    const toggleDivisionFilter = (division: string) => {
        const current = settings.division_filter;
        if (current.includes(division)) {
            updateSetting('division_filter', current.filter((d) => d !== division));
        } else {
            updateSetting('division_filter', [...current, division]);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                    <Settings className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4">
                    <SheetTitle>Chat Settings</SheetTitle>
                    <SheetDescription>
                        Configure RAG retrieval parameters and filters
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <div className="space-y-6">
                        {/* Query Mode */}
                        <div className="space-y-2">
                            <Label>Query Mode</Label>
                            <Select
                                value={settings.mode}
                                onValueChange={(value) => updateSetting('mode', value as ChatSettings['mode'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mix">Mix</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                    <SelectItem value="global">Global</SelectItem>
                                    <SelectItem value="hybrid">Hybrid</SelectItem>
                                    <SelectItem value="naive">Naive</SelectItem>
                                    <SelectItem value="bypass">Bypass</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Mix mode combines local and global search for best results
                            </p>
                        </div>

                        {/* Local K */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Local Search Results (k)</Label>
                                <span className="text-sm text-gray-500">{settings.local_k}</span>
                            </div>
                            <Slider
                                value={[settings.local_k]}
                                onValueChange={([value]) => updateSetting('local_k', value)}
                                min={1}
                                max={20}
                                step={1}
                            />
                            <p className="text-xs text-gray-500">
                                Number of local document chunks to retrieve
                            </p>
                        </div>

                        {/* Global K */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Global Search Results (k)</Label>
                                <span className="text-sm text-gray-500">{settings.global_k}</span>
                            </div>
                            <Slider
                                value={[settings.global_k]}
                                onValueChange={([value]) => updateSetting('global_k', value)}
                                min={1}
                                max={30}
                                step={1}
                            />
                            <p className="text-xs text-gray-500">
                                Number of global document results to retrieve
                            </p>
                        </div>

                        {/* Include References */}
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="include-references"
                                checked={settings.include_references}
                                onChange={(e) => updateSetting('include_references', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="include-references" className="font-normal">
                                Include document references in response
                            </Label>
                        </div>

                        {/* Division Filter */}
                        <div className="space-y-2">
                            <Label>Division Filter</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {DOCUMENT_DIVISION_OPTIONS.filter(d => d.value !== 'ALL').map((division) => (
                                    <div key={division.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`div-${division.value}`}
                                            checked={settings.division_filter.includes(division.value)}
                                            onChange={() => toggleDivisionFilter(division.value)}
                                            className="rounded border-gray-300"
                                        />
                                        <Label
                                            htmlFor={`div-${division.value}`}
                                            className="font-normal text-sm cursor-pointer"
                                        >
                                            {division.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500">
                                {settings.division_filter.length === 0
                                    ? 'All divisions (no filter)'
                                    : `${settings.division_filter.length} selected`}
                            </p>
                        </div>

                        {/* Reset Button */}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                onSettingsChange({
                                    mode: 'mix',
                                    local_k: 5,
                                    global_k: 10,
                                    include_references: true,
                                    division_filter: [],
                                    access_filter: ['external'],
                                });
                            }}
                        >
                            Reset to Defaults
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
