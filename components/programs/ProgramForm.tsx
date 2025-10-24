'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { Program, CreateProgramData, UpdateProgramData } from '@/lib/api/programs';
import { Upload, FileText, X } from 'lucide-react';
import { useState } from 'react';

const MAX_FILE_SIZE = 200 * 1024; // 200KB

const programSchema = z.object({
  name: z.string().min(2, 'Program name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  short_description: z.string().optional(),
  language: z.enum(['en', 'pl', 'nl', 'fr', 'de', 'es']),
  program_type: z.enum(['therapy', 'support_group', 'workshop', 'consultation', 'other']),
  brochure: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, 'File size must be less than 200KB')
    .refine(
      (file) => file.type === 'application/pdf',
      'File must be a PDF'
    )
    .optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

interface ProgramFormProps {
  program?: Program;
  onSubmit: (data: CreateProgramData | UpdateProgramData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ProgramForm({
  program,
  onSubmit,
  isLoading = false,
  submitLabel,
}: ProgramFormProps) {
  const t = useTranslations();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program?.name || '',
      description: program?.description || '',
      short_description: program?.short_description || '',
      language: program?.language || 'en',
      program_type: program?.program_type || 'therapy',
    },
  });

  const handleSubmit = async (data: ProgramFormValues) => {
    const submitData = {
      ...data,
      short_description: data.short_description || undefined,
      brochure: selectedFile || undefined,
    };
    await onSubmit(submitData);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError('brochure', {
          message: 'File size must be less than 200KB',
        });
        return;
      }
      if (file.type !== 'application/pdf') {
        form.setError('brochure', {
          message: 'File must be a PDF',
        });
        return;
      }
      setSelectedFile(file);
      form.clearErrors('brochure');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    form.clearErrors('brochure');
    // Reset the file input
    const fileInput = document.getElementById('brochure-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const programTypes = [
    { value: 'therapy', label: 'Therapy' },
    { value: 'support_group', label: 'Support Group' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'other', label: 'Other' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'pl', label: 'Polski' },
    { value: 'nl', label: 'Nederlands' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('programs.name')}</FormLabel>
                <FormControl>
                  <Input placeholder="Mental Health Support Program" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="program_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('programs.type')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="short_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('programs.shortDescription')}</FormLabel>
              <FormControl>
                <Input
                  placeholder="Brief one-line description..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('programs.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detailed description of the program, its goals, methodology, and target audience..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('programs.language')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>{t('programs.brochure')} (Optional)</FormLabel>
          
          {program?.brochure_url && !selectedFile && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-800">Current brochure uploaded</span>
              <a
                href={program.brochure_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View PDF
              </a>
            </div>
          )}

          {selectedFile ? (
            <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">{selectedFile.name}</span>
              <span className="text-xs text-blue-600">
                ({Math.round(selectedFile.size / 1024)}KB)
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="ml-auto h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2">
                  <label
                    htmlFor="brochure-input"
                    className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    {t('programs.uploadBrochure')}
                  </label>
                  <input
                    id="brochure-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-gray-500">PDF up to 200KB</p>
              </div>
            </div>
          )}
          
          {form.formState.errors.brochure && (
            <p className="text-sm text-red-600">
              {form.formState.errors.brochure.message}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? t('common.loading')
              : submitLabel || t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
