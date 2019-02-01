import React from "react";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Polls from "./polls";

const Home = ({ user, loading }) => (
  <div>
    <Paper style={{marginTop: "1%", padding: "1%"}}>
      <Typography variant="display1">
        {loading && "Loading..."}
        {user && !loading && `Welcome, ${user.username}!`}
        {!user && !loading && "Please login or register to create and vote in polls."}
      </Typography>
      {user && !loading && <Typography variant="body2">You can create, vote for and add options to polls.</Typography>}
    </Paper>
    <Typography variant="display2" style={{marginTop: "2%", marginLeft: "1%"}}>Polls</Typography>
    <div style={{width: "98%", margin: "auto"}}>
      <Polls />
    </div>
  </div>
);

export default Home;
