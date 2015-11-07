
Processor.prototype.TilerProcessor = function(owner)
{
}
Processor.prototype.TilerProcessor.prototype.IgnoreDescription = true;
Processor.prototype.TilerProcessor.prototype.UsingSelection = true;
Processor.prototype.TilerProcessor.prototype.Initialize = function(owner)
{
}
Processor.prototype.TilerProcessor.prototype.Process = function(owner)
{
    owner.Document.Photoshop.SetLayersPanelVisibility(false);
    
    
    app.activeDocument.selection.deselect();
    
    var selectedLayers = owner.SelectedLayers;
    var layerBounds = owner.SelectedLayersBounds[0]; 
    
    for(var c = 0; c < columnCount; c++)
    {
        for(var r = 0; r < rowCount; r++)
        {

            if(c == 0 && r == 0) continue;
            
            owner.Document.DuplicateLayers(selectedLayers);
  
            var x =  (c * (layerBounds.Width + columnMargin));
            var y = (r * (layerBounds.Height + rowMargin));
            owner.Document.SelectedLayersTranslateRelative(x,y);
            
        }
    }

    owner.Document.Photoshop.SetLayersPanelVisibility(true);
}


