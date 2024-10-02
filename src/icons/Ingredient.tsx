// icon:food-hot-dog | Material Design Icons https://materialdesignicons.com/ | Austin Andrews
import * as React from 'react';

function IconIngredient(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      height="1em"
      width="1em"
      {...props}
    >
      <path d="M21 5.77c-.15-.12-.28-.22-.41-.32l.03-.04c.78-.78.78-2.04 0-2.82-.78-.78-2.04-.78-2.83 0l-.74.74a3.465 3.465 0 00-4.55.32L3.65 12.5a3.465 3.465 0 00-.32 4.55l-.74.74c-.79.79-.79 2.05 0 2.83.78.78 2.04.78 2.82 0l.04-.03c.1.13.2.26.32.41 1.36 1.34 3.58 1.34 4.95 0l10.25-10.28A3.522 3.522 0 0021 5.77M4.77 15.61a1.5 1.5 0 01.29-1.71l8.84-8.84a1.5 1.5 0 011.71-.29L4.77 15.61M19.56 9.3L9.3 19.56c-.58.59-1.53.59-2.12 0-.58-.56-.58-1.56 0-2.12L17.44 7.18c.56-.58 1.56-.58 2.12 0 .59.59.59 1.54 0 2.12z" />
    </svg>
  );
}

export default IconIngredient;
