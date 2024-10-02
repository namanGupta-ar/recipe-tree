import React, { Children, useEffect, useState } from 'react';
import tempdata from './temp';
import RenderTree from './RenderTree';


import {
  fetchFullDetails,
  fetchMealsByCategory,
  fetchMealsByIngredient,
  fetchMealsCategories,
} from '../api';

type ApiTypes =
  | 'category'
  | 'mealsByCategory'
  | 'mealDetails'
  | 'mealsByIngredient'
  | 'showPopup';

type MealDataTypes = {
  id: string;
  children: MealDataTypes[] | null;
  title: string;
  clickToGet?: ApiTypes;
  img?: string;
  type?: string;
};

type CategoriesApiTypes = {
  idCategory?: string;
  strCategory?: string;
};

const FoodExplorer = () => {
  const initMealData: MealDataTypes = {
    id: 'explore',
    title: 'Explore',
    children: null,
    clickToGet: 'category',
    img: '',
  };
  const [mealData, setMealData] = useState(initMealData as MealDataTypes);

  useEffect(() => {
    console.log('meal data updated ', mealData);
  }, [mealData]);

  const updateTreeRecursively = (id: string, newMeals: MealDataTypes[]) => {
    const updateNode = (node: MealDataTypes): MealDataTypes => {
      if (node.id === id) {
        return {
          ...node,
          children: [...newMeals], // Add new children
        };
      }

      // Recursively traverse through children if they exist
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }

      return node;
    };
    setMealData((prev) => updateNode(prev));
  };
  useEffect(() => {
    console.log('meal dataaa ', mealData);
  }, [mealData]);

  const handleFetch = async (data: MealDataTypes) => {
    console.log('clicked data', data);
    const { id, clickToGet, title } = data;
    switch (clickToGet) {
      case 'category':
        const mealCategories = await fetchMealsCategories();
        const requiredMeals: MealDataTypes[] = mealCategories
          .slice(0, 5)
          .map((c: CategoriesApiTypes) => {
            return {
              id: c.idCategory,
              title: c.strCategory,
              children: null,
              clickToGet: 'mealsByCategory',
              type: 'option',
            };
          });
        console.log('requiredMeals', requiredMeals);
        updateTreeRecursively(id, requiredMeals);
        break;
      case 'mealsByCategory':
        const mealsByCategory = await fetchMealsByCategory(title);
        const requiredMealsByCategory: MealDataTypes[] = mealsByCategory
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
        console.log('requiredMealsByCategory', requiredMealsByCategory);
        updateTreeRecursively(id, requiredMealsByCategory);
        break;
      case 'mealDetails':
        const mealDetails = await fetchFullDetails(id);
        addMealDetails(id, mealDetails);
        break;
      case 'mealsByIngredient':
        const mealsByIng = await fetchMealsByIngredient(title);
        const requiredMealsByIng: MealDataTypes[] = mealsByIng
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
        updateTreeRecursively(id, requiredMealsByIng);
        break;
      case 'showPopup':
        console.log('Showing popup');
        break;
    }
  };

  const addMealDetails = (id: string, mealDetails: any) => {
    // 1. view ingredients
    // 2. veiw tags
    // 3. view Details
    const { strTags } = mealDetails;
    // get ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      if (mealDetails[`strIngredient${i}`]) {
        ingredients.push({
          id: Date.now() + i,
          title: mealDetails[`strIngredient${i}`],
          clickToGet: 'mealsByIngredient',
          children: null,
          type: 'option',
        });
      }
    }
    console.log('meal ingredients ', ingredients);
    //todo
    const tags = strTags?.split(',');
    if (tags?.length) console.log('tags ', tags);

    const children: MealDataTypes[] = [
      {
        id: `ingredients${id}`,
        title: 'View Ingredients',
        children: ingredients ? [...ingredients] : null,
        type: 'pill',
      },
      {
        id: `tag${id}`,
        title: 'View Tags',
        children: tags ? [...tags] : null,
        type: 'pill',
      },
      {
        id: `details${id}`,
        title: 'View Details',
        children: null,
        clickToGet: 'showPopup',
        type: 'pill',
      },
    ];
    updateTreeRecursively(id, children);
  };

  return (
    <RenderTree />
  );

  return (
    mealData && (
      <div
        id={mealData.id}
        onClick={(e) => {
          e.stopPropagation();
          handleFetch(mealData);
        }}
        className="flex items-start w-max relative px-4 py-2 border rounded-lg m-10"
      >
        {/* <div className="px-4 py-2 border rounded-lg"> */}
            {mealData.title}
            {/* </div> */}
        {mealData.children && (
          <RenderMealDetails
            data={mealData.children}
            handleFetch={handleFetch}
          />
        )}
      </div>
    )
  );
};

type RenderMealDetailsTypes = {
  data: MealDataTypes[];
  handleFetch: (data: MealDataTypes) => void;
};

const RenderMealDetails: React.FC<RenderMealDetailsTypes> = ({
  data,
  handleFetch,
}) => {
  return (
    <div className="absolute top-[-20px] right-0 translate-x-full">
      {data &&
        data.map((item) => (
          <div
            // className="flex items-start"
            className={`flex px-4 py-2  w-max border relative ${
              item.type === 'pill' ? 'rounded-full' : 'rounded-lg'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleFetch(item);
            }}
          >
            {/* <div
              className={`px-4 py-2 border relative ${
                item.type === 'pill' ? 'rounded-full' : 'rounded-lg'
              }`}
            > */}
            {item.title}
            {/* </div> */}
            {item.children && (
              <RenderMealDetails
                data={item.children}
                handleFetch={handleFetch}
              />
            )}
          </div>
        ))}
    </div>
  );
};

export default FoodExplorer;
