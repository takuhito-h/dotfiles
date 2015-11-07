function Document(photoshop, documentId) {

    this.DocumentId = documentId;
    this.Photoshop = photoshop;     
    this._DocumentSizeCache = null;
    
    this.TextLayerInfos = [];
    
};

Document.prototype.UseDocumentScope = false;
Document.prototype.DocumentScope = function(scopeFunction)
{
    if(this.UseDocumentScope == false)
    {
        return scopeFunction.apply(this);
        return;
    }

    var currentDocumentIndex = this.Photoshop.GetActiveDocumentId();
    if(currentDocumentIndex != this.DocumentId)
    {
        this.Photoshop.SetActiveDocumentFromId(this.DocumentId);
    }

    var result = scopeFunction.apply(this);
    
    if(currentDocumentIndex != this.DocumentId) 
    {        
        this.Photoshop.SetActiveDocumentFromId(currentDocumentIndex);
    }
    return result;
};


Document.prototype.GetDocumentDescriptor = function(documentReference){
    
    if(documentReference == null)
    {
        documentReference = new ActionReference();
        documentReference.putIdentifier(typeID("Dcmn"), this.DocumentId);    
    }
    return executeActionGet(documentReference);
};

Document.prototype.GetDocumentProperty = function(typeId)
{
    var documentReference = new ActionReference();
    documentReference.putProperty(typeID("Prpr"), typeId);
    documentReference.putIdentifier(typeID("Dcmn"), this.DocumentId);  
    var documentDescriptor = executeActionGet(documentReference);
    return documentDescriptor.getInteger(typeId);
};


Document.prototype.GetGlobalLight = function() {

    return this.DocumentScope(function() {
        var ref = new ActionReference();
        ref.putProperty(typeID("Prpr"), typeID("globalAngle"));
        ref.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));
        var descriptor = executeActionGet(ref);
        return descriptor.getInteger(typeID("globalAngle"));
    });
}




Document.prototype.GetResolution = function() {

    return this.DocumentScope(function() {
        return this.GetDocumentProperty(typeID("Rslt"));
    });
    
};

Document.prototype.SetResolution = function(resolution) {

    return this.DocumentScope(function() {
        var desc122 = new ActionDescriptor();
        desc122.putUnitDouble( typeID( "Rslt" ), typeID( "#Rsl" ), resolution);
        executeAction( typeID( "ImgS" ), desc122, DialogModes.NO );
    });    
};


Document.prototype.GetDocumentSize = function(useCache) {

    if(this._DocumentSizeCache != null && useCache == false)
    {
        return this._DocumentSizeCache;
    }
    
    return this.DocumentScope(function() {

        var docRef = activeDocument;
        this._DocumentSizeCache = new Size(docRef.width.value, docRef.height.value);
        
        return this._DocumentSizeCache;

    });
};

Document.prototype.SetDocumentSize = function (width, height) {
    
    this.DocumentScope(function() {    
        var canvasSizeDescriptor = new ActionDescriptor();
        canvasSizeDescriptor.putUnitDouble( typeID( "Wdth" ), typeID( "#Pxl" ), width );
        canvasSizeDescriptor.putUnitDouble( typeID( "Hght" ), typeID( "#Pxl" ), height );
        canvasSizeDescriptor.putEnumerated( typeID( "Hrzn" ), typeID( "HrzL" ), typeID( "Cntr" ) );
        canvasSizeDescriptor.putEnumerated( typeID( "Vrtc" ), typeID( "VrtL" ), typeID( "Cntr" ) );
        executeAction( typeID( "CnvS" ), canvasSizeDescriptor, DialogModes.NO );
    });
    
};

Document.prototype.ApplyDocumentScale = function (scale) {
    
    this.DocumentScope(function() {    

        var desc785 = new ActionDescriptor();
        desc785.putUnitDouble( typeID( "Hght" ), typeID( "#Prc" ), scale * 100.000000 );
        desc785.putBoolean( typeID( "CnsP" ), true );
        desc785.putEnumerated( typeID( "Intr" ), typeID( "Intr" ), typeID( "Blnr" ) );
        executeAction( typeID( "ImgS" ), desc785, DialogModes.NO );

    });
    
};


Document.prototype.GetDocumentIndex = function () {
    
    return this.GetDocumentProperty (typeID("ItmI"));    
};

Document.prototype.HasBackground = function() {

    return this.DocumentScope(function() {    
        
        var backgroundReference = new ActionReference();
        backgroundReference.putProperty(typeID("Prpr"), typeID("Bckg"));
        backgroundReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Back"));
        var backgroundDescriptor = executeActionGet(backgroundReference);
        var hasBackground = backgroundDescriptor.getBoolean(typeID("Bckg"));
        
        
        if(hasBackground == false)
        {
            try
            {
                var layerReference = new ActionReference();        
                layerReference.putIndex(typeID("Lyr "), 0);        
                var zero = executeActionGet(layerReference);    
                hasBackground = true;
            }
            catch(ex)
            {
                
            }
            
        }
        return hasBackground;
        
    });

};


Document.prototype.Crop = function(bounds) {
    
    this.DocumentScope(function() {    
        var cropDescriptor = new ActionDescriptor();
        cropDescriptor.putObject(typeID("T   "), typeID("Rctn"), bounds.ToDescriptor());
        cropDescriptor.putUnitDouble(typeID("Angl"), typeID("#Ang"), 0.000000);
        cropDescriptor.putUnitDouble(typeID("Wdth"), typeID("#Pxl"), 0.000000);
        cropDescriptor.putUnitDouble(typeID("Hght"), typeID("#Pxl"), 0.000000);
        cropDescriptor.putUnitDouble(typeID("Rslt"), typeID("#Rsl"), 0.000000);
        executeAction(typeID("Crop"), cropDescriptor, DialogModes.NO);
    });
    
};

Document.prototype.Duplicate = function () {
    
    this.DocumentScope(function() {    
        var documentDescriptor = new ActionDescriptor();
        var documentReference = new ActionReference();
        documentReference.putEnumerated( typeID( "Dcmn" ), typeID( "Ordn" ), typeID( "Frst" ) );
        documentDescriptor.putReference( typeID( "null" ), documentReference );
        executeAction( typeID( "Dplc" ), documentDescriptor, DialogModes.NO );
    });
    
};

Document.prototype.DuplicateLayers = function(selectedLayers)
{
    
    var current = new ActionReference();
    for(var i = 0; i < selectedLayers.length;i++) current.putIdentifier(typeID("Lyr "), selectedLayers[i]);
                      
    var desc  = new ActionDescriptor();    
    desc.putReference (typeID("null"), current);   
    var idVrsn = charIDToTypeID( "Vrsn" );
    desc.putInteger( idVrsn, 5 );    
    executeAction( typeID( "Dplc" ), desc , DialogModes.NO );
}

Document.prototype.SelectedLayersTranslateRelative = function(x,  y)
{
    var layer = new ActionDescriptor();
    
    var layerIndex = 0;
    var idOfst = typeID("Ofst");
    layer.putEnumerated(typeID("FTcs"), typeID("QCSt"), typeID("Qcs0"));
    var pixel = typeID("#Pxl");
    layer.putObject(idOfst, idOfst, new Point(x,y).ToDescriptor());
    executeAction(typeID("Trnf"), layer, DialogModes.NO);
}

Document.prototype.SaveAs = function (destination, fileName, format) {

    return this.DocumentScope(function() {    

        try
        {
            var docRef = activeDocument;
            var saveOptions = null;
            var saveFile = null;
            
            if(format == "JPG")
            {
                saveOptions = new JPEGSaveOptions();
                saveOptions.quality = 10;        
            }
            else if(format == "PNG")
            {
                saveOptions = new PNGSaveOptions();
                saveOptions.compression=9;
            }
            else if(format == "BMP") saveOptions = new BMPSaveOptions();
            else if(format == "PSD") saveOptions = new PhotoshopSaveOptions();
            
            if(saveOptions != null)
            {
                var saveFile = new File(destination + "/" + fileName + "." + format);
                activeDocument.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
            }    
        }
        catch(ex)
        {
            return false;
        }
        return true;

    });

}

Document.prototype.Close = function () {

    this.DocumentScope(function() {    

        var desc904 = new ActionDescriptor();
        desc904.putEnumerated( typeID( "Svng" ), typeID( "YsN " ), typeID( "N   " ) );
        executeAction( typeID( "Cls " ), desc904, DialogModes.NO );
    });

};


Document.prototype.MergeVisible = function () {
    
    this.DocumentScope(function() {    
        executeAction( typeID( "MrgV" ), undefined, DialogModes.NO );
    });

};


Document.prototype.FixDocumentBounds = function (bounds, documentSizeCache) {

    var documentSize = documentSizeCache;
    if(documentSize == null) documentSize = this.GetDocumentSize();

    if(bounds.X < 0)
    {
        bounds.Width = bounds.Width + bounds.X;
        bounds.X = 0;
    }
    if(bounds.Y < 0)
    {
        bounds.Height = bounds.Height + bounds.Y;
        bounds.Y = 0;
    }

    if(bounds.Right() > documentSize.Width)
    {
        bounds.Width = documentSize.Width - bounds.X;
    }

    if(bounds.Bottom() > documentSize.Height)
    {
        bounds.Height = documentSize.Height - bounds.Y;
    }

    return bounds;
    
};

Document.prototype.FixReferencePoint = function (x,  y,  selectionBounds, documentSizeCache) {
    
    var documentSize = documentSizeCache;
    if(documentSize == null) documentSize = this.GetDocumentSize();

    var documentRight = documentSize.Width;
    var documentBottom = documentSize.Height;
    
    if(selectionBounds.IsEmpty() == false)
    {
        documentRight = selectionBounds.Right();
        documentBottom = selectionBounds.Bottom();
    }
    
    if(ReferencePointType == "LeftTop") 
    {
        x = x - selectionBounds.X;
        y = y - selectionBounds.Y;       
    }
    else if(ReferencePointType == "RightTop") 
    {
        x = -(x - documentRight);     
        y = y - selectionBounds.Y;
    }          
    else if(ReferencePointType == "LeftBottom") 
    {
        x = x - selectionBounds.X;
        y = -(y - documentBottom); 
    }
    else if(ReferencePointType == "RightBottom") 
    { 
        x = -(x - documentRight);  
        y = -(y - documentBottom); 
    }
        
    return new Point(x, y);
}



//----------------------------------------------------------
// Layers Functions
//----------------------------------------------------------
Document.prototype.HideLayer = function(selectedLayers)
{

    if(selectedLayers.constructor === Number) selectedLayers = [selectedLayers];
    
    var current = new ActionReference();
    for(var i = 0; i < selectedLayers.length;i++) current.putIdentifier(typeID("Lyr "), selectedLayers[i]);
               
    var idHd = charIDToTypeID( "Hd  " );
    var desc242 = new ActionDescriptor();
    var idnull = charIDToTypeID( "null" );
        var list10 = new ActionList();
        list10.putReference( current );
    desc242.putList( idnull, list10 );
    executeAction( idHd, desc242, DialogModes.NO );
}
Document.prototype.GetIsTextLayer = function (id) {
    
    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("Txt "));        
        layerReference.putIdentifier(typeID("Lyr "), id);        
        var descriptor = executeActionGet(layerReference);
        return descriptor.hasKey(typeID("Txt "));
    });    
    
    
};

Document.prototype.GetLayerIndex = function (layerId) {   
    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("ItmI"));
        layerReference.putIdentifier(typeID("Lyr "), layerId);        
        var descriptor = executeActionGet(layerReference);
        return descriptor.getInteger(typeID("ItmI"));
    });
}

Document.prototype.GetLayerName = function (layerId) {   
    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("Nm  "));
        layerReference.putIdentifier(typeID("Lyr "), layerId);        
        var descriptor = executeActionGet(layerReference);
        return descriptor.getString(typeID("Nm  "));
    });
}
Document.prototype.GetLayerId = function (descriptor) {
    
    return descriptor.getInteger(typeID("LyrI"));

}
Document.prototype.GetLayerIdFromName = function (name) {

    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("LyrI"));        
        layerReference.putName(typeID("Lyr "), name);
        
        return this.GetLayerId(executeActionGet(layerReference));
    });

};

Document.prototype.GetLayerIdFromIndex = function (index) {

    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("LyrI"));
        layerReference.putIndex(typeID("Lyr "), index);        
        return this.GetLayerId(executeActionGet(layerReference));
    });

};

Document.prototype.IsLayerVisible = function (id) {

    return this.DocumentScope(function() {    
        var layerReference = new ActionReference();
        layerReference.putProperty(typeID("Prpr"), typeID("Vsbl"));
        layerReference.putIdentifier(typeID("Lyr "), id);        
        var descriptor = executeActionGet(layerReference);
        if(descriptor.hasKey(typeID("Vsbl")) == false) return false;
        return descriptor.getBoolean (typeID("Vsbl"));
    });

};

Document.prototype.SelectFrontLayer = function() {
    
    return this.DocumentScope(function() { 
        try
        {
            var layerDescriptor = new ActionDescriptor();
            var layerReference = new ActionReference();
            layerReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Frnt"));
            layerDescriptor.putReference( typeID( "null" ), layerReference );
            layerDescriptor.putBoolean( typeID( "MkVs" ), false );
            executeAction( typeID( "slct" ), layerDescriptor, DialogModes.NO );            
        }
        catch(ex)
        {
        }
    });

};

Document.prototype.SelectBackLayer = function() {
    
    return this.DocumentScope(function() {    
        var layerDescriptor = new ActionDescriptor();
        var layerReference = new ActionReference();
        layerReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Bckg"));
        layerDescriptor.putReference( typeID( "null" ), layerReference );
        layerDescriptor.putBoolean( typeID( "MkVs" ), false );
        executeAction( typeID( "slct" ), layerDescriptor, DialogModes.NO );
    });

};

Document.prototype.GetSelectedLayers = function () {


    
    return this.DocumentScope(function() {    
        
        var selectedLayerIds = [];
        try
        {
            
            var targetLayersTypeId = typeID("targetLayers");
            
            var selectedLayersReference = new ActionReference();
            selectedLayersReference.putProperty(typeID("Prpr"), targetLayersTypeId);
            selectedLayersReference.putEnumerated(typeID("Dcmn"), typeID("Ordn"), typeID("Trgt"));        
            var descriptor = executeActionGet(selectedLayersReference);

            if(descriptor.hasKey(targetLayersTypeId) == false)
            {            
                selectedLayersReference = new ActionReference();
                selectedLayersReference.putProperty(typeID("Prpr"), typeID("LyrI"));                
                selectedLayersReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));
                descriptor = executeActionGet(selectedLayersReference);
                var id = descriptor.getInteger(typeID("LyrI"));                    
                 
                if(this.IsLayerVisible(id)) selectedLayerIds.push (id); 
            }
            else        
            {
                var hasBackground = this.HasBackground() ? 0 : 1;
                
                var list = descriptor.getList(targetLayersTypeId);
                for (var i = 0; i < list.count; i++)
                {
                    
                    
                    var selectedLayerIndex = list.getReference(i).getIndex() + hasBackground;
                    var selectedLayersReference = new ActionReference();
                    selectedLayersReference.putProperty(typeID("Prpr"), typeID("LyrI"));
                    selectedLayersReference.putIndex(typeID("Lyr "), selectedLayerIndex);
                    descriptor = executeActionGet(selectedLayersReference);
                    
                    var id = descriptor.getInteger(typeID("LyrI"));                    
                    if(this.IsLayerVisible(id)) selectedLayerIds.push (id); 
                }
                
            }  


            //descriptor.getBoolean(typeID("Vsbl"))
        
        }
        catch(ex)
        {
        }
        return selectedLayerIds;
    });  

};



Document.prototype.GetLayersBounds = function (layers, merge) {

    var getSelectedLayerBounds = function()
    {
        var selectedLayerReference = new ActionReference();
        selectedLayerReference.putProperty(typeID("Prpr"), typeID("bounds"));
        selectedLayerReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));        
        var selectedLayerDescriptor = executeActionGet(selectedLayerReference);                
        return Rectangle.FromDescriptor(selectedLayerDescriptor);
        
    };

    return this.DocumentScope(function() {    
         
        var result = [];
        if(merge)
        {
            activeDocument.suspendHistory("Assistor Layer Mesurement",  "mesure.apply(this)");
            function mesure()
            {
                this.SetSelectedLayers(layers);
                executeAction(typeID("newPlacedLayer"), undefined, DialogModes.NO);
                result.push(getSelectedLayerBounds());
            }           
        }
        else
        {
            activeDocument.suspendHistory("Assistor Layer Mesurement",  "mesure.apply(this)");
            function mesure()
            {
                for(var i = 0; i < layers.length ; i++)
                {
                    this.SetSelectedLayers(layers[i]);    
                    executeAction(typeID("newPlacedLayer"), undefined, DialogModes.NO);
                    result.push(getSelectedLayerBounds());
                }
            }           

        }        
        this.Undo();
        return result;
    });
    

}


Document.prototype.SetSelectedLayers = function (selectedLayers) {
    
    return this.DocumentScope(function() {       
        if(selectedLayers.constructor === Number) selectedLayers = [selectedLayers];

        if(selectedLayers.length == 0) return;
        
        var current = new ActionReference();
        for(var i = 0; i < selectedLayers.length;i++) current.putIdentifier(typeID("Lyr "), selectedLayers[i]);
               
        var desc  = new ActionDescriptor();    
        desc.putReference (typeID("null"), current);   
        executeAction( typeID( "slct" ), desc , DialogModes.NO );
    });
    
};

Document.prototype.IsEnabledLayerEffect = function(layerId)
{
    var layerReference = new ActionReference();
    layerReference.putProperty(typeID("Prpr"), typeID("layerFXVisible"));            
    layerReference.putIdentifier(typeID("Lyr "), layerId);        
    var layerDescriptor = executeActionGet(layerReference);
    
    if(layerDescriptor.hasKey( typeID("layerFXVisible")) == false) return false;
    
    return layerDescriptor.getBoolean(typeID("layerFXVisible"));
}

Document.prototype.GetLayerEffect = function(layerId)
{
    var hasEffect = this.IsEnabledLayerEffect(layerId);
    if(hasEffect == false) return null;
    
    var layerReference = new ActionReference();
    layerReference.putProperty(typeID("Prpr"), typeID("layerEffects"));            
    layerReference.putIdentifier(typeID("Lyr "), layerId);        
    var layerDescriptor = executeActionGet(layerReference);
    
    if(layerDescriptor.hasKey( typeID("layerEffects")) == false) return null;
    
    var effectDescriptor = layerDescriptor.getObjectValue( typeID("layerEffects"));
    
    var result = {};
        
    if(effectDescriptor.hasKey(typeID("dropShadow")))
    {
        var dropShadow = effectDescriptor.getObjectValue(typeID("dropShadow"));
        
        if(dropShadow.hasKey(typeID("enab")) && dropShadow.getBoolean(typeID("enab")) ) 
            result.DropShadow  = DropShadow.FromDescriptor(dropShadow);        
        else
            result.DropShadow  = null;
    }
    else
    {
        result.DropShadow = null;
    }

    if(effectDescriptor.hasKey(typeID("SoFi")))
    {
        var colorOverlay = effectDescriptor.getObjectValue(typeID("SoFi"));

        if(colorOverlay.hasKey(typeID("enab")) && colorOverlay.getBoolean(typeID("enab")) ) 
            result.ColorOverlay  = Color.FromDescriptor(colorOverlay.getObjectValue(typeID("Clr ")));
        else
            result.ColorOverlay  = null;
        
    }
    else
    {
        result.ColorOverlay = null;
    }

    return result;
}
Document.prototype.GetTexLayertInfoFromTextItem = function(layerId)
{
    function GetTextScale(descriptor)
    {
        var textDescriptor = descriptor.getObjectValue(typeID("Txt "));
        if(textDescriptor.hasKey(typeID("Trnf")))
        {
            var transform = textDescriptor.getObjectValue(typeID("Trnf"));
            return transform.getDouble (typeID("yy"));
        }                 
        return 1;
    }

    function getSafeValue(textItem, key, defaultValue)
    {
        if(typeof defaultValue  == "undefined") defaultValue = "";
        
        try { return textItem[key]; }
        catch(ex) { return defaultValue }
    }
    
    this.SetSelectedLayers(layerId);
    
    var textInfo = {};
    textInfo.AntiAlising =  textInfo.FontName =  textInfo.FontStyle = textInfo.FontSize = textInfo.FontColor = "";

    try
    {
        var layer = activeDocument.activeLayer;
        
        var textItem = layer.textItem;
        textInfo.AntiAlising = getSafeValue(textItem,"antiAliasMethod", "None");

        textInfo.FontSize = getSafeValue(textItem,"size", 12);
            
        if(typeof textInfo.FontSize != "number") textInfo.FontSize = textInfo.FontSize.value;

        textInfo.LineHeight = getSafeValue(textItem,"leading", "Auto");
        if(typeof textInfo.LineHeight != "number") textInfo.LineHeight = textInfo.LineHeight.value;
        
        if(isCS6 || isCC) 
        {
            var layerReference = new ActionReference();
            layerReference.putProperty(typeID("Prpr"), typeID("Txt "));
            layerReference.putIdentifier(typeID("Lyr "), layerId);   
            var descriptor = executeActionGet(layerReference);
            var textScale = GetTextScale(descriptor);
            textInfo.FontSize *= textScale;
            
            if(typeof textInfo.LineHeight == "number")  textInfo.LineHeight *= textScale;
            
        }
        
        textInfo.FontName = getSafeValue(textItem,"font", "MyriadPro-Regular"); 
        if(textInfo.FontName.indexOf('-') > 0) {
            var font = textInfo.FontName.split('-');    
            textInfo.FontName = font[0];
            textInfo.FontStyle = font[1];
        }
        else
        {
            textInfo.FontStyle = "Regular";
        }
        
        if( getSafeValue(textItem,"fauxBold", false) == true)
        {
            textInfo.FontStyle += " Bold";
        }
    
        textInfo.FontColor = getSafeValue(textItem,"color", null);
        if(textInfo.FontColor != null) textInfo.FontColor = new Color(textInfo.FontColor.rgb.red, textInfo.FontColor.rgb.green, textInfo.FontColor.rgb.blue);
        else textInfo.FontColor = new Color(0,0,0);
        
        textInfo.Effect = this.GetLayerEffect(layerId);
        
        if(textInfo.Effect.ColorOverlay != null)
        {
            textInfo.FontColor = textInfo.Effect.ColorOverlay;
        }
        
    }
    catch(ex) { }

    return textInfo;
}

Document.prototype.GetTextLayerInfo = function(layerId)
{
    return this.DocumentScope(function() {    
        
        if(this.TextLayerInfos[layerId]  != null) return this.TextLayerInfos[layerId];

        var currentInfo = this.GetTexLayertInfoFromTextItem(layerId);

        this.TextLayerInfos[layerId] = currentInfo;
        
        return currentInfo;
       
    });

}

//----------------------------------------------------------
// History Functions
//----------------------------------------------------------
Document.prototype.Undo = function() {

    this.DocumentScope(function() {    
        executeAction( typeID( "undo" ), undefined, DialogModes.NO );
    });
    
};

Document.prototype.SuspendHistory = function(name, executeFunction) {
    
    return this.DocumentScope(function() {    
        executeFunction.apply(this);
        activeDocument.suspendHistory(name,  "executeFunction()");    
    });
    
};



//----------------------------------------------------------
// Guides Functions
//----------------------------------------------------------
Document.prototype.CreateHorizontalGuides = function (offset) {
    this.CreateGuides(offset, true);
};

Document.prototype.CreateVerticalGuides = function (offset) {
    this.CreateGuides(offset, false);
};

Document.prototype.CreateGuides = function (position, isHorizontal) {

    this.DocumentScope(function() {    
        var orientation = isHorizontal ? typeID( "Hrzn" ) : typeID( "Vrtc" );
        var desc65 = new ActionDescriptor();
        desc65.putUnitDouble( typeID( "Pstn" ), typeID( "#Pxl" ), position);
        desc65.putEnumerated( typeID( "Ornt" ), typeID( "Ornt" ), orientation);    
        var desc64 = new ActionDescriptor();        
        desc64.putObject( typeID( "Nw  " ), typeID( "Gd  " ), desc65 );    
        executeAction(typeID( "Mk  " ), desc64, DialogModes.NO );
    });
};

Document.prototype.ClearGuides = function() {

    this.DocumentScope(function() {    
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID( "Gd  " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Al  " ) );
        desc.putReference( charIDToTypeID( "null" ), ref );
        executeAction( charIDToTypeID( "Dlt " ), desc, DialogModes.NO );
     });
};



//----------------------------------------------------------
// Selection Functions
//----------------------------------------------------------
Document.prototype.HasSelection = function () {

    this.DocumentScope(function() {    
        try {
            activeDocument.selection.bounds; return true;
        } catch(e) {
            return false;
        }
    });

};

Document.prototype.GetSelectionBounds = function() {

    return this.DocumentScope(function() {  
        try
        {
            var SB = activeDocument.selection.bounds;           
            return new Rectangle(SB[0].value,SB[1].value,SB[2].value - SB[0].value, SB[3].value - SB[1].value);            
        }
        catch(ex)
        {
            return EmptyRectangle;
        }    
    });

};

Document.prototype.SetSelectionPolygon = function(polygon)
{
    var documentSize = this.GetDocumentSize();
    
    var left = 100000, top = 100000, right = 0, bottom = 0;
    for(var i in polygon)
    {
        
        if(polygon[i][0] < 0) polygon[i][0] = 0;
        if(polygon[i][1] < 0) polygon[i][1] = 0;
        
        if(polygon[i][0] >= documentSize.Width) polygon[i][0] = documentSize.Width;
        if(polygon[i][1] >= documentSize.Height) polygon[i][1] = documentSize.Height ;            

        if(left > polygon[i][0]) left = polygon[i][0];
        if(top > polygon[i][1]) top = polygon[i][1];
        if(right < polygon[i][0]) right = polygon[i][0];
        if(bottom < polygon[i][1]) bottom = polygon[i][1];                        
    }   
    if(top == bottom || left == right) return false;   
    

    var idsetd = typeID( "setd" );
        var desc408 = new ActionDescriptor();
        var idnull = typeID( "null" );
            var ref216 = new ActionReference();
            var idChnl = typeID( "Chnl" );
            var idfsel = typeID( "fsel" );
            ref216.putProperty( idChnl, idfsel );
        desc408.putReference( idnull, ref216 );
        var idT = typeID( "T   " );
            var desc409 = new ActionDescriptor();
            var idPts = typeID( "Pts " );
                var pointList = new ActionList();
                
                for(var i = 0; i < polygon.length; i ++)
                {
                    var desc410 = new ActionDescriptor();
                    desc410.putUnitDouble(typeID("Hrzn"),  typeID("#Pxl"), polygon[i][0] );               
                    desc410.putUnitDouble( typeID("Vrtc"), typeID("#Pxl"), polygon[i][1] );            
                    pointList.putObject( typeID("Pnt "), desc410 );                    
                }

            desc409.putList( idPts, pointList );
        var idPlgn = charIDToTypeID( "Plgn" );
        desc408.putObject( idT, idPlgn, desc409 );
        var idAntA = charIDToTypeID( "AntA" );
        desc408.putBoolean( idAntA, true );
    executeAction( idsetd, desc408, DialogModes.NO );
    
    return true;
    
}

Document.prototype.SetSelectionBounds = function (bounds, isAppend) {

    return this.DocumentScope(function() {  
            
        isAppend = typeof isAppend !== 'undefined' ? isAppend : false;

        var size = this.GetDocumentSize();

        var documentBounds = new Rectangle(0, 0, size.Width, size.Height);
        bounds = documentBounds.Intersect(bounds);

        if(bounds.IsEmpty()) return EmptyRectangle;

        var selectionMode = isAppend ? typeID("AddT") : typeID("setd");

        var selectionDescriptor = new ActionDescriptor();
        var selectionReference = new ActionReference();
        selectionReference.putProperty(typeID("Chnl"), typeID("fsel"));
        selectionDescriptor.putReference(typeID("null"), selectionReference);

        selectionDescriptor.putObject(typeID("T   "), typeID("Rctn"), bounds.ToDescriptor());
        executeAction(selectionMode, selectionDescriptor, DialogModes.NO);

        return bounds;    

    });

};

Document.prototype.AppendSelectionBounds = function ( bounds) {

    this.SetSelectionBounds(bounds, true);
    
};


Document.prototype.DeselectSelectionBounds = function () {

    this.DocumentScope(function() {            
        var selectionDescriptor = new ActionDescriptor();
        var selectionReference = new ActionReference();
        selectionReference.putProperty(typeID("Chnl"), typeID("fsel"));
        selectionDescriptor.putReference(typeID("null"), selectionReference);
        selectionDescriptor.putEnumerated(typeID("T   "), typeID("Ordn"), typeID("None"));
        executeAction(typeID("setd"), selectionDescriptor, DialogModes.NO);
    });
    
};


//----------------------------------------------------------
// Create Layer Functions
//----------------------------------------------------------
Document.prototype.CreateGroupLayer = function (name) {
    
    // =======================================================
    var idMk = typeID("Mk  ");
    var idlayerSection = typeID("layerSection");

    var groupDescriptor = new ActionDescriptor();
    var groupTypeReference = new ActionReference();
    var groupNameDescriptor = new ActionDescriptor();
    groupTypeReference.putClass(idlayerSection);
    groupDescriptor.putReference(typeID("null"), groupTypeReference);
    groupNameDescriptor.putString(typeID("Nm  "), name);
    groupDescriptor.putObject(typeID("Usng"), idlayerSection, groupNameDescriptor);
    
    executeAction(typeID("Mk  "), groupDescriptor, DialogModes.NO);   

}

//----------------------------------------------------------
// Assistor Functions
//----------------------------------------------------------
var guideGroupElement = null;
Document.prototype.GetGuideGroup = function () {

    if(guideGroupElement == null)   
        guideGroupElement = app.activeDocument.layerSets.getByName('@Assistor_guide');
        
        return guideGroupElement;
    
}

Document.prototype.GuideGroupId = 0;

var GuideGroupName = "@Assistor_guide";
Document.prototype.EnsureGuideGroup = function () {

    try {

        var guideGroupId = this.GetLayerIdFromName(GuideGroupName);
        this.GuideGroupId = guideGroupId;

        var guideGroupReference = new ActionReference();      
        guideGroupReference.putProperty(typeID("Prpr"), typeID("ItmI"));
        guideGroupReference.putIdentifier(typeID("Lyr "), guideGroupId);
        var groupDescriptor = executeActionGet(guideGroupReference);


        this.SetSelectedLayers(guideGroupId);
        
        
        var ref33 = new ActionReference();
        ref33.putEnumerated( typeID( "Lyr " ), typeID( "Ordn" ), typeID( "Trgt" ) );
        
        // =======================================================

        var desc70 = new ActionDescriptor();
        desc70.putReference( charIDToTypeID( "null" ), ref33 );
        var desc71 = new ActionDescriptor();
        var desc72 = new ActionDescriptor();
        desc72.putBoolean( stringIDToTypeID( "protectNone" ), true );        
        desc71.putObject( stringIDToTypeID( "layerLocking" ), stringIDToTypeID( "layerLocking" ), desc72 );
        var idLyr = charIDToTypeID( "Lyr " );
        desc70.putObject( charIDToTypeID( "T   " ), idLyr, desc71 );
        executeAction( charIDToTypeID( "setd" ), desc70, DialogModes.NO );


        var hasBackground = this.HasBackground () ? 1 : 0;
        var guideGroupIndex = groupDescriptor.getInteger(typeID("ItmI"));
        var childlayerReference = new ActionReference();
        childlayerReference.putProperty(typeID("Prpr"), typeID("Nm  "));
        childlayerReference.putIndex(typeID("Lyr "), guideGroupIndex - 1 - hasBackground);        
        var childdescriptor = executeActionGet(childlayerReference);
        var childName = childdescriptor.getString(typeID("Nm  "));


        if(childName == "</Layer group>")
        {
            // group is empty    
            var desc11 = new ActionDescriptor();
            var ref10 = new ActionReference();
            ref10.putIdentifier(typeID("Lyr "), guideGroupId);
            desc11.putReference( typeID( "null" ), ref10 );
            executeAction( typeID( "Dlt " ), desc11, DialogModes.NO );
            throw "Empty Guide Group"
        }
        else
        {     
            var desc6 = new ActionDescriptor();
            var ref5 = new ActionReference();
            ref5.putIndex(typeID("Lyr "), guideGroupIndex - 1 - hasBackground);       
            desc6.putReference( typeID( "null" ), ref5 );
            executeAction( typeID( "slct" ), desc6, DialogModes.NO );
        }
        
        
        //this.SetSelectedLayers(guideGroupId);

        
    }
    catch(ex) {
        this.SelectFrontLayer ();
        this.CreateGroupLayer (GuideGroupName);

        this.GuideGroupId = this.GetLayerIdFromName(GuideGroupName);

    }    
};

Document.prototype.GetSelectedLayerDescriptions = function (selectedLayers, selectedLayersBounds, selectionBounds) {


    if(selectionBounds == null) selectionBounds = new Rectangle(0,0,0,0);
    
    var result = {};
    
    if(selectedLayers.length == 1 && this.GetIsTextLayer(selectedLayers[0]))
    {
        
        /*
        var typeUnit = preferences.typeUnits;
        if(typeUnit == TypeUnits.PIXELS) typeUnit = "px";
        else if(typeUnit == TypeUnits.POINTS) typeUnit = "pt";
        else if(typeUnit == TypeUnits.MM) typeUnit = "mm";
        */
    
        var textLayerInfo = this.GetTextLayerInfo(selectedLayers[0]);
        
        result.FontName = textLayerInfo.FontName + " / " +textLayerInfo.FontStyle; 
        result.FontColor = textLayerInfo.FontColor.toString();               
        result.FontSize = FixTypeUnit(textLayerInfo.FontSize, this.GetResolution ()) + " " + TypeUnit;

        if(textLayerInfo.LineHeight != null) result.LineHeight = FixTypeUnit(textLayerInfo.LineHeight, this.GetResolution ()) + " " + TypeUnit;
        else result.LineHeight = "Auto";
        
        if(textLayerInfo.Effect != null && textLayerInfo.Effect.DropShadow != null)
        {
            result.Effect = textLayerInfo.Effect.DropShadow.toString()
        }
        
        
        // get textInfo;
        
    }
    
    var left = 1000000, top = 100000, right = 0, bottom = 0;
    
    for(var i = 0; i< selectedLayersBounds.length; i++)
    {        
        if(left > selectedLayersBounds[i].X) left = selectedLayersBounds[i].X;
        if(top > selectedLayersBounds[i].Y) top = selectedLayersBounds[i].Y;
        if(right < selectedLayersBounds[i].Right()) right = selectedLayersBounds[i].Right();
        if(bottom < selectedLayersBounds[i].Bottom()) bottom = selectedLayersBounds[i].Bottom();
    }
    var bounds = new Rectangle(left, top, right - left, bottom - top);
    
    if(PositionPointType == "CenterTop") { left += bounds.Width / 2; }
    else if(PositionPointType == "RightTop") { left += bounds.Width; }
    else if(PositionPointType == "LeftMiddle") { top += bounds.Height / 2; }
    else if(PositionPointType == "CenterMiddle") {  left += bounds.Width / 2;  top += bounds.Height / 2;}
    else if(PositionPointType == "RightMiddle") { left += bounds.Width;  top += bounds.Height / 2; }
    else if(PositionPointType == "LeftBottom") { top += bounds.Height; }
    else if(PositionPointType == "CenterBottom") {  left += bounds.Width / 2; top += bounds.Height; }
    else if(PositionPointType == "RightBottom") {  left += bounds.Width; top += bounds.Height; }

    var documentSize = this.GetDocumentSize();
    
    if(selectionBounds.IsEmpty())
    {
        bounds = this.FixDocumentBounds(bounds, documentSize);
    }
    else
    {
        bounds.Width = selectionBounds.Width;
        bounds.Height = selectionBounds.Height;
    }
    
    var applyReferencePoint = this.FixReferencePoint(bounds.X, bounds.Y, selectionBounds, documentSize);
    
    result.X = FixUnit(applyReferencePoint.X);
    result.Y = FixUnit(applyReferencePoint.Y);
    result.Width = FixUnit(bounds.Width);
    result.Height = FixUnit(bounds.Height);
    
    result.SelectedLayerCount = selectedLayers.length;
    
    return result;
};