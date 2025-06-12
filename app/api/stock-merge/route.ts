import { createFileInfo, mergeDataByIdWithReduce, readExcelFiles } from '@/lib/utils';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: Request) {
  console.log('Received request:', request);

  const valueKeyCell = [
    {
      name: '재고',
      cell: 'J',
    },
    {
      name: '가용재고',
      cell: 'K',
    },
  ];

  try {
    const formData = await request.formData();
    console.log('Parsed body:', formData);
    const fileEntries = Array.from(formData.entries()).filter(([key]) => key.startsWith('file_'));

    const files = await createFileInfo(fileEntries);
    const standardColum = JSON.parse(formData.get('standardColums') as string);
    const sheetName = formData.get('sheetName') as string;

    // 필수 필드 검증
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('Processing Excel files...');
    const xlsxData = await readExcelFiles(files, sheetName || 'Sheet1');

    if (!xlsxData || xlsxData.length === 0) {
      return NextResponse.json({ error: 'No data found in Excel files' }, { status: 400 });
    }
    const mergeXlsxData = mergeDataByIdWithReduce(
      xlsxData,
      standardColum || [],
      valueKeyCell.map((item) => item.cell),
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(mergeXlsxData);

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // Excel 파일을 Buffer로 생성
    const xlsxBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true,
    });

    // 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const fileName = `취합파일_${timestamp}.xlsx`;

    console.log(`Excel file generated: ${fileName}, size: ${xlsxBuffer.length} bytes`);

    return new NextResponse(xlsxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Length': xlsxBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error processing Excel request:', error);

    // 에러 타입에 따른 구체적인 응답
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: `Processing failed: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ error: 'Unknown error occurred while processing Excel files' }, { status: 500 });
  }
}
