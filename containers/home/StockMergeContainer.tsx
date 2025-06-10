'use client';

import React from 'react';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from '@/components/ui/file-upload';
import { Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ContCard from '@/components/common/ContCard';
import Description from '@/components/common/Description';
import { useForm } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const formSchema = z.object({
  sheetName: z.string().min(1, 'Sheet name is required'),
  standColums: z.array(z.string()).min(1, 'Please select at least one column'),
  files: z
    .array(z.custom<File>())
    .min(1, 'Please select at least one file')
    .max(2, 'Please select up to 2 files')
    .refine((files) => files.every((file) => file.size <= 20 * 1024 * 1024), {
      message: 'File size must be less than 5MB',
      path: ['files'],
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function StockMergeContainer() {
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheetName: 'Sheet1',
      standColums: ['D', 'E', 'F', 'G', 'H', 'I'],
      files: [],
    },
  });

  const onFileValidate = useCallback(
    (file: File): string | null => {
      // Validate max files
      if (form.watch('files').length >= 2) {
        return 'You can only upload up to 2 files';
      }

      // Validate file type (only .xlsx files)
      if (
        file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        !file.name.toLowerCase().endsWith('.xlsx')
      ) {
        return 'Only .xlsx files are allowed';
      }

      // Validate file size (max 20MB)
      const MAX_SIZE = 20 * 1024 * 1024; // 20MB
      if (file.size > MAX_SIZE) {
        return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
      }

      //   same file name check
      if (form.watch('files').some((f) => f.name === file.name)) {
        return `File with name "${file.name}" already exists`;
      }

      return null;
    },
    [form.watch('files')],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onSubmit = useCallback((data: FormValues) => {
    console.log('Form submitted with data:', data);
    toast.success('Form submitted successfully!');
  }, []);

  return (
    <>
      <h2>지점 재고 취합</h2>
      <ContCard className='mt-2'>
        <h4>파일 업로드</h4>
        <Description description='지점에서 취합한 재고 파일을 업로드하세요.' className='mt-1' />
        <div className='mt-2'>
          <Form {...form}>
            <form>
              <FormField
                control={form.control}
                name='files'
                render={({ field }) => (
                  <FileUpload
                    value={field.value}
                    onValueChange={field.onChange}
                    onFileValidate={onFileValidate}
                    onFileReject={onFileReject}
                    accept='.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    maxFiles={2}
                    className='w-full'
                    multiple
                  >
                    <FileUploadDropzone>
                      <div className='flex flex-col items-center gap-1'>
                        <div className='flex items-center justify-center rounded-full border p-2.5'>
                          <Upload className='size-6 text-muted-foreground' />
                        </div>
                        <p className='font-medium text-sm'>Drag & drop files here</p>
                        <p className='text-muted-foreground text-xs'>Or click to browse (max 2 files)</p>
                      </div>
                      <FileUploadTrigger asChild>
                        <Button variant='outline' size='sm' className='mt-2 w-fit'>
                          Browse files
                        </Button>
                      </FileUploadTrigger>
                    </FileUploadDropzone>
                    <FileUploadList>
                      {field.value.map((file, index) => (
                        <FileUploadItem key={index} value={file}>
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <FileUploadItemDelete asChild>
                            <Button variant='ghost' size='icon' className='size-7'>
                              <X />
                            </Button>
                          </FileUploadItemDelete>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  </FileUpload>
                )}
              />
            </form>
          </Form>
        </div>
      </ContCard>
      <ContCard className='mt-2'>
        <h4>지점 재고 취합 옵션</h4>
        <Description description='지점 재고 파일 취합을 위한 옵션을 설정할 수 있습니다.' className='mt-1' />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            <FormField
              control={form.control}
              name='sheetName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='shadcn' {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Form>
      </ContCard>
    </>
  );
}
