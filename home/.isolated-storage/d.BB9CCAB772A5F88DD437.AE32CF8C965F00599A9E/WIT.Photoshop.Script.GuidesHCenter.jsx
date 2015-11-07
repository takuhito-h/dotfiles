// ===============================================================
//  Guides Horizontal Center Processor
// ===============================================================
Processor.prototype.GuidesHCenterProcessor = function(owner) {}
Processor.prototype.GuidesHCenterProcessor.prototype.Process = function(owner)
{
    var selectionBounds = owner.SelectionBounds;
    var documentSize = selectionBounds.IsEmpty() ? owner.Document.GetDocumentSize() : selectionBounds.Size();     
    owner.Document.CreateVerticalGuides(selectionBounds.X + documentSize.Width / 2);
}
