
# 🍽️ Food Explorer App

This React application is a dynamic food exploration tool that visualizes categories of food and meals as an interactive tree using React Flow. The app allows users to explore various food categories, view meals, ingredients, and details in a structured manner with endless possibilities of navigation.


[Deployment](https://food-explorer-yum.netlify.app/)


## 🚀 Features

1. Interactive Food Category Tree:

- Initially, the app displays an Explore Node.
- Clicking on the node fetches various food categories and displays them in a tree structure.
2. Category/Ingredients Exploration:

- Upon clicking a category/ingredients node, a "View Meals" option appears.
- Clicking "View Meals" fetches the meals associated with that category/ingredients and adds them to the tree.
3. Meal Details:

a. Clicking on a meal node displays three options:
 - View Ingredients: Fetches and shows the ingredients for the selected meal. Clicking on an ingredient will fetch meals containing that ingredient, extending the tree further.
- View Tags: Displays associated tags for the selected meal.
- View Details: Opens a popup containing full details about the meal.
4. Endless Exploration:

- The app supports endless navigation. You can click on ingredients or meals to explore deeper into the tree structure, creating an infinite exploration experience.
5. Caching:

- Implemented caching to reduce redundant API calls and improve performance. Once data is fetched for a specific category, meal, or ingredient, it is cached, so subsequent requests fetch the data from the cache.


## 🛠️ How It Works👋

1. The app starts with a single "Explore" node in the tree.
2. Clicking on the node triggers an API request to fetch food categories, which are displayed as child nodes.
3. Clicking on a food category shows a "View Meals" option. Clicking this button fetches the meals for that category and displays them in the tree.
4. Clicking on a meal node provides three options:
- View Ingredients: Fetches ingredients and displays them.
- View Tags: Displays the meal's tags.
- View Details: Opens a popup with all the details about the meal.
5. The process continues, allowing users to explore ingredients and meals endlessly.
## 🧑‍💻 Installation

1. Clone the repository:

```bash
git clone https://github.com/namanGupta-ar/recipe-tree.git
cd recipe-tree
```
2. Install the dependencies:

    ```bash
        npm install
    ```

3. Start the development server:

```bash
    npm run dev
```
## 📚 Dependencies

- React: Frontend framework.
- React Flow: To create and visualize the dynamic tree structure.
- Tailwind CSS: For styling the app.
- Recipe Api: [link](https://www.themealdb.com/api.php)
## 💾 Caching
Caching is implemented to minimize API calls. Once a node is clicked and data is fetched, it is stored in a cache. When the same node or data is requested again, the app retrieves the information from the cache instead of making another API call, improving efficiency.
