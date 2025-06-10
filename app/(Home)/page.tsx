import ContCard from '@/components/common/ContCard';
import Description from '@/components/common/Description';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <>
      <div className='flex-2/3'>
        <h2>지점 재고 취합</h2>
        <ContCard className='mt-2'>
          <h4>파일 업로드</h4>
          <Description description='지점에서 취합한 재고 파일을 업로드하세요.' className='mt-1' />
        </ContCard>
        <ContCard className='mt-2'>tets</ContCard>
      </div>
      <div className='flex-1/3'>
        <h2>스토어 재고 변경 양식 생성</h2>
        <ContCard className='mt-2'>
          <h4>People stopped telling jokes</h4>
        </ContCard>
      </div>
    </>
  );
}
