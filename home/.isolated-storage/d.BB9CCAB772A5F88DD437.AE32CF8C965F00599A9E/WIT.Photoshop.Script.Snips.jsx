Processor.prototype.SnipsProcessor = function(owner) {}
Processor.prototype.SnipsProcessor.prototype.BeginInitialize = function(owner)
{
    if(SnipsAutoSave && new File(SnipsSaveDirectory).exists == false)
    {
        throw "Auto save directory does not exists";
    }
}
Processor.prototype.SnipsProcessor.prototype.UsingSelection = true;
Processor.prototype.SnipsProcessor.prototype.IgnoreDescription = true;
Processor.prototype.SnipsProcessor.prototype.Process = function(owner)
{
    
    if(owner.SelectionBounds.IsEmpty() == false)
    {
        var newBounds = [];
        for(var i = 0; i < owner.SelectedLayers.length; i++) newBounds.push(owner.SelectionBounds);
        owner.SelectedLayersBounds = newBounds;
    }

    var selectedLayers = owner.SelectedLayers;
    var selectedLayersBounds = owner.SelectedLayersBounds;    
    var documentSize = owner.Document.GetDocumentSize();
    var originalResolution = owner.Document.Resolution;               


    
    function SnipsSelectedLayer(bounds, layerName, globalLightAngle)
    {
        bounds = owner.Document.FixDocumentBounds(bounds, documentSize);        
        if(bounds.IsEmpty())
        {
            throw "Invalid Layer Bounds";
        }
    
        ////////////////////////////////
        // Duplicate layer
        ////////////////////////////////
        var newDocumentDescriptor = new ActionDescriptor();
        var documentTypeReference = new ActionReference();
        documentTypeReference.putClass(typeID("Dcmn"));
        newDocumentDescriptor.putReference(typeID("null"), documentTypeReference);
        newDocumentDescriptor.putString(typeID("Nm  "), layerName + " - Assistor");
        var selectedLayersReference = new ActionReference();
        selectedLayersReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));
        newDocumentDescriptor.putReference(typeID("Usng"), selectedLayersReference);
        executeAction(typeID("Mk  "), newDocumentDescriptor, DialogModes.NO);
        
        var saveSuccess = false;
        var currentDocument = owner.Photoshop.GetActiveDocument();
        activeDocument.suspendHistory("Assistor Snips",  "executeMethod.apply(this)");
        function executeMethod() 
        {                
            if(globalLightAngle != 120)
            {
                var globalLightDescriptor = new ActionDescriptor();
                var ref37 = new ActionReference();
                //ref37.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Frst" ) );
                ref37.putIndex(charIDToTypeID( "Lyr " ),1);
                globalLightDescriptor.putReference( charIDToTypeID( "null" ), ref37 );
                var layerEffectDescriptor = new ActionDescriptor();
                layerEffectDescriptor.putUnitDouble( charIDToTypeID( "gagl" ), charIDToTypeID( "#Ang" ), globalLightAngle );
                globalLightDescriptor.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lefx" ), layerEffectDescriptor );
                executeAction( charIDToTypeID( "setd" ), globalLightDescriptor, DialogModes.NO );
            }

        
            
            if(SnipsIsFixedSize == false) currentDocument.Crop(bounds);                
            else if(SnipsIsFixedSize)
            {
                bounds = FixedSizeForBounds(bounds, SnipsWidth, SnipsHeight);
                currentDocument.Crop(bounds);    
            }
        
            if(originalResolution != 72)
            {
                currentDocument.SetResolution(originalResolution);
            }
        
            if(SnipsExportScale != "None")
            {
                var scaleResolution = originalResolution;

                var rulerResolution = ApplyRulerResolution(originalResolution);

                if(SnipsExportScale == "Twice") scaleResolution *= 2;
                else if(SnipsExportScale == "Half") scaleResolution *= 0.5;
                else if(SnipsExportScale == "LDPI") scaleResolution *= 120 / rulerResolution;
                else if(SnipsExportScale == "MDPI") scaleResolution *= 160 / rulerResolution;
                else if(SnipsExportScale == "TVDPI") scaleResolution *= 213 / rulerResolution;
                else if(SnipsExportScale == "HDPI") scaleResolution *= 240 / rulerResolution;
                else if(SnipsExportScale == "XHDPI") scaleResolution *= 320 / rulerResolution;
                else if(SnipsExportScale == "XXHDPI") scaleResolution *= 480 / rulerResolution;
                else if(SnipsExportScale == "XXXHDPI") scaleResolution *= 480 / rulerResolution;
                
                if(scaleResolution != originalResolution)
                {
                    var desc96 = new ActionDescriptor();
                    desc96.putUnitDouble( typeID( "Rslt" ), typeID( "#Rsl" ), scaleResolution );
                    desc96.putBoolean( typeID( "CnsP" ), true );
                    desc96.putEnumerated( typeID( "Intr" ), typeID( "Intp" ), typeID( "Blnr" ) );
                    executeAction(typeID( "ImgS" ), desc96, DialogModes.NO );
                }                
            
            }
            // apply scale
            //if(SnipsSizeType == "TwiceSize")
            //{
            //    currentDocument.ApplyDocumentScale(2);
            //}
            
            

        
            if(SnipsAutoSave && SnipsSaveDirectory != null)
            {
               
                if(Is2xSuffix) layerName += "@2x";
                saveSuccess = currentDocument.SaveAs(SnipsSaveDirectory, layerName ,SnipsFormat);
            }
        }
        
        if(saveSuccess && SnipsAutoSave && SnipsSaveAndClose)
        {
            currentDocument.Close();
        }
        
        
        
    }

    this.LastResultDocument = 0;
    
    var currentGlobalLightAngle = owner.Document.GetGlobalLight();
    var currentDocumentId  = owner.Document.DocumentId;
    if(IsSeparately)
    {
        for (var i = 0; i < selectedLayers.length; i++)
        {
            owner.Document.SetSelectedLayers(selectedLayers[i]);                      
            var name = owner.Document.GetLayerName(selectedLayers[i]);
            SnipsSelectedLayer(selectedLayersBounds[i], name, currentGlobalLightAngle);
            if(i < selectedLayers.length - 1) 
            {
                owner.Document.Photoshop.SetActiveDocumentFromId(currentDocumentId);    
            }                       
        }         
    }
    else
    {
        var name = owner.Document.GetLayerName(selectedLayers[0]);
        SnipsSelectedLayer(selectedLayersBounds[0], name, currentGlobalLightAngle);
    }
}

Processor.prototype.SnipsProcessor.prototype.Finalize = function(owner)
{
    owner.Document.UseDocumentScope  = true;
    //application.SetDocumentIndex(this.LastResultDocument);
}


