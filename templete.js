// 2.1 SIDE-BY-SIDE BOXPLOT

d3.csv("socialMedia.csv").then(function (data) {
  data.forEach(d => d.Likes = +d.Likes);

  const margin = { top: 40, right: 40, bottom: 60, left: 60 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#boxplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain([...new Set(data.map(d => d.AgeGroup))])
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Likes)])
    .nice()
    .range([height, 0]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  svg.append("g").call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .text("Age Group");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Likes");

  const rollupFunction = function (groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    return {
      min: d3.min(values),
      q1: d3.quantile(values, 0.25),
      median: d3.quantile(values, 0.5),
      q3: d3.quantile(values, 0.75),
      max: d3.max(values)
    };
  };

  const grouped = d3.rollup(data, rollupFunction, d => d.AgeGroup);

  grouped.forEach((q, group) => {
    const xPos = x(group);
    const boxWidth = x.bandwidth();

    // Vertical line
    svg.append("line")
      .attr("x1", xPos + boxWidth / 2)
      .attr("x2", xPos + boxWidth / 2)
      .attr("y1", y(q.min))
      .attr("y2", y(q.max))
      .attr("stroke", "#333");

    // Box
    svg.append("rect")
      .attr("x", xPos)
      .attr("y", y(q.q3))
      .attr("width", boxWidth)
      .attr("height", y(q.q1) - y(q.q3))
      .attr("fill", "#8fd19e")
      .attr("stroke", "#333");

    // Median
    svg.append("line")
      .attr("x1", xPos)
      .attr("x2", xPos + boxWidth)
      .attr("y1", y(q.median))
      .attr("y2", y(q.median))
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  });
});

// 2.2 SIDE-BY-SIDE BAR PLOT

d3.csv("socialMediaAvg.csv").then(function (data) {
  data.forEach(d => d.AvgLikes = +d.AvgLikes);

  const margin = { top: 40, right: 40, bottom: 70, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#barplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const platforms = [...new Set(data.map(d => d.Platform))];
  const postTypes = [...new Set(data.map(d => d.PostType))];

  const x0 = d3.scaleBand().domain(platforms).range([0, width]).padding(0.2);
  const x1 = d3.scaleBand().domain(postTypes).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height, 0]);
  const color = d3.scaleOrdinal().domain(postTypes).range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

  svg.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x0));
  svg.append("g").call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 55)
    .attr("text-anchor", "middle")
    .text("Platform");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  const grouped = d3.group(data, d => d.Platform);

  grouped.forEach((vals, key) => {
    const group = svg.append("g").attr("transform", `translate(${x0(key)},0)`);

    group.selectAll("rect")
      .data(vals)
      .enter()
      .append("rect")
      .attr("x", d => x1(d.PostType))
      .attr("y", d => y(d.AvgLikes))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.AvgLikes))
      .attr("fill", d => color(d.PostType));
  });

  const legend = svg.append("g").attr("transform", `translate(${width - 120}, 0)`);
  postTypes.forEach((type, i) => {
    legend.append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));

    legend.append("text")
      .attr("x", 22)
      .attr("y", i * 20 + 12)
      .text(type)
      .attr("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });
});

// 2.3 LINE PLOT

d3.csv("SocialMediaTime.csv").then(function (data) {
  data.forEach(d => d.AvgLikes = +d.AvgLikes);

  const margin = { top: 40, right: 40, bottom: 80, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

  const svg = d3.select("#lineplot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scalePoint().domain(data.map(d => d.Date)).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.AvgLikes)]).nice().range([height, 0]);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-25)")
    .style("text-anchor", "end");

  svg.append("g").call(d3.axisLeft(y));

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 65)
    .attr("text-anchor", "middle")
    .text("Date");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -45)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  const line = d3.line()
    .x(d => x(d.Date))
    .y(d => y(d.AvgLikes))
    .curve(d3.curveNatural);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#2c7bb6")
    .attr("stroke-width", 2)
    .attr("d", line);
});
