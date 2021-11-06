import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  Container,
  Checkbox,
  Card,
  FormControl,
  Input,
  InputLabel,
  FormHelperText,
  Grid,
  Button,
} from "@material-ui/core";
import SortIcon from "@material-ui/icons/ArrowDownward";
import { io } from "socket.io-client";
import Loading from "./components/Loading.js";
import ResultAccordion from "./components/ResultAccordion.js";
import ConfirmationDialog from "./components/ConfirmationDialog.js";
import "./App.css";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const socket = io(SOCKET_URL, {
  transports: ["websocket","polling"],
});

const columns = [
  {
    name: "ID",
    selector: "id",
    sortable: true,
  },
  {
    name: "Length",
    selector: "length",
    sortable: true,
  },
  {
    name: "Width",
    selector: "width",
    sortable: true,
  },
  {
    name: "Height",
    selector: "height",
    sortable: true,
  },
  {
    name: "Weight",
    selector: "weight",
    sortable: true,
  },
];

const isIndeterminate = (indeterminate) => indeterminate;
const selectableGridsComponentProps = { indeterminate: isIndeterminate };

function App() {
  const [boxes, setBoxes] = useState([]);
  const [gaParams, setGaParams] = useState({
    grid_x: 20,
    grid_y: 20,
    grid_z: 20,
    mutation_probability: 0.02,
    max_generation: 100,
    population_size: 100,
  });
  const [boxData, setBoxData] = useState({
    length: 5,
    width: 5,
    height: 5,
    weight: 5,
  });
  const [bestFitness, setBestFitness] = useState();
  const [bestCenterOfMass, setBestCenterOfMass] = useState();
  const [bestVolume, setBestVolume] = useState();
  const [bestWeight, setBestWeight] = useState();
  const [gaProgress, setGaProgress] = useState(0);
  const [progressInfo, setProgressInfo] = useState("");
  const [status, setStatus] = useState("");
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  // Socket handler
  const socketHandleGaProgress = (e) => {
    const { n, total, elapsed } = e;
    setGaProgress(Math.floor((n / total) * 100));
    setProgressInfo(`Generation ${n}  |  Elapsed time: ${elapsed}s`);
  };

  const socketHandleStatus = (e) => {
    const { status, graph } = e;
    setStatus(status);
    console.log(status);
    switch (status) {
      case "generate-best-fitness-end":
        setBestFitness(JSON.parse(graph));
        break;
      case "generate-best-center_of_mass-end":
        setBestCenterOfMass(JSON.parse(graph));
        break;
      case "generate-best-volume-end":
        setBestVolume(JSON.parse(graph));
        break;
      case "generate-best-weight-end":
        setBestWeight(JSON.parse(graph));
        break;
      case "generate-best-fitness-begin":
        setProgressInfo("Generating Best Individual by Fitness Plot");
        break;
      case "generate-best-center_of_mass-begin":
        setProgressInfo("Generating Best Individual by Center of Mass Plot");
        break;
      case "generate-best-volume-begin":
        setProgressInfo("Generating Best Individual by Volume Plot");
        break;
      case "generate-best-weight-begin":
        setProgressInfo("Generating Best Individual by Weight Plot");
        break;
      case "ga-begin":
        setProgressInfo("Begin Genetic Algorithm");
        break;
      case "ga-end":
        setProgressInfo("End Genetic Algorithm");
        break;
      case "done":
        setProgressInfo("Done!");
        break;
      default:
        break;
    }
  };

  const socketHandleConnectResponse = (e) => {
    console.log(e.data);
  };

  // Socket listener
  useEffect(() => {
    socket.on("connect-response", socketHandleConnectResponse);
    socket.on("status", socketHandleStatus);
    socket.on("ga-progress", socketHandleGaProgress);
  }, []);

  const handleChangeBoxData = (event) => {
    setBoxData({
      ...boxData,
      [event.target.name]: parseInt(event.target.value),
    });
  };

  const handleChangeGaParams = (event) => {
    setGaParams({
      ...gaParams,
      [event.target.name]: parseInt(event.target.value),
    });
  };

  const handleRandomize = () => {
    setBoxData({
      length: Math.floor(Math.random() * 10) + 1,
      width: Math.floor(Math.random() * 10) + 1,
      height: Math.floor(Math.random() * 10) + 1,
      weight: Math.floor(Math.random() * 10) + 1,
    });
  };

  const handleAddBox = () => {
    const maxId = boxes.reduce(
      (prev, current) => (prev.id > current.id ? prev.id : current.id),
      0
    );

    setBoxes([...boxes, { ...boxData, id: maxId + 1 }]);
  };

  const doGeneticAlgorithm = () => {
    socket.emit("data-in", {
      boxes: boxes.map((e) => [e.id, e.length, e.width, e.height, e.weight]),
      ...gaParams,
    });
    setBestFitness("");
    setBestCenterOfMass("");
    setBestVolume("");
    setBestWeight("");
  };

  const handleStartGeneticAlgorithm = () => {
    const totalBoxesVolume = boxes.reduce(
      (prev, current) => prev + current.length * current.width * current.height,
      0
    );
    const containerVolume = gaParams.grid_x * gaParams.grid_y * gaParams.grid_z;
    if (totalBoxesVolume / containerVolume < 0.8) {
      setConfirmationDialogOpen(true);
    } else {
      doGeneticAlgorithm();
    }
  };

  const handleConfirmationAgree = () => {
    setConfirmationDialogOpen(false);
    doGeneticAlgorithm();
  };

  const handleConfirmationDisagree = () => {
    setConfirmationDialogOpen(false);
  };

  return (
    <div className="App">
      <Container>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          style={{ marginBottom: 20 }}
          spacing={2}
        >
          <Grid item md={10}>
            <Card>
              <DataTable
                title="Box Data"
                columns={columns}
                data={boxes}
                defaultSortField="id"
                sortIcon={<SortIcon />}
                pagination
                selectableGrids
                selectableGridsComponent={Checkbox}
                selectableGridsComponentProps={selectableGridsComponentProps}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container align="center" spacing={2} justifyContent="center">
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="box-length">Length</InputLabel>
              <Input
                id="box-length"
                value={boxData.length}
                name="length"
                onChange={handleChangeBoxData}
                aria-describedby="box-length-helper"
                type="number"
              />
              <FormHelperText id="box-length-helper">
                The length of box
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="box-width">Width</InputLabel>
              <Input
                id="box-width"
                value={boxData.width}
                name="width"
                onChange={handleChangeBoxData}
                aria-describedby="box-width-helper"
                type="number"
              />
              <FormHelperText id="box-width-helper">
                The width of box
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="box-height">Height</InputLabel>
              <Input
                id="box-height"
                value={boxData.height}
                name="height"
                onChange={handleChangeBoxData}
                aria-describedby="box-height-helper"
                type="number"
              />
              <FormHelperText id="box-height-helper">
                The height of box
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="box-weight">Weight</InputLabel>
              <Input
                id="box-weight"
                value={boxData.weight}
                name="weight"
                onChange={handleChangeBoxData}
                aria-describedby="box-weight-helper"
                type="number"
              />
              <FormHelperText id="box-weight-helper">
                The weight of box
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <Button
              variant="contained"
              color="default"
              onClick={handleRandomize}
              style={{ marginTop: 5 }}
            >
              Randomize
            </Button>
          </Grid>
          <Grid item lg={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddBox}
              style={{ marginTop: 5 }}
            >
              Add Box
            </Button>
          </Grid>
        </Grid>
        <Grid
          container
          align="center"
          justifyContent="center"
          style={{ marginTop: 20 }}
          spacing={2}
        >
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="grid_x">Container Length</InputLabel>
              <Input
                id="grid_x"
                value={gaParams.grid_x}
                name="grid_x"
                onChange={handleChangeGaParams}
                aria-describedby="grid_x-helper"
                type="number"
              />
              <FormHelperText id="grid_x-helper">
                The length of container
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="grid_y">Container Width</InputLabel>
              <Input
                id="grid_y"
                value={gaParams.grid_y}
                name="grid_y"
                onChange={handleChangeGaParams}
                aria-describedby="grid_y-helper"
                type="number"
              />
              <FormHelperText id="grid_y-helper">
                The width of container
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="grid_x">Container Height</InputLabel>
              <Input
                id="grid_z"
                value={gaParams.grid_z}
                name="grid_z"
                onChange={handleChangeGaParams}
                aria-describedby="grid_z-helper"
                type="number"
              />
              <FormHelperText id="grid_z-helper">
                The height of container
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="mutation-probability">
                Mutation Probability
              </InputLabel>
              <Input
                id="mutation-probability"
                value={gaParams.mutation_probability}
                name="mutation_probability"
                onChange={handleChangeGaParams}
                aria-describedby="mutation-probability-helper"
                type="number"
              />
              <FormHelperText id="mutation-probability-helper">
                The mutation probability of Genetic Algorithm
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="population-size">Population Size</InputLabel>
              <Input
                id="population-size"
                value={gaParams.population_size}
                name="population_size"
                onChange={handleChangeGaParams}
                aria-describedby="population-size-helper"
                type="number"
              />
              <FormHelperText id="population-size-helper">
                The population size of of Genetic Algorithm
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid item lg={2}>
            <FormControl>
              <InputLabel htmlFor="max-generation">
                Maximum Generation
              </InputLabel>
              <Input
                id="max-generation"
                value={gaParams.max_generation}
                name="max_generation"
                onChange={handleChangeGaParams}
                aria-describedby="max-generation-helper"
                type="number"
              />
              <FormHelperText id="max-generation-helper">
                The maximum generation of Genetic Algorithm
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        <Grid
          container
          align="center"
          justifyContent="center"
          style={{ marginTop: 20 }}
        >
          <Grid item lg={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleStartGeneticAlgorithm}
            >
              Start Genetic Algorithm
            </Button>
          </Grid>
        </Grid>

        <ConfirmationDialog
          open={confirmationDialogOpen}
          handleAgree={handleConfirmationAgree}
          handleDisagree={handleConfirmationDisagree}
        />

        <Loading
          status={status}
          gaProgress={gaProgress}
          progressInfo={progressInfo}
        />

        <ResultAccordion
          result={bestFitness}
          info="Individual with Best Fitness"
        />

        <ResultAccordion
          result={bestCenterOfMass}
          info="Individual with Best Center of Mass"
        />

        <ResultAccordion
          result={bestVolume}
          info="Individual with Best Volume Utilization"
        />

        <ResultAccordion
          result={bestWeight}
          info="Individual with Best Total Weight"
        />
      </Container>
    </div>
  );
}

export default App;
