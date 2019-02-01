import React, { Component } from 'react';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { Link, Route } from "react-router-dom";
import Home from "./home";
import Polls from "./polls"
import CreatePoll from "./createpoll";
import Login from "./login";
import Register from "./register";
import Poll from "./poll";
import Votes from "./votes";

class App extends Component {
  constructor() {
    super();
    this.state = { polls: [], user: null, loading: true };
  }
  async componentDidMount() {
    try {
      const res = await fetch("/sessions", {
         credentials: "include"
      });

      const result = await res.json();
      if (res.status === 200) {
        this.setState({ user: result, loading: false });
      } else if (res.status === 404) {
        this.setState({ loading: false });
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      this.setState({ loading: false, error: "Login failed. Please try again later." });
    }
  }
  loginUser = user => {
    this.setState({ user });
  }
  logoutUser = async () => {
    try {
      await fetch("/logout", {
        method: "POST",
        credentials: "include"
      });

      this.setState({ user: null });
    } catch (e) {
      this.setState({ error: "Logout failed. Please try again later." });
    }
  }
  render() {
    const { polls, user, loading, error } = this.state;
    return (
        <div>
        <AppBar position="static">
          <Toolbar>
            <Link to="/" href="/">
            <Typography variant="display1" style={{color: "white"}}>
              Cast
            </Typography>
          </Link>
          {loading && "Loading..."}
          {user && !loading &&
          <React.Fragment>
            <Link to="/create" href="/create">
            <Typography variant="body1" style={{ color: "white"}}>
              Create Poll
            </Typography>
          </Link>
          <Link to="/" href="/" onClick={this.logoutUser}>
            <Typography variant="body1" style={{ color: "white"}}>
              Logout
            </Typography>
          </Link>
        </React.Fragment>
          }
          {!loading && (
          <Link to="/polls" href="/polls">
            <Typography variant="body1" style={{ color: "white"}}>
              Polls
            </Typography>
          </Link>)
          }
          {!user && !loading &&
            <React.Fragment>
           <Link to="/login" href="/login">
            <Typography variant="body1" style={{ color: "white"}}>
              Login
            </Typography>
          </Link>
          <Link to="/register" href="/register">
            <Typography variant="body1" style={{ color: "white"}}>
              Register
            </Typography>
          </Link>
        </React.Fragment>
          }
          {user && !loading && (
            <Link to="/votes" href="/votes">
              <Typography variant="body1" style={{ color: "white"}}>
                Votes
              </Typography>
            </Link>
          )}
        </Toolbar>
      </AppBar>
      <Route exact path="/" render={() => <Home user={user} loading={loading} />} />
      <Route path="/polls" render={() => <Polls polls={polls} loading={loading} />} />
      <Route path="/create" component={CreatePoll} />
      <Route path="/login" render={(props) => <Login {...props} onLogin={this.loginUser} />} />
      <Route path="/register" render={(props) => <Register {...props} onLogin={this.loginUser} />} />
      <Route path="/poll/:id" render={(props) => <Poll {...props} user={user} />} />
      <Route path="/votes" component={Votes} />
      {error && <Typography variant="body2" color="error">{error}</Typography>}
    </div>
    );
  }
}

export default App;
