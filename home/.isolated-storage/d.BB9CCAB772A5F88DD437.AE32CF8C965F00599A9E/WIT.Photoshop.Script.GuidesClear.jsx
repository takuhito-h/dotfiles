// ===============================================================
//  Guides Clear Processor
// ===============================================================
Processor.prototype.GuidesClearProcessor = function(owner) {}
Processor.prototype.GuidesClearProcessor.prototype.Process = function(owner)
{
    owner.Document.ClearGuides();
}
