import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Daily, Home } from "src/components";

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/daily">
          <Daily />
        </Route>
      </Switch>
    </Router>
  );
}
