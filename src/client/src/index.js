import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import Orders from './Pages/Orders';
import Coupons from './Pages/Coupons';
import reportWebVitals from './reportWebVitals';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    
    children: [
      {
        path: "orders",
        element: <Orders />,
      },
      {
        path: "coupons",
        element: <Coupons />,
      },
    ],
  },
]);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<RouterProvider router={router} />)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
