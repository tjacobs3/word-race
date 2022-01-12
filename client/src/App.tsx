import {
  BrowserRouter as Router,
  Switch,
  Route
} from 'react-router-dom';

import Splash from './components/splash';
import 'bootstrap/dist/css/bootstrap.css';
import './App.scss';
import Game from './components/word_race/game';
import JoinGame from './components/join_game';

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/game/:id">
          <Game />
        </Route>
        <Route path="/join/:id">
          <JoinGame />
        </Route>
        <Route path="/">
          <Splash />
        </Route>
      </Switch>
    </Router>

  );
}

export default App;
