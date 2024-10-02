const fetchMealsCategories = async () => {
  // to get random meals
  try {
    const response = await fetch(
      'https://themealdb.com/api/json/v1/1/categories.php'
    );
    const { categories } = await response.json();
    return categories;
  } catch (error) {
    console.log('Error while fetching meals categories', error);
  }
};

const fetchMealsByCategory = async (category: string) => {
  try {
    const response = await fetch(
      `https://themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    const { meals } = await response.json();
    return meals;
  } catch (error) {
    console.log('Error while fetching meals categories', error);
  }
};
const fetchMealsByIngredient = async (ingredient: string) => {
  try {
    const response = await fetch(
      `https://themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    const { meals } = await response.json();
    return meals;
  } catch (error) {
    console.log('Error while fetching meals categories', error);
  }
};

const fetchFullDetails = async (id: string) => {
  try {
    const response = await fetch(
      `https://themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const { meals } = await response.json();
    return meals[0];
  } catch (error) {
    console.log('Error while fetching meals categories', error);
  }
};

export {
  fetchMealsCategories,
  fetchMealsByCategory,
  fetchFullDetails,
  fetchMealsByIngredient,
};
