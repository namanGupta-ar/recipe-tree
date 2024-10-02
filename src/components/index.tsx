import { useEffect, useState } from 'react';

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
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
import DetailsPopup from './DetailsPopup';
import renderIcon from './common/RenderIcon';

const nodeTypes = {
  CustomNode,
};

const RenderTree = () => {
  const { getCache, setCache } = useCache('food_explorer');
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeTypes>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<EdgesTypes>([]);
  const [showDetails, setShowDetails] = useState(null);

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
        clickToGet: 'showPopup',
      },
    ];
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
        const mealFullDetails = getCache(parentId ?? '');
        setShowDetails(mealFullDetails);
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

  const handlePopupClose = () => {
    setShowDetails(null);
  };

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
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      {showDetails && (
        <DetailsPopup
          mealDetails={showDetails}
          handlePopupClose={handlePopupClose}
        />
      )}
    </div>
  );
};

export default RenderTree;
