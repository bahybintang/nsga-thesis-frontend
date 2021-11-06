import React from "react";
import {
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Plot from "react-plotly.js";

function ResultAccordion(props) {
  const { result, info } = props;

  return (
    <div>
      {!!result ? (
        <Grid
          container
          align="center"
          justifyContent="center"
          style={{ marginTop: 20 }}
          spacing={2}
        >
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{info}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Plot data={result.data} layout={result.layout} />
            </AccordionDetails>
          </Accordion>
        </Grid>
      ) : (
        <></>
      )}
    </div>
  );
}

export default ResultAccordion;
