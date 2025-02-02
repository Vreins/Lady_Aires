import { SAVED_ADD_ITEM, SAVED_REMOVE_ITEM } from '../constants/savedConstants';

export const savedReducer = (state = { cartItems: [] }, action) => {
  switch (action.type) {
    case SAVED_ADD_ITEM:
      const item = action.payload;
      const existItem = state.savedItems.find((x) => x.product === item.product);
      if (existItem) {
        return {
          ...state,
          savedItems: state.savedItems.map((x) =>
            x.product === existItem.product ? item : x
          ),
        };
      } else {
        return { ...state, savedItems: [...state.savedItems, item] };
      }
      case SAVED_REMOVE_ITEM:
        return {
          ...state,
          savedItems: state.savedItems.filter((x) => x.product !== action.payload),
        };
    default:
      return state;
  }
};