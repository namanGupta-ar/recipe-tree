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
  id: string;
  label: string;
  img?: string;
  clickToGet: string;
  type?: string;
  level: number;
  position: PositionType;
  onClick: (data: NodeDataTypes) => void;
};

type NodeTypes = {
  id: string;
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
      id: `e${source.id}-${c.id}`,
      source: source.id,
      target: c.id,
      level: source.level,
    }));
    setEdges((prev) => [
      // removing edges on same level
      ...prev.filter((p) => p.level !== source.level),
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
      ...prev.filter((p) => p.data.level !== level),
      ...newNodes,
    ]);
    handleEdges(source, newNodes);
  };

  const addMealDetails = (source: NodeDataTypes, mealDetails) => {
    // 1. view ingredients
    // 2. veiw tags
    // 3. view Details
    const { position, level } = source;
    // const { strTags } = mealDetails;
    // get ingredients
    const ingredients: IngredientTypes[] = [];
    for (let i = 1; i <= 20; i++) {
      if (mealDetails[`strIngredient${i}`]) {
        const id = (Date.now() + i).toString();
        ingredients.push({
          id,
          label: mealDetails[`strIngredient${i}`],
        });
      }
    }

    // add three nodes

    const viewNodes: ViewNodeTypes[] = [
      {
        label: 'View Ingredients',
        clickToGet: 'showIngredients',
        // data
      },
      {
        label: 'View Tags',
        clickToGet: '',
      },
      {
        label: 'View Details',
        clickToGet: 'showDetails',
        // data
      },
    ];

    const newNodes: NodeTypes[] = viewNodes.map((node, i) => {
      const { label, clickToGet } = node;
      const generatedId = (Date.now() - i).toString();
      if (ingredients.length > 0) {
        setCache(generatedId, ingredients);
      }
      return createNode({
        id: generatedId,
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

  const handleFetch = async (data: NodeDataTypes) => {
    const { id, clickToGet, label, position, level } = data;
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
        const mealDetails = await fetchFullDetails(id);
        addMealDetails(data, mealDetails);
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
        const ingredients: IngredientTypes[] = getCache(id);
        if (ingredients?.length > 0) {
          const ingridentNodes: NodeTypes[] = ingredients.map((ingr, i) => {
            const { id, label } = ingr;
            return createNode({
              id,
              label,
              clickToGet: 'mealsByIngredient',
              level: level + 1,
              sPos: position,
              index: i,
              onClick: handleNodeClick,
            });
          });
          handleNodes(data, ingridentNodes, level + 1);
        }
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
