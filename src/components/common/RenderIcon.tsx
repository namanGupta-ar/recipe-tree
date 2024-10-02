import FoodIcon from "../../icons/Food";
import IconGlobeOutline from "../../icons/Globe";
import IconIngredient from "../../icons/Ingredient";
import IconBxFoodMenu from "../../icons/Menu";
import ShareIcon from "../../icons/Share";

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

export default renderIcon;