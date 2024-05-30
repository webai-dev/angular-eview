const RandomDragula = () =>
  Math.random()
    .toString(36)
    .substring(2, 15) +
  Math.random()
    .toString(36)
    .substring(2, 15);

const CanMove = (targetElement: Element, shouldHaveClass: string) => {
  const lookForClass = (element: Element, className: string): boolean => {
    if (
      typeof element.className === 'string' &&
      element.className.split(' ').includes(className)
    )
      return true;
    if (!element.parentElement) return false;
    return lookForClass(element.parentElement, className);
  };
  return lookForClass(targetElement, shouldHaveClass);
};

export const DragulaHelpers = { RandomDragula, CanMove };
