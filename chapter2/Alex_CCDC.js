var AOI = ee.FeatureCollection("users/craigmahlasi/Alexandria_regional_assessment_AOI"),
    S2SR = ee.ImageCollection("COPERNICUS/S2_SR"),
    table = ee.FeatureCollection("users/craigmahlasi/testingsamples"),
    S2 = ee.ImageCollection("COPERNICUS/S2"),
    image = ee.Image("users/craigmahlasi/CCDCimage"),
    image2 = ee.Image("users/craigmahlasi/Clearings_2019-09-20_new"),
    image3 = ee.Image("users/craigmahlasi/Clearings_2019-09-10_new"),
    image4 = ee.Image("users/craigmahlasi/Clearings_2019-10-01_new"),
    image5 = ee.Image("users/craigmahlasi/Clearings_2019-10-10_new"),
    image6 = ee.Image("users/craigmahlasi/Clearings_2019-10-20_new"),
    geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      },
      {
        "type": "marker"
      },
      {
        "type": "marker"
      },
      {
        "type": "marker"
      }
    ] */
    ee.Geometry({
      "type": "GeometryCollection",
      "geometries": [
        {
          "type": "Polygon",
          "coordinates": [
            [
              [
                26.325718642287956,
                -33.62648093167047
              ],
              [
                26.325718642287956,
                -33.63648590468251
              ],
              [
                26.337284327560173,
                -33.63648590468251
              ],
              [
                26.337284327560173,
                -33.62648093167047
              ]
            ]
          ],
          "geodesic": false,
          "evenOdd": true
        },
        {
          "type": "Point",
          "coordinates": [
            26.325737547321854,
            -33.636527995813175
          ]
        },
        {
          "type": "Point",
          "coordinates": [
            26.33728177492195,
            -33.63645653587608
          ]
        },
        {
          "type": "Point",
          "coordinates": [
            26.337260317249832,
            -33.62650516063655
          ]
        }
      ],
      "coordinates": []
    }),
    image7 = ee.Image("projects/alextifs2019/assets/20190901_075748_1003_3B_AnalyticMS_SR_clip"),
    geometry2 = /* color: #98ff00 */ee.Geometry.MultiPoint(
        [[26.325759004993973, -33.63649226585204],
         [26.33728177492195, -33.63645653587608],
         [26.337238859577713, -33.62648729357889]]),
    image8 = ee.Image("projects/alextifs2019/assets/20190930_075731_1005_3B_AnalyticMS_SR_clip");


var utils = require('users/parevalo_bu/gee-ccdc-tools:ccdcUtilities/api')
//var params = require('users/parevalo_bu/gee-ccdc-tools:Tutorial/params.js')
var classUtils = require('users/craigmahlasi/CCDCuit:/class.js')
 ///////////////////////////////////////////////////
////////////////////////////////////////////////////

// Change detection parameters
var changeDetection = {
  breakpointBands: ['B1','B2','B3','B4','B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
  tmaskBands: ['B3','B12'],
  //breakpointBands: ['GREEN','RED','NIR','SWIR1','SWIR2'],
  //tmaskBands: ['GREEN','SWIR2'],
  minObservations: 3,
  chiSquareProbability: .99,
  minNumOfYearsScaler: 1.33,
  dateFormat: 2,
  lambda: 20/10000,
  maxIterations: 25000
}


// Classification parameters
var classification = {
  bandNames: ['B1','B2','B3','B4','B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
  //bandNames: ['GREEN','RED','NIR','SWIR1','SWIR2'],
  inputFeatures: ["INTP", "SLP","PHASE","RMSE"],
  coefs: ["INTP", "SLP","COS", "SIN","RMSE","COS2","SIN2","COS3","SIN3"],
  ancillaryFeatures: ['TEMPERATURE', "RAINFALL"],
  resultFormat: 'SegCollection',
  classProperty: 'Class_',
  yearProperty: 'year',
  
  classifier: ee.Classifier.smileRandomForest,
  classifierParams: {
    numberOfTrees: 100,
    variablesPerSplit:5,
    minLeafPopulation: 10,
    bagFraction: 0.9,
    maxNodes: null
  },
  outPath: 'users/craigmahlasi/',
  segs: ["S1", "S2", "S3", "S4", "S5", "S6"],
  trainingPath: 'projects/alextifs2019/assets/Alexsampleswithmosaic75',
  trainingPathPredictors: 'users/craigmahlasi/predictorsFINAL75',
}

var studyRegion = ee.FeatureCollection('users/craigmahlasi/Alexandria_regional_assessment_AOI')
  //.filterMetadata('country_na','equals','Kenya').union()

var params = {
  start: '2016-01-01',
  end: '2021-12-31',
  
  ChangeDetection: changeDetection,
  Classification: classification,
  StudyRegion: studyRegion
}
var tiles = '35HMC'
//r tiles = '35HMC' 
// Filter by date and a location in Brazil
var filteredLandsat =S2
    .filterDate(params.start, params.end)
    .filterBounds(params.StudyRegion)
  . filterMetadata('MGRS_TILE', 'equals', tiles)
    

print(filteredLandsat) 

 

params.ChangeDetection['collection'] = filteredLandsat


var results = ee.Algorithms.TemporalSegmentation.Ccdc(params.ChangeDetection)
print(results)

Export.image.toAsset({
  image: results,
  description: 'CCDCimage2',
  assetId: 'CCDCimage2',
  scale:20,   
 region: studyRegion,
  pyramidingPolicy: 'sample'

})

 



var trainingData = ee.FeatureCollection(params.Classification.trainingPath)
print(trainingData.first())

//var alldata = trainingData.randomColumn();
//var split = 0.7;  // Roughly 70% training, 30% testing.
//var training10 = alldata.filter(ee.Filter.lt('random', split));
//var validation10 = alldata.filter(ee.Filter.gte('random', split));

print(trainingData.aggregate_histogram('Class_'))
var trainingData  = trainingData.remap([0,1],[0,1],'Class_')
print(trainingData.aggregate_histogram('Class_'))


var trainingData = trainingData.map(function(feat) {
  return feat.set('year',2016)})
  print(trainingData.first())
  
  
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


 

// Define bands to use in classification
var bands = params.Classification.bandNames

// Define coefficients to use in classification
var coefs = params.Classification.coefs

var inputFeatures = params.Classification.inputFeatures
// Segment ids
var segs = params.Classification.segs

// Property corresponding to year of training data
var yearProperty = params.Classification.yearProperty

// Define path to change detection results
 

var pan = ee.Image('users/craigmahlasi/S2CCDstack')
 
var clipped = pan.clip(AOI)


params.Classification.changeResults = clipped

// Load ccd image stack with coefficients and change information
var ccdImage = utils.CCDC.buildCcdImage(params.Classification.changeResults,params.Classification.segs.length, params.Classification.bandNames)


print('CCD Image:', ccdImage)
// Finally, get ancillary topographic and climate data
var ancillary = utils.Inputs.getAncillary();

var trainingData1 = utils.Classification.getTrainingCoefsAtDate(trainingData, coefs, bands, yearProperty, ancillary, ccdImage, segs)


// Filter points with no data
var testBand = params.Classification.bandNames[0]+ '_' + params.Classification.coefs[0]
  trainingData1.filter(ee.Filter.notNull([testBand]))

//print('First training point with predictors:', trainingData1.first())

Export.table.toAsset({
  collection: trainingData,
  description: 'trainingDataProcessedFINAL50',
  assetId: params.Classification.trainingPathPredictors}) 

var trainingData2 = utils.Classification.assignIds(trainingData1, 'ID')


// Now do the actual classification add the first segments classification to the map

// Get training data as FC
var trainingData2 = ee.FeatureCollection(params.Classification.trainingPath)

// Optionally filter by study area
var trainingData2 = trainingData1.filterBounds(params.StudyRegion)

// Next, turn array image into image
var imageToClassify = utils.CCDC.buildCcdImage(params.Classification.changeResults, params.Classification.segs.length, params.Classification.bandNames)

// Now get ancillary data
//var demImage = ee.Image('USGS/SRTMGL1_003').rename('ELEVATION')
//var slope = ee.Terrain.slope(demImage).rename('DEM_SLOPE')
//var aspect = ee.Terrain.aspect(demImage).rename('ASPECT')
var bio = ee.Image('WORLDCLIM/V1/BIO')
   .select(['bio01','bio12'])
   .rename(['TEMPERATURE','RAINFALL'])
var ancillary = ee.Image.cat([bio])

// Get classifier with params
//var coefs1 = ['B1_INTP', 'B2_INTP', 'B3_INTP', 'B4_INTP', 'B5_INTP', 'B6_INTP', 'B7_INTP', 'B8_INTP', 'B8A_INTP', 'B9_INTP', 'B11_INTP', 'B12_INTP', 'B1_SLP', 'B2_SLP', 'B3_SLP', 'B4_SLP', 'B5_SLP', 'B6_SLP', 'B7_SLP', 'B8_SLP', 'B8A_SLP', 'B9_SLP', 'B11_SLP', 'B12_SLP', 'B1_COS', 'B2_COS', 'B3_COS', 'B4_COS', 'B5_COS', 'B6_COS', 'B7_COS', 'B8_COS', 'B8A_COS', 'B9_COS', 'B11_COS', 'B12_COS', 'B1_SIN', 'B2_SIN', 'B3_SIN', 'B4_SIN', 'B5_SIN', 'B6_SIN', 'B7_SIN', 'B8_SIN', 'B8A_SIN', 'B9_SIN', 'B11_SIN', 'B12_SIN', 'B1_COS2', 'B2_COS2', 'B3_COS2', 'B4_COS2', 'B5_COS2', 'B6_COS2', 'B7_COS2', 'B8_COS2', 'B8A_COS2', 'B9_COS2', 'B11_COS2', 'B12_COS2', 'B1_SIN2', 'B2_SIN2', 'B3_SIN2', 'B4_SIN2', 'B5_SIN2', 'B6_SIN2', 'B7_SIN2', 'B8_SIN2', 'B8A_SIN2', 'B9_SIN2', 'B11_SIN2', 'B12_SIN2', 'B1_COS3', 'B2_COS3', 'B3_COS3', 'B4_COS3', 'B5_COS3', 'B6_COS3', 'B7_COS3', 'B8_COS3', 'B8A_COS3', 'B9_COS3', 'B11_COS3', 'B12_COS3', 'B1_SIN3', 'B2_SIN3', 'B3_SIN3', 'B4_SIN3', 'B5_SIN3', 'B6_SIN3', 'B7_SIN3', 'B8_SIN3', 'B8A_SIN3', 'B9_SIN3', 'B11_SIN3', 'B12_SIN3', 'B1_RMSE', 'B2_RMSE', 'B3_RMSE', 'B4_RMSE', 'B5_RMSE', 'B6_RMSE', 'B7_RMSE', 'B8_RMSE', 'B8A_RMSE', 'B9_RMSE', 'B11_RMSE', 'B12_RMSE']

var classifier = params.Classification.classifier(params.Classification.classifierParams)
var subsetTraining=true
var seed = 'random'
var trainProp =.4 
var results9 = utils.Classification.classifySegments(imageToClassify, params.Classification.segs.length, params.Classification.bandNames, ancillary, params.Classification.ancillaryFeatures,
    trainingData2, classifier, params.StudyRegion, params.Classification.classProperty,
    params.Classification.inputFeatures)
    .clip(params.StudyRegion)
 


var datamask = ee.Image('users/craigmahlasi/NDVI_16mask')
var  mask = datamask.gte(0.35) 

var results9 = results9.updateMask(mask) 
print(trainingData1)
Map.addLayer(clipped.select(0).randomVisualizer(), {}, 'ccdImage')
Map.addLayer(results9.select(0).randomVisualizer(), {}, 'Sg1  Classification')

var classUtils = require('users/craigmahlasi/CCDCuit:/class.js')
var classificationStack =  results9
var dateOfClassification1 = '2019-08-30'
var matchingDate1 = classUtils.getLcAtDate(classificationStack,
    dateOfClassification1)

var dateOfClassification2= '2019-09-20'
var matchingDate2 = classUtils.getLcAtDate(classificationStack,
    dateOfClassification2)

var dateOfClassification3 = '2019-10-01'
var matchingDate3 = classUtils.getLcAtDate(classificationStack,
    dateOfClassification2)
var class2015 = utils.Classification.getLcAtDate(classificationStack,
    '2018-01-01')
var mask2 =  matchingDate1.gte(0)
//var matchingDate1 = matchingDate1.updateMask(mask) 
//var matchingDate2 = matchingDate2.updateMask(mask) 
//var matchingDate3 = matchingDate3.updateMask(mask) 

 

var image2 = image2.updateMask(mask) 
var image3 = image3.updateMask(mask) 
var image4 = image4.updateMask(mask) 
var image5 = image5.updateMask(mask) 
var image6 = image5.updateMask(mask) 

var ndwi_pal = ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', 'green']
Map.addLayer(matchingDate1, {}, '20191')
Map.addLayer(matchingDate2, {}, '20192')
Map.addLayer(matchingDate2, {}, '20193')

Map.addLayer(image8)
Map.addLayer(image3.select('Thicket_Probability'), {min: 0, max:  1,palette: ndwi_pal}, '2019-09-10')
Map.addLayer(image2.select('Thicket_Probability'), {min: 0, max:  1, palette: ndwi_pal}, '2019-09-20')
Map.addLayer(image4.select('Thicket_Probability'), {min: 0, max:  1, palette: ndwi_pal}, '2019-10-01')
Map.addLayer(image5.select('Thicket_Probability'), {min: 0, max:  1, palette: ndwi_pal}, '2019-10-10')
Map.addLayer(image6.select('Thicket_Probability'), {min: 0, max:  1, palette: ndwi_pal}, '2019-10-20')
 
var clearing20
var clearing20
var clearing10 = (image4.select('Clearing_Probability').gte(0.7))

var clearing20 = image2.select('Clearing_Probability').gte(0.7).and(image3.select('Clearing_Probability').neq(1))
//Map.addLayer(clearing10, {}, 'clearing10')
var class2019 = utils.Classification.getLcAtDate(classificationStack,
    '2019-12-30')

var Clearing = class2015.eq(0)
    .and(class2019.eq(1))

Map.addLayer(Clearing.selfMask(),
    {palette: 'red'},
    'Clearing')

var postclearingClass = class2019.updateMask(Clearing)

Map.addLayer(postclearingClass.randomVisualizer(),
    {},
    'Post-Clearing Class')
print(params.Classification.coefs)
var seed= 10
var trainProp=.4
var predictors = ccdImage.bandNames()
print(predictors)

var predictors = ee.List(predictors)


// First load the API file
var utils = require('users/parevalo_bu/gee-ccdc-tools:ccdcUtilities/api')

// Load the results
var ccdc = ee.Image('users/craigmahlasi/CCDCimage')

var inputDate = '2019-12-30'
var dateParams = {inputFormat: 3, inputDate: inputDate, outputFormat: 1}
var formattedDate = utils.Dates.convertDate(dateParams)


// Spectral band names. This list contains all possible bands in this dataset
var BANDS = ['B1','B2','B3','B4','B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12']

// Names of the temporal segments
var SEGS = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10"]

// Obtain CCDC results in 'regular' ee.Image format
var ccdImage = utils.CCDC.buildCcdImage(ccdc, SEGS.length, BANDS)

// Define bands to select.
var SELECT_BANDS = ['B8', 'B4']

// Define coefficients to select. This list contains all possible segments
var SELECT_COEFS = ["INTP", "SLP", "COS", "SIN", "COS2", "SIN2", "COS3", "SIN3", "RMSE"]

// Obtain coefficients
var coefs = utils.CCDC.getMultiCoefs(ccdImage, formattedDate, SELECT_BANDS, SELECT_COEFS, true, SEGS, 'after')



var coefs1 = ['B1_INTP', 'B2_INTP', 'B3_INTP', 'B4_INTP', 'B5_INTP', 'B6_INTP', 'B7_INTP', 'B8_INTP', 'B8A_INTP', 'B9_INTP', 'B11_INTP', 'B12_INTP', 'B1_SLP', 'B2_SLP', 'B3_SLP', 'B4_SLP', 'B5_SLP', 'B6_SLP', 'B7_SLP', 'B8_SLP', 'B8A_SLP', 'B9_SLP', 'B11_SLP', 'B12_SLP', 'B1_COS', 'B2_COS', 'B3_COS', 'B4_COS', 'B5_COS', 'B6_COS', 'B7_COS', 'B8_COS', 'B8A_COS', 'B9_COS', 'B11_COS', 'B12_COS', 'B1_SIN', 'B2_SIN', 'B3_SIN', 'B4_SIN', 'B5_SIN', 'B6_SIN', 'B7_SIN', 'B8_SIN', 'B8A_SIN', 'B9_SIN', 'B11_SIN', 'B12_SIN', 'B1_COS2', 'B2_COS2', 'B3_COS2', 'B4_COS2', 'B5_COS2', 'B6_COS2', 'B7_COS2', 'B8_COS2', 'B8A_COS2', 'B9_COS2', 'B11_COS2', 'B12_COS2', 'B1_SIN2', 'B2_SIN2', 'B3_SIN2', 'B4_SIN2', 'B5_SIN2', 'B6_SIN2', 'B7_SIN2', 'B8_SIN2', 'B8A_SIN2', 'B9_SIN2', 'B11_SIN2', 'B12_SIN2', 'B1_COS3', 'B2_COS3', 'B3_COS3', 'B4_COS3', 'B5_COS3', 'B6_COS3', 'B7_COS3', 'B8_COS3', 'B8A_COS3', 'B9_COS3', 'B11_COS3', 'B12_COS3', 'B1_SIN3', 'B2_SIN3', 'B3_SIN3', 'B4_SIN3', 'B5_SIN3', 'B6_SIN3', 'B7_SIN3', 'B8_SIN3', 'B8A_SIN3', 'B9_SIN3', 'B11_SIN3', 'B12_SIN3', 'B1_RMSE', 'B2_RMSE', 'B3_RMSE', 'B4_RMSE', 'B5_RMSE', 'B6_RMSE', 'B7_RMSE', 'B8_RMSE', 'B8A_RMSE', 'B9_RMSE', 'B11_RMSE', 'B12_RMSE']



























//Export.image.toAsset({
//  image: class2019,
//  description: 'class2019',
//  assetId: 'class2019',
//  scale: 20,
//  region: studyRegion,
//  pyramidingPolicy: 'sample'
//});

 



var ac = ee.Image('users/craigmahlasi/class2019')

 
 
var con1 = classUtils.accuracyProcedure(trainingData2, imageToClassify, coefs1, BANDS, ancillary, classifier, params.Classification.classProperty, 10, .4)
 
 

print(con1)
