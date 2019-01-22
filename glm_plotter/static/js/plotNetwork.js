const D3_NetworkTopology = import('./D3_NetworkTopology.js');

const configuration = {};

const el = document.getElementById('main');

let data;
// load data
d3.json('/data', function(error, mydata) {
  if (error) {
    throw error;
  }
  data = mydata;

  //console.log("$$$$", el);
  D3_NetworkTopology.then(d => {
    console.log('D3_NetworkTopology', d.default);
    networkTopology = d;

    d.default.create(el, data, configuration, d3);
  });
});
