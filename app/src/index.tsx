import React from "react";
import assert from "assert";
import { render, unmountComponentAtNode } from "react-dom";
import { Router, Switch, Route } from "react-router-dom";

import { createBrowserHistory } from "history";

const history = createBrowserHistory({});

const appRootNode = document.getElementById("root");
assert(appRootNode, "Root node must be a valid DOM element.");

function renderTo(mountNode: HTMLElement) {
  render(
    <Router history={history}>
      <Switch>
        <Route path="/login" render={() => <div>login</div>} />
        <Route
          path="/logout"
          component={() => (
            <div>logout</div>
          )}
        />
        <Route
          path="/"
          component={() => (
            <div>index</div>
          )}
        />
      </Switch>
    </Router>,
    mountNode
  );
}

renderTo(appRootNode);

if (import.meta.hot) {
  import.meta.hot.accept("./Routes", function () {
    unmountComponentAtNode(appRootNode);
    renderTo(appRootNode);
  });
}
