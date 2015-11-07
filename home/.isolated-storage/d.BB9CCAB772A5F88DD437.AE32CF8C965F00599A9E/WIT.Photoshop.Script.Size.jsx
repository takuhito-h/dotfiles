//@include 'WIT.Photoshop.DrawingContext.jsx'

Processor.prototype.SizeProcessor = function(owner) {}

Processor.prototype.SizeProcessor.prototype.BeginInitialize = function(owner)
{
    if(owner.SelectionBounds.IsEmpty() == false) 
    {
        this.IgnoreDescription = true;
        this.AcceptsNoneLayers = true;
        return;
    }
}

Processor.prototype.SizeProcessor.prototype.UsingSelection = true;
Processor.prototype.SizeProcessor.prototype.Process = function(owner)
{
   
    var documentSize = owner.Document.GetDocumentSize();

    if(owner.SelectionBounds.IsEmpty() == false)
    {
        owner.SelectedLayersBounds = [owner.SelectionBounds];
    }
    
    owner.Document.EnsureGuideGroup();
  
    var drawingContext = new DrawingContext(owner.Document);
    drawingContext.CreateBackground = CreateBackground && CreateSizeBackground;

    var displayWidth = (SizeDisplayFormat == "WidthAndHeight" || SizeDisplayFormat == "Width");
    var displayHeight = (SizeDisplayFormat == "WidthAndHeight" || SizeDisplayFormat == "Height");
    
    for (var i in owner.SelectedLayersBounds) {  
        
        drawingContext.BeginTrace();
        
        var bounds = owner.Document.FixDocumentBounds(owner.SelectedLayersBounds[i], documentSize);
        if(bounds.IsEmpty()) return;        

        if(SizeIndicatorType == "Cutted")
        {

            var horizontalOffset = (bounds.Right() >= documentSize.Width) ? bounds.X - 13 : bounds.Right();        
            var verticalOffset = (bounds.Bottom() >= documentSize.Height) ? bounds.Y  - 13: bounds.Bottom();        

            if(horizontalOffset < 0) horizontalOffset = 0;
            if(verticalOffset < 0) verticalOffset = 0;
            
            if(displayWidth)
            {
                drawingContext.DrawLength(bounds.X, verticalOffset, bounds.Width, true, SizeIndicatorType);
            }        
            if(displayHeight)
            {
                drawingContext.DrawLength(horizontalOffset, bounds.Y, bounds.Height, false, SizeIndicatorType);                
            }
            
        }
        else if(SizeIndicatorType == "Line")
        {

            var horizontalOffset = (bounds.Right() >= documentSize.Width) ? bounds.X - 2 : bounds.Right() + 2;        
            var verticalOffset = (bounds.Bottom() >= documentSize.Height) ? bounds.Y  - 2: bounds.Bottom() + 2;        

            if(horizontalOffset < 0) horizontalOffset = 0;
            if(verticalOffset < 0) verticalOffset = 0;

            if(displayWidth)
            {
                drawingContext.DrawLength(bounds.X, verticalOffset, bounds.Width, true, SizeIndicatorType);
            }        
            if(displayHeight)
            {
                drawingContext.DrawLength(horizontalOffset, bounds.Y, bounds.Height, false, SizeIndicatorType);                
            }
        }
        else
        {
            // draw text right/bottom
            var displayText = "";
            if(displayWidth && displayHeight) displayText = FixUnit(bounds.Width) + "*" + FixUnit(bounds.Height);
            else if(displayWidth) displayText = "W:" + FixUnit(bounds.Width);
            else if(displayHeight) displayText = "H:" + FixUnit(bounds.Height);
            
            drawingContext.TextAlignment = typeID("Rght");
            drawingContext.DrawText(bounds.Right() - 5, bounds.Bottom() - 5 - drawingContext.FontSize, displayText);
            drawingContext.Flush();            
            
        }
    
        drawingContext.EndTrace("Size")
        
    }

    drawingContext.Flush();


}

