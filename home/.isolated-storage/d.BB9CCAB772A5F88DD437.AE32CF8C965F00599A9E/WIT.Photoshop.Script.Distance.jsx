//@include 'WIT.Photoshop.DrawingContext.jsx'

Processor.prototype.DistanceProcessor = function(owner) {}


Processor.prototype.DistanceProcessor.prototype.BeginInitialize = function(owner)
{
    if(owner.SelectionBounds.IsEmpty() == false) 
    {
        this.IgnoreDescription = true;
        this.AcceptsNoneLayers = true;
        return;
    }
}

Processor.prototype.DistanceProcessor.prototype.Initialize = function(owner)
{   

}
Processor.prototype.DistanceProcessor.prototype.IsSeparately = true;
Processor.prototype.DistanceProcessor.prototype.UsingSelection = true;
Processor.prototype.DistanceProcessor.prototype.Process = function(owner)
{
    var selectedLayers = owner.SelectedLayers;
    var selectedLayersBounds = owner.SelectedLayersBounds;    

    var documentSize = owner.Document.GetDocumentSize();

    var drawingContext = new DrawingContext(owner.Document);
    drawingContext.CreateBackground = CreateBackground && CreateSpacingBackground;

    drawingContext.BeginTrace();
    if(owner.SelectionBounds.IsEmpty() == false) 
    {
        owner.Document.EnsureGuideGroup();
        
        var bounds = owner.SelectionBounds;
        if(bounds.Width < bounds.Height)
        {
            drawingContext.DrawLength(  Math.round(bounds.X + bounds.Width / 2),bounds.Y, bounds.Height, false, SpacingIndicatorType);
        }
        else
        {
            drawingContext.DrawLength( bounds.X, Math.round(bounds.Y + bounds.Height / 2), bounds.Width, true, SpacingIndicatorType);            
        }

    }
    else
    {
        
        if(owner.SelectedLayers.length == 1)
        {
            selectedLayersBounds.push(new Rectangle(0,0, documentSize.Width, documentSize.Height));
        }
        
        var source = owner.Document.FixDocumentBounds(selectedLayersBounds[0]);
        var target = owner.Document.FixDocumentBounds(selectedLayersBounds[1]);
        if (source.IntersectsWith(target))
        {

            if(target.Contains(source))
            {
                var temp = source;
                source = target;
                target = temp;
            }
            else if(source.Contains(target) == false)
            {
                throw "Cannot measure distance between layers.";
            }
            
            owner.Document.EnsureGuideGroup();
            
            var leftDistance = target.X - source.X;
            var rightDistance = source.Right() - target.Right();
            
            if(rightDistance == 0 || (leftDistance > 0 && leftDistance < rightDistance))
            {
                drawingContext.DrawLength( source.X, Math.round(target.Y + target.Height / 2), leftDistance, true, SpacingIndicatorType);
            }
            else if(rightDistance > 0)
            {
                drawingContext.DrawLength( target.Right(), Math.round(target.Y + target.Height / 2), rightDistance, true, SpacingIndicatorType);
            }

            var topDistance = target.Y - source.Y;
            var bottomDistance = source.Bottom() - target.Bottom();
            
            if(bottomDistance == 0 || (topDistance > 0 && topDistance < bottomDistance))
            {
                drawingContext.DrawLength( Math.round(target.X + target.Width / 2),source.Y, topDistance, false, SpacingIndicatorType);
            }
            else if(bottomDistance > 0)
            {
                drawingContext.DrawLength( Math.round(target.X + target.Width / 2),target.Bottom(),  bottomDistance, false, SpacingIndicatorType);
            }        
            
        }
        else
        {

            var verticalIntersection = source.Intersect(new Rectangle(target.X, source.Y, target.Width, target.Height));
            var horizontalIntersection = source.Intersect(new Rectangle(source.X, target.Y, target.Width, target.Height));

            if(horizontalIntersection.IsEmpty() && verticalIntersection.IsEmpty())
            {
                throw "Cannot measure distance between layers.";
            }

            owner.Document.EnsureGuideGroup();
            
            if(horizontalIntersection.IsEmpty() == false)
            {
                var left = source.X > target.X ? source.X : target.X;
                var right = source.X > target.X ? target.Right() : source.Right();
                var horizontalDistance = left - right;
                drawingContext.DrawLength(right, Math.round(horizontalIntersection.Y + horizontalIntersection.Height / 2), horizontalDistance, true, SpacingIndicatorType);
            }
            if(verticalIntersection.IsEmpty() == false)
            {
                var top = source.Y > target.Y? source.Y : target.Y;
                var bottom = source.Y > target.Y ? target.Bottom() : source.Bottom();
                var verticalDistance = top - bottom;
                drawingContext.DrawLength(Math.round(verticalIntersection.X + verticalIntersection.Width / 2), bottom, verticalDistance, false, SpacingIndicatorType);            
            }
        }
    }
    

    drawingContext.EndTrace("Spacing");


}



