//@include 'WIT.Photoshop.DrawingContext.jsx'

Processor.prototype.GuideBoxProcessor = function(owner)
{
}
Processor.prototype.GuideBoxProcessor.prototype.BeginInitialize = function(owner)
{
    if(owner.SelectionBounds.IsEmpty() == false) 
    {
        this.IgnoreDescription = true;
        this.AcceptsNoneLayers = true;
        return;
    }
}
Processor.prototype.GuideBoxProcessor.prototype.UsingSelection = true;

Processor.prototype.GuideBoxProcessor.prototype.Process = function(owner)
{
    var documentSize = owner.Document.GetDocumentSize();
    if(owner.SelectionBounds.IsEmpty() == false)
    {
        owner.SelectedLayersBounds = [owner.SelectionBounds];
    }

    owner.Document.EnsureGuideGroup();

    var drawingContext = new DrawingContext(owner.Document);
    drawingContext.Opacity = 30;
    
    for (var i in owner.SelectedLayersBounds) {
        
        drawingContext.BeginTrace();
        
        var bounds = owner.Document.FixDocumentBounds(owner.SelectedLayersBounds[i], documentSize);
        if(bounds.IsEmpty()) return;   
        
        if(GuideBoxIsFixedSize) bounds = FixedSizeForBounds(bounds, GuideBoxWidth, GuideBoxHeight);
        drawingContext.DrawRectangle(bounds.X,bounds.Y,bounds.Width,bounds.Height);
        drawingContext.Flush();
        
        drawingContext.EndTrace("GuideBox");
    }
    
    

}