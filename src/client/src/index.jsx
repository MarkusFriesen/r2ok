import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import Orders from './Pages/Orders';
import Coupons from './Pages/Coupons';
import reportWebVitals from './reportWebVitals';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


import {
  createHashRouter,
  RouterProvider,
} from "react-router-dom";

const router = createHashRouter([
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
