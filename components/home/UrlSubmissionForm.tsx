'use client';

import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormValues {
    url: string;
}

interface UrlSubmissionFormProps {
    onSubmit: (url: string) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

export default function UrlSubmissionForm({ onSubmit, isLoading, setIsLoading }: UrlSubmissionFormProps) {
    const form = useForm<FormValues>({
        defaultValues: { url: "" },
        mode: 'onChange',
    });

    const handleFormSubmit = async (data: any) => {
        setIsLoading(true)
        onSubmit(data.url);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((handleFormSubmit))} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
                <FormField
                    control={form.control}
                    name="url"
                    rules={{
                        required: 'url is required.',
                        pattern: {
                            value: new RegExp('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$'),
                            message: 'Please enter a valid website URL.'
                        }
                    }}
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormControl>
                                <Input
                                    disabled={isLoading}
                                    type="url"
                                    placeholder="https://www.yourwebsite.com"
                                    className="h-10 text-center rounded-full sm:text-left"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" size="lg" className="w-full rounded-full font-semibold sm:w-auto" disabled={isLoading}>
                    {isLoading && <Loader2 className="animate-spin" />}
                    Start  Audit
                </Button>
            </form>
        </Form>
    );
}