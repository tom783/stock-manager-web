import React from 'react';

export interface ContCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export default function ContCard({ children, ...props }: ContCardProps) {
  return (
    <div {...props} className={`border border-border rounded-sm p-4 ${props.className ? ` ${props.className}` : ''}`}>
      {children}
    </div>
  );
}
