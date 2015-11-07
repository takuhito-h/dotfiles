Processor.prototype.ExportProcessor = function(owner) {}
Processor.prototype.ExportProcessor.prototype.IgnoreDescription = true;
Processor.prototype.ExportProcessor.prototype.Process = function(owner)
{

    
    
    // image duplicate
    owner.Document.Duplicate();
    
    // hide guide group
    var guideGroup = owner.Document.EnsureGuideGroup();
    var selectedLayer = owner.Document.GetSelectedLayers();
    owner.Document.HideLayer(selectedLayer);
        

    // save as
    owner.Document.SaveAs(currentFilePath);
  
    // close document
    owner.Document.Close();
    

}
