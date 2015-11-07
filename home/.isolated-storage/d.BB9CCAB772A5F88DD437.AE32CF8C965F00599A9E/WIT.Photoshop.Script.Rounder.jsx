
Processor.prototype.RounderProcessor = function(owner){}
Processor.prototype.RounderProcessor.prototype.IgnoreDescription = true;
Processor.prototype.RounderProcessor.prototype.Process = function(owner)
{
    docRef = activeDocument;
    var selectedLayers = owner.Document.GetSelectedLayers();

    var originalResolution = owner.Document.GetResolution();               
    if(originalResolution != 72)     {        owner.Document.SetResolution(72);    }
    owner.Document.Photoshop.SetLayersPanelVisibility(false);
          
    for (var i in selectedLayers) {  
        owner.Document.SetSelectedLayers(selectedLayers[i]);
        SetRectangleRounding(topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius);
    }

    owner.Document.Photoshop.SetLayersPanelVisibility(true);         
    if(originalResolution != 72) owner.Document.SetResolution(originalResolution);             
    
    owner.Document.SetSelectedLayers (selectedLayers);
    
    function SetRectangleRounding( topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius)
    {
        if (docRef.pathItems.length == 0) return;
        
        var pathItem = docRef.pathItems[docRef.pathItems.length - 1];
        if (pathItem.kind != PathKind.VECTORMASK) return;
        
        roundedRec = pathItem.subPathItems[0];
        
        var left, top, right, bottom;
        
        left = Infinity;
        top = Infinity;
        right = -Infinity;
        bottom = -Infinity;
        
        for (i = 0; i < roundedRec.pathPoints.length; i++) {        
            anchor = roundedRec.pathPoints[i].anchor;
            x = anchor[0];
            y = anchor[1];
            if (x < left) left = x;
            if (x > right) right = x;
            if (y < top) top = y;
            if (y > bottom) bottom = y;
        }
        if(topLeftRadius == undefined) topLeftRadius = 0;
        if(topRightRadius == undefined) topRightRadius = topLeftRadius;
        if(bottomRightRadius == undefined) bottomRightRadius = topLeftRadius;
        if(bottomLeftRadius == undefined) bottomLeftRadius = topLeftRadius;
        
        
        var figure = new SubPathInfo();
        figure.operation = ShapeOperation.SHAPEXOR;
        figure.closed = true;
        figure.entireSubPath = CreateRoundedRectangle(left,top, right,bottom,  topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius);
        var lineSubPathArray = [ figure ];
            
        DeleteVectorMask();
        docRef.pathItems.add("AssistorTempPath", lineSubPathArray);
        SetVectorMask();

    }

    function CreateRoundedRectangle(left, top, right, bottom, topLeftRadius, topRightRadius, bottomRightRadius, bottomLeftRadius)
    {

        var points = [];
        var HALF = 0.5;
        var i = 0;
        points[i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(left + topLeftRadius, top);
        points[i].rightDirection = Array(left + topLeftRadius * HALF, top);
        points[i].leftDirection = points[i].anchor;
        
        points[++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(right - topRightRadius, top);
        points[i].rightDirection = points[i].anchor;
        points[i].leftDirection = Array(right - topRightRadius * HALF, top);

        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(right, top + topRightRadius);
        points[i].rightDirection = Array(right, top + topRightRadius * HALF);
        points[i].leftDirection = points[i].anchor;

        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(right, bottom - bottomRightRadius);
        points[i].rightDirection = points[i].anchor;
        points[i].leftDirection = Array(right, bottom - bottomRightRadius * HALF);
        
        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(right - bottomRightRadius, bottom);
        points[i].rightDirection = Array(right - bottomRightRadius * HALF, bottom);
        points[i].leftDirection = points[i].anchor;

        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(left + bottomLeftRadius, bottom);
        points[i].rightDirection = points[i].anchor;
        points[i].leftDirection = Array(left + bottomLeftRadius * HALF, bottom);

        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(left, bottom - bottomLeftRadius);
        points[i].rightDirection = Array(left, bottom - bottomLeftRadius * HALF);
        points[i].leftDirection = points[i].anchor;

        points[ ++i] = new PathPointInfo;
        points[i].kind = PointKind.CORNERPOINT;
        points[i].anchor = Array(left, top + topLeftRadius);
        points[i].rightDirection = points[i].anchor;
        points[i].leftDirection = Array(left, top + topLeftRadius * HALF);

        
        return points;

    }

    function SetVectorMask()
    {
        var idMk = charIDToTypeID("Mk  ");
        var desc170 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref126 = new ActionReference();
        var idPath = charIDToTypeID("Path");
        ref126.putClass(idPath);
        desc170.putReference(idnull, ref126);
        var idAt = charIDToTypeID("At  ");
        var ref127 = new ActionReference();
        var idPath = charIDToTypeID("Path");
        var idPath = charIDToTypeID("Path");
        var idvectorMask = stringIDToTypeID("vectorMask");
        ref127.putEnumerated(idPath, idPath, idvectorMask);
        desc170.putReference(idAt, ref127);
        var idUsng = charIDToTypeID("Usng");
        var ref128 = new ActionReference();
        var idPath = charIDToTypeID("Path");
        var idOrdn = charIDToTypeID("Ordn");
        var idTrgt = charIDToTypeID("Trgt");
        ref128.putEnumerated(idPath, idOrdn, idTrgt);
        desc170.putReference(idUsng, ref128);
        executeAction(idMk, desc170, DialogModes.NO);
        try {
            var idDlt = charIDToTypeID("Dlt ");
            var desc16 = new ActionDescriptor();
            var idnull = charIDToTypeID("null");
            var ref7 = new ActionReference();
            var idPath = charIDToTypeID("Path");
            ref7.putName(idPath, "AssistorTempPath");
            desc16.putReference(idnull, ref7);
            executeAction(idDlt, desc16, DialogModes.NO);
        } catch (err) {}
    }
    function DeleteVectorMask()
    {
        try {
        var idDlt = charIDToTypeID("Dlt ");
        var desc171 = new ActionDescriptor();
        var idnull = charIDToTypeID("null");
        var ref129 = new ActionReference();
        var idPath = charIDToTypeID("Path");
        var idPath = charIDToTypeID("Path");
        var idvectorMask = stringIDToTypeID("vectorMask");
        ref129.putEnumerated(idPath, idPath, idvectorMask);
        var idLyr = charIDToTypeID("Lyr ");
        var idOrdn = charIDToTypeID("Ordn");
        var idTrgt = charIDToTypeID("Trgt");
        ref129.putEnumerated(idLyr, idOrdn, idTrgt);
        desc171.putReference(idnull, ref129);
        executeAction(idDlt, desc171, DialogModes.NO);
        } catch (err) {}
    }

    function CreateAnchor(anchor, leftDirection, rightDirection)
    {   

        if(leftDirection == undefined) leftDirection = anchor;
        if(rightDirection == undefined) rightDirection = anchor;
        
        var pathInfo = new PathPointInfo();
        pathInfo.kind = PointKind.CORNERPOINT;
        pathInfo.anchor = new Array(anchor.X, anchor.Y);
        pathInfo.leftDirection =  new Array(leftDirection.X,leftDirection.Y);
        pathInfo.rightDirection =  new Array(rightDirection.X,rightDirection.Y);
        
        return pathInfo;
    }







}
