// ===============================================================
//  GuidesVertical Center Processor
// ===============================================================
Processor.prototype.GuidesVCenterProcessor = function(owner) {}
Processor.prototype.GuidesVCenterProcessor.prototype.Process = function(owner)
{
    var selectionBounds = owner.SelectionBounds;
    var documentSize = selectionBounds.IsEmpty() ? owner.Document.GetDocumentSize() : selectionBounds.Size();     
    owner.Document.CreateHorizontalGuides(selectionBounds.Y + documentSize.Height / 2);
}

