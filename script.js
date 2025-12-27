const width = 1000;
const height = 600;

const svg = d3.select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

const url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

fetch(url)
  .then(response => response.json())
  .then(data => {
    // Get unique categories (platforms)
    const categories = data.children.map(d => d.name);

    // Color scale - one color per platform
    const color = d3.scaleOrdinal(d3.schemeSet3).domain(categories);

    // Create hierarchy
    const root = d3.hierarchy(data)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    // Treemap layout
    d3.treemap()
      .size([width, height])
      .paddingInner(3)(root);

    // Draw cells (only leaves)
    const cell = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    // Rectangles
    cell.append("rect")
      .attr("class", "tile")
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("fill", d => color(d.data.category))
      .on("mousemove", (event, d) => {
        tooltip.style("opacity", 0.9)
          .html(`Name: ${d.data.name}<br>Platform: ${d.data.category}<br>Sales: ${d.data.value} million`)
          .attr("data-value", d.data.value)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    // Text labels (split long names across lines)
    cell.append("text")
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g)) // split on camelCase
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 14 + i * 12)
      .text(d => d)
      .style("fill", "white")
      .style("font-size", "11px")
      .style("pointer-events", "none");

    // Legend
    const legend = d3.select("#legend")
      .append("svg")
      .attr("id", "legend")
      .attr("width", width)
      .attr("height", 100);

    const legendItem = legend.selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${100 + i * 120}, 40)`);

    legendItem.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => color(d));

    legendItem.append("text")
      .attr("x", 24)
      .attr("y", 14)
      .text(d => d);
  })
  .catch(err => console.error("Error loading data:", err));
