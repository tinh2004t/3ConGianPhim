import PropTypes from "prop-types";
import { TimelineConnector, TimelineContent, TimelineDot, TimelineItem as MuiTimelineItem, TimelineSeparator } from "@mui/lab";
import { Typography, Icon } from "@mui/material";
import Box from "@mui/material/Box";

function TimelineItem({ color, icon, title, dateTime, lastItem }) {
  return (
    <MuiTimelineItem>
      <TimelineSeparator>
        <TimelineDot color={color}>
          <Icon>{icon}</Icon>
        </TimelineDot>
        {!lastItem && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent>
        <Box mb={0.5}>
          <Typography variant="subtitle2" fontWeight="bold">
            {title}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          {dateTime}
        </Typography>
      </TimelineContent>
    </MuiTimelineItem>
  );
}

TimelineItem.propTypes = {
  color: PropTypes.oneOf([
    "grey", "inherit", "primary", "secondary", "error", "info", "success", "warning"
  ]),
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  dateTime: PropTypes.string.isRequired,
  lastItem: PropTypes.bool,
};

TimelineItem.defaultProps = {
  color: "grey",
  lastItem: false,
};

export default TimelineItem;
