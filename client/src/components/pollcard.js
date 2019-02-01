import React from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";

const PollCard = ({ poll }) => (
  <Card raised style={{marginBottom: "2%"}}>
    <CardContent>
      <Link to={`/poll/${poll._id}`} href={`/poll/${poll._id}`}>
        <Typography variant="display1">{poll.title}</Typography>
      </Link>
    </CardContent>
  </Card>
);

export default PollCard;
