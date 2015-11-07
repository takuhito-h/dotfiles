//@include 'WIT.Photoshop.DrawingContext.jsx'

Processor.prototype.PositionProcessor = function(owner) {}

Processor.prototype.PositionProcessor.prototype.UsingSelection = true;
Processor.prototype.PositionProcessor.prototype.Process = function(owner)
{

    owner.Document.EnsureGuideGroup(); 
    var documentSize = owner.Document.GetDocumentSize();
    
    var drawingContext = new DrawingContext(owner.Document);
    drawingContext.CreateBackground = CreateBackground && CreatePositionBackground;

    for (var i in owner.SelectedLayersBounds) {
        var bounds = owner.SelectedLayersBounds[i];
        bounds = owner.Document.FixDocumentBounds(bounds, documentSize);
        if(bounds.IsEmpty()) continue;
        
        var x = bounds.X; var y = bounds.Y;
        
        if(PositionPointType == "CenterTop") { x += bounds.Width / 2; }
        else if(PositionPointType == "RightTop") { x += bounds.Width; }
        else if(PositionPointType == "LeftMiddle") { y += bounds.Height / 2; }
        else if(PositionPointType == "CenterMiddle") {  x += bounds.Width / 2;  y += bounds.Height / 2;}
        else if(PositionPointType == "RightMiddle") { x += bounds.Width;  y += bounds.Height / 2; }
        else if(PositionPointType == "LeftBottom") { y += bounds.Height; }
        else if(PositionPointType == "CenterBottom") {  x += bounds.Width / 2; y += bounds.Height; }
        else if(PositionPointType == "RightBottom") {  x += bounds.Width; y += bounds.Height; }
        
        
        var resultPosition = owner.Document.FixReferencePoint(x ,  y ,  owner.SelectionBounds, documentSize);
        var resultX = FixUnit(resultPosition.X);
        var resultY = FixUnit(resultPosition.Y);
        
        var text = resultX + "," + resultY;
        
        drawingContext.BeginTrace();
        
        drawingContext.DrawText(x, y, text); 
        
        if(PositionIndicatorType != "None")
        {
            drawingContext.DrawLine(x - 5 , y , 11, true);
            drawingContext.DrawLine(x  , y-5 , 11, false);               
        }
        
        if(PositionIndicatorType == "CrossWithEllipse")
        {
            drawingContext.DrawEllipse(x-1.5,y-1.5,4,4);
        }
    
        drawingContext.Flush();
         
        drawingContext.EndTrace("Position");        
    
    }


}

