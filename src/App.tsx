import { Component, type ReactNode } from 'react';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { PokemonApp } from './components/PokemonApp';

export default class App extends Component {
  render(): ReactNode {
    return (
      <AppErrorBoundary>
        <PokemonApp />
      </AppErrorBoundary>
    );
  }
}
