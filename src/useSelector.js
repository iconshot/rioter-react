import React from "react";

import useStore from "./useStore";

function compareDeep(value, currentValue) {
  // for null values, check if currentValue is also null

  if (value === null) {
    return currentValue === null;
  }

  // for arrays, compare items deeply

  if (Array.isArray(value)) {
    if (!Array.isArray(currentValue)) {
      return false;
    }

    if (value.length !== currentValue.length) {
      return false;
    }

    return value.every((item, i) => compareDeep(item, currentValue[i]));
  }

  // for objects, compare properties deeply

  if (typeof value === "object") {
    if (currentValue === null) {
      return false;
    }

    if (Array.isArray(currentValue)) {
      return false;
    }

    if (typeof currentValue !== "object") {
      return false;
    }

    const keys = Object.getOwnPropertyNames(value);
    const currentKeys = Object.getOwnPropertyNames(currentValue);

    if (keys.length !== currentKeys.length) {
      return false;
    }

    return keys.every(
      (key) => key in currentValue && compareDeep(value[key], currentValue[key])
    );
  }

  // for anything else, check equality

  return value === currentValue;
}

export default (closure) => {
  const store = useStore();

  const state = store.getState();

  const result = closure(state); // closure is called here so we can handle props updates and store updates

  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    store.on("update", onCompare);

    return () => {
      store.off("update", onCompare);
    };
  }); // trigger every time this component is rendered

  const onCompare = () => {
    try {
      const newResult = closure(state);

      const updated = !compareDeep(newResult, result);

      if (updated) {
        forceUpdate();
      }
    } catch (error) {}
  };

  return result;
};
