const calculatePosition = (pos: PositionType , index: number, totalNodes: number) => {
  return {
    x: pos.x + 300,
    y: pos.y - (totalNodes / 2) * 80 + index * 80,
  };
};

const createNode = (data: CreateNodeType, totalNodes = 5) => {
  const { id, label, img, clickToGet, level, sPos, index, type, onClick, parentId, parentLabel } =
    data;
  const newPosition = calculatePosition(sPos, index, totalNodes);
  const uuid = (Date.now() + index).toString();
  return {
    id: uuid,
    position: newPosition,
    type: 'CustomNode',
    draggable: false,
    data: {
      onClick,
      position: newPosition,
      id,
      parentId,
      parentLabel,
      uuid,
      label,
      clickToGet,
      img: img ?? '',
      type: type ?? 'option',
      level: level,
    },
  };
};

export { createNode, calculatePosition };
