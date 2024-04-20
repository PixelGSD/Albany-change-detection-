var image = ee.Image("projects/ee-craigmahlasi/assets/finalclassification2clipped_0"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.379702266211176, -33.658922193759196]),
            {
              "Class": 599.21,
              "Class_": "Stable Thicket",
              "system:index": "0"
            })]),
    geometry2 = 
    /* color: #98ff00 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.36734264707055, -33.66349431672319]),
            {
              "Class": 139.56,
              "Class_": "Stable Forest",
              "system:index": "0"
            })]),
    geometry3 = 
    /* color: #0b4a8b */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.388971980566645, -33.66006524727824]),
            {
              "Class": 582.87,
              "Class_": "Stable non Thicket/Forest",
              "system:index": "0"
            })]),
    geometry4 = 
    /* color: #ffc82d */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.381418879980707, -33.66063676834335]),
            {
              "Class": 16.75,
              "Class_": "Thicket gain",
              "system:index": "0"
            })]),
    geometry5 = 
    /* color: #00ffff */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.375925715918207, -33.662637062174845]),
            {
              "Class": 11.94,
              "Class_": "Thicket loss",
              "system:index": "0"
            })]),
    geometry6 = 
    /* color: #bf04c2 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.379015620703363, -33.65977948532208]),
            {
              "Class": 10.07,
              "Class_": "Forest loss",
              "system:index": "0"
            })]),
    geometry7 = 
    /* color: #ff0000 */
    /* shown: false */
    ee.FeatureCollection(
        [ee.Feature(
            ee.Geometry.Point([26.383478816504145, -33.661208285612105]),
            {
              "Class": 11.51,
              "Class_": "Forest gain",
              "system:index": "0"
            })]),
    imageVisParam = {"opacity":1,"bands":["b1"],"min":1,"max":6,"palette":["f3ffb1","ffeb5c","baff4d","9dff43","ff0455","0affbb","1d19ff"]},
    geometry8 = 
    /* color: #00ff00 */
    /* shown: false */
    ee.Geometry.Point([26.38433262714705, -33.663294752417194]),
    imageVisParam2 = {"opacity":1,"bands":["B4","B3","B2"],"min":376.84000000000003,"max":4209.16,"gamma":1},
    imageVisParam3 = {"opacity":1,"bands":["B4","B3","B2"],"min":376.84000000000003,"max":4209.16,"gamma":1},
    imageVisParam4 = {"opacity":1,"bands":["B4","B3","B2"],"min":376.84000000000003,"max":4209.16,"gamma":1},
    imageVisParam5 = {"opacity":1,"bands":["B4","B3","B2"],"min":376.84000000000003,"max":4209.16,"gamma":1},
    table = ee.FeatureCollection("users/craigmahlasi/Alexandria_regional_assessment_AOI");

var bar = geometry.merge(geometry2).merge(geometry3).merge(geometry4).merge(geometry5).merge(geometry6).merge(geometry7)
print(bar)
//var palette =  'f3ffb1', 'ffeb5c', 'baff4d', '9dff43', 'ff0455', '0affbb', '1d19ff'


Map.addLayer(image, imageVisParam)


//////////////////
//Creating a Legend
//////////////////

//-----------6.Generating a legend for the classification map
// set position of panel
var legend = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '8px 15px'
  }
});

// Create legend title
var legendTitle = ui.Label({
  value: 'Classes',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});

// Add the title to the panel
legend.add(legendTitle);
    
// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
      
      // Create the label that is actually the colored box.
      var colorBox = ui.Label({
        style: {
          backgroundColor:   '#' + color,
          // Use padding to give the box height and width.
          padding: '8px',
          margin: '0 0 4px 0'
        }
      });
      
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 4px 6px'}
      });
      
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};


//  Palette with the colors
var palette =['f3ffb1','ffeb5c','baff4d','008310','ff0000','00ffad','1d19ff'];
// name of the legend
var names =['Stable Thicket','Stable Forest', 'Stable non Thicket/Forest','Thicket gain',
'Thicket loss', 'Forest loss','Forest gain'];



// Add color and and names
for (var i = 0; i < 7; i++) {
  legend.add(makeRow(palette[i], names[i]));
  }  

// add legend to map (alternatively you can also print the legend to the console)  
Map.add(legend);  

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

Map.style().set('cursor', 'crosshair');

// Create an empty panel in which to arrange widgets.
// The layout is vertical flow by default.
var panel = ui.Panel({style: {width: '400px'}})
    .add(ui.Label('Click left window'));

// Set a callback function for when the user clicks the map.
Map.onClick(function(coords) {
  // Create or update the location label (the second widget in the panel)
  var location = 'lon: ' + coords.lon.toFixed(2) + ' ' +
                 'lat: ' + coords.lat.toFixed(2);
  panel.widgets().set(1, ui.Label(location));

  // Add a red dot to the map where the user clicked.
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  Map.layers().set(1, ui.Map.Layer(point, {color: 'FF0000'}));

// Import the example feature collection.
var ecoregions = bar;

// Define the chart and print it to the console.
var chart =
    ui.Chart.feature
        .byProperty({
          features: ecoregions.select('Class'),
          xProperties: 'Class',
        })
        .setSeriesNames([
          'Stable Thicket','Stable Forest', 'Stable non-Thicket/Forest','Thicket gain',
'Thicket loss', 'Forest loss','Forest gain'
          
        ])
        .setChartType('ColumnChart')
        .setOptions({
          title: 'Class Area Extent',
          hAxis:
              {title: 'Land cover classes', titleTextStyle: {italic: false, bold: true}},
          vAxis: {
            title: 'Area extent (SQKM)',
            titleTextStyle: {italic: false, bold: true}
          },
          colors: [
            'f3ffb1','ffeb5c','baff4d','008310','ff0000','00ffad','1d19ff', 
          ]
        });
 panel.widgets().set(2, chart);
//print(chart);

ui.root.add(panel);

});
  
    
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
var RGB20191 = ee.ImageCollection("COPERNICUS/S2")
.filterDate('2019-12-19', '2019-12-30')
.filterBounds(geometry)
.first()

var RGB20161 = ee.ImageCollection("COPERNICUS/S2")
.filterDate('2016-12-19', '2016-12-30')
.filterBounds(geometry)
.first()

var RGB2016 = RGB20161.clip(table)
var RGB2019 = RGB20191.clip(table)

var linkedMap = ui.Map();
 linkedMap.addLayer(RGB2019, {bands: ['B4', 'B3', 'B2'], max: 2000}, '2019 RGB') 
 linkedMap.addLayer(RGB2016, {bands: ['B4', 'B3', 'B2'], max: 2000}, '2016 RGB')
// Link the default Map to the other map.//////////
var linker = ui.Map.Linker([ui.root.widgets().get(0), linkedMap]);

// Make an inset map and add it to the linked map.
//var inset = ui.Map({style: {position: "bottom-right"}});
//linkedMap.add(inset);

// Register a function to the linked map to update the inset map.
linkedMap.onChangeBounds(function() {
  var bounds = ee.Geometry.Rectangle(Map.getBounds());
  //inset.centerObject(bounds);
  //inset.layers().set(0, bounds);
});

// Create a SplitPanel which holds the linked maps side-by-side.
var splitPanel = ui.SplitPanel({
  firstPanel: linker.get(0),
  secondPanel: linker.get(1),
  orientation: 'horizontal',
  wipe: true,
  style: {stretch: 'both'}
});

// Set the SplitPanel as the only thing in root.
ui.root.widgets().reset([splitPanel])

linkedMap.setCenter(26.3156680763658,-33.63928834086848, 10);
