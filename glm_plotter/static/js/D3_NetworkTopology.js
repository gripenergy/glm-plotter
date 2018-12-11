// ///////////////////////////////////////////////////////////////////////////////////////
// Note:  This file should be kept in sync with the plotNetwork.js in glm-plotter (accounting for slight differences in React vs. straight JS)
// TODO: Move this React version into glm-plotter, centralize common code, and add a dependency to the React client.
// /////////////////////////////////////////////////////////////////////////////////////

// since d3 is not a top level export
// For npm installed D3 V3
// import * as d3 from 'd3-v3';
// import d3 from "../lib/js/d3.js";

// Importing local d3 library because this code is incompatible with d3 V5. There is a WIP version for d3 V5 but it needs work.
// import d3 from './lib/d3/v3/d3';
// Create React App runs Babel and Linter.  Babel adds "use strict", wchihc breaks the D3 code.  Using a CDN instead to get the D3 V3 script from the network.  This is probably the best long term solution as well.
// import d3 from './lib/d3/v3/d3';

/* eslint-disable prefer-arrow-callback */
/* eslint-disable fun-names */
/* eslint-disable camelcase */

// Adapted from https://github.com/jdechalendar/glm-plotter to work with React

// JAC - jdechalendar@stanford.edu

/* const OPTIONS = {
  linkDisplayText: {
    name: true,
    linkType: false
  }
}; */

let d3; // Allow the right version to be passed in.

let mouseOverHandler = e => {};
let mouseOutHandler = e => {};

const D3_NetworkTopology = {};

// const width = 960;
// const height = 760;
// const width = 720;
// const height = 437;

const defaultConfiguration = {
  width: 960,
  height: 760
};

let force;

function zoomFit(zoom, root, paddingPercent, transitionDuration) {
  // console.log('zoomFit', 'root',root, 'paddingPercent', paddingPercent, 'transitionDuration', transitionDuration)
  const bounds = root.node().getBBox();
  const parent = root.node().parentElement;
  const fullWidth = parent.clientWidth;

  const fullHeight = parent.clientHeight;
  const width = bounds.width;

  const height = bounds.height;
  const midX = bounds.x + width / 2;

  const midY = bounds.y + height / 2;
  if (width == 0 || height == 0) return; // nothing to fit
  const scale = (paddingPercent || 0.75) / Math.max(width / fullWidth, height / fullHeight);
  const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

  console.trace('zoomFit', translate, scale);
  root
    .transition()
    .duration(transitionDuration || 0) // milliseconds
    .call(zoom.translate(translate).scale(scale).event);
}

D3_NetworkTopology.create = (el, data, configuration, d3ver) => {
  d3 = d3 || d3ver;

  // initialize force
  force = d3.layout
    .force()
    .charge(-120)
    .linkDistance(30)
    .gravity(0.05)
    .size([
      configuration.width || defaultConfiguration.width,
      configuration.height || defaultConfiguration.height
    ]);

  const myTitle = d3.select('#main').append('h1');

  const svg = d3
    .select(el)
    .append('div')
    .attr('class', 'col')
    .append('svg')
    .attr('width', configuration.width || defaultConfiguration.width)
    .attr('height', configuration.height || defaultConfiguration.width);

  const container = svg.append('g');

  // zooming
  const min_zoom = 0.1;
  const max_zoom = 5;

  const zoom = d3.behavior
    .zoom()
    .scaleExtent([min_zoom, max_zoom])
    .on('zoom', zoomed);

  function zoomed() {
    container.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
  }

  svg.call(zoom).on('dblclick.zoom', null);

  const drag = force.drag().on('dragstart', dragstart);

  let node = container.selectAll('.node');

  let link = container.selectAll('.link');

  // load data
  /*   d3.json('/data', (error, mydata) => {
    if (error) throw error; */

  const mydata = data;
  // extract data from the json input
  const fileNm = mydata.file;
  const graph = mydata.graph;
  const fixedNodes = mydata.fixedNodes;

  myTitle.html(fileNm);

  link = link
    .data(graph.links)
    .enter()
    .append('g')
    .attr('class', 'link');
  // there is no value property. But varying line-width could be useful in the
  // future - keep
  //   .style("stroke-width", function(d) { return Math.sqrt(d.value); });
  // Note: I created the following line object in a 'g' container even though
  // it wasn't necessary in case I want to add something to the container later,
  // like an image - or text
  const line = link.append('line');

  // color the lines according to their type as defined by linkType property in
  // the JSON
  link.each(function (d) {
    if (d.linkType) {
      d3.select(this).classed(d.linkType, true);
    }
  });

  // node 'g' container will contain the node circle and label
  node = node
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(drag) // this command enables the dragging feature
    .on('dblclick', dblclick);
  // .on("click",clickAction); // this was removed but can be used to display
  // a hidden chart

  node.each(function (d) {
    if (d.classNm) {
      d3.select(this).classed(d.classNm, true);
    }
  });
  node.each(function (d) {
    if (d.child) {
      d3.select(this).classed(d.child, true);
    }
  });

  const circle = node
    .append('circle')
    .attr('r', 10)
    .attr('class', d => d.classNm);
  // .style("fill", function(d) { return color(d.group); });
  const label = node
    .append('text')
    .text(d => d.name)
    .attr('class', 'nodeNm');

  const lineLabel = link.append('text').text(function (d) {
    return d.name;
  });
  const lineLabel2 = link
    .append('text')
    .style('font-size', 16)
    .text(function (d) {
      return d.linkType;
    });

  const nodeg = node
    .append('g')
    .append('text')
    .style('font-size', 16)
    .text(function (d) {
      if (d.child) {
        return `${d.classNm}:${d.child}`;
      }
      return d.classNm;
    });

  node.each(function (d) {
    const idNode = fixedNodes.names.indexOf(d.name);
    if (idNode > -1) {
      d3.select(this).classed('fixed', (d.fixed = true));
      d.x = fixedNodes.x[idNode];
      d.y = fixedNodes.y[idNode];
    }
  });

  link.on('mouseover', function (e) {
    mouseOverHandler(e);
  });
  link.on('mouseout', function (e) {
    mouseOutHandler(e);
  });
  node.on('mouseover', function (e) {
    mouseOverHandler(e);
    // d3.select(this).moveToFront(); //d3 extended needed
    d3.select(this)
      .select('circle')
      .attr('r', 20);
  });
  node.on('mouseout', e => {
    mouseOutHandler(e);
    d3.selectAll('g.node').each(function (d) {
      if (d.name === e.name) {
        d3.select(this)
          .select('circle')
          .attr('r', 10);
      }
    });
  });
  force
    .nodes(graph.nodes)
    .links(graph.links)
    .start();

  // update positions at every iteration ('tick') of the force algorithm
  force.on('tick', () => {
    line
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    lineLabel
      .attr('x', d => (d.source.x + d.target.x) / 2 + 8)
      .attr('y', d => (d.source.y + d.target.y) / 2 + 20);
    lineLabel2
      .attr('x', function (d) {
        return (d.source.x + d.target.x) / 2 + 8;
      })
      .attr('y', function (d) {
        return (d.source.y + d.target.y) / 2 + 40;
      });
    circle.attr('cx', d => d.x).attr('cy', d => d.y);
    label.attr('x', d => d.x + 8).attr('y', d => d.y);
    nodeg.attr('x', d => d.x + 8).attr('y', d => d.y + 20);
  });
  // });

  if (configuration.nodeSelect) {
    nodeSelect(configuration.nodeSelect);
  }

  setTimeout(() => {
    zoomFit(zoom, container, 0.95, 500);
  }, 4000);

  return d3.select(el).select('div');
}; // end create()

// after a node has been moved manually it is now fixed
function dragstart(d) {
  d3.event.sourceEvent.stopPropagation();
  d3.select(this).classed('fixed', (d.fixed = true));
}

// when you double click a fixed node, it is released
function dblclick(d) {
  d3.select(this).classed('fixed', (d.fixed = false));
}
// function clickAction(d){
// if (document.getElementById('chart').style.display=='none'){
//   document.getElementById('chart').style.display='block';
// }
// else {
//  document.getElementById('chart').style.display='none';
// }
// }
function saveXY() {
  const pre = document.getElementById('rmPreText').value;
  let myStr = 'data:text/csv;charset=utf-8,';
  const txtArr = [];
  const cxArr = [];
  const cyArr = [];

  d3.selectAll('text.nodeNm').each(function (d) {
    txtArr.push(pre + d3.select(this).text());
  });
  d3.selectAll('circle').each(function (d) {
    cxArr.push(d3.select(this).attr('cx'));
    cyArr.push(d3.select(this).attr('cy'));
  });
  if (txtArr.length != cxArr.length || txtArr.length != cyArr.length) {
    throw 'number of circles is not consistent with number of text labels!';
  }
  for (let ii = 0; ii < txtArr.length; ii++) {
    myStr = `${myStr + txtArr[ii]},${cxArr[ii]},${cyArr[ii]}\n`;
  }
  //	var cc = node.selectAll("circle")
  //	var myStr = "data:text/csv;charset=utf-8,";
  //	cc.each(function(d){
  //		myStr = myStr+[d3.select(this).attr("cx") ,d3.select(this).attr("cy")].join(",") +"\n"
  //	});
  //	node.selectAll('text.nodeNm').each(function (d){
  //		d3.select(this).text()
  //	})
  // console.log(myStr)
  const encodedUri = encodeURI(myStr);
  const dummy = document.createElement('a');
  dummy.setAttribute('href', encodedUri);
  dummy.setAttribute('download', 'xycoords.csv');
  document.body.appendChild(dummy);
  dummy.click(); // This will download the data file
}
function saveXYfixed() {
  const pre = document.getElementById('rmPreText').value;
  let myStr = 'data:text/csv;charset=utf-8,';
  const txtArr = [];
  const cxArr = [];
  const cyArr = [];

  d3.selectAll('text.nodeNm').each(function (d) {
    if (d.fixed) {
      txtArr.push(pre + d3.select(this).text());
    }
  });
  d3.selectAll('circle').each(function (d) {
    if (d.fixed) {
      cxArr.push(d3.select(this).attr('cx'));
      cyArr.push(d3.select(this).attr('cy'));
    }
  });
  if (txtArr.length != cxArr.length || txtArr.length != cyArr.length) {
    throw 'number of circles is not consistent with number of text labels!';
  }
  for (let ii = 0; ii < txtArr.length; ii++) {
    myStr = `${myStr + txtArr[ii]},${cxArr[ii]},${cyArr[ii]}\n`;
  }
  const encodedUri = encodeURI(myStr);
  const dummy = document.createElement('a');
  dummy.setAttribute('href', encodedUri);
  dummy.setAttribute('download', 'xycoords.csv');
  document.body.appendChild(dummy);
  dummy.click(); // This will download the data file
}
function removePrefix() {
  const pre = document.getElementById('rmPreText').value;
  d3.selectAll('text.nodeNm').text(d => d.name.replace(pre, ''));
}

function handleNodeSearch() {
  console.log('handleNodeSearch');
  nodeSelect(document.getElementById('nodeSearchNm').value);
}

function nodeSelect(targetNodeName, selection) {
  console.log('nodeSelect', targetNodeName);
  if (!selection) {
    selection = 'g.node,g.link';
  }
  const nodes = d3.selectAll(selection);
  nodes.each(function (d) {
    if (d.name === targetNodeName) {
      console.log('Found', d, d.name);
      console.log('Selecting', d3.select(this));
      d3.select(this).classed('highlight', true);
    } else {
      nodeUnselectBySelection(d3.select(this));
    }
  });
}
function nodeUnselectBySelection(unselectNodes) {
  // console.log('Unselecting', unselectNodes);
  unselectNodes.classed('highlight', false);
  unselectNodes.selectAll('text,line').each(function () {
    d3.select(this).classed('highlight', false);
  });
}
/* function nodeUnselectByName(name) {
  d3.selectAll('g.node').each(function (d) {
    if (d.name === name) {
      nodeUnselectBySelection(d3.select(this));
    }
  });
} */
function changeLinkDistance() {
  force.linkDistance(Number(document.getElementById('linkLengthVal').value));
}
function changeGravity() {
  force.gravity(Number(document.getElementById('gravityVal').value));
}
function changeCharge() {
  /*  */
  force.charge(Number(document.getElementById('chargeVal').value));
}
function registerMouseOverHandler(handler) {
  mouseOverHandler = handler;
}
function registerMouseOutHandler(handler) {
  mouseOutHandler = handler;
}

D3_NetworkTopology.update = (el, data, configuration, chart) => {
  console.log('D3_NetworkTopology update');
  // d3 Code to update the chart
  console.log('update el', el);
  console.log('update svg', d3.select(el).select('div'));
  console.log('update data', data);

  if (chart) {
    console.log('update chart', chart);
    chart.remove();
  }
  return D3_NetworkTopology.create(el, data, configuration);
};

D3_NetworkTopology.destroy = chart => {
  console.log('D3_NetworkTopology destroy');
  // Cleaning code here
  chart.remove();
};

D3_NetworkTopology.registerMouseOverHandler = registerMouseOverHandler;
D3_NetworkTopology.registerMouseOutHandler = registerMouseOutHandler;
D3_NetworkTopology.nodeSelect = nodeSelect;

D3_NetworkTopology.saveXY = saveXY;
D3_NetworkTopology.saveXYfixed = saveXYfixed;
D3_NetworkTopology.removePrefix = removePrefix;
D3_NetworkTopology.handleNodeSearch = handleNodeSearch;
D3_NetworkTopology.changeGravity = changeGravity;

export default D3_NetworkTopology;
