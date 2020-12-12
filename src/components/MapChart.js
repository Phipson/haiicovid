import React, { memo } from "react";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography
} from "react-simple-maps";
import { scaleQuantize } from "d3-scale";
import Color from 'color';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend'

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const rounded = num => {
  return Math.round(num / 10) / 100;
};

const createColorScale = (covidData, colorNum) => {
  let temp = [];
  Object.values(covidData).forEach((element) => {
    if (element.value)
      temp.push(element.value);
  });

  //console.log(temp);
  let maxValue = temp.reduce((max, p) => p > max ? p : max, temp[0]);

  let range = [];
  let increments = 1/colorNum;
  for (let i = 0; i < colorNum; i++) {
    range.push(Color({h: 0, s: 80 * (i * increments), l: 70 * (1 - i * increments) + 20}, "hsl").string());
  }

  //console.log(range);

  return scaleQuantize()
  .domain([0, maxValue])
  .range(range);
}

const fetchDateData = (data, dateOfConcern) => {
  let date_data = [];
  //console.log(dateOfConcern);
  Object.values(data).forEach((state_info) => {
    if (state_info.data) {
      if (dateOfConcern in state_info.data) {
        date_data.push({value: state_info.data[dateOfConcern], name: state_info.name});
      }
    }
  });

  console.log("Date data: ", date_data);
  return date_data;
}

function legend({
  color,
  title,
} = {}) {

    var svg = d3.select(".svgLegend");

    svg.attr("style", "height: 50vh; position: absolute; top: 0; right: 0; background-color: white; border-style: solid; border-color: black")

    svg.append("g")
    .attr("class", "legendQuant")
    .attr("style", "width: 100%; height: 100%")
    .attr("transform", "translate(20,20)");

    var legend = legendColor()
    .labelFormat(d3.format(".0f"))
    .title(title)
    .titleWidth(250)
    .scale(color);

    svg.select(".legendQuant")
    .call(legend);
}

const MapChart = ({ setTooltipContent, covidData, dateOfConcern, onScaleChange }) => {
  console.log("Map Chart JS Data: ", covidData);

  let dataToday = fetchDateData(covidData, dateOfConcern);

  // Change scaleQuantize() based on the range of values
  let colorScale = createColorScale(dataToday, 20);
  return (
    <div style={{position: "relative"}}>
      <svg className="svgLegend"/>
      {legend({color: colorScale, title: "COVID Cases Legend"})}
      <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const cur = dataToday.find(s => s.name === geo.properties.name);
                const val = rounded(cur ? cur.value : 0);

                return (<Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onMouseEnter={() => {
                    const { name } = geo.properties;
                    setTooltipContent(`${name} - ${cur ? val + "K Cases" : "No data found from COVIDCast"}`);
                  }}
                  onMouseLeave={() => {
                    setTooltipContent("");
                  }}
                  style={{
                    default: {
                      fill: cur ? colorScale(cur.value) : "#000000",
                      outline: "none"
                    },
                    hover: {
                      fill: "#F53",
                      outline: "none"
                    },
                    pressed: {
                      fill: "#E42",
                      outline: "none"
                    }
                  }}/>
              )})
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(MapChart);