import createStore from "../src/lib/createStore";

type IState = {
  value?: number;
};

type UpdateAction = {
  value: any;
  type: "UPDATE";
};

const reducer = (state: IState = { value: 0 }, action: UpdateAction) => {
  if (action.type === "UPDATE") return { ...state, value: action.value };
  return state;
};

export default createStore(reducer);
