import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './client/router';
import { ContextProvider } from './client/contexts/ContextProvider';
import '../css/app.css';

ReactDOM.createRoot(document.getElementById('client-root')).render(
    <React.StrictMode>
        <ContextProvider>
            <RouterProvider router={router} />
        </ContextProvider>
    </React.StrictMode>
);
