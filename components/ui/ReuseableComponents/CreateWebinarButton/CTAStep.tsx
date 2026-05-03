import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Upload, X } from 'lucide-react';
import { useWebinarStore } from '@/store/useWebinarStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { add } from 'date-fns';
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { CtaTypeEnum } from '@prisma/client';


type Props = {}

const CTAStep = (props: Props) => {
    const {
        formData,
        updateCTAField,
        addTag,
        removeTag,
        getStepValidationErrors,
    } = useWebinarStore();

    const { ctaLabel, tags, aiAgent, priceId, ctaType } = formData.cta;
    const errors = getStepValidationErrors('cta');
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateCTAField(name as keyof typeof formData.cta, value);
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
            setTagInput('');
        }
    }

    const handleSelectCTAType = (value: string) => {
        updateCTAField('ctaType', value as CtaTypeEnum);
    }

    return <div className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="ctaLabel" className={errors.ctaLabel ? 'text-red-400' : ''}>
                CTA Label <span className="text-red-400">*</span>
            </Label>
            <Input
                id="ctaLabel"
                name="ctaLabel"
                value={ctaLabel || ''}
                onChange={handleChange}
                placeholder="Let's Get Started"
                className={cn(
                    'pl-9 bg-background/50 border border-input',
                    errors.ctaLabel && 'border-red-400 focus-visible:ring-red-400'
                )}
            />
            {errors.ctaLabel && (
                <p className="text-sm text-red-400">{errors.ctaLabel}</p>
            )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags and press Enter"
                className="!bg-background/50 border border-input"
            />
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag: string, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-md"
                        >
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                className="text-gray-400 hover:text-white"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
        <div className="space-y-2 w-full">
            <Label>CTA Type</Label>
            <Tabs
                defaultValue={CtaTypeEnum.BOOK_A_CALL}
                className="w-full"
            >
                <TabsList className="w-full bg-transparent">
                    <TabsTrigger
                        value={CtaTypeEnum.BOOK_A_CALL}
                        className="w-1/2 data-[state=active]:!bg-background/50"
                        onClick={() => handleSelectCTAType(CtaTypeEnum.BOOK_A_CALL)}
                    >
                        Book a Call
                    </TabsTrigger>
                    <TabsTrigger
                        value={CtaTypeEnum.BUY_NOW}
                        className="w-1/2"
                        onClick={() => handleSelectCTAType(CtaTypeEnum.BUY_NOW)}
                    >
                        Buy Now
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    </div>
}

export default CTAStep