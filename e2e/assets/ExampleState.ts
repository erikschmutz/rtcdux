import createStore from "../src/lib/createStore";

type IState = {
  messages: string[];
};

type AddAction = {
  message: string;
  type: "ADD";
};

type RemoveAction = {
  message: string;
  type: "REMOVE";
};

type Action = AddAction | RemoveAction;

const reducer = (state: IState = { messages: [] }, action: Action) => {
  if (action.type === "ADD")
    return { ...state, messages: [...state.messages, action.message] };

  if (action.type === "REMOVE")
    return {
      ...state,
      messages: state.messages.filter((message) => message !== action.message),
    };

  return state;
};

export default createStore(reducer);
