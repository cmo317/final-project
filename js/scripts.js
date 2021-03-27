mapboxgl.accessToken = 'pk.eyJ1IjoiY2dtNDAyIiwiYSI6ImNra2lqZ3ltNTA4dTIydm52MzUycms0c2sifQ.7SbXsgoXVCjxbo33Zg_OYA';

// initialize modal on page load
$(document).ready(function() {
  $("#myModal").modal('show');
});

var map = new mapboxgl.Map({
  container: 'mapContainer', // container ID
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-99.570631, 39.467814], // starting position [lng, lat]
  zoom: 3.5 // starting zoom
});

// add a navigation control
var nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'top-left');
map.scrollZoom.disable();

//add my state level source
map.on('style.load', function() {
  map.addSource('states2020', {
    'type': 'geojson',
    'data': 'data/data2020.geojson'
  });
  //add derailments2020 layer
  map.addLayer({
    'id': '2020',
    'type': 'fill',
    'source': 'states2020',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
      'fill-color': {
        'property': 'derailments',
        'stops': [
          [0, '#fee5d9'],
          [5, '#fcbba1'],
          [13, '#fc9272'],
          [19, '#fb6a4a'],
          [26, '#ef3b2c'],
          [40, '#cb181d'],
          [100, '#99000d']
        ]
      },
      'fill-outline-color': 'white',
      'fill-opacity': 0.85
    }
  });
  // add 2015 data
  map.addSource('states2015', {
    'type': 'geojson',
    'data': 'data/data2015.geojson'
  });
  map.addLayer({
    'id': '2015',
    'type': 'fill',
    'source': 'states2015',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'fill-color': {
        'property': 'derailments',
        'stops': [
          [0, '#fee5d9'],
          [5, '#fcbba1'],
          [13, '#fc9272'],
          [19, '#fb6a4a'],
          [26, '#ef3b2c'],
          [40, '#cb181d'],
          [100, '#99000d']
        ]
      },
      'fill-outline-color': 'white',
      'fill-opacity': 0.85
    }
  });
  map.addSource('states2010', {
    'type': 'geojson',
    'data': 'data/data2010.geojson'
  });
  map.addLayer({
    'id': '2010',
    'type': 'fill',
    'source': 'states2010',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'fill-color': {
        'property': 'derailments',
        'stops': [
          [0, '#fee5d9'],
          [5, '#fcbba1'],
          [13, '#fc9272'],
          [19, '#fb6a4a'],
          [26, '#ef3b2c'],
          [40, '#cb181d'],
          [100, '#99000d']
        ]
      },
      'fill-outline-color': 'white',
      'fill-opacity': 0.85
    }
  });
  map.addSource('states2005', {
    'type': 'geojson',
    'data': 'data/data2005.geojson'
  });
  map.addLayer({
    'id': '2005',
    'type': 'fill',
    'source': 'states2005',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'fill-color': {
        'property': 'derailments',
        'stops': [
          [0, '#fee5d9'],
          [5, '#fcbba1'],
          [13, '#fc9272'],
          [19, '#fb6a4a'],
          [26, '#ef3b2c'],
          [40, '#cb181d'],
          [100, '#99000d']
        ]
      },
      'fill-outline-color': 'white',
      'fill-opacity': 0.85
    }
  });

  // add an empty data source, which we will use to highlight the state the user hovers over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted state
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 3,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });
});
//toggle on/off layers from https://docs.mapbox.com/mapbox-gl-js/example/toggle-layers/
// also huge help from https://jwilsonschutter.github.io/Webmapping-Final-Class/
var toggleableLayerIds = ['2020', '2015', '2010', '2005'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
  var id = toggleableLayerIds[i];

  var link = document.getElementById(id + '-button');
  link.setAttribute('layer-id', id);
  link.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();

    toggleLayer(e.currentTarget.getAttribute('layer-id'));
  };
}

function toggleLayer(layer) {
  var visibility = map.getLayoutProperty(layer, 'visibility');
  map.setLayoutProperty(layer, 'visibility', 'visible');
  $('#' + layer + '-button').addClass('active');

  for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];
    if (id !== layer) {
      map.setLayoutProperty(id, 'visibility', 'none');
      $('#' + id + '-button').removeClass('active');
    }
  }
}

// add default text so sidebar isn't empty
var defaultText = '<p>click on a state to get started!</p>'
$('#feature-info').html(defaultText)

var popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

map.on('mousemove', function(e) {
  // query for the features under the mouse, but only in the lots layer
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['2020', '2015', '2010','2005'],
  });

  // set up variable to show scenario in sidebar
  //var showScenario = document.getElementById('scenario');

  if (features.length > 0) {
    // show the popup
    // Populate the popup and set its coordinates
    // based on the feature found.
    var hoveredFeature = features[0]
    if (features[0].layer.id === '2020') {
      var state = hoveredFeature.properties.NAME;
      var year = '2020';
      var derail = hoveredFeature.properties.derailments;
      var damages = hoveredFeature.properties.ACCDMG;
      var casualties = hoveredFeature.properties.CASKLD;
      var injuries = hoveredFeature.properties.CASINJ;
      var hazmat = hoveredFeature.properties.CARSDMG;
      var spilled = hoveredFeature.properties.CARSHZD;
    } else if (features[0].layer.id === '2015') {
      var state = hoveredFeature.properties.NAME;
      var year = '2015';
      var derail = hoveredFeature.properties.derailments;
      var damages = hoveredFeature.properties.ACCDMG;
      var casualties = hoveredFeature.properties.CASKLD;
      var injuries = hoveredFeature.properties.CASINJ;
      var hazmat = hoveredFeature.properties.CARSDMG;
      var spilled = hoveredFeature.properties.CARSHZD;
    } else if (features[0].layer.id === '2010') {
      var state = hoveredFeature.properties.NAME;
      var year = '2010';
      var derail = hoveredFeature.properties.derailments;
      var damages = hoveredFeature.properties.ACCDMG;
      var casualties = hoveredFeature.properties.CASKLD;
      var injuries = hoveredFeature.properties.CASINJ;
      var hazmat = hoveredFeature.properties.CARSDMG;
      var spilled = hoveredFeature.properties.CARSHZD;
    }else if (features[0].layer.id === '2005') {
      var state = hoveredFeature.properties.NAME;
      var year = '2005';
      var derail = hoveredFeature.properties.derailments;
      var damages = hoveredFeature.properties.ACCDMG;
      var casualties = hoveredFeature.properties.CASKLD;
      var injuries = hoveredFeature.properties.CASINJ;
      var hazmat = hoveredFeature.properties.CARSDMG;
      var spilled = hoveredFeature.properties.CARSHZD;
    }

    var popupContent = `
<div id="popup">
        <h6><strong>${state}</strong><br></h6>
        <strong>derailments in ${year}:</strong>  ${derail}<br>
        <strong>total damages:</strong> $${damages}<br>
        <strong>casualties:</strong> ${casualties}<br>
        <strong>injuries:</strong> ${injuries}<br>
        <strong>derailed hazmat cars:</strong> ${hazmat}<br>
        <strong>spilled hazmat cars:</strong> ${spilled}</p>
<div>
      `

    popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(hoveredFeature.geometry);

    // show the cursor as a pointer
    map.getCanvas().style.cursor = 'pointer';
  } else {
    // remove the Popup
    popup.remove();

    map.getCanvas().style.cursor = '';
    // reset the highlight source to an empty featurecollection
map.getSource('highlight-feature').setData({
  type: 'FeatureCollection',
  features: []
     });
  }

})



// populate sidebar on click
map.on('click', function(e) {
  // query for the features under the mouse, but only in the lots layer
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['2020', '2015','2010','2005'],
  });

  // if the mouse pointer is over a feature on our layer of interest
  // take the data for that feature and display it in the sidebar
  if (features.length > 0) {
    map.getCanvas().style.cursor = 'pointer'; // make the cursor a pointer
    var clickedFeature = features[0]
    var featureInfo = `
        <h6><strong>${clickedFeature.properties.NAME} Rankings</strong></h6>
        <p>total derailments: #${clickedFeature.properties.rankderail}<br>
        total damages ($): #${clickedFeature.properties.rankACCDMG}<br>
        derailed hazmat cars: #${clickedFeature.properties.rankCARSDMG}<br>
        hazmat cars that spilled: #${clickedFeature.properties.rankCARSHZD}</p>
      `
    $('#feature-info').html(featureInfo)

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(clickedFeature.geometry);
  } else {
    // if there is no feature under the mouse, reset things:
    map.getCanvas().style.cursor = 'default'; // make the cursor default

    // reset the highlight source to an empty featurecollection
    map.getSource('highlight-feature').setData({
      type: 'FeatureCollection',
      features: []
    });

    // reset the default message
    $('#feature-info').html(defaultText)
  }
})


// MODAL STUFF
// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
// open modal when 'about' button is clicked
$('.about').on('click', function() {
  $('#myModal').modal('show');
})
