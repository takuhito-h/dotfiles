/* ##################################
    Begin Initialize XMPScript Metadata Part
################################## */
//if (ExternalObject.AdobeXMPScript == undefined) {
//    ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");
//}

//var witstudioNamespace = "http://assistor.net/2013";
//var witstudioPrefix = "assistor:";    
//var witstudioMetadataProperty = "Metadata";
//XMPMeta.registerNamespace(witstudioNamespace, witstudioPrefix);

function SetLayerMetadata(layer, metadata)
{
    return; // current not support
    var xmpMeta;
    try {
        xmpMeta = new XMPMeta(layer.xmpMetadata.rawData);        
    } catch (e) {
        xmpMeta = new XMPMeta();
    }          
    var jsonString = JSONstring.make(metadata);
    //metadata.deleteProperty(witstudioNamespace, property);
    xmpMeta.setProperty(witstudioNamespace, witstudioMetadataProperty, jsonString);
    layer.xmpMetadata.rawData = xmpMeta.serialize();    
};

/* ##################################
    End Initialize XMPScript Metadata Part
################################## */


function LineShape(x, y, length, isHorizontal)
{
    this.X = x; this.Y = y; this.Length = length; this.IsHorizontal = isHorizontal;    
}
LineShape.prototype.DescriptorType = charIDToTypeID( "Ln  ");
LineShape.prototype.CreateDescriptor = function()
{
    var lineDescriptor = new ActionDescriptor();

    var x1 = this.X + (this.IsHorizontal == false ? 0.5 : 0);
    var y1 = this.Y + (this.IsHorizontal ? 0.5 : 0);
    
    var x2 = x1 + (this.IsHorizontal ? this.Length : 0);
    var y2 = y1 + (this.IsHorizontal == false ? this.Length : 0);
    
    lineDescriptor.putObject( charIDToTypeID( "Strt" ), charIDToTypeID( "Pnt " ), new Point(x1, y1).ToDescriptor());       
    lineDescriptor.putObject( charIDToTypeID( "End " ), charIDToTypeID( "Pnt " ), new Point(x2, y2).ToDescriptor());   
    lineDescriptor.putUnitDouble( charIDToTypeID( "Wdth" ), charIDToTypeID( "#Pxl" ), 1.000000 );
    
    return lineDescriptor;
}

function RectangleShape(x, y, width, height, radius)
{
    if(typeof radius == "undefined") radius = 0;
    
    this.X = x; this.Y = y; this.Width = width; this.Height = height; 
    this.Radius = radius;    
    
}
RectangleShape.prototype.DescriptorType = charIDToTypeID( "Rctn");
RectangleShape.prototype.CreateDescriptor = function()
{
    var rectangleDescriptor = new Rectangle(this.X, this.Y, this.Width, this.Height).ToDescriptor();
    if(this.Radius > 0)
    {
        rectangleDescriptor.putUnitDouble( charIDToTypeID( "Rds " ), charIDToTypeID( "#Pxl" ), this.Radius);        
    }
    
    return rectangleDescriptor;
}

function EllipseShape(x, y, width, height)
{
    RectangleShape.apply(this, arguments);         
}
EllipseShape.prototype.DescriptorType = charIDToTypeID("Elps");
EllipseShape.prototype.CreateDescriptor = RectangleShape.prototype.CreateDescriptor;

function DrawingContext(document)
{
    this.Document = document;
    
    this.Shapes = [];    
    this.RasterizeVectorMask = false;
    this.Opacity = 100;
    
    this.Foreground = Foreground;
    
    this.CreateBackground = false;
    this.Background = Background;
    this.BackgroundOpacity = Opacity;
    this.FontFamily = FontFamily;
    this.FontSize = FontSize;
    this.IsBold = IsBold;
    this.TextAlignment = typeID("Left");
    this.AntiAliasing = AntiAliasing;
    
}

DrawingContext.prototype.DrawLine = function(x, y, length, isHorizontal)
{      
    this.Shapes.push(new LineShape (x, y, length, isHorizontal));
}

DrawingContext.prototype.DrawRectangle = function(x, y, width, height, radius)
{
    this.Shapes.push(new RectangleShape(x, y, width, height, radius));
}

DrawingContext.prototype.DrawEllipse = function(x, y, width, height)
{
    this.Shapes.push(new EllipseShape(x, y, width, height));
}

DrawingContext.prototype.DrawCuttedLine = function(x, y, length, isHorizontal)
{
    
    if(isHorizontal)
    {
        y += 6;
        this.DrawLine(x,y - 5,11, false);    
        this.DrawLine(x + length - 1,y - 5,11, false);    
        
    }
    else
    {
        x += 6;
        this.DrawLine(x - 5,y,11, true);    
        this.DrawLine(x -5,y + length - 1,11, true);    
        
    }
    this.DrawLine(x,y,length - 1, isHorizontal);    
    
}

DrawingContext.prototype.DrawBoldLine = function(x, y, length, isHorizontal)
{
    if(isHorizontal)
    {
        this.DrawRectangle(x,y, length, 2);    
    }
    else
    {
        this.DrawRectangle(x,y, 2, length);            
    }      
}

DrawingContext.prototype.DrawLength = function(x, y, length, isHorizontal, indicatorType)
{
    if(isHorizontal) this.TextAlignment = typeID("Cntr");
    else this.TextAlignment = typeID("Left");
   
    if(indicatorType == "Cutted")
    {
        var horizontalOffset = isHorizontal ? (length / 2) : 7;        
        var verticalOffset = isHorizontal ? 6 : (length / 2) - this.FontSize / 2;        
        
        this.DrawCuttedLine(x , y, length, isHorizontal);
        this.DrawText(x + horizontalOffset, y + verticalOffset, FixUnit(length));
    }
    else if(indicatorType == "Line")
    {
        var horizontalOffset = isHorizontal ? (length / 2) : 5;        
        var verticalOffset = isHorizontal ? 3 : (length / 2) - this.FontSize / 2;        
        
        this.DrawLine(x , y, length, isHorizontal);
        this.DrawText(x + horizontalOffset, y + verticalOffset, FixUnit(length));
    }
    else if(indicatorType == "BoldLine")
    {
        var horizontalOffset = isHorizontal ? (length / 2) : 3;        
        var verticalOffset = isHorizontal ? 3 : (length / 2) - this.FontSize / 2;         
        
        this.DrawBoldLine(x , y, length, isHorizontal);
        this.DrawText(x + horizontalOffset, y + verticalOffset, FixUnit(length));
    }

    this.Flush();
}


DrawingContext.prototype.GetPostScriptFontName = function(fontName)
{
    var fonts = app.fonts;
    var count = fonts.length;
    var similarFonts = [];
    for(var i=0;i<count; i++)
    {
        if(fonts[i].name == fontName || fonts[i].name.indexOf (fontName) == 0) return fonts[i].postScriptName;        
    }
    return "";
}

DrawingContext.prototype.GetAntiAliasing = function(antiAliasing)
{
    if(antiAliasing == null || antiAliasing == "None") return typeID("antiAliasNone");
    else if(antiAliasing == "Sharp") return typeID("antiAliasSharp");
    else if(antiAliasing == "Crisp") return typeID("antiAliasCrisp");
    else if(antiAliasing == "Strong") return typeID("antiAliasStrong");
    else if(antiAliasing == "Smooth") return typeID("antiAliasSmooth");
    
}

DrawingContext.prototype.DrawText = function(x, y, text)
{
       
    if(text == null || text == "") return;

    if(typeof text != "String") text = text.toString()
    
    
    this.Flush();
    if(this.CreateBackground) x += 3;
    
    function setTextLength(descriptor) {
        descriptor.putInteger(typeID("From"), 0);
        descriptor.putInteger(typeID("T   "), text.length);
    }

    var documentSize = this.Document.GetDocumentSize();
    x = (typeof x !== 'undefined' ? x : 0) / documentSize.Width * 100;
    y = ((typeof y !== 'undefined' ? y : 0) + this.FontSize) / documentSize.Height * 100;


    var textLayerDescriptor = new ActionDescriptor();
    var textLayerTypeReference = new ActionReference();
    textLayerTypeReference.putClass(typeID("TxLr"));
    textLayerDescriptor.putReference(typeID("null"), textLayerTypeReference);
            
    var styleRangeDescriptor = new ActionDescriptor();
    
    // text
    styleRangeDescriptor.putString(typeID("Txt "), text);
    
    // position
    styleRangeDescriptor.putObject(typeID("TxtC"), typeID("#Pxl"), new Point(x, y).ToDescriptor());

    // anti alising
    styleRangeDescriptor.putEnumerated( typeID( "AntA" ), typeID( "Annt" ), this.GetAntiAliasing(this.AntiAliasing));

    var styleDescriptor = new ActionDescriptor();
    
    // font size
    styleDescriptor.putUnitDouble(typeID("Sz  "), typeID("#Pxl"), this.FontSize);
    
    // foreground
    styleDescriptor.putObject(typeID("Clr "), typeID("RGBC"), this.Foreground.ToDescriptor());
     
    // font family
    styleDescriptor.putString( typeID( "fontPostScriptName" ), this.GetPostScriptFontName(this.FontFamily) );    
        
    // bold
    styleDescriptor.putBoolean( typeID( "syntheticBold" ), this.IsBold );    
    
    var textStyleDescriptor = new ActionDescriptor();
    
    setTextLength(textStyleDescriptor);
    textStyleDescriptor.putObject(typeID("TxtS"), typeID("TxtS"), styleDescriptor);
    var textStyleList = new ActionList();
    textStyleList.putObject(typeID("Txtt"), textStyleDescriptor);
    styleRangeDescriptor.putList(typeID("Txtt"), textStyleList);                 

    var paragraphStyles = new ActionList();
    var paragraphStyleDescriptor = new ActionDescriptor();
    setTextLength(paragraphStyleDescriptor);


    // alignment
    var alignmentDescriptor = new ActionDescriptor();        
    alignmentDescriptor.putEnumerated(typeID("Algn"), typeID("Alg "), this.TextAlignment);                  
    
    paragraphStyleDescriptor.putObject(typeID("paragraphStyle"), typeID("paragraphStyle"), alignmentDescriptor);                
    
    
    paragraphStyles.putObject(typeID("paragraphStyleRange"), paragraphStyleDescriptor);
    styleRangeDescriptor.putList(typeID("paragraphStyleRange"), paragraphStyles);
        
      
    textLayerDescriptor.putObject(typeID("Usng"), typeID("TxLr"), styleRangeDescriptor);
      
    executeAction(typeID("Mk  "), textLayerDescriptor, DialogModes.NO);
    this.TraceItem();
    
    if(this.CreateBackground)
    {
        
        this.Flush();
        
        var selectedLayerReference = new ActionReference();
        selectedLayerReference.putProperty(typeID("Prpr"), typeID("bounds"));
        selectedLayerReference.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));        
        var selectedLayerDescriptor = executeActionGet(selectedLayerReference);                
        var bounds = Rectangle.FromDescriptor(selectedLayerDescriptor);
        
        var current = { foreground : this.Foreground, opacity : this.Opacity };

        this.Foreground = this.Background;
        this.Opacity = this.BackgroundOpacity;
        
        this.DrawRectangle(bounds.X - 1, bounds.Y - 1, bounds.Width + 2, bounds.Height + 2);
        this.Flush();
        
        this.Foreground = current.foreground;
        this.Opacity = current.opacity;
        
        var idmove = charIDToTypeID( "move" );
        var desc70 = new ActionDescriptor();
        var ref51 = new ActionReference();        
        ref51.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Trgt"));        
        desc70.putReference( charIDToTypeID( "null" ), ref51 );
        
        var ref52 = new ActionReference();
        ref52.putEnumerated(typeID("Lyr "), typeID("Ordn"), typeID("Prvs"));        
        desc70.putReference(charIDToTypeID( "T   " ), ref52 );
        executeAction( idmove, desc70, DialogModes.NO );
        this.TraceItem();

    }

};

DrawingContext.prototype.Flush = function()
{
    if(this.Shapes.length == 0) return;
    
    activeDocument.suspendHistory ("Render DrawingContext", "OnRender.apply(this)");
    function OnRender()
    {
        var desc448 = new ActionDescriptor();
        var ref321 = new ActionReference();
        ref321.putClass( stringIDToTypeID( "contentLayer" ));
        desc448.putReference( charIDToTypeID( "null" ), ref321 );

        var layerDescriptor = new ActionDescriptor();
        
        var solidColorLayerDescriptor = new ActionDescriptor();
        solidColorLayerDescriptor.putObject(typeID("Clr "), typeID("RGBC"), this.Foreground.ToDescriptor());        
        layerDescriptor.putUnitDouble(typeID("Opct"), typeID("#Prc"), this.Opacity);
        layerDescriptor.putObject(typeID("Type"),stringIDToTypeID( "solidColorLayer" ), solidColorLayerDescriptor);
        layerDescriptor.putObject( charIDToTypeID( "Shp " ), this.Shapes[0].DescriptorType, this.Shapes[0].CreateDescriptor());
                
        desc448.putObject( charIDToTypeID( "Usng" ), stringIDToTypeID( "contentLayer" ), layerDescriptor );
        executeAction( charIDToTypeID( "Mk  " ), desc448, DialogModes.NO );

        for(var i = 1; i < this.Shapes.length ; i++)
        {
            var desc453 = new ActionDescriptor();
            var ref322 = new ActionReference();
            ref322.putEnumerated( charIDToTypeID( "Path" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
            desc453.putReference( charIDToTypeID( "null" ), ref322 );           
            desc453.putObject( charIDToTypeID( "T   " ), this.Shapes[i].DescriptorType, this.Shapes[i].CreateDescriptor() );
            executeAction( charIDToTypeID( "AddT" ), desc453, DialogModes.NO );        
        }

        if(this.RasterizeVectorMask)
        {
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
            desc.putReference( charIDToTypeID('null'), ref );
            desc.putEnumerated( charIDToTypeID('What'), stringIDToTypeID('rasterizeItem'), stringIDToTypeID('vectorMask') );
            executeAction( stringIDToTypeID('rasterizeLayer'), desc, DialogModes.NO );        
        }
        
        this.TraceItem();
    }

    this.Shapes.length = 0;
    
}


var trackedItems = [];
DrawingContext.prototype.BeginTrace = function()
{
    var isTrackedItems = CreateLayerLinks | CreateLayerGroups;
    if(isTrackedItems != true) return;
    trackedItems = [];
}    

DrawingContext.prototype.CreateDummyLayer = function()
{

    var desc177 = new ActionDescriptor();
    var ref143 = new ActionReference();
    ref143.putClass( charIDToTypeID( "Lyr " ) );
    desc177.putReference( charIDToTypeID( "null" ), ref143 );
    executeAction( charIDToTypeID( "Mk  " ), desc177, DialogModes.NO );
    return this.TraceItem();
    
}

var guideGroupMap = [];
DrawingContext.prototype.EnsureDrwaingGroup = function(groupName)
{    
    if(guideGroupMap[groupName] != null) return guideGroupMap[groupName];
    
    var guideGroup = this.Document.GetGuideGroup();
    var selectedLayer = this.Document.GetSelectedLayers();
    
    var drawingGroup = null;
    try
    {
        drawingGroup = guideGroup.layerSets.getByName(groupName);      
        app.activeDocument.activeLayer = drawingGroup;
    }
    catch(ex)
    {
        drawingGroup = guideGroup.layerSets.add();
        drawingGroup.name = groupName;
    }

    if(drawingGroup != null)
    {
        var result = this.Document.GetSelectedLayers()[0];        
        guideGroupMap[groupName] = this.Document.GetLayerIndex(result) - 1;
    }
    this.Document.SetSelectedLayers(selectedLayer);
    
    return guideGroupMap[groupName];
    
}

DrawingContext.prototype.EndTrace = function(name, metadatas)
{

    if(trackedItems.length <=0) return;
    
    /*
        // set drawing context metadata
    var DrawingContextInfo = {};
    DrawingContextInfo.Type = name;
    DrawingContextInfo.Id = Math.uuid();
    DrawingContextInfo.Items = trackedItems;    
    DrawingContextInfo.Description = metadatas;
    SetLayerMetadata (app.activeDocument.activeLayer, DrawingContextInfo);
   */

    var isTrackedItems = CreateLayerLinks | CreateLayerGroups;
    if(isTrackedItems == false) return;
    
    this.Document.SetSelectedLayers(trackedItems);

    if(CreateLayerLinks && trackedItems.length > 1)
    {
        var desc11 = new ActionDescriptor();            
        var ref7 = new ActionReference();
        ref7.putEnumerated( typeID( "Lyr " ), typeID( "Ordn" ), typeID( "Trgt" ) );
        desc11.putReference( typeID( "null" ), ref7 );
        executeAction( stringIDToTypeID( "linkSelectedLayers" ), desc11, DialogModes.NO );        
    }

    if(CreateLayerGroups)
    {
        var drawingGroup = this.EnsureDrwaingGroup(name);

        var desc9 = new ActionDescriptor();
        var ref5 = new ActionReference();
        ref5.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
        desc9.putReference( charIDToTypeID( "null" ), ref5 );
        var ref6 = new ActionReference();
        ref6.putIndex(typeID("Lyr "), drawingGroup);
        desc9.putReference( charIDToTypeID( "T   " ), ref6 );
        desc9.putBoolean( charIDToTypeID( "Adjs" ), false );
        desc9.putInteger( charIDToTypeID( "Vrsn" ), 5 );
        executeAction( charIDToTypeID( "move" ), desc9, DialogModes.NO );
    }



}    
    
DrawingContext.prototype.TraceItem = function()
{
    var isTrackedItems = CreateLayerLinks | CreateLayerGroups;
    if(isTrackedItems != true) return;
    
    var selectedLayers = this.Document.GetSelectedLayers();
    
    for(var i in selectedLayers)
    {
        if(this.Document.GuideGroupId == selectedLayers[i]) continue;
        trackedItems.push(selectedLayers[i]);
    }   
    
    return selectedLayers[0];
    
}

DrawingContext.prototype.DrawGeometry = function(geometry)
{
    activeDocument.pathItems.add("#ASSISTOR_TEMP_PATH#", geometry);            
   
    var desc12 = new ActionDescriptor();
    var solidColorLayerDescriptor = new ActionDescriptor();
    solidColorLayerDescriptor.putObject(typeID("Clr "), typeID("RGBC"), this.Foreground.ToDescriptor());    
    desc12.putObject( charIDToTypeID( "Type" ), stringIDToTypeID( "solidColorLayer" ), solidColorLayerDescriptor);

    // =======================================================
    var desc11 = new ActionDescriptor();
    var ref11 = new ActionReference();
    ref11.putClass( stringIDToTypeID( "contentLayer" ) );
    desc11.putReference( charIDToTypeID( "null" ), ref11 );
    desc11.putObject( charIDToTypeID( "Usng" ), stringIDToTypeID( "contentLayer" ), desc12 );
    
    executeAction( charIDToTypeID( "Mk  " ), desc11, DialogModes.NO );
        
    try {    
        var tempPathDescriptor = new ActionDescriptor();    
        var tempPathReference = new ActionReference();
        tempPathReference.putName(charIDToTypeID("Path"), "#ASSISTOR_TEMP_PATH#");
        tempPathDescriptor.putReference(charIDToTypeID("null"), tempPathReference);
        executeAction(charIDToTypeID("Dlt "), tempPathDescriptor, DialogModes.NO);
    } catch (err) {}    
}
