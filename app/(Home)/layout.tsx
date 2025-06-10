import React from 'react';

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <h1 className='text-2xl font-bold'>재고 관리 시스템</h1>
      <p className='text-gray-800 mt-2'>
        재고 관리 시스템에 오신 것을 환영합니다. 이 시스템은 재고를 효율적으로 관리하고 추적하는 데 도움을 줍니다.
      </p>

      <div className='flex gap-4 mt-8'>{children}</div>
    </div>
  );
}
