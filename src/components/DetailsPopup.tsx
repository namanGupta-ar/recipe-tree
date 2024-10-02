import React from 'react';
import { tempDetais } from './temp';
import IconCross1 from '../icons/Cross';

type PillProps = {
  label: string;
};

type DetailsProps = {
  mealDetails: any;
  handlePopupClose: () => void;
};

const tailwindColors = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'pink',
  'indigo',
  'teal',
  'orange',
  'cyan',
  'lime',
  'rose',
];

function getRandomTailwindColor() {
  const randomIndex = Math.floor(Math.random() * tailwindColors.length);
  return tailwindColors[randomIndex];
}

const Pill: React.FC<PillProps> = ({ label }) => {
  const randomColor = getRandomTailwindColor();
  const borderColor = `border-${randomColor}-500`;
  const backgroundColor = `bg-${randomColor}-500/20`;
  return (
    <p
      className={`rounded-full text-${randomColor}-700 border-2 ${borderColor} ${backgroundColor} py-1 px-3 text-xs`}
    >
      {label}
    </p>
  );
};

const DetailsPopup: React.FC<DetailsProps> = ({
  mealDetails,
  handlePopupClose,
}) => {
  const {
    strMeal,
    strMealThumb,
    strTags,
    strCategory,
    strArea,
    strYoutube,
    strInstructions,
  } = mealDetails;

  const tags = strTags ? strTags.split(',') : [];

  const details = [
    {
      type: 'Category',
      desc: strCategory,
    },
    {
      type: 'Area',
      desc: strArea,
    },
    {
      type: 'YouTube',
      desc: strYoutube,
    },
    {
      type: 'Recipe',
      desc: strYoutube, // tocheck
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-[350px] bg-white border p-2 overflow-x-hidden h-screen scrollbar-none fixed top-0 right-0">
      <div className="flex justify-between items-center border-b-2 py-2">
        <h3 className="text-gray-600 font-bold">{strMeal}</h3>
        <p className="h-5 w-5 cursor-pointer" onClick={handlePopupClose}>
          <IconCross1 color="grey" />
        </p>
      </div>
      {strMealThumb && (
        <p className="w-full">
          <img src={strMealThumb} alt="loading" />
        </p>
      )}
      {tags && (
        <div className="flex gap-2">
          {tags.map((tag: string, i) => (
            <Pill label={tag} key={i} />
          ))}
        </div>
      )}
      {details &&
        details.map((d) => (
          <div className="flex w-full text-gray-600 text-xs">
            <p className="w-1/2">{d.type}</p>
            <p className="w-1/2 break-words">{d.desc}</p>
          </div>
        ))}
      {strInstructions && (
        <div className="border-2 p-4">
          <p className="font-bold text-sm mb-3">Instructions</p>
          <p className="text-xs">{strInstructions}</p>
        </div>
      )}
    </div>
  );
};

export default DetailsPopup;
