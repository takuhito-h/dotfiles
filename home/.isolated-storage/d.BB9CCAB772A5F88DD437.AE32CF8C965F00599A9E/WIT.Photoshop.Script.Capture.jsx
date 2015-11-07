// ===============================================================
//  Capture Processor
// ===============================================================
Processor.prototype.CaptureProcessor = function(owner) {}
Processor.prototype.CaptureProcessor.prototype.IgnoreDescription = true;
Processor.prototype.CaptureProcessor.prototype.UsingSelection = true;
        
Processor.prototype.CaptureProcessor.prototype.Process = function(owner)
{

    var documentSize = owner.Document.GetDocumentSize();
    if(owner.SelectionBounds.IsEmpty())
    {        
        owner.Document.SetSelectionBounds(owner.SelectedLayersBounds[0]);        
    }

    var idCpyM = charIDToTypeID( "CpyM" );
    executeAction( idCpyM, undefined, DialogModes.ALL );
    
}
