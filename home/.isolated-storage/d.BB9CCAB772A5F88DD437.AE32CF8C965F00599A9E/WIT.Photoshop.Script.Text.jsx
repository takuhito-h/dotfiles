//@include 'WIT.Photoshop.DrawingContext.jsx'

Processor.prototype.TextProcessor = function(owner)
{
}

Processor.prototype.TextProcessor.prototype.Initialize = function(owner)
{
    
    var selectedLayers = owner.SelectedLayers;
    var selectedLayersBounds = owner.SelectedLayersBounds;

    

    this.SelectedTextLayers = [];
    this.SelectedTextLayerBounds = [];
    for(var i = 0; i < selectedLayers.length; i++)
    {                        
        if(owner.Document.GetIsTextLayer(selectedLayers[i]))
        { 
            this.SelectedTextLayers.push(selectedLayers[i]);
            if(selectedLayersBounds.length <= i) continue;
            this.SelectedTextLayerBounds.push(selectedLayersBounds[i]);
        }
    }

    if(owner.IsSeparately == false && this.SelectedTextLayers.length != this.SelectedTextLayerBounds.length)
    {
        throw "Cannot measure multiple text layer on 'non-each layers mode'.";
        
    }

    if(this.SelectedTextLayers.length == 0)
    {
        throw "Please select one or more 'Text' layers.";
    }

    this.SelectedTextLayerInfo = [];
    for (var index in this.SelectedTextLayerBounds) {
        
        var current = owner.Document.GetTextLayerInfo(this.SelectedTextLayers[index]);
        this.SelectedTextLayerInfo.push(current);
    }        

}

Processor.prototype.TextProcessor.prototype.UsingSelection = true;
Processor.prototype.TextProcessor.prototype.CreateTextLayerInfoString = function(info, typeUnit, resolution)
{

    var result = "";
    
    if(TypeInfoVisibility == false) return result;
    
    if(TypeFontFamilyVisibility) 
    {
        if(TypeFontStyleVisibility) result = info.FontName + " " + info.FontStyle;
        else result = info.FontName;
        
        result += "\r";
    }
    else if(TypeFontStyleVisibility)
    {
        result = info.FontStyle + "\r";
    }
    
    if(TypeFontSizeVisibility) 
    {
        result += FixTypeUnit(info.FontSize, resolution) + " " + typeUnit + "\r";
    }
    if(TypeLineHeightVisibility)
    {
        if(info.LineHeight != null && info.LineHeight != "Auto")
        {
            result += FixTypeUnit(info.LineHeight, resolution) + " " + typeUnit + "\r";    
        }
    }
    if(TypeFontColorVisibility) result += info.FontColor.toString() + "\r";
    
    if(TypeEffectVisibility && info.Effect != null && info.Effect.DropShadow != null) result += info.Effect.DropShadow.toString() + "\r";
    
    return result;
    
}

Processor.prototype.TextProcessor.prototype.Process = function(owner)
{


    owner.Document.EnsureGuideGroup();
    
    var drawingContext = new DrawingContext(owner.Document);
    drawingContext.CreateBackground = CreateBackground && CreateTypeInfoBackground;
    var resolution = owner.Document.GetResolution();
    
    
    /*
    var typeUnit = preferences.typeUnits;
    if(typeUnit == TypeUnits.PIXELS) typeUnit = "px";
    else if(typeUnit == TypeUnits.POINTS) typeUnit = "pt";
    else if(typeUnit == TypeUnits.MM) typeUnit = "mm";
    */

    for (var index in this.SelectedTextLayerBounds) {
        
        drawingContext.BeginTrace();
        
        var bounds = this.SelectedTextLayerBounds[index];
        var textLayerinfo = this.SelectedTextLayerInfo[index];
        
        if(TypeGuidelineVisibility) drawingContext.DrawLine(bounds.X, bounds.Bottom() + 1, bounds.Width, true);
        drawingContext.DrawText(bounds.X, bounds.Bottom(), this.CreateTextLayerInfoString(textLayerinfo, TypeUnit, resolution));
        
        drawingContext.EndTrace("Type info");
        
    }        
    
  
}


