import React from 'react';
import useFluidCursor from '@/hooks/useFluidCursor';

const FluidCursor: React.FC = () => {
  useFluidCursor();

  return (
    <canvas
      id="fluid"
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{
        mixBlendMode: 'screen',
        background: 'transparent'
      }}
    />
  );
};

export default FluidCursor;