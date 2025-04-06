import 'reflect-metadata'
import './App.css';
import { HologyScene } from '@hology/react'
import shaders from './shaders'
import actors from './actors'
import Game from './services/game'
import Dialogue from './Dialogue';

function App() {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const scene = params.get('scene') ?? 'main';

  return (
    <HologyScene gameClass={Game} sceneName={scene} dataDir='data' shaders={shaders} actors={actors} rendering={{maxPixelRatio: 1, resolutionScale: 1}}>
      <Dialogue/>
    </HologyScene>
  );
}

export default App;