import Axios from 'axios';
import { SAVED_ADD_ITEM,SAVED_REMOVE_ITEM } from '../constants/savedConstants';

export const addToSavedItem = (productId, qty) => async (dispatch, getState) => {
  const { data } = await Axios.get(`https://lady-aires-wc74.onrender.com/api/products/${productId}`);
  dispatch({
    type: SAVED_ADD_ITEM,
    payload: {
        name: data.name,
        images: data.images,
        price: data.price,
        countInStock: data.countInStock,
        product: data._id,
        seller:data.seller,
        qty,
      },
  });
  localStorage.setItem('savedItems', JSON.stringify(getState().saved.savedItems));
};



export const removeFromSaved = (productId) => (dispatch, getState) => {
    dispatch({ type: SAVED_REMOVE_ITEM, payload: productId });
    localStorage.setItem('savedItems', JSON.stringify(getState().saved.savedItems));
  };