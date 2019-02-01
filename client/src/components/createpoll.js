import React from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

class CreatePoll extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  handleChange = name => e => {
    this.setState({ [name]: e.target.value });
  }
  handleSubmit = async () => {
     const { title, options } = this.state;

     if (!title) {
       return this.setState({ error: "Poll must have a title" });
     }

     if (!options) {
       return this.setState({ error: "Poll must have options" });
     }

     try {
       const res = await fetch("/create", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ title, options }),
         credentials: "include"
       });

       const result = await res.json();
       if (res.status === 201 && !result.error) {
         this.props.history.push(`/poll/${result.id}`);
       } else {
         throw new Error(result.error);
       }

    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  render() {
    const { title, options, error } = this.state;
    return (
      <div style={{display: "flex", justifyContent: "center", marginTop: "1%"}}>
      <form method="POST" action="/create" style={{display: "flex", flexDirection: "column", width: "50%"}}>
        <TextField id="title" required label="Poll Title" value={title} onChange={this.handleChange("title")} placeholder="Poll Title" margin="dense" />
        <TextField id="options" required label="Poll Options" value={options} onChange={this.handleChange("options")} multiline rows="8" margin="dense" placeholder="Please provide options for the poll separated by a '/'" />
        <Button variant="contained" onClick={this.handleSubmit}>Submit</Button>
      </form>
      {error && <Typography variant="body2" color="error">{error}</Typography> }
    </div>
    );
  }
}

export default CreatePoll;
