import React from 'react';

interface IDescriptionProps {
  description?: string;
  className?: string;
}

export default function Description({ description, className }: IDescriptionProps) {
  if (!description) return null;
  return <div className={`text-muted-foreground text-sm ${className ? `${className}` : ''}`}>{description}</div>;
}
