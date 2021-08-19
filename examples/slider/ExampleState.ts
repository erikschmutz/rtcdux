import createStore from "../../src/lib/createStore";

type IState = {
  value: number;
};

type SetValueAction = {
  value: number;
  type: "SET";
};

type Action = SetValueAction;

const reducer = (state: IState = { value: 50 }, action: Action) => {
  if (action.type === "SET")
    return {
      value: action.value,
    };

  return state;
};

export default createStore(reducer);
