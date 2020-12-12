import React from 'react';
import clsx from 'clsx';
import { withStyles } from "@material-ui/core/styles";
import CssBaseline from '@material-ui/core/CssBaseline';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';

import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import CasesChart from "./CasesChart";
import MapChart from "./MapChart";
import Explainer from './ChartExplanation';
import ReactTooltip from "react-tooltip";
import SimpleMenu from './DropDownMenu';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth = 240;

const styles = (theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: "100%",
  },
});

const covid_data_key_map = {
  "al": "Alabama",
  "ak": "Alaska",
  "az": "Arizona",
  "ar": "Arkansas",
  "ca": "California",
  "co": "Colorado",
  "ct": "Connecticut",
  "de": "Delaware",
  "dc": "Washington",
  "fl": "Florida",
  "ga": "Georgia",
  "hi": "Hawaii",
  "ia": "Iowa",
  "id": "Idaho",
  "il": "Illinois",
  "in": "Indiana",
  "ks": "Kansas",
  "ky": "Kentucky",
  "la": "Louisiana",
  "me": "Maine",
  "md": "Maryland",
  "ma": "Massachusetts",
  "mi": "Michigan",
  "mn": "Minnesota",
  "ms": "Mississippi",
  "mo": "Missouri",
  "mt": "Montana",
  "ne": "Nebraska",
  "nh": "New Hampshire",
  "nj": "New Jersey",
  "nm": "New Mexico",
  "ny": "New York",
  "nc": "North Carolina",
  "nd": "North Dakota",
  "nv": "Nevada",
  "oh": "Ohio",
  "ok": "Oklahoma",
  "or": "Oregon",
  "pa": "Pennsylvania",
  "ri": "Rhode Island",
  "sc": "South Carolina",
  "sd": "South Dakota",
  "tn": "Tennessee",
  "tx": "Texas",
  "ut": "Utah",
  "vt": "Vermont",
  "va": "Virginia",
  "wv": "West Virginia",
  "wi": "Wisconsin",
  "wy": "Wyoming",
  "pr": "Puerto Rico"
}

class Dashboard extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      open: false,
      endDate: new Date(), // Date that we will base our current visuals on
      focusState: "*", // Specifies geo value to select
      content: "",
      covidData: {TOTAL: {}},
      covidScale: null,
      covidDayLag: 3,
      covidStateQuery: "TOTAL",
      explainer: {}
    }

    this.state.endDate.setDate(this.state.endDate.getDate() - 3);

    this.setContent = this.setContent.bind(this);
    this.setDrawerOpen = this.setDrawerOpen.bind(this);
    this.setDateChange = this.setDateChange.bind(this);
    this.getUpdatedCOVIDData = this.getUpdatedCOVIDData.bind(this);
    this.parseCOVIDData = this.parseCOVIDData.bind(this);
    this.createDateArray = this.createDateArray.bind(this);
    this.predictCOVIDCases = this.predictCOVIDCases.bind(this);
    this.setNewState = this.setNewState.bind(this);
  }

  async componentDidMount() {
    this.getUpdatedCOVIDData();
  }

  // Used to set the new content when hovered over
  setContent(new_content) {
    this.setState(() => ({
      content: new_content
    }));
  }

  // Used to handle whether the dashboard is opened or not
  setDrawerOpen(open_state) {
    this.setState(() => ({
      open: open_state
    }));
  }

  setDateChange(newDate) {
    this.setState(() => ({
      endDate: newDate
    }), () => {this.getUpdatedCOVIDData(); this.predictCOVIDCases(this.state.covidDayLag);});
  }

  setNewState(newState) {
    this.setState(() => ({
      covidStateQuery: newState
    }), () => {
      console.log("New State: ", newState);
      if (this.child) {
        if (newState === "TOTAL")
          this.child.renderChart(this.state.covidData[newState])
        else
          this.child.renderChart(this.state.covidData[newState].data)
      }
    })
  }

  async predictCOVIDCases(days) {
    //console.log(this.state.covidData);

    let cases_data = {};
    let case_predict_date = new Date(this.state.endDate);
    case_predict_date.setDate(case_predict_date.getDate() + 1);
    let predict_date = case_predict_date.getFullYear() * 10000 + (case_predict_date.getMonth()+1) * 100 + case_predict_date.getDate()

    // Step 1: Get all the data as a multidimensional array
    Object.keys(this.state.covidData).forEach((key) => {
      if (key !== "TOTAL") {
        let temp = []
        let case_start_date = new Date(this.state.endDate);
        case_start_date.setDate(case_start_date.getDate() - days);
        for (let i = 0; i < days; i++) {
          case_start_date.setDate(case_start_date.getDate() + 1);
          let date_int = case_start_date.getFullYear() * 10000 + (case_start_date.getMonth()+1) * 100 + case_start_date.getDate()
          temp.push(this.state.covidData[key].data[date_int])
        }

        cases_data[key] = temp;
      }
    })
    //console.log("Input: ", cases_data);

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cases: cases_data })
    };

    fetch('/predict_cases', requestOptions)
        .then(response => response.json())
        .then(data => {
          console.log("Results: ", data); 
          let total = 0;
          Object.keys(data.result).forEach((state) => {
            this.state.covidData[state].data[predict_date] = data.result[state]
            total += data.result[state];
          })

          Object.keys(data.explanation).forEach((state) => {
            let text = "similar to the number of COVID-19 cases in the majority of other states";
            
            if (data.explanation[state][0].includes("> 0.07")) {
              text = "greater than the number of COVID-19 cases in many other states"
            }
            else if (data.explanation[state][0].includes("0.01 <")) {
              text = "less than the number of COVID-19 cases in many other states"
            }

            let text2 = "remains relatively the same"
            if (Math.max(data.result[state], ...cases_data[state]) === data.result[state]) {
              text2 = "increase"
            } else if (Math.min(data.result[state], ...cases_data[state]) === data.result[state]) {
              text2 = "decrease"
            }

            this.state.explainer[state] = {
              increase: text2,
              significance: text
            }
          })

          console.log(this.state.explainer);

          this.state.covidData.TOTAL[predict_date] = total;
          // console.log(this.state.covidData);
          this.setNewState(this.state.covidStateQuery);
      })
  }

  getUpdatedCOVIDData() {
    let startDate = new Date(this.state.endDate);
    startDate.setDate( startDate.getDate() - 6) // We need an array of 7 days in total to predict the next day

    let startDateInt = startDate.getFullYear() * 10000 + (startDate.getMonth()+1) * 100 + startDate.getDate(),
    endDateInt = this.state.endDate.getFullYear() * 10000 + (this.state.endDate.getMonth()+1) * 100 + this.state.endDate.getDate()
  
    // For each state, get map the geo_id in the CSV to the state name and then fetch the value
    let data_source = "indicator-combination", 
    signal = "confirmed_7dav_incidence_num", 
    time_type = "day", 
    geo_type = "state",
    time_values = startDateInt.toString()+"-"+endDateInt.toString(),
    geo_value = this.state.focusState,
    url = `https://api.covidcast.cmu.edu/epidata/api.php?source=covidcast&data_source=${data_source}&signal=${signal}&time_type=${time_type}&geo_type=${geo_type}&time_values=${time_values}&geo_value=${geo_value}`;

    console.log(url)
    fetch(url)
      .then(response => response.json())
      .then(data => {this.parseCOVIDData(data.epidata, this.createDateArray(startDate, this.state.endDate))});
  }

  // Helper function to parse the COVID Data
  parseCOVIDData(data, date_arr) {
    let covidData = {};
    console.log(data);
    Object.keys(covid_data_key_map).forEach((key) => {
      let state_data = data.filter(function (element) {
        return element.geo_value === key;
      })

      let dataObj = {}
      state_data.forEach((data) => {
        dataObj[data.time_value] = data.value;
      })

      covidData[key] = {data: dataObj, name: covid_data_key_map[key]}//{data: state_data, cases: sum};
    })

    let total_cases_arr = {};
    date_arr.forEach((date) => {
      let temp_data_arr = []
      Object.values(covidData).forEach((state_arr) => {
        if (date in state_arr.data) {
          temp_data_arr.push(state_arr.data[date]);
        }
      })

      // console.log("Temp_Data_Arr: ", temp_data_arr);

      if (temp_data_arr.length > 0)
        total_cases_arr[date] = temp_data_arr.reduce((a, b) => a + b, 0);
      else
        total_cases_arr[date] = -1
    })
    
    covidData["TOTAL"] = total_cases_arr;
    // console.log(covidData);

    this.setState(() => ({
      covidData: covidData,
    }), () => {if (this.child) {this.child.renderChart(covidData.TOTAL)}
      this.predictCOVIDCases(this.state.covidDayLag);
    })
  }

  createDateArray(startDate, endDate) {
    let date_arr = []
    while (startDate.getTime() <= endDate.getTime()) {
      date_arr.push(startDate.getFullYear() * 10000 + (startDate.getMonth()+1) * 100 + startDate.getDate());
      startDate.setDate(startDate.getDate() + 1);
    }

    console.log(date_arr)
    return date_arr;
  }

  render() {
    const { classes } = this.props;
    const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);
    return (
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              COVID Cases in the U.S.A. Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            <Grid container spacing={3}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <KeyboardDatePicker
              autoOk
              variant="inline"
              inputVariant="outlined"
              label="COVID Results for"
              format="MM/dd/yyyy"
              value={this.state.endDate}
              InputAdornmentProps={{ position: "start" }}
              onChange={(date) => this.setDateChange(date)}/>
              </MuiPickersUtilsProvider>
              {/* Chart */}
              <Grid item xs={12} md={12} lg={12}>
                <Paper className={fixedHeightPaper}>
                  <MapChart setTooltipContent={this.setContent} 
                            covidData={this.state.covidData} 
                            onScaleChange={this.updatedColorScale}
                            dateOfConcern={this.state.endDate.getFullYear() * 10000 + (this.state.endDate.getMonth()+1) * 100 + this.state.endDate.getDate()}/>
                  <ReactTooltip>{this.state.content}</ReactTooltip>
                </Paper>
              </Grid>
              <Grid item xs={12} md={9} lg={8}>
                <Paper className={fixedHeightPaper}>
                  <SimpleMenu setState={this.setNewState}/>
                  <CasesChart onRef={ref => (this.child = ref)}/>
                </Paper>
              </Grid>
              <Grid item xs={12} md={5} lg={4}>
                <Paper className={fixedHeightPaper}>
                  <Explainer state={this.state.covidStateQuery === "TOTAL" ? "TOTAL" : 
                                    covid_data_key_map[this.state.covidStateQuery]} 
                             explainer={this.state.explainer[this.state.covidStateQuery]}/>
                </Paper>
              </Grid>
            </Grid>
            <Box pt={4}>
              <Copyright />
            </Box>
          </Container>
        </main>
      </div>
    );
  }
}

export default withStyles(styles)(Dashboard);