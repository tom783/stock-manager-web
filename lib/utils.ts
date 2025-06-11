import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as XLSX from 'xlsx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 주어진 데이터 배열들을 병합하여, 특정 키를 기준으로 합산하는 함수입니다.
 * @param dataArrays sheet_to_json으로 변환된 데이터 배열들
 * @param keysToMatch data를 병합할 때 기준이 되는 키들의 배열
 * @param valueKeysToSum data를 병합할 때 합산할 값들의 키 배열
 * @returns
 */
export const mergeDataByIdWithReduce = (
  dataArrays: Array<Array<{ [key: string]: any }>>,
  keysToMatch: Array<string>,
  valueKeysToSum: Array<string>,
) => {
  // 모든 배열을 하나의 평평한 배열로 만듭니다.
  const allItems = dataArrays.flat();

  // reduce를 사용하여 id별로 val 값을 누적시킵니다.
  const mergedData = allItems.reduce((acc, item) => {
    // 병합 기준으로 사용할 키들의 값을 조합하여 고유한 복합 키를 생성합니다.
    const compositeKey = keysToMatch.map((key) => item[key]).join('_');

    if (acc[compositeKey]) {
      // 이미 해당 복합 키의 객체가 있다면, 합산할 값들을 각각 더합니다.
      valueKeysToSum.forEach((valueKey) => {
        if (typeof item[valueKey] === 'number') {
          // 숫자인 경우에만 합산
          acc[compositeKey][valueKey] = (acc[compositeKey][valueKey] || 0) + item[valueKey];
        }
      });
    } else {
      // 없다면 새로운 객체로 추가합니다.
      // 원본 item의 모든 속성을 복사하고, 합산할 값들은 그대로 초기값으로 설정합니다.
      acc[compositeKey] = { ...item };
      // 참고: 여기서 { ...item }을 사용하면 val, val2 등의 초기값이 그대로 들어갑니다.
      // 만약 다른 속성들도 기본값으로 초기화하고 싶다면 이 부분을 수정할 수 있습니다.
    }
    return acc;
  }, {}); // 초기 accumulator는 빈 객체 {}입니다.

  // 병합된 객체의 값들(객체들)만 추출하여 배열로 반환합니다.
  return Object.values(mergedData);
};

/**
 * 엑셀 파일을 XLSX 로 읽고 json으로 변환하는 함수입니다.
 * @param files 엑셀 파일
 */
export const readExcelFiles = async (files: any[], readSheet: string): Promise<any[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  console.log('엑셀 파일 읽기 시작:', files);
  const result = files.map((file) => {
    console.log('파일 이름:', file, file.buffer);
    // const buffer = Buffer.from(file.buffer);
    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });
    const workSheet = workbook.Sheets[readSheet];

    if (workSheet) {
      const jsonData = XLSX.utils.sheet_to_json(workSheet, { header: 'A' });
      const realData = jsonData.slice(3);
      return realData;
    }
  });

  return result.filter((data) => data !== undefined);
};

/**
 * 파일 정보를 생성하는 함수입니다.
 * @param files 파일 배열
 */
export const createFileInfo = async (files: any) => {
  const fileInfos = [];
  for (const [key, file] of files) {
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      fileInfos.push({
        name: file.name,
        buffer: Array.from(uint8Array),
        size: file.size,
        type: file.type,
      });
    }
  }
  return fileInfos;
};
