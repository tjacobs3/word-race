import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Splash from './components/splash';
import 'bootstrap/dist/css/bootstrap.css';
import './App.scss';
import Game from './components/holdem/game';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/game/:id">
          <Game />
        </Route>
        <Route path="/">
          <Splash />
        </Route>
      </Switch>
    </Router>

  );
}

export default App;
