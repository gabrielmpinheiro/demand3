import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './admin/router';
import { ContextProvider } from './admin/contexts/ContextProvider';
import '../css/app.css';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
    <React.StrictMode>
        <ContextProvider>
            <RouterProvider router={router} />
        </ContextProvider>
    </React.StrictMode>
);
