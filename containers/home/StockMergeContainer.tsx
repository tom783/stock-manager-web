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
import api from '@/lib/axios';

const formSchema = z.object({
  sheetName: z.string().min(1, 'Sheet name is required'),
  standardColumns: z.array(z.string()).min(1, 'Please select at least one column'),
  standardColumn: z.string(),
  stockColumns: z.array(z.string()).min(1, 'Please select at least one stock column'),
  stockColumn: z.string(),
  files: z
    .array(z.custom<File>())
    .min(1, 'Please select at least one file')
    .max(5, 'Please select up to 5 files')
    .refine((files) => files.every((file) => file.size <= 20 * 1024 * 1024), {
      message: 'File size must be less than 5MB',
      path: ['files'],
    }),
});

type FormValues = z.infer<typeof formSchema>;

export default function StockMergeContainer() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sheetName: 'Sheet1',
      standardColumns: ['D', 'E', 'F', 'G', 'H', 'I'],
      standardColumn: '',
      stockColumns: ['J', 'K'],
      stockColumn: '',
      files: [],
    },
  });

  const onFileValidate = useCallback(
    (file: File): string | null => {
      // Validate max files
      if (form.watch('files').length >= 5) {
        return 'You can only upload up to 5 files';
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

  /**
   * 데이터 취합 및 다운로드 핸들러
   */
  const onSubmit = useCallback(async (data: FormValues) => {
    console.log('Form submitted with data:', data);
    toast.success('Form submitted successfully!');
    const loadingToast = toast.loading('Merging data, please wait...');
    const formData = new FormData();
    // 파일들 추가
    Array.from(data.files).forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    formData.append('sheetName', data.sheetName);
    formData.append('standardColumns', JSON.stringify(data.standardColumns));
    formData.append('stockColumns', JSON.stringify(data.stockColumns));

    const response = await api.post('/stock-merge', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob', // Blob으로 응답 받기
    });

    if (response.status === 200) {
      toast.success('Data merged successfully!');
      // Blob으로 파일 데이터 받기
      const blob = await response.data;

      // Content-Disposition 헤더에서 파일명 추출
      const disposition = response.headers['content-disposition'];
      let filename = '취합파일.xlsx';

      if (disposition) {
        const filenameMatch = disposition.match(/filename\*=UTF-8''(.+)/);
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleMatch = disposition.match(/filename="(.+)"/);
          if (simpleMatch) filename = simpleMatch[1];
        }
      }

      // 다운로드 링크 생성 및 클릭
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // 정리
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // 성공 메시지
      toast.success('Excel 파일이 다운로드되었습니다!');
      toast.dismiss(loadingToast);
    } else {
      toast.error('Failed to merge data. Please try again.');
    }
  }, []);

  const onAddColumn = useCallback(() => {
    const currentCols = form.getValues('standardColumns');
    const newCol = form.getValues('standardColumn').trim();
    if (newCol && !currentCols.includes(newCol)) {
      form.setValue('standardColumns', [...currentCols, newCol]);
      form.setValue('standardColumn', ''); // Clear the input after adding
    } else {
      toast.error('Please enter a valid column name that is not already added.');
    }
  }, [form]);

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
                    maxFiles={5}
                    className='w-full'
                    multiple
                  >
                    <FileUploadDropzone>
                      <div className='flex flex-col items-center gap-1'>
                        <div className='flex items-center justify-center rounded-full border p-2.5'>
                          <Upload className='size-6 text-muted-foreground' />
                        </div>
                        <p className='font-medium text-sm'>Drag & drop files here</p>
                        <p className='text-muted-foreground text-xs'>Or click to browse (max 5 files)</p>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 mt-4'>
            <FormField
              control={form.control}
              name='sheetName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대상 시트명</FormLabel>
                  <FormControl>
                    <Input placeholder='target sheet name' {...field} />
                  </FormControl>
                  <FormDescription>취합할 데이터 시트의 이름을 지정할 수 있습니다.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='standardColumn'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>기준 컬럼명 (선택)</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        placeholder='standard column'
                        {...field}
                        value={field.value?.toUpperCase() || ''}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                      <Button variant='outline' size='sm' type='button' onClick={onAddColumn}>
                        + 컬럼 추가
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>데이터 취합 기준이 되는 컬럼을 설정할 수 있습니다.</FormDescription>
                  <FormMessage />
                  {form.watch('standardColumns').length > 0 && (
                    <ul className='mt-2 space-y-1'>
                      {form.watch('standardColumns').map((col, index) => (
                        <li
                          key={index}
                          className='flex items-center justify-between gap-2 border border-border rounded-sm p-3'
                        >
                          <span>{col}</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              const currentCols = form.getValues('standardColumns');
                              form.setValue(
                                'standardColumns',
                                currentCols.filter((c) => c !== col),
                              );
                            }}
                          >
                            <X className='size-4' />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='stockColumn'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>재고 컬럼명 (선택)</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-2'>
                      <Input
                        placeholder='stock column'
                        {...field}
                        value={field.value?.toUpperCase() || ''}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                      <Button variant='outline' size='sm' type='button' onClick={onAddColumn}>
                        + 컬럼 추가
                      </Button>
                    </div>
                  </FormControl>
                  <FormDescription>재고 컬럼을 설정할 수 있습니다.</FormDescription>
                  <FormMessage />
                  {form.watch('stockColumns').length > 0 && (
                    <ul className='mt-2 space-y-1'>
                      {form.watch('stockColumns').map((col, index) => (
                        <li
                          key={index}
                          className='flex items-center justify-between gap-2 border border-border rounded-sm p-3'
                        >
                          <span>{col}</span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => {
                              const currentCols = form.getValues('stockColumns');
                              form.setValue(
                                'stockColumns',
                                currentCols.filter((c) => c !== col),
                              );
                            }}
                          >
                            <X className='size-4' />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </FormItem>
              )}
            />
            <Button type='submit'>데이터 취합 및 다운로드</Button>
          </form>
        </Form>
      </ContCard>
    </>
  );
}
