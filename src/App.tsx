import { Component, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

export default class App extends Component {
  render(): ReactNode {
    return (
      <BrowserRouter>
        <AppErrorBoundary>
          <AppRoutes />
        </AppErrorBoundary>
      </BrowserRouter>
    );
  }
}
