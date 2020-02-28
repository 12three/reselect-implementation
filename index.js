function defaultEqualityCheck(a, b) {
  return a === b;
}

function checkArgsEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false;
  }

  return prev.every((prevArg, index) => equalityCheck(prevArg, next[index]));
}

export function defaultMemoize(fn, equalityCheck = defaultEqualityCheck) {
  let lastArgs = null;
  let lastResult = null;

  return (...args) => {
    const areArgsEqual = checkArgsEqual(equalityCheck, lastArgs, args);

    if (!areArgsEqual) {
      lastResult = fn(...args);
    }

    lastArgs = args;
    return lastResult;
  };
}

export function createSelectorCreator(memoize, ...memoizeOptions) {
  return (selectors, fn) => {
    let recomputations = 0;
    const memoizedFn = memoize((...args) => {
      recomputations++;
      return fn(...args);
    }, ...memoizeOptions);

    return state => {
      const args = selectors.map(selector => selector(state));
      const selector = memoizedFn(...args);

      selector.resultFunc = fn;
      selector.recomputations = recomputations;
      return selector;
    };
  };
}

export const createSelector = createSelectorCreator(defaultMemoize);

export function createStructuredSelector(inputSelectorsObj) {
  const selectorsKeys = Object.keys(inputSelectorsObj);
  return createSelector(
    selectorsKeys.map(key => inputSelectorsObj[key]),
    (...values) => {
      return values.reduce((acc, value, index) => {
        return {
          ...acc,
          [selectorsKeys[index]]: value
        };
      }, {});
    }
  );
}
