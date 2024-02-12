import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type TooltipWrapperPropsType = {
  children: React.ReactNode;
  text?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
};

const TooltipWrapper = ({ children, text, side }: TooltipWrapperPropsType) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side={side || 'bottom'}
        collisionPadding={8}
        sideOffset={side === 'left' || side === 'right' ? 8 : 0}
      >
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default TooltipWrapper;
