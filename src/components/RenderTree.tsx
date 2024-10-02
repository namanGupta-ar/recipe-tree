import React, { useEffect } from 'react';

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
// import {CategoriesApiTypes } from 'types/api' // todo
import CustomNode from './react-flow/CustomNode';
import { defaultEdgeOptions } from './react-flow/reactFlowConfig';
import {
  fetchFullDetails,
  fetchMealsByCategory,
  fetchMealsByIngredient,
  fetchMealsCategories,
} from '../api';
import { createNode } from '../utility';
import useCache from './common/useCache';

type CategoriesApiTypes = {
  idCategory?: string;
  strCategory?: string;
};

type MealsApiTypes = {
  idMeal?: string;
  strMeal?: string;
  strMealThumb?: string;
};

type IngredientTypes = {
  id: string;
  label: string;
};
type PositionType = {
  x: number;
  y: number;
};

type NodeDataTypes = {
  id: string; // id from api to perform caching
  uuid: string; // unique id to render tree
  parentId?: string; // available in case of view nodes
  label: string;
  img?: string;
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
  // type: 'CustomNode';
  data: NodeDataTypes;
};

type EdgesTypes = {
  id: string;
  source: string;
  target: string;
  level: number;
};

type ViewNodeTypes = {
  label: string;
  clickToGet?: string;
};

const nodeTypes = {
  CustomNode,
};

const RenderTree = () => {
  const { getCache, setCache } = useCache('food_explorer');
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeTypes>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgesTypes>([]);

  const handleNodeClick = (data: NodeDataTypes) => {
    console.log('Node Clicked', data);
    handleFetch(data);
  };

  const handleEdges = (source: NodeDataTypes, children: NodeTypes[]) => {
    const newEdges = children.map((c) => ({
      id: `e${source.uuid}-${c.id}`,
      source: source.uuid,
      target: c.id,
      level: source.level,
    }));

    setEdges((prev) => [
      // removing edges on same level
      ...prev.filter((p) => p.level < source.level),
      ...newEdges,
    ]);
  };

  const handleNodes = (
    source: NodeDataTypes,
    newNodes: NodeTypes[],
    level: number
  ) => {
    setNodes((prev) => [
      // removing nodes on same level
      ...prev.filter((p) => p.data.level < level),
      ...newNodes,
    ]);
    handleEdges(source, newNodes);
  };

  const addMealDetails = (source: NodeDataTypes) => {
    // 1. view ingredients
    // 2. veiw tags
    // 3. view Details
    const { position, level, id } = source;
    const viewNodes: ViewNodeTypes[] = [
      {
        label: 'View Ingredients',
        clickToGet: 'showIngredients',
      },
      {
        label: 'View Tags',
        clickToGet: '',
      },
      {
        label: 'View Details',
        clickToGet: 'showDetails',
      },
    ];

    const newNodes: NodeTypes[] = viewNodes.map((node, i) => {
      const { label, clickToGet } = node;
      const generatedId = (Date.now() - i).toString();
      return createNode({
        id: generatedId,
        parentId: id, // storing parent id in case of view nodes, to cache on parent node
        label,
        clickToGet,
        level: level + 1,
        sPos: position,
        index: i,
        onClick: handleNodeClick,
      });
    });

    handleNodes(source, newNodes, level + 1);
  };

  const getIngredientsFromDetails = (source: NodeDataTypes, sourceParentId: string) => {
    // source: view node, sourceParent: meal node id to get cached value
    const { position, level } = source;
    const mealDetails = getCache(sourceParentId);
    if (mealDetails) {
      const ingredientNodes: NodeTypes[] = [];
      for (let i = 1; i <= 20; i++) {
        if (mealDetails[`strIngredient${i}`]) {
          const id = (Date.now() + i).toString();
           ingredientNodes.push(createNode({
             id,
             label: mealDetails[`strIngredient${i}`],
             clickToGet: 'mealsByIngredient',
             level: level + 1,
             sPos: position,
             index: i,
             onClick: handleNodeClick,
           }))
        }
      }
      handleNodes(source, ingredientNodes, level + 1);
    }
  };

  const handleFetch = async (data: NodeDataTypes) => {
    const { id, clickToGet, label, position, level, parentId } = data;
    switch (clickToGet) {
      case 'category':
        let mealCategories: CategoriesApiTypes[] = getCache(id);
        if (!mealCategories) {
          const categories = await fetchMealsCategories();
          mealCategories = categories.slice(0, 5);
          setCache(id, mealCategories);
        }
        const requiredMeals: NodeTypes[] = mealCategories.map((c, i) => {
          const { idCategory: id, strCategory: label } = c;
          return createNode({
            id,
            label,
            clickToGet: 'mealsByCategory',
            level: level + 1,
            sPos: position,
            index: i,
            onClick: handleNodeClick,
          });
        });
        handleNodes(data, requiredMeals, level + 1);
        break;
      case 'mealsByCategory':
        let mealsByCategory: MealsApiTypes[] = getCache(id);
        if (!mealsByCategory) {
          const meals = await fetchMealsByCategory(label);
          mealsByCategory = meals.slice(0, 5);
          setCache(id, mealsByCategory);
        }
        const requiredMealsByCategory = mealsByCategory.map((m, i) => {
          const { idMeal: id, strMeal: label, strMealThumb: img } = m;
          return createNode({
            id,
            label,
            img,
            clickToGet: 'mealDetails',
            level: level + 1,
            sPos: position,
            index: i,
            onClick: handleNodeClick,
          });
        });
        handleNodes(data, requiredMealsByCategory, level + 1);
        break;
      case 'mealDetails':
        let mealDetails = getCache(id);
        if (!mealDetails) {
          mealDetails = await fetchFullDetails(id);
          setCache(id, mealDetails);
        }
        addMealDetails(data);
        break;
      case 'mealsByIngredient':
        let mealsByIng: MealsApiTypes[] = getCache(id);
        if (!mealsByIng) {
          const meals = await fetchMealsByIngredient(label);
          mealsByIng = meals.slice(0, 5);
          setCache(id, mealsByIng);
        }
        const requiredMealsByIng: NodeTypes[] = mealsByIng.map((m: any, i) => {
          const { idMeal: id, strMeal: label, strMealThumb: img } = m;
          return createNode({
            id,
            label,
            img,
            clickToGet: 'mealDetails',
            level: level + 1,
            sPos: position,
            index: i,
            onClick: handleNodeClick,
          });
        });
        handleNodes(data, requiredMealsByIng, level + 1);
        break;
      case 'showIngredients':
        getIngredientsFromDetails(data, parentId ?? "");
        break;
      case 'showPopup':
        console.log('Showing popup');
        break;
    }
  };
  useEffect(() => {
    const initialNodes: NodeTypes[] = [
      {
        id: 'explore',
        position: { x: 100, y: 100 },
        type: 'CustomNode',
        data: {
          onClick: handleNodeClick,
          id: 'explore',
          uuid: 'explore',
          label: 'Explore',
          clickToGet: 'category',
          position: { x: 100, y: 100 },
          img: '',
          level: 0,
        },
      },
    ];
    setNodes(initialNodes);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default RenderTree;
