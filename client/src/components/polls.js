import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import PollCard from "./pollcard";

class Polls extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, polls: [] }
  }
  async componentDidMount() {
    try {
      const res = await fetch("/polls");
      const polls = await res.json();
      this.setState({ polls, loading: false });
    } catch (e) {
      this.setState({ error: e.message, loading: false });
    }
  }
  render() {
    const { polls, loading, error } = this.state;
    return (
      <Paper elevation={2} style={{marginTop: "1%", backgroundColor: "#eee"}}>
        {loading && <Typography variant="body2">Loading...</Typography>}
        {polls.length > 0 && !loading && polls.map(poll => <PollCard poll={poll} key={poll._id} /> )}
        {polls.length === 0 && !loading && !error && <Typography variant="body2">There are no polls. You can create polls only if you're logged in.</Typography>}
        {error && <Typography variant="body2" color="error">{error}</Typography>}
      </Paper>
    );
  }
}

export default Polls;
