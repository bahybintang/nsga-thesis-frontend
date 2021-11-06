import React from "react";
import { LinearProgress, Box, Grid, Typography } from "@material-ui/core";

function Loading(props) {
  const { status, gaProgress, progressInfo } = props;

  return (
    <div>
      {status === "ga-begin" || status === "ga-end" ? (
        <Grid
          container
          align="center"
          justifyContent="center"
          style={{ marginTop: 20 }}
        >
          <Grid item lg={10}>
            <Box>{progressInfo}</Box>
            <Box display="flex" alignItems="center">
              <Box width="100%" mr={1}>
                <LinearProgress variant="determinate" value={gaProgress} />
              </Box>
              <Box minWidth={35}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                >{`${Math.round(gaProgress)}%`}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}

      {status.startsWith("generate-best") ? (
        <Grid
          container
          align="center"
          justifyContent="center"
          style={{ marginTop: 20 }}
        >
          <Grid item lg={10}>
            <Box>{progressInfo}</Box>
            <Box display="flex" alignItems="center">
              <Box width="100%">
                <LinearProgress />
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </div>
  );
}

export default Loading;
