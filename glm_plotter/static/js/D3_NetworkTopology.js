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
  height: 760,
  zoomFitDelay: 4000 // 0 is good when using fixed nodes
};
let configuration;

let force;
let svg;

// root = g element.  svg is the parent of g.
function zoomFit(zoom, root, paddingPercent, transitionDuration) {
  console.log(
    'zoomFit',
    'root',
    root,
    'paddingPercent',
    paddingPercent,
    'transitionDuration',
    transitionDuration
  );

  // Allow override in cases where the chart is no currently displayed on the page
  const rootNode = root.node() || svg;
  const bounds = rootNode.getBBox();
  const parent = rootNode.parentElement;

  const fullWidth = parent.clientWidth || parent.getAttribute('width') // configuration.width;
  const fullHeight = parent.clientHeight || parent.getAttribute('height'); //configuration.height;

  const width = bounds.width || configuration.bounds.width; // parent.getAttribute('width');
  const height = bounds.height || configuration.bounds.height;  //parent.getAttribute('height');

  const midX = ( bounds.x || configuration.bounds.x) + width / 2;
  const midY = ( bounds.y || configuration.bounds.y) + height / 2;

  if (width == 0 || height == 0) return; // nothing to fit
  const scale = (paddingPercent || 0.75) / Math.max(width / fullWidth, height / fullHeight);
  const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];

  // console.log('zoomFit2', translate, scale);
  root
    .transition()
    .duration(transitionDuration || 0) // milliseconds
    .call(zoom.translate(translate).scale(scale).event);
}

let zoom;
let container;
D3_NetworkTopology.create = (el, data, config, d3ver) => {
  console.log('D3_NetworkTopology create');
  d3 = d3 || d3ver;
  configuration = { ...defaultConfiguration, ...(config || {}) };

  // initialize force
  force = d3.layout
    .force()
    .charge(-120)
    .linkDistance(30)
    .gravity(0.02)
    .size([configuration.width, configuration.height]);

  const myTitle = d3.select('#main').append('h1');

  svg = d3
    .select(el)
    .append('div')
    .attr('class', 'col')
    .append('svg')
    .attr('width', configuration.width)
    .attr('height', configuration.height);

  container = svg.append('g');

  console.log(
    'D3_NetworkTopologycontainer',
    svg,
    'container',
    container,
    configuration.width,
    configuration.height
  );

  // zooming
  const min_zoom = 0.1;
  const max_zoom = 5;

  zoom = d3.behavior
    .zoom()
    .scaleExtent([min_zoom, max_zoom])
    .on('zoom', zoomed);
  console.log('D3_NetworkTopologycontainer1');
  function zoomed() {
    container.attr('transform', `translate(${d3.event.translate})scale(${d3.event.scale})`);
  }

  svg.call(zoom).on('dblclick.zoom', null);

  const drag = force.drag().on('dragstart', dragstart);

  let nodes = container.selectAll('.node');

  let links = container.selectAll('.link');

  // load data
  /*   d3.json('/data', (error, mydata) => {
    if (error) throw error; */

  const mydata = data;
  // extract data from the json input
  const fileNm = mydata.file;
  const graph = mydata.graph;
  const fixedNodes = mydata.fixedNodes;

  myTitle.html(fileNm);

  links = links
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
  const line = links.append('line');

  // color the lines according to their type as defined by linkType property in
  // the JSON
  links.each(function (d) {
    if (d.linkType) {
      d3.select(this).classed(d.linkType, true);
    }
  });

  // node 'g' container will contain the node circle and label
  nodes = nodes
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .call(drag) // this command enables the dragging feature
    .on('dblclick', dblclick);
  // .on("click",clickAction); // this was removed but can be used to display
  // a hidden chart

  nodes.each(function (d) {
    if (d.classNm) {
      d3.select(this).classed(d.classNm, true);
    }

    if (d.child) {
      d3.select(this).classed(d.child, true);
    }

    const idNode = fixedNodes.names.indexOf(d.name);
    if (idNode > -1) {
      d3.select(this).classed('fixed', (d.fixed = true));
      d.x = fixedNodes.x[idNode];
      d.y = fixedNodes.y[idNode];
    }

    d.normalSize = 10;
    if (!configuration.selectionBands) {
      return;
    }
    // TODO: Set up these selectionBands on links
    d.normalSize = 10;
    if (configuration.selectionBands.medium) {
      console.log('1AAA configuration.selectionBands', configuration.selectionBands);
      configuration.selectionBands.medium.forEach(item => {
        if (item == d.name) {
          nodeSelect(item, null, 'medium', false);
          d.medium = true;
          d.normalSize = 20;
        }
      });
    }
    if (configuration.selectionBands.high) {
      configuration.selectionBands.high.forEach(item => {
        if (item == d.name) {
          nodeSelect(item, null, 'high', false);
          d.high = true;
          d.normalSize = 20;
        }
      });
    }
  });

  const circle = nodes
    .append('circle')
    .attr('r', 10)
    .attr('class', d => d.classNm);
  // .style("fill", function(d) { return color(d.group); });
  const label = nodes
    .append('text')
    .text(d => d.name)
    .attr('class', 'nodeNm');

  const lineLabel = links.append('text').text(function (d) {
    return d.name;
  });
  const lineLabel2 = links
    .append('text')
    .style('font-size', 16)
    .text(function (d) {
      return d.linkType;
    });

  const nodeg = nodes
    .append('g')
    .append('text')
    .style('font-size', 16)
    .text(function (d) {
      if (d.child) {
        return `${d.classNm}:${d.child}`;
      }
      return d.classNm;
    });

  links.on('mouseover', function (e) {
    mouseOverHandler(e);
  });
  links.on('mouseout', function (e) {
    mouseOutHandler(e);
  });
  nodes.on('mouseover', function (e) {
    // d3.select(this).moveToFront(); //d3 extended needed
    mouseOverHandler(e); // Run first in case of re-render (React).
    d3.select(this)
      .select('circle')
      .attr('r', 20);
  });
  nodes.on('mouseout', function (e) {
    mouseOutHandler(e); // Run first in case of re-render (React).

    console.log('mouseout this', this, 'e', e);
    const circle = d3.select(this).select('circle');
    circle.attr('r', e.normalSize);
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
  }, configuration.zoomFitDelay);

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
  console.log('saveXY');
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
  //	var cc = nodes.selectAll("circle")
  //	var myStr = "data:text/csv;charset=utf-8,";
  //	cc.each(function(d){
  //		myStr = myStr+[d3.select(this).attr("cx") ,d3.select(this).attr("cy")].join(",") +"\n"
  //	});
  //	nodes.selectAll('text.nodeNm').each(function (d){
  //		d3.select(this).text()
  //	})
  // console.log(myStr)
  const encodedUri = encodeURI(myStr);
  const dummy = document.createElement('a');
  dummy.setAttribute('href', encodedUri);
  dummy.setAttribute('download', 'xycoords.csv');
  document.body.appendChild(dummy);
  dummy.click(); // This will download the data file

  // zoomFit(zoom, container, 0.95, 0);
}

function saveXYfixed() {
  console.log('saveXYfixed');
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

  // zoomFit(zoom, container, 0.95, 0);
}

function removePrefix() {
  const pre = document.getElementById('rmPreText').value;
  d3.selectAll('text.nodeNm').text(d => d.name.replace(pre, ''));
}

function handleNodeSearch() {
  console.log('handleNodeSearch');
  nodeSelect(document.getElementById('nodeSearchNm').value);
}

function nodeSelect(targetNodeName, selection, clazz, unselectOthers) {
  console.log('nodeSelect', targetNodeName, clazz);
  if (!selection) {
    selection = 'g.node,g.link';
  }
  if (!clazz) {
    clazz = 'highlight';
  }
  const nodes = d3.selectAll(selection);
  nodes.each(function (d) {
    if (d.name === targetNodeName) {
      console.log('Found', d, d.name);
      console.log('Selecting', d3.select(this));
      d3.select(this)
        .classed(clazz, true)
        .select('circle')
        .attr('r', 20);
    } else {
      // Unselect others by default
      // if (unselectOthers == null || unselectOthers == true) {
      nodeUnselectBySelection(d3.select(this), d);
      // }
    }
  });
}

function nodeUnselectBySelection(unselectNode, unselectNodeEvent) {
  // console.log('Unselecting', unselectNodes);
  unselectNode
    .classed('highlight', false)
    .select('circle')
    .attr('r', unselectNodeEvent.normalSize);
  /*   unselectNodes.selectAll('text,line').each(function () {
      d3.select(this).classed('highlight', false)
    }); */
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
