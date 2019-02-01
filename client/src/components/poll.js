import React from "react";
import Typography from "@material-ui/core/Typography";
import Input from "@material-ui/core/Input";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";

class Poll extends React.Component {
  constructor() {
    super();
    this.state = { loading: true, option: "", poll: null, addOption: false };
  }
  async componentDidMount() {
    const { id } = this.props.match.params;
      try {
        const res = await fetch(`/poll/${id}`);
        const poll = await res.json();
        this.setState({ poll, loading: false });
      } catch (e) {
        this.setState({ error: e.message, loading: false });
      }
  }
  handleChange = name => e => {
    this.setState({ [name]: e.target.value });
  }
  handleVote = async () => {
    const { option } = this.state;
    if (!option) {
      return this.setState({ error: "You must supply an option to vote" });
    }

    try {
      const { id } = this.props.match.params;
      const res = await fetch(`/vote/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ option })
      });

      const result = await res.json();
      if (res.status === 201 && !result.error) {
        this.setState({ poll: result });
      } else {
        throw new Error(result.error);
      }
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  addOption = async () => {
    const { newOption } = this.state;
    const { id } = this.props.match.params;
    if (!newOption) {
      return this.setState({ error: "Option cannot be empty" });
    }

    try {
      const res = await fetch(`/poll/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newOption })
      });
      const result = await res.json();

      if (res.status === 201) {
        this.setState({ poll: result, addOption: false });
      } else {
        throw new Error(result.error);
      }

    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  deletePoll = async () => {
    try {
      const { id } = this.props.match.params;
      const { user } = this.props;

      const res = await fetch(`/delete/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
      });

      if (res.status === 202) {
        this.props.history.push("/polls");
      } else {
        const result = await res.json();
        throw new Error(result.error);
      }
    } catch (e) {
      this.setState({ error: e.message });
    }
  }
  toggleInput = () => {
    this.setState({ addOption: !this.state.addOption });
  }
  render() {
    const { addOption, loading, poll, option, error } = this.state;
    const { user } = this.props;
    return (
      <div style={{display: "flex", marginTop: "1%", flexDirection: "column", alignItems: "center"}}>
        {loading && !poll && <Typography variant="body2">Loading...</Typography>}
        {poll && !loading && [<Typography variant="display1" key={poll.title}>{poll.title}</Typography>,
                   <Typography variant="body1" key={poll.author.username}>Created by: {poll.author.username}</Typography>,
                   <Typography variant="body2" key={poll.votes.length}>{poll.votes.length} Votes</Typography>,
        <form method="POST" action={`/vote/${poll._id}`} key={poll._id} style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "22%", marginTop: "2%"}}>
          <FormControl>
            <Select value={option} onChange={this.handleChange("option")} input={<Input name="options" id="options" />}>
              {poll.options.map(option => (
                <MenuItem value={option} key={option}>{option}</MenuItem>
              ))}
            </Select>
            <FormHelperText>Pick an Option</FormHelperText>
          </FormControl>
          <Button variant="contained" onClick={this.handleVote} style={{marginTop: "5%"}}>Vote</Button>
        </form>]
        }
        {poll && user && !loading && poll.author.username === user.username && <Button onClick={this.deletePoll}>Delete</Button>}
        {!addOption && !loading && <Button variant="contained" onClick={this.toggleInput} style={{marginTop: "2%"}}>Add Option</Button>}
        {addOption && !loading && <form method="post" action="" style={{display: "flex", justifyContent: "center", flexDirection: "column", width: "22%", marginTop: "2%"}}>
          <TextField label="New Option" margin="dense" id="newOption" required placeholder="New Option..." onChange={this.handleChange("newOption")} />
          <Button variant="contained" onClick={this.addOption}>Add</Button>
        </form>}
        {error && <Typography variant="body2" color="error">{error}</Typography> }
      </div>
    );
  }
}

export default Poll;
