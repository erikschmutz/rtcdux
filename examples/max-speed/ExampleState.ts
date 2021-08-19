import createStore from "../../src/lib/createStore";

type IState = {
  value: number;
};

type SetValueAction = {
  type: "ICRMNT";
};

type Action = SetValueAction;

const reducer = (state: IState = { value: 0 }, action: Action) => {
  if (action.type === "ICRMNT")
    return {
      value: state.value + 1,
    };

  return state;
};

export default createStore(reducer);
