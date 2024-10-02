
// @ts-nocheck

import { memo } from 'react';
import { Handle, Position} from '@xyflow/react';

const CustomNode = ({ data}) => {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div  className='px-10 py-3 border-2 border-black' onClick={() => data.onClick(data)} >{data.label} {data.level}</div>
      <Handle type="source" position={Position.Right} />
    </>
  );
};

export default memo(CustomNode);
