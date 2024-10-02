// @ts-nocheck

const calculatePosition = (pos, index) => {
  return {
    x: pos.x + 250,
    y: pos.y + index * 80,
  };
};

const createNode = (data) => {
  const { id, label, img, clickToGet, level, sPos, index, type, onClick, parentId } =
    data;
  const newPosition = calculatePosition(sPos, index);
  const uuid = (Date.now() + index).toString();
  return {
    id: uuid,
    position: newPosition,
    type: 'CustomNode',
    data: {
      onClick,
      position: newPosition,
      id,
      parentId,
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
