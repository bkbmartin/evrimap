var map;

function setMinLimit(event) {
    var id = parseInt($(event.target).attr("data-id"));
    var count = parseInt($(event.target).attr("data-count"));
    var min = parseInt($(event.target).attr("min"))

    var currentValue = $(event.target).val();
    $(".travelTime-" + (count + 1), ('#inputs-' + id)).prop('disabled', false);
    if (currentValue != 0 && currentValue != "" && parseInt(currentValue) >= min) {
        currentValue = parseInt(currentValue);
        $(".travelTime-" + (count + 1), ('#inputs-' + id)).attr("min", (currentValue + 1));
    } else {
        for (var i = count + 1; i <= 5; i++) {
            $(".travelTime-" + i, ('#inputs-' + id)).prop('disabled', true);
            $(".travelTime-" + i, ('#inputs-' + id)).val("");
        }
    }
}

$(document).ready(function () {
    var startingLocation = [-58.45205168391631, -34.60071207426402];
    var otherStores = [
        [-58.45307221477849, -34.60109731930584],
        [-58.45604694739092, -34.60253147418247],
        [-58.45222229117495, -34.610541298375935],
        [-58.46675598479618, -34.61208021540505],
        [-58.468285847282786, -34.60606428664291],
        [-58.46705345805729, -34.60050266245958],
        // [-58.4677758931208, -34.59273675281179],
        [-58.43692366631039, -34.59413606943479],
        [-58.436541200689035, -34.5855998714157],
        [-58.43547879618457, -34.58360563321978],
        [-58.43131417052706, -34.593121567232416],
        [-58.426767079248194, -34.59179220076703],
        [-58.4253647053022, -34.59508059483068],
        [-58.428551918815515, -34.5988935696452],
        [-58.48128967841738, -34.618585322202115],
        [-58.48133217459784, -34.621802713464014],
        [-58.41767289668982, -34.61547272717918]
    ];
    var stores = [];
    var markers = [];
    var coordinates = [];
    var features = {
        "coordinates": [],
        "visibility": "visible",
        "radius": {
            "id": "",
            "visibility": "visible",
            "feature": {}
        },
        "polygon": {
            "id": "",
            "visibility": "visible",
            "feature": {}
        },
        "isochrones": [
            {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
        ]
    };
    var savedFeatures = [features,];
    var mapboxIsochrone = {
        "id": "",
        "visibility": "visible",
        "feature": {}
    };
    var bingMapsIsochrone = {
        "id": "",
        "visibility": "visible",
        "feature": {}
    }
    var azureMapsIsochrone = {
        "id": "",
        "visibility": "visible",
        "feature": {}
    }
    var colors = ["#5D89A8", "#44AF69", "#FFC000", "#EF9738", "#D14F57"];

    mapboxgl.accessToken = 'pk.eyJ1IjoiYnJhbmRvbi1rYWhsZWw5OCIsImEiOiJja3oxNXRtZHkwZ3d5MndxZmMzeXV4N2llIn0.rDaS9FHkxMh6F8uLPXDrjg';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        preserveDrawingBuffer: true
    });
    map.on('idle', function () {
        map.resize();
    });
    map.setZoom(9);
    map.setCenter([-58.381592, -34.603722]); // Starting Position: [lng, lat]
    var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false
    });
    map.addControl(geocoder);
    map.addControl(new mapboxgl.NavigationControl());
    var draw = new MapboxDraw({
        displayControlsDefault: false,
        // Select which mapbox-gl-draw control buttons to add to the map.
        defaultMode: 'simple_select'
    });

    map.addControl(draw, 'top-left');

        
    geocoder.on("result", function (event) {
        coordinates.lng = event.result.center[0];
        coordinates.lat = event.result.center[1];
        marker.setLngLat(coordinates).addTo(map);
    });


    $(document).on("change", ".lngInput, .latInput", function () {
        var id = parseInt($(event.target).attr("data-id"));

        if ($(".lngInput").val()) {
            savedFeatures[id].coordinates[0] = parseFloat($(".lngInput").val());
        }
        if ($(".latInput").val()) {
            savedFeatures[id].coordinates[1] = parseFloat($(".latInput").val());
        }
        // console.log(savedFeatures[id].coordinates);

        if (savedFeatures[id].coordinates[0] && savedFeatures[id].coordinates[1]) {
            /*
            if (markers[id]) {
                markers[id].remove();
                markers[id] = null;
            }
            markers[id] = new mapboxgl.Marker({ color: "#0000FF" }).setLngLat(savedFeatures[id].coordinates).addTo(map);
            */
            var location = {
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': savedFeatures[id].coordinates
                    }
                }]
            };
            
            try {
                map.getSource("location").setData(location);
            } catch(err) {
                map.loadImage(
                    './img/markers/orange-marker.png',
                    (error, image) => {
                        if (error) throw error;
                        map.addImage('orange-marker', image);
    
                        map.addSource('location', {
                            'type': 'geojson',
                            'data': location
                        });
    
                        map.addLayer({
                            'id': 'location',
                            'type': 'symbol',
                            'source': 'location',
                            'layout': {
                                'icon-image': 'orange-marker',
                                'icon-anchor': 'center'
                            }
                        });
                    }
                );
            }
        }
    });


    $(document).on("click", ".placePin", function (event) {
        var id = parseInt($(event.target).attr("data-id"));
        draw.changeMode("draw_point");
        map.on('draw.create', function (event) {
            var drawMode = draw.getMode();
            var drawnFeature = event.features[0];
            if (drawMode == "draw_point") {
                draw.trash();
                coordinates = [...drawnFeature.geometry.coordinates];
                $('input[name="lng"]', ('#inputs-' + id)).val(coordinates[0]);
                $('input[name="lat"]', ('#inputs-' + id)).val(coordinates[1]);
                /*
                if (markers[id]) {
                    markers[id].remove();
                    markers[id] = null;
                }
                markers[id] = new mapboxgl.Marker({ color: "#0000FF" }).setLngLat(coordinates).addTo(map);
                */
                
                var location = {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': coordinates
                        }
                    }]
                };
                
                try {
                    map.getSource("location").setData(location);
                } catch(err) {
                    map.loadImage(
                        './img/markers/orange-marker.png',
                        (error, image) => {
                            if (error) throw error;
                            map.addImage('orange-marker', image);
        
                            map.addSource('location', {
                                'type': 'geojson',
                                'data': location
                            });
        
                            map.addLayer({
                                'id': 'location',
                                'type': 'symbol',
                                'source': 'location',
                                'layout': {
                                    'icon-image': 'orange-marker',
                                    'icon-anchor': 'center'
                                }
                            });
                        }
                    );
                }

                // TODO: add changes to radius and isochrone layers upon change
            }
        });
    });

    $(document).on("click", ".drawPolygon", function (event) {
        var id = parseInt($(event.target).attr("data-id"));
        draw.changeMode("draw_polygon");
        map.on('draw.create', function (event) {
            var drawMode = draw.getMode();
            var drawnFeature = event.features[0];
            if (drawMode == "draw_polygon") {
                draw.trash();

                savedFeatures[id].polygon.feature = drawnFeature;

                var area = turf.area(drawnFeature) / 1000000;
                drawnFeature.properties = {
                    "featureType": "polygon",
                    "area": parseFloat(area.toFixed(2))
                }

                if (savedFeatures[id].polygon.id == "") {
                    savedFeatures[id].polygon.id = uuidv4();
                }

                var source_id = "source-" + savedFeatures[id].polygon.id;
                if (map.getSource(source_id)) {
                    map.getSource(source_id).setData(drawnFeature);
                } else {
                    map.addSource(source_id, {
                        type: "geojson",
                        data: drawnFeature
                    });

                    var fill_id = "fill-" + savedFeatures[id].polygon.id;
                    var line_id = "line-" + savedFeatures[id].polygon.id;

                    map.addLayer({
                        id: fill_id,
                        type: "fill",
                        source: source_id,
                        layout: {
                            "visibility": savedFeatures[id].polygon.visibility
                        },
                        paint: {
                            "fill-color": "#f2ac60",
                            "fill-opacity": 0.2
                        }
                    });
                    map.addLayer({
                        id: line_id,
                        type: "line",
                        source: source_id,
                        layout: {
                            "visibility": savedFeatures[id].polygon.visibility
                        },
                        paint: {
                            "line-color": "#f2ac60",
                            "line-width": 1
                        }
                    });
                }

                $('.polygonArea', ('#inputs-' + id)).html(parseFloat(area.toFixed(2)).toLocaleString("en-US"));
            }
        });
    });

    $(document).on("change", ".radiusInput", function (event) {
        var id = parseInt($(event.target).attr("data-id"));
        var radius = $(".radiusInput", ('#inputs-' + id)).val();

        if (coordinates.length > 0) {
            var options = {
                steps: 64,
                units: "kilometers",
            };
            var circle = turf.circle(coordinates, radius, options);
            var area = turf.area(circle) / 1000000;
            circle.properties = {
                "featureType": "radius",
                "radius": radius,
                "area": parseFloat(area.toFixed(2))
            }
            // console.log(circle);
            savedFeatures[id].radius.feature = circle;

            if (savedFeatures[id].radius.id == "") {
                savedFeatures[id].radius.id = uuidv4();
            }

            var source_id = "source-" + savedFeatures[id].radius.id;
            if (map.getSource(source_id)) {
                map.getSource(source_id).setData(circle);
            } else {
                map.addSource(source_id, {
                    type: "geojson",
                    data: circle
                });

                var fill_id = "fill-" + savedFeatures[id].radius.id;
                var line_id = "line-" + savedFeatures[id].radius.id;

                map.addLayer({
                    id: fill_id,
                    type: "fill",
                    source: source_id,
                    layout: {
                        "visibility": savedFeatures[id].radius.visibility
                    },
                    paint: {
                        "fill-color": "#f5c188",
                        "fill-opacity": 0.2
                    }
                }, "location");
                map.addLayer({
                    id: line_id,
                    type: "line",
                    source: source_id,
                    layout: {
                        "visibility": savedFeatures[id].radius.visibility
                    },
                    paint: {
                        "line-color": "#f5c188",
                        "line-width": 1
                    }
                }, "location");
            }

            $('.radiusArea', ('#inputs-' + id)).html(parseFloat(area.toFixed(2)).toLocaleString("en-US"));
            /*
            console.log(features.radius);
            if (features.radius != "") {
                circle.id = features.radius;
                draw.add(circle);
            } else {
                features.radius = (draw.add(circle))[0];
            }
            */
        }
    });

    $(document).on("click", ".generateTimeMap", function (event) {
        var id = parseInt($(event.target).attr("data-id"));

        var bingMapsKey = "AhvdEi_ko9tlWb0VsXeDR8HiM9E0vT_gK3Ip6-7Fb2n1r2uS-zQa52oRItW1W9wu";

        var lng = ($('input[name="lng"]', ('#inputs-' + id)).val() != "" ? parseFloat($('input[name="lng"]', ('#inputs-' + id)).val()) : parseFloat("0"));
        var lat = ($('input[name="lat"]', ('#inputs-' + id)).val() != "" ? parseFloat($('input[name="lat"]', ('#inputs-' + id)).val()) : parseFloat("0"));
        var waypoint = lat + "," + lng;

        var travelTimeInputs = [];

        for (var i = 1; i <= 5; i++) {
            if ($(".travelTime-" + i, ('#inputs-' + id)).val() != "") {
                var currentValue = parseInt($(".travelTime-" + i, ('#inputs-' + id)).val());
                if (i > 1 && currentValue < parseInt(travelTimeInputs[i - 1])) {
                    continue;
                }
                travelTimeInputs.push($(".travelTime-" + i, ('#inputs-' + id)).val());
            }
        }

        var modeOfTransport = $(".modeOfTransport", ('#inputs-' + id)).val();

        var date = $("#datepicker").val();
        var time = $("#timepicker").val();
        var datetime = moment(date + ' ' + time).toISOString();

        for (var i = 0; i < travelTimeInputs.length; i++) {
            var travelTimeInput = travelTimeInputs[i];
            var travelTime = (travelTimeInput != "" ? parseInt(travelTimeInput) * 60 : 0);

            var query = `https://dev.virtualearth.net/REST/v1/Routes/Isochrones?waypoint=${waypoint}&maxtime=${travelTime}&dateTime=${datetime}&travelMode=${modeOfTransport}&key=${bingMapsKey}`
            console.log(query);

            $.ajax({
                url: query,
                method: "GET",
                async: false,
                success: function (data) {
                    var polygons = data.resourceSets[0].resources[0].polygons[0].coordinates;
                    var coordinates = polygons.map(polygon => polygon.map(point => [point[1], point[0]]));

                    var feature = {
                        type: 'Feature',
                        geometry: {
                            type: 'Polygon',
                            coordinates: coordinates
                        },
                        properties: {}
                    }

                    var area = turf.area(feature) / 1000000;
                    $('.isochroneArea-' + (i + 1).toString(), ('#inputs-' + id)).html(parseFloat(area.toFixed(1)).toLocaleString("en-US"));

                    if (i > 0) {
                        var union = savedFeatures[id].isochrones[0].feature;
                        for (var j = 1; j < i; j++) {
                            union = turf.union(union, savedFeatures[id].isochrones[j].feature);
                        }
                        feature = turf.difference(feature, union);
                    }

                    feature.properties.count = i;
                    feature.properties.featureType = "isochrone";
                    feature.properties.travelTime = travelTimeInput;
                    feature.properties.modeOfTransport = modeOfTransport;
                    feature.properties.departureDate = date;
                    feature.properties.departureTime = time;
                    feature.properties.area = area;

                    /*
                    var area = turf.area(feature) / 1000000;
                    $('.isochroneArea', ('#inputs-' + id)).html(parseFloat(area.toFixed(2)).toLocaleString("en-US"));
                    feature.properties.area = area;
                    */

                    if (savedFeatures[id].isochrones[i].id == "") {
                        savedFeatures[id].isochrones[i].id = uuidv4();
                    }

                    savedFeatures[id].isochrones[i].feature = feature;
                    // console.log(savedFeatures[id].isochrones);

                    var source_id = "source-" + savedFeatures[id].isochrones[i].id;
                    if (map.getSource(source_id)) {
                        map.getSource(source_id).setData(feature);
                    } else {
                        map.addSource(source_id, {
                            type: "geojson",
                            data: feature
                        });

                        var fill_id = "fill-" + savedFeatures[id].isochrones[i].id;
                        var line_id = "line-" + savedFeatures[id].isochrones[i].id;

                        map.addLayer({
                            id: fill_id,
                            type: "fill",
                            source: source_id,
                            layout: {
                                "visibility": "visible"
                            },
                            paint: {
                                "fill-color": colors[i],
                                "fill-opacity": 0.2
                            }
                        }, "location");
                        map.addLayer({
                            id: line_id,
                            type: "line",
                            source: source_id,
                            layout: {
                                "visibility": "visible"
                            },
                            paint: {
                                "line-color": colors[i],
                                "line-width": 1
                            }
                        }, "location");
                    }
                }
            });
        }
    });

    $(document).on("click", ".hide-btn", function (event) {
        event.preventDefault();

        var id = parseInt($(event.target).attr("data-id"));
        var layerType = $(event.target).data("layer");
        var layerId;
        var layerIds = [];
        if (layerType == "mapbox") {
            layerId = mapboxIsochrone.id;
        } else if (layerType == "bing") {
            layerId = bingMapsIsochrone.id;
        } else if (layerType == "azure") {
            layerId = azureMapsIsochrone.id;
        } else if (layerType == "isochrone") {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                layerIds[i] = savedFeatures[id].isochrones[i].id;
            }
        } else if (layerType != "marker") {
            layerId = savedFeatures[id][layerType].id;
        }

        $(("." + layerType + " > .hide-btn"), "#inputs-" + id).hide();
        $(("." + layerType + " > .show-btn"), "#inputs-" + id).show()

        if (layerType == "marker") {
            /*
            if (markers[id]) {
                markers[id].remove();
                markers[id] = null;
            } */
            map.setLayoutProperty('location', 'visibility', 'none');
        } else if (layerType == "isochrone") {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                if (layerIds[i] != "") {
                    var fill_id = "fill-" + layerIds[i];
                    var line_id = "line-" + layerIds[i];

                    map.setLayoutProperty(fill_id, 'visibility', 'none');
                    map.setLayoutProperty(line_id, 'visibility', 'none');

                    savedFeatures[id].isochrones[i].visibility = "none";
                }
            }
        } else {
            var fill_id = "fill-" + layerId;
            var line_id = "line-" + layerId;

            map.setLayoutProperty(fill_id, 'visibility', 'none');
            map.setLayoutProperty(line_id, 'visibility', 'none');

            if (layerType == "mapbox") {
                mapboxIsochrone.visibility = "none";
            } else if (layerType == "bing") {
                bingMapsIsochrone.visibility = "none";
            } else if (layerType == "azure") {
                azureMapsIsochrone.visibility = "none";
            } else {
                savedFeatures[id][layerType].visibility = "none";
            }
        }
    });

    $(document).on("click", ".show-btn", function (event) {
        event.preventDefault();

        var id = parseInt($(event.target).attr("data-id"));
        var layerType = $(event.target).data("layer");
        var layerId;
        var layerIds = [];
        if (layerType == "mapbox") {
            layerId = mapboxIsochrone.id;
        } else if (layerType == "bing") {
            layerId = bingMapsIsochrone.id;
        } else if (layerType == "azure") {
            layerId = azureMapsIsochrone.id;
        } else if (layerType == "isochrone") {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                layerIds[i] = savedFeatures[id].isochrones[i].id;
            }
        } else if (layerType != "marker") {
            layerId = savedFeatures[id][layerType].id;
        }

        $(("." + layerType + " > .hide-btn"), "#inputs-" + id).show();
        $(("." + layerType + " > .show-btn"), "#inputs-" + id).hide()


        if (layerType == "marker") {
            /*
            if (markers[id] == null) {
                markers[id] = new mapboxgl.Marker({ color: "#0000FF" }).setLngLat(coordinates).addTo(map);
            } */
            map.setLayoutProperty('location', 'visibility', 'visible');
        } else if (layerType == "isochrone") {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                if (layerIds[i] != "") {
                    var fill_id = "fill-" + layerIds[i];
                    var line_id = "line-" + layerIds[i];

                    map.setLayoutProperty(fill_id, 'visibility', 'visible');
                    map.setLayoutProperty(line_id, 'visibility', 'visible');

                    savedFeatures[id].isochrones[i].visibility = "visible";
                }
            }
        } else {
            var fill_id = "fill-" + layerId;
            var line_id = "line-" + layerId;
            map.setLayoutProperty(fill_id, 'visibility', 'visible');
            map.setLayoutProperty(line_id, 'visibility', 'visible');

            if (layerType == "mapbox") {
                mapboxIsochrone.visibility = "visible";
            } else if (layerType == "bing") {
                bingMapsIsochrone.visibility = "visible";
            } else if (layerType == "azure") {
                azureMapsIsochrone.visibility = "visible";
            } else {
                savedFeatures[id][layerType].visibility = "visible";
            }
        }

    });

    $(document).on("click", ".delete-btn", function(event) {
        event.preventDefault();

        var id = parseInt($(event.target).attr("data-id"));
        var layerType = $(event.target).data("layer");
        var layerId;
        var layerIds = [];
        if (layerType == "mapbox") {
            layerId = mapboxIsochrone.id;
        } else if (layerType == "bing") {
            layerId = bingMapsIsochrone.id;
        } else if (layerType == "azure") {
            layerId = azureMapsIsochrone.id;
        } else if (layerType == "isochrone") {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                layerIds[i] = savedFeatures[id].isochrones[i].id;
            }
            // console.log(layerIds);
        } else {
            layerId = savedFeatures[id][layerType].id;
        }

        if (layerType != "isochrone") {
            var fill_id = "fill-" + layerId;
            var line_id = "line-" + layerId;

            if (map.getLayer(fill_id)) {
                map.removeLayer(fill_id);
            }

            if (map.getLayer(line_id)) {
                map.removeLayer(line_id);
            }

            var sourceId;
            if (layerType == "mapbox" || layerType == "bing" || layerType == "azure") {
                sourceId = layerId;
            } else {
                sourceId = "source-" + layerId;
            }
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        } else {
            for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
                if (layerIds[i] != "") {
                    var fill_id = "fill-" + layerIds[i];
                    var line_id = "line-" + layerIds[i];

                    if (map.getLayer(fill_id)) {
                        map.removeLayer(fill_id);
                    }

                    if (map.getLayer(line_id)) {
                        map.removeLayer(line_id);
                    }

                    var sourceId = "source-" + layerIds[i];
                    if (map.getSource(sourceId)) {
                        map.removeSource(sourceId);
                    }
                }
            }
        }

        console.log(layerType);

        switch (layerType) {
            case "radius":
                $(".radiusInput", ('#inputs-' + id)).val(0);
                $('.radiusArea', ('#inputs-' + id)).html("0");
                break;
            case "isochrone":
                $(".isochroneArea-1", ('#inputs-' + id)).html("0");
                $(".isochroneArea-2", ('#inputs-' + id)).html("0");
                $(".isochroneArea-3", ('#inputs-' + id)).html("0");
                $(".isochroneArea-4", ('#inputs-' + id)).html("0");
                $(".isochroneArea-5", ('#inputs-' + id)).html("0");
                $(".travelTime-1", ('#inputs-' + id)).val("0");
                $(".travelTime-2", ('#inputs-' + id)).val("");
                $(".travelTime-2", ('#inputs-' + id)).attr("min", 0);
                $(".travelTime-2", ('#inputs-' + id)).prop('disabled', true);
                $(".travelTime-3", ('#inputs-' + id)).val("");
                $(".travelTime-3", ('#inputs-' + id)).attr("min", 0);
                $(".travelTime-3", ('#inputs-' + id)).prop('disabled', true);
                $(".travelTime-4", ('#inputs-' + id)).val("");
                $(".travelTime-4", ('#inputs-' + id)).attr("min", 0);
                $(".travelTime-4", ('#inputs-' + id)).prop('disabled', true);
                $(".travelTime-5", ('#inputs-' + id)).val("");
                $(".travelTime-5", ('#inputs-' + id)).attr("min", 0);
                $(".travelTime-5", ('#inputs-' + id)).prop('disabled', true);
                $(".modeOfTransport", ('#inputs-' + id)).val("driving");
                $("#datepicker", ('#inputs-' + id)).val("");
                $("#timepicker", ('#inputs-' + id)).val("");
                break;
            case "polygon":
                $('.polygonArea', ('#inputs-' + id)).html("0");
                break;
            case "mapbox":
                $(".travelTime2", ('#inputs-' + id)).val(0);
                $('.isochroneArea2', ('#inputs-' + id)).html("0");
                break;
            case "bing":
                $(".travelTime3", ('#inputs-' + id)).val(0);
                $('.isochroneArea3', ('#inputs-' + id)).html("0");
                $('.modeOfTransport3', ('#inputs-' + id)).val("driving");
                $('.datepicker3', ('#inputs-' + id)).val("");
                $('.timepicker3', ('#inputs-' + id)).val("");
                break;
            case "azure":
                $(".travelTime4", ('#inputs-' + id)).val(0);
                $('.isochroneArea4', ('#inputs-' + id)).html("0");
                $('.modeOfTransport4', ('#inputs-' + id)).val("car");
                $('.datepicker4', ('#inputs-' + id)).val("");
                $('.timepicker4', ('#inputs-' + id)).val("");
                break;
        }

        if (layerType == "mapbox") {
            mapboxIsochrone.id = "";
            mapboxIsochrone.visibility = "visible";
        } else if (layerType == "bing") {
            bingMapsIsochrone.id = "";
            bingMapsIsochrone.visibility = "visible";
        } else if (layerType == "azure") {
            azureMapsIsochrone.id = "";
            azureMapsIsochrone.visibility = "visible";
        } else if (layerType == "isochrone") {
            savedFeatures[id].isochrones = [
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
            ];
        } else {
            savedFeatures[id][layerType].id = "";
            savedFeatures[id][layerType].visibility = "visible";
        }

        $(("." + layerType + " > .hide-btn"), "#inputs-" + id).show();
        $(("." + layerType + " > .show-btn"), "#inputs-" + id).hide();
    });

    $(document).on("click", ".hide-isochrone-btn", function (event) {
        event.preventDefault();

        var id = parseInt($(event.target).attr("data-id"));
        var count = parseInt($(event.target).attr("data-count"));

        if (savedFeatures[id].isochrones[(count - 1)].id != "") {
            var fill_id = "fill-" + savedFeatures[id].isochrones[(count - 1)].id;
            var line_id = "line-" + savedFeatures[id].isochrones[(count - 1)].id;

            map.setLayoutProperty(fill_id, 'visibility', 'none');
            map.setLayoutProperty(line_id, 'visibility', 'none');

            savedFeatures[id].isochrones[(count - 1)].visibility = "none";

            $((".isochrone-layer-" + count + " > .hide-isochrone-btn"), "#inputs-" + id).hide();
            $((".isochrone-layer-" + count + " > .show-isochrone-btn"), "#inputs-" + id).show();
        }
    });

    $(document).on("click", ".show-isochrone-btn", function (event) {
        event.preventDefault();

        var id = parseInt($(event.target).attr("data-id"));
        var count = parseInt($(event.target).attr("data-count"));

        if (savedFeatures[id].isochrones[(count - 1)].id != "") {
            var fill_id = "fill-" + savedFeatures[id].isochrones[(count - 1)].id;
            var line_id = "line-" + savedFeatures[id].isochrones[(count - 1)].id;

            map.setLayoutProperty(fill_id, 'visibility', 'visible');
            map.setLayoutProperty(line_id, 'visibility', 'visible');
            
            savedFeatures[id].isochrones[(count - 1)].visibility = "visible";

            $((".isochrone-layer-" + count + " > .show-isochrone-btn"), "#inputs-" + id).hide();
            $((".isochrone-layer-" + count + " > .hide-isochrone-btn"), "#inputs-" + id).show();
        }
    });

    function deleteLayer(layerId) {
        var sourceId = "source-" + layerId;
        var fill_id = "fill-" + layerId;
        var line_id = "line-" + layerId;
        if (map.getLayer(fill_id)) {
            map.removeLayer(fill_id);
        }
        if (map.getLayer(line_id)) {
            map.removeLayer(line_id);
        }
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId);
        }
    }

    /*
    $(document).on("click", "#clearLayers", function (event) {
        var id = parseInt($(event.target).attr("data-id"));

        $('input[name="name"]', ('#inputs-' + id)).val("");
        $(".lngInput", ('#inputs-' + id)).val("");
        $(".latInput", ('#inputs-' + id)).val("");
        if (markers[id]) {
            markers[id].remove();
        }

        $(".radiusArea", ('#inputs-' + id)).html("0");
        $(".radiusInput", ('#inputs-' + id)).val("");
        $((".radius > .hide-btn"), "#inputs-" + id).show();
        $((".radius > .show-btn"), "#inputs-" + id).hide();
        deleteLayer(savedFeatures[id].radius.id);


        $(".polygonArea", ('#inputs-' + id)).html("0");
        $((".polygon > .hide-btn"), "#inputs-" + id).show();
        $((".polygon > .show-btn"), "#inputs-" + id).hide();
        deleteLayer(savedFeatures[id].polygon.id);

        $(".isochroneArea-1", ('#inputs-' + id)).html("0");
        $(".isochroneArea-2", ('#inputs-' + id)).html("0");
        $(".isochroneArea-3", ('#inputs-' + id)).html("0");
        $(".isochroneArea-4", ('#inputs-' + id)).html("0");
        $(".isochroneArea-5", ('#inputs-' + id)).html("0");
        $(".travelTime-1", ('#inputs-' + id)).val("");
        $(".travelTime-2", ('#inputs-' + id)).val("");
        $(".travelTime-2", ('#inputs-' + id)).attr("min", 0);
        $(".travelTime-2", ('#inputs-' + id)).prop('disabled', true);
        $(".travelTime-3", ('#inputs-' + id)).val("");
        $(".travelTime-3", ('#inputs-' + id)).attr("min", 0);
        $(".travelTime-3", ('#inputs-' + id)).prop('disabled', true);
        $(".travelTime-4", ('#inputs-' + id)).val("");
        $(".travelTime-4", ('#inputs-' + id)).attr("min", 0);
        $(".travelTime-4", ('#inputs-' + id)).prop('disabled', true);
        $(".travelTime-5", ('#inputs-' + id)).val("");
        $(".travelTime-5", ('#inputs-' + id)).attr("min", 0);
        $(".travelTime-5", ('#inputs-' + id)).prop('disabled', true);
        $(".modeOfTransport", ('#inputs-' + id)).val("driving");
        $("#datepicker", ('#inputs-' + id)).val("");
        $("#timepicker", ('#inputs-' + id)).val("");
        $((".isochrone > .hide-btn"), "#inputs-" + id).show();
        $((".isochrone > .show-btn"), "#inputs-" + id).hide();
        for (var i = 0; i < savedFeatures[id].isochrones.length; i++) {
            if (savedFeatures[id].isochrones[i].id != "") {
                deleteLayer(savedFeatures[id].isochrones[i].id);
            }
        }

        savedFeatures[id] = {
            "coordinates": [],
            "visibility": "visible",
            "radius": {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            "polygon": {
                "id": "",
                "visibility": "visible",
                "feature": {}
            },
            "isochrones": [
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
                {
                    "id": "",
                    "visibility": "visible",
                    "feature": {}
                },
            ]
        };
    });
    */

    $(document).on("change", "#csv-file-upload", function(event) {
        var files = document.querySelector('#csv-file-upload').files;
        if(files.length > 0 ){
            var file = files[0];

            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function(event) {
                var csvData = event.target.result;
                var rowData = csvData.split('\n');

                var headers = rowData[0].split(',');
                var latIdx = -1
                var lngIdx = -1
                for (var colIdx = 0; colIdx < headers.length; colIdx++) {
                    if (headers[colIdx] == "lat") {
                        latIdx = colIdx;
                    } else if (headers[colIdx] == "lng") {
                        lngIdx = colIdx;
                    }
                }

                if (latIdx > -1 && lngIdx > -1) {
                    for (var rowIdx = 1; rowIdx < rowData.length; rowIdx++) {
                        var row = rowData[rowIdx].split(',');
                        var coordinates = [row[lngIdx], row[latIdx]];
                        stores.push(coordinates)
                    }
                }

                if (stores.length > 0) {
                    // TODO: Add checking for if the map already is displaying store points and update that with new set instead

                    var points = {
                        'type': 'FeatureCollection',
                        'features': []
                    };
                    for (var i = 0; i < stores.length; i++) {
                        points.features.push({
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': stores[i]
                            }
                        });
                    }

                    try {
                        map.getSource("stores").setData(points)
                    } catch (err) {
                        console.log(err);
                        map.loadImage(
                            './img/markers/red-marker.png',
                            (error, image) => {
                                if (error) throw error;
                                map.addImage('custom-marker', image);
    
                                map.addSource('stores', {
                                    'type': 'geojson',
                                    'data': points
                                });
    
                                map.addLayer({
                                    'id': 'stores',
                                    'type': 'symbol',
                                    'source': 'stores',
                                    'layout': {
                                        'icon-image': 'custom-marker',
                                        'icon-anchor': 'center'
                                    }
                                }, "location");
                            }
                        );
                    }
                }
                
                
            };

        }
    });

    $(document).on("click", "#generateCompetitiveMapping", function(event) {
        var polygonFeature = savedFeatures[0].isochrones[0].feature;
        if (Object.keys(polygonFeature).length != 0) {
            // Calculating points within polygon
            var points = turf.points(stores);
            var searchWithin = turf.polygon(polygonFeature.geometry.coordinates);
            var pointsWithin = turf.pointsWithinPolygon(points, searchWithin);

            // Getting the difference to get points outside of polygon
            var pointsArray = turf.coordAll(points);
            var pointsWithinArray = turf.coordAll(pointsWithin);
            var pointsOutsideArray = pointsArray.filter(x => !pointsWithinArray.includes(x));
            var pointsOutside = turf.points(pointsOutsideArray);

            // Display points
            try {
                map.getSource("points-within").setData(pointsWithin);
            } catch(err) {
                map.loadImage(
                    './img/markers/red-marker.png',
                    (error, image) => {
                        if (error) throw error;
                        map.addImage('red-marker', image);
    
                        map.addSource('points-within', {
                            'type': 'geojson',
                            'data': pointsWithin
                        });
    
                        map.addLayer({
                            'id': 'points-within',
                            'type': 'symbol',
                            'source': 'points-within',
                            'layout': {
                                'icon-image': 'red-marker',
                                'icon-anchor': 'center'
                            }
                        }, "location");
                    }
                );
            }
            
            try {
                map.getSource("points-outside").setData(pointsOutside);
            } catch(err) {
                map.loadImage(
                    './img/markers/grey-marker.png',
                    (error, image) => {
                        if (error) throw error;
                        map.addImage('grey-marker', image);
    
                        map.addSource('points-outside', {
                            'type': 'geojson',
                            'data': pointsOutside
                        });
    
                        map.addLayer({
                            'id': 'points-outside',
                            'type': 'symbol',
                            'source': 'points-outside',
                            'layout': {
                                'icon-image': 'grey-marker',
                                'icon-anchor': 'center'
                            }
                        }, "location");
                    }
                );
            }
            

            map.deleteLayer("stores");
        }
    });

    $(document).on("click", "#downloadScreenshot", function(event) {
        var img = map.getCanvas().toDataURL();
        var link = document.createElement('a');
        link.href = img;
        var fileId = uuidv4();
        var filename = "evrimap_" + fileId + ".png";
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});