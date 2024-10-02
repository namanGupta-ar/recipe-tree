
import React, {  useEffect } from 'react';

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


type CategoriesApiTypes = {
  idCategory?: string;
  strCategory?: string;
};

type MealsApiTypes = {
  idMeal?: string;
  strMeal?: string;
  strMealThumb?: string
};

type PositionType = {
  x: number,
  y: number
}

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
  type: 'CustomNode';
  data: NodeDataTypes
};

type EdgesTypes = {
  id: string,
  source: string,
  target: string,
  level: number
}

const nodeTypes = {
  CustomNode,
};


const RenderTree = () => {
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
      ...prev.filter((p) => p.level !== source.level + 1),
      ...newEdges,
    ]);
  };

  const handleNodes = (newNodes: NodeTypes[], level: number) => {
    console.log('level ', level);
    setNodes((prev) => [
      ...prev.filter((p) => p.data.level !== level),
      ...newNodes,
    ]);
  };


  const addMealDetails = (source: NodeDataTypes, mealDetails) => {
    // 1. view ingredients
    // 2. veiw tags
    // 3. view Details
    // const {position, level} = source;
    // const { strTags } = mealDetails;
    // get ingredients
    // const ingredients = [];
    // for (let i = 1; i <= 20; i++) {
    //   if (mealDetails[`strIngredient${i}`]) {
    //     const id = Date.now() + i;
    //     ingredients.push({
    //       id,
    //       label: mealDetails[`strIngredient${i}`]
    //     });
    //   }
    // }
    // add three nodes
  };

  const handleFetch = async (data: NodeDataTypes) => {
    const { id, clickToGet, label, position, level } = data;
    switch (clickToGet) {
      case 'category':
        const mealCategories = await fetchMealsCategories();
        const requiredMeals: NodeTypes[] = mealCategories
          .slice(0, 5)
          .map((c: CategoriesApiTypes, i: number) => {
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
        handleNodes(requiredMeals, level + 1);
        handleEdges(data, requiredMeals);
        break;
      case 'mealsByCategory':
        const mealsByCategory = await fetchMealsByCategory(label);
        const requiredMealsByCategory: NodeTypes[] = mealsByCategory
          .slice(0, 5)
          .map((m: MealsApiTypes, i: number) => {
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
        console.log('requiredMealsByCategory', requiredMealsByCategory);
        handleNodes(requiredMealsByCategory, level + 1);
        handleEdges(data, requiredMealsByCategory);
        break;
      case 'mealDetails':
        const mealDetails = await fetchFullDetails(id);
        addMealDetails(data, mealDetails);
        break;
      case 'mealsByIngredient':
        const mealsByIng = await fetchMealsByIngredient(label);
        const requiredMealsByIng: NodeTypes[] = mealsByIng
          .slice(0, 5)
          .map((m: any) => {
            return {
              id: m.idMeal,
              title: m.strMeal,
              children: null,
              clickToGet: 'mealDetails',
              img: m.strMealThumb ?? '',
              type: 'option',
            };
          });
        console.log('requiredMealsByCategory', requiredMealsByIng);
        // updateTreeRecursively(id, requiredMealsByIng);
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
      }
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
