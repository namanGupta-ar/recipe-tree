import React from 'react';
import IconCross1 from '../icons/Cross';

type PillProps = {
  label: string;
};

type DetailsProps = {
  mealDetails: any;
  handlePopupClose: () => void;
};

const tailwindColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-lime-500',
  'bg-rose-500',
];

function getRandomTailwindColor() {
  const randomIndex = Math.floor(Math.random() * tailwindColors.length);
  return tailwindColors[randomIndex];
}


const Pill: React.FC<PillProps> = ({ label }) => {
  const randomColor = getRandomTailwindColor();
  return (
    <p
      className={`rounded-full py-1 px-3 text-xs ${randomColor}`}
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
    strSource,
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
      desc: strSource, 
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
          {tags.map((tag: string, i: number) => (
            <Pill label={tag} key={i} />
          ))}
        </div>
      )}
      {details &&
        details.map((d) => (
          <div className="flex w-full text-gray-600 text-xs">
            <p className="w-1/2">{d.type}</p>
            <a className="w-1/2 break-words" href={d.desc} target='_blank'>{d.desc}</a>
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
