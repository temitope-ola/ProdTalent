import { jsx as _jsx } from "react/jsx-runtime";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
// Import des contextes nécessaires
import { AuthProvider } from './contexts/AuthContext';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }));
