import React, { ReactNode, useEffect } from 'react';

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
import ShareIcon from '../icons/Share';
import IconGlobeOutline from '../icons/Globe';
import FoodIcon from '../icons/Food';
import IconBxFoodMenu from '../icons/Menu';
import IconIngredient from '../icons/Ingredient';

type CategoriesApiTypes = {
  idCategory?: string;
  strCategory?: string;
};

type MealsApiTypes = {
  idMeal?: string;
  strMeal?: string;
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

  const viewMealDetailsTags = (source: NodeDataTypes) => {
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
    console.log('creating tag for ', id);
    const newNodes: NodeTypes[] = viewNodes.map((node, i) => {
      const { label, clickToGet } = node;
      const generatedId = (Date.now() - i).toString();
      return createNode(
        {
          id: generatedId,
          parentId: id, // storing parent id in case of view nodes, to cache on parent node
          label,
          clickToGet,
          level: level + 1,
          sPos: position,
          index: i,
          onClick: handleNodeClick,
          img: renderIcon('share'),
          type: 'view',
        },
        3
      );
    });

    handleNodes(source, newNodes, level + 1);
  };

  const viewMealTag = (source: NodeDataTypes, clickToGet: string) => {
    const { id, level, position, label } = source;
    const generatedId = Date.now().toString();
    const viewNode = [
      createNode(
        {
          id: generatedId,
          parentId: id,
          parentLabel: label,
          label: 'View Meals',
          clickToGet,
          level: level + 1,
          sPos: position,
          index: 0,
          img: renderIcon('share'),
          type: 'view',
          onClick: handleNodeClick,
        },
        1
      ),
    ];
    handleNodes(source, viewNode, level + 1);
  };

  const getIngredientsFromDetails = (
    source: NodeDataTypes,
    sourceParentId: string
  ) => {
    // source: view node, sourceParent: meal node id to get cached value
    const { position, level } = source;
    const mealDetails = getCache(sourceParentId);
    if (mealDetails) {
      const ingredientNodes: NodeTypes[] = [];
      for (let i = 1; i <= 5; i++) {
        const label = mealDetails[`strIngredient${i}`];
        if (mealDetails[`strIngredient${i}`]) {
          // const id = (Date.now() + i).toString();
          ingredientNodes.push(
            createNode({
              id: label.replace(/\s+/g, '_'),
              label,
              clickToGet: 'viewMealsByIngredientsTag', // to get view meal tag
              level: level + 1,
              sPos: position,
              index: i,
              onClick: handleNodeClick,
              img: renderIcon('ingredient'),
            })
          );
        }
      }
      handleNodes(source, ingredientNodes, level + 1);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'meal':
        return (
          <p className="h-5 w-5 rounded p-[2.5px] bg-blue-600">
            <FoodIcon height={15} width={15} color="white" />
          </p>
        );
      case 'menu':
        return (
          <p className="h-5 w-5 rounded p-[2.5px] bg-red-600">
            <IconBxFoodMenu height={15} width={15} color="white" />
          </p>
        );
      case 'share':
        return <ShareIcon color="lime" height={20} width={20} />;
      case 'explore':
        return (
          <p className="h-5 w-5 rounded p-[2.5px] bg-slate-700">
            <IconGlobeOutline height={15} width={15} color="white" />
          </p>
        );
      case 'ingredient':
        return (
          <p className="h-5 w-5 rounded p-[2.5px] bg-purple-700">
            <IconIngredient height={15} width={15} color="white" />
          </p>
        );
    }
  };

  const handleFetch = async (data: NodeDataTypes) => {
    const { id, clickToGet, position, level, parentId, parentLabel } = data;
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
            clickToGet: 'viewMealsByCategoryTag',
            level: level + 1,
            sPos: position,
            index: i,
            onClick: handleNodeClick,
            img: renderIcon('menu'),
          });
        });
        handleNodes(data, requiredMeals, level + 1);
        break;
      case 'mealsByCategory':
        let mealsByCategory: MealsApiTypes[] = getCache(parentId ?? '');
        if (!mealsByCategory) {
          const meals = await fetchMealsByCategory(parentLabel ?? '');
          mealsByCategory = meals.slice(0, 5);
          if (parentId) {
            setCache(parentId, mealsByCategory);
          }
        }
        const requiredMealsByCategory = mealsByCategory.map((m, i) => {
          const { idMeal: id, strMeal: label } = m;
          return createNode({
            id,
            label,
            img: renderIcon('meal'),
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
        viewMealDetailsTags(data);
        break;
      case 'mealsByIngredient':
        console.log('mealsByIngredient', parentId);
        let mealsByIng: MealsApiTypes[] = getCache(parentId ?? '');
        if (!mealsByIng) {
          const meals = await fetchMealsByIngredient(parentId ?? '');
          mealsByIng = meals.slice(0, 5);
          if (parentId) setCache(parentId, mealsByIng);
        }
        const requiredMealsByIng: NodeTypes[] = mealsByIng.map((m: any, i) => {
          const { idMeal: id, strMeal: label } = m;
          return createNode({
            id,
            label,
            img: renderIcon('meal'),
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
        getIngredientsFromDetails(data, parentId ?? ''); // when view ingredient tag is clicked
        break;
      case 'viewMealsByIngredientsTag':
        viewMealTag(data, 'mealsByIngredient'); // if view meal tag is clicked after ingredient
        break;
      case 'viewMealsByCategoryTag': // if view meal tag is clicked after category
        viewMealTag(data, 'mealsByCategory');
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
          img: renderIcon('explore'),
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
