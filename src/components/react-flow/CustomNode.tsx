// @ts-nocheck

import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ data }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ visibility: 'hidden' }}
      />
      <div
        className={`flex items-center gap-2 px-3 py-[6px] border-2 shadow-lg bg-white  w-[200px] ${
          data.type === 'view' ? 'rounded-full' : 'rounded-md'
        }`}
        onClick={() => data.onClick(data)}
      >
        {data.img}
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ visibility: 'hidden' }}
      />
    </>
  );
};

export default memo(CustomNode);
