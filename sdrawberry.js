function addLayers (number) {
    for (var i=0; i<number; i++) {
	layer = new Kinetic.Layer({id: 'L'+layerIdCounter});
	dragrect = new Kinetic.Rect({width: stage.getWidth(), height: stage.getHeight(), id: 'Rec'+rectIdCounter});
	layerIdCounter++;
	rectIdCounter++;
	layer.add(dragrect);
	layer.setListening(false);
	stage.add(layer);
	ahierarchy.push(layer.getId());
	selectLayer(layer.getId());
    }
    redrawLayerForm();
}
	
function makeImageHistory() {
    imageHistoryStep++;
    if (imageHistoryStep < imageHistory.length) {
        imageHistory.length = imageHistoryStep;
    }
    var json = layer.toJSON();
    imageHistory.push(json);
    setimagedata();
    stage.draw();
}

function searcharray(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return i;
    }
}

function undoImageHistory() {
    if (imageHistoryStep > 0) {
        imageHistoryStep--;
	var steps = searcharray(ahierarchy,layer.getId());
	ahierarchy.splice(searcharray(ahierarchy,layer.getId()), 1);
	var layerid = layer.getId();
        layer.destroy();
	rectIdCounter++;
        layer = Kinetic.Node.create(imageHistory[imageHistoryStep], 'container')
	var dragrect = new Kinetic.Rect({width: stage.getWidth(), height: stage.getHeight(), id: 'Rec'+rectIdCounter});
	layer.add(dragrect);
	layer.setListening(false);
	layer.setId(layerid);	
	ahierarchy.push(layer.getId());
        stage.add(layer);
	for (var i=1; i < ahierarchy.length-steps; i++) {
	    var position = searcharray(ahierarchy,layer.getId());
	    ahierarchy.swap(position-1,position);
	    layer.moveDown();
	}
	currentLayerId = layer.getId();
	redrawLayerForm();
    }
}

function redoImageHistory() {
    if (imageHistoryStep < imageHistory.length-1) {
        imageHistoryStep++;
	var steps = searcharray(ahierarchy,layer.getId());
	ahierarchy.splice(searcharray(ahierarchy,layer.getId()), 1);
	var layerid = layer.getId();
        layer.destroy();
	rectIdCounter++;
        layer = Kinetic.Node.create(imageHistory[imageHistoryStep], 'container')
	var dragrect = new Kinetic.Rect({width: stage.getWidth(), height: stage.getHeight(), id: 'Rec'+rectIdCounter});
	layer.add(dragrect);
	layer.setListening(false);
	layer.setId(layerid);	
	ahierarchy.push(layer.getId());
        stage.add(layer);
	for (var i=1; i < ahierarchy.length-steps; i++) {
	    var position = searcharray(ahierarchy,layer.getId());
	    ahierarchy.swap(position-1,position);
	    layer.moveDown();
	}
	currentLayerId = layer.getId();
	redrawLayerForm();
    }
}

function redrawLayerForm() {
    var newHTML = [];
    for (var i=0; i < ahierarchy.length; i++)
    {
	var id = ahierarchy[i];
	if (id == currentLayerId) {	    
	    newHTML[i] = "<input type=\"radio\" name=\"layerRadio\" value=\"" + id + "\" onclick=\"selectLayer('" + id + "');\" checked=\"checked\">" + id + "<br/>";
	} else {
	    newHTML[i] = "<input type=\"radio\" name=\"layerRadio\" value=\"" + id + "\" onclick=\"selectLayer('" + id + "');\">" + id + "<br/>";
	}
    }
    var insert = newHTML.reverse().join("\n");
    document.getElementById('radioForm').innerHTML = insert;
}

function moveLayerUp(rObj) {
    for (var i=0; i < rObj.length; i++) 
    { 
	if (rObj[i].checked && i>0)
	{ 
	    var layerid = rObj[i].value;
	    var position = searcharray(ahierarchy,layerid);
	    ahierarchy.swap(position+1,position);
	    layer.moveUp();
	}
    }
    redrawLayerForm();
}

function moveLayerDown(rObj) {
    for (var i=0; i < rObj.length; i++) 
    { 
	if (rObj[i].checked && i<rObj.length-1)
	{ 
	    var layerid = rObj[i].value;
	    var position = searcharray(ahierarchy,layerid);
	    ahierarchy.swap(position-1,position);
	    layer.moveDown();
	}
    }
    redrawLayerForm();
}

function selectLayer(string) {
    if (layer != null) {
    	layer.setListening(false);
    	layer.setDraggable(false);
    	layer.drawHit();
    }    
    layer = stage.find(eval('\'#'+string+'\''))[0];
    currentLayerId = string;
    updateAction(action);
    imageHistory = [];
    imageHistoryStep = 0;
}

function selectBrush(i) {
    brush = i;
}

function updateColor(newcolor) {
    color = newcolor;
}

function updateAction(newaction){
    action = newaction;
    layer.setDraggable(false);
    layer.setListening(false);
    layer.drawHit();
    if (action == "moving"){
	layer.setListening(true);
	layer.setDraggable(true);
	layer.drawHit();
    }
}

function setimagedata() {
    stage.toDataURL({
	callback: function(data){
            $('#image_data').val(data);
	}
    });
}

function mirrorLayer() {
    layer.setScale(layer.getScale().x * (-1),1);
    if (layer.getScale().x == -1) {
	layer.setPosition(640,0);
    } else {
	layer.setPosition(0,0);
    }
    layer.draw();
}

function addImage(imagesrc) {
    var imageObj = new Image();
    var image = new Kinetic.Image({image: imageObj});
    layer.add(image);
    imageObj.src = imagesrc;
    makeImageHistory();
}

function initialize() {
    Array.prototype.swap = function (x,y) {
	var b = this[x];
	this[x] = this[y];
	this[y] = b;
	return this;
    }

    checkedindex = 4;
    brush = 3;
    stage = new Kinetic.Stage({
	container: 'kineticcontainer',
	width: 640,
	height: 480
    });
    isMousedown = false;
    points = [];
    color = "black";
    action = "drawing";
    imageHistoryStep = 0;
    imageHistory = [];
    layerIdCounter = 0;
    rectIdCounter = 0;
    currentLayerId = "L0";
    ahierarchy = [];

    stage.on('contentMousedown', function() {
	isMousedown = true;
	if (action == "drawing") {
	    points = [];
	    points.push([stage.getPointerPosition().x - layer.getPosition().x,stage.getPointerPosition().y - layer.getPosition().y]);
	    line = new Kinetic.Line({
		points: points,
		stroke: color,
		strokeWidth: brush,
		lineCap: 'round',
		lineJoin: 'round',
		dragOnTop: false
	    });
	    layer.add(line);
	    newline = line;
	} else if (action == "scaling") {
	    scalestartx = stage.getPointerPosition().x;
	    scalestarty = stage.getPointerPosition().y;
	} else if (action == "rotating") {
	    rotatestart = stage.getPointerPosition().y;
	    layer.setOffset(stage.getPointerPosition());
	    layer.setPosition(layer.getOffset());
	}
    });

    stage.on('contentMousemove', function() {
	if (isMousedown) {
	    if (action == "drawing") {
		points.push([stage.getPointerPosition().x - layer.getPosition().x,stage.getPointerPosition().y - layer.getPosition().y]);
		newline.setPoints(points);
		newline.drawScene();
	    } else if (action == "scaling") {
		var scalex = (scalestartx - stage.getPointerPosition().x) / (stage.getWidth());
		var scaley = (scalestarty - stage.getPointerPosition().y) / (stage.getHeight());
		layer.setScale(layer.getScale().x - scalex,layer.getScale().y - scaley);
		scalestartx = stage.getPointerPosition().x;
		scalestarty = stage.getPointerPosition().y;
		layer.drawScene();
	    } else if (action == "rotating") {
		var angle = (rotatestart - stage.getPointerPosition().y) / 50;
		layer.rotate(angle);
		rotatestart = stage.getPointerPosition().y;
		layer.drawScene();
	    }
	}
    });

    stage.on('contentMouseup', function() {
	isMousedown = false;
	layer.draw();
	makeImageHistory();
    });

    addLayers(9);
    selectLayer("L4");
    redrawLayerForm();
    makeImageHistory();
    stage.draw();
}
