type CategoriesApiTypes = {
  idCategory: string;
  strCategory: string;
};


type MealsApiTypes = {
  idMeal: string;
  strMeal: string;
  strMealThumb?: string;
};

type PositionType = {
  x: number;
  y: number;
};


type NodeDataTypes = {
  id: string; // id from api to perform caching
  uuid: string; // unique id to render tree
  parentId?: string; // available in case of view nodes to do caching and api calls
  parentLabel?: string; // available in case of view nodes to do caching and api calls
  label: string;
  img?: ReactNode;
  clickToGet: string;
  type?: string;
  level: number;
  position: PositionType;
  onClick: (data: NodeDataTypes) => void;
};

type NodeTypes = {
  id: string; // it is also an uuid,
  position: PositionType;
  type: string;
  draggable: boolean;
  // type: 'CustomNode';
  data: NodeDataTypes;
};

type CreateNodeType = {
  id: string;
  label: string;
  parentId?: string;
  parentLabel?: string;
  img?: ReactNode;
  clickToGet: string;
  index: number;
  type?: string;
  level: number;
  sPos: PositionType;
  onClick: (data: NodeDataTypes) => void;
};

type EdgesTypes = {
  id: string;
  source: string;
  target: string;
  level: number;
};

type ViewNodeTypes = {
  label: string;
  clickToGet: string;
};