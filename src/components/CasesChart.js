import React, { Component } from "react";
import CanvasJSReact from '../canvasjs.react';
let CanvasJS = CanvasJSReact.CanvasJS;
let CanvasJSChart = CanvasJSReact.CanvasJSChart;

const rounded = num => {
    return Math.round(num / 1) / 1;
  };

export default class CasesChart extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPoints: [],
        }

        this.renderChart = this.renderChart.bind(this);
    }
 
	render() {	
		let options = {
			theme: "light2",
			title: {
				text: "COVID Cases over the past Week"
			},
			axisY: {
				title: "Cases",
				prefix: ""
			},
			data: [{
				type: "line",
				xValueFormatString: "MMM-DD-YYYY",
				yValueFormatString: "#",
				dataPoints: this.state.dataPoints
			}]
        }
		return (
		<div>
			<CanvasJSChart options = {options} 
				 onRef={ref => this.chart = ref}
			/>
			{/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
		</div>
		);
    }
    
    componentDidMount() {
        this.props.onRef(this);
    }
    
    renderChart(covidData) {
        console.log("Cases Chart JS: ", covidData);
        var chart = this.chart;
        let temp = []
        Object.keys(covidData).forEach((element) => {
            //console.log(element);
            //console.log(rounded(element/10000), rounded((element%10000)/100)-1, element%100);
            let cases = covidData[element];
            temp.push({
                x: new Date(rounded(element/10000), rounded((element%10000)/100)-1, element%100),
                y: cases >= 0 ? cases : null
            });
        })
        
        this.setState(() => ({
            dataPoints: temp
        }), chart.render());
    }
}