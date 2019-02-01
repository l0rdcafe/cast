import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

class Login extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  handleChange = name => e => {
    this.setState({ [name]: e.target.value });
  }
  handleSubmit = async () => {
    const { username, password } = this.state;
    if (!username) {
      return this.setState({ error: "Username cannot be empty" });
    }

    if (!password) {
      return this.setState({ error: "Password cannot be empty" });
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });

      const result = await res.json();


      if (res.status === 200 && !result.error) {
        this.props.history.push("/");
        this.props.onLogin({ ...result });
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  render() {
    const { error } = this.state;
    return (
      <div style={{marginTop: "1%", display: "flex", alignItems: "center", flexDirection: "column"}}>
        <form method="POST" action="/login" style={{display: "flex", flexDirection: "column", width: "22%"}}>
          <TextField label="Username" margin="dense" id="username" required placeholder="Enter your username..." onChange={this.handleChange("username")} />
          <TextField label="Password" margin="dense" id="password" required type="password" placeholder="Enter your password..." onChange={this.handleChange("password")} />
          <Button variant="contained" onClick={this.handleSubmit}>Login</Button>
        </form>
        <div style={{marginTop: "4%"}}>
          {error && <Typography variant="body1" color="error">{error}</Typography>}
        </div>
      </div>
    );
  }
}

export default Login;
