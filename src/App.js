import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from "d3";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selected_data: [],
      sentimentColors: { positive: "green", negative: "red", neutral: "gray" },
    };
  }
  componentDidMount() {
    this.renderChart();
  }
  componentDidUpdate() {
    this.renderChart();
  }
  set_data = (csv_data) => {
    this.setState({ data: csv_data });
  };

  renderChart = () => {
    var margin = { left: 50, right: 150, top: 10, bottom: 10 },
      width = 500,
      height = 300;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;

    var data = this.state.data;
    const svg = d3.select("svg").attr("width", width).attr("height", height);
    const circles = d3
      .select(".innerChart")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimension1 = this.state.data.map((d) => d["Dimension 1"]);
    const dimension2 = this.state.data.map((d) => d["Dimension 2"]);

    const xScale = d3.scaleLinear().domain([d3.min(dimension1), d3.max(dimension1)]).range([0, innerWidth]);
      
    const yScale = d3.scaleLinear().domain([d3.min(dimension2), d3.max(dimension2)]).range([0, innerHeight]);

    circles
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => xScale(d["Dimension 1"]))
      .attr("cy", (d) => yScale(d["Dimension 2"]))
      .attr("r", 5)
      .attr("fill", (d) => this.state.sentimentColors[d.PredictedSentiment]);

    const legendX = width - margin.right + 20;
    const legendY = margin.top + 20;

    if (this.state.data.length > 0) {
      [["red", legendY + 20, "negative"],
       ["green", legendY, "positive"],
       ["gray", legendY + 40, "neutral"]
      ].forEach(([color, yPos, label]) => {
        svg.append("circle")
           .attr("cx", legendX)
           .attr("cy", yPos)
           .attr("r", 4)
           .style("fill", color);
    
        svg.append("text")
           .attr("x", legendX + 10)
           .attr("y", yPos + 5)
           .text(label);
      });
    }    

    var brush = d3.brush().on("start brush", (e) => {
      var selected_tweets = data.filter((item) => {
        return (
          xScale(item["Dimension 1"]) >= e.selection[0][0] &&
          xScale(item["Dimension 1"]) <= e.selection[1][0] &&
          yScale(item["Dimension 2"]) >= e.selection[0][1] &&
          yScale(item["Dimension 2"]) <= e.selection[1][1]
        );
      });
      this.setState({ selected_data: selected_tweets });
      console.log(selected_tweets);
    });

    d3.select("g").call(brush);
  };

  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item">
            <h2>Projected Tweets</h2>
            <svg className="selectionChart">
              <g className="innerChart"></g>
            </svg>
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2>
            {this.state.selected_data.map((item) => (
              <p
                style={{
                  color: this.state.sentimentColors[item["PredictedSentiment"]],
                }}
              >
                {item["Tweets"]}
              </p>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
