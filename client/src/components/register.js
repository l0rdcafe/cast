import React from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import validator from "validator";

class Register extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  handleChange = name => e => {
    this.setState({ [name]: e.target.value });
  }
  handleSubmit = async () => {
    const { username, email, password, passwordConfirm } = this.state;

    if (!username) {
      return this.setState({ error: "Username cannot be empty" });
    }

    if (!password) {
      return this.setState({ error: "Password cannot be empty" });
    }

    if (!passwordConfirm) {
      return this.setState({ error: "Confirm password field cannot be empty" });
    }

    if (!email) {
      return this.setState({ error: "Email cannot be empty" });
    }

    if (!validator.isEmail(email)) {
      return this.setState({ error: "Invalid email address" });
    }

    if (password !== passwordConfirm) {
      return this.setState({ error: "Passwords do not match" });
    }

    try {
      const res = await fetch("/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, email, passwordConfirm })
      });

      const result = await res.json();
      if (res.status === 200) {
        this.props.history.push("/");
        this.props.onLogin(result);
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
      <div style={{display: "flex", alignItems: "center", flexDirection: "column", marginTop: "1%"}}>
        <form method="POST" action="/register" style={{display: "flex", flexDirection: "column", width: "50%"}}>
          <TextField id="username" margin="dense" required onChange={this.handleChange("username")} label="Username" placeholder="Enter username..." />
          <TextField id="email" margin="dense" required onChange={this.handleChange("email")} label="Email Address" placeholder="Enter email..." />
          <TextField type="password" id="password" margin="dense" required onChange={this.handleChange("password")} label="Password" placeholder="Enter password..." />
          <TextField type="password" id="passwordConfirm" margin="dense" required onChange={this.handleChange("passwordConfirm")} label="Confirm Password" placeholder="Enter password confirmation..." />
          <Button variant="contained" onClick={this.handleSubmit}>Register</Button>
        </form>
        <div style={{marginTop: "4%"}}>
          {error && <Typography variant="body1" color="error">{error}</Typography>}
        </div>
      </div>
    );
  }
}

export default Register;
