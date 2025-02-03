import { createRoot } from 'react-dom/client'; // ✅ Correct import
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import './index.css';
import { Provider } from 'react-redux';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store';

const root = createRoot(document.getElementById('root')); // ✅ Fix: Correct createRoot usage

root.render(
  <Provider store={store}>
    <BrowserRouter basename="/"> 
      <App />
    </BrowserRouter>
  </Provider>
);

reportWebVitals();