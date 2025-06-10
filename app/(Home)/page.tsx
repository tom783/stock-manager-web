import ContCard from '@/components/common/ContCard';
import Description from '@/components/common/Description';
import StockMergeContainer from '@/containers/home/StockMergeContainer';

export default function Home() {
  return (
    <>
      <div className='flex-2/3'>
        <StockMergeContainer />
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
