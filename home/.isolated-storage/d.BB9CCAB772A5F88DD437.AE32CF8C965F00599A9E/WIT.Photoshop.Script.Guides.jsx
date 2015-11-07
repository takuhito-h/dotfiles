
// ===============================================================
//  Guides  Processor
// ===============================================================
Processor.prototype.GuidesProcessor = function(owner){}
Processor.prototype.GuidesProcessor.prototype.IgnoreDescription = true;
Processor.prototype.GuidesProcessor.prototype.Process = function(owner)
{
    
    var selectionBounds = owner.SelectionBounds;
    var documentSize = selectionBounds.IsEmpty() ? owner.Document.GetDocumentSize() : selectionBounds.Size();

    ////////////////////////////////////////////////////////////////////////////////////////////
    // Begin Draw Margin
    ////////////////////////////////////////////////////////////////////////////////////////////
    if(gridleft != null)        owner.Document.CreateGuides(selectionBounds.X + gridleft, false);
    if(gridtop != null)        owner.Document.CreateGuides(selectionBounds.Y + gridtop, true);
    if(gridright != null)      owner.Document.CreateGuides(selectionBounds.X +  documentSize.Width - gridright, false);
    if(gridbottom != null)  owner.Document.CreateGuides(selectionBounds.Y + documentSize.Height - gridbottom, true);
       
    if(columnGutter == null) columnGutter = 0;
    if(rowGutter == null) rowGutter = 0;

    var paddingColumn = gridleft + gridright;
    if(columnCount == null && columnWidth != null)
    {
        columnCount = (documentSize.Width - paddingColumn) / (columnWidth + columnGutter);
    }
    else if(columnCount != null && columnWidth == null)
    {
        var margin = ((columnCount - 1) * columnGutter);    
        columnWidth = (documentSize.Width - paddingColumn - margin) / columnCount;
    }
    else if(columnCount == null && columnWidth == null)
    {
        columnCount = 0;
        columnWidth = 0;
    }

    if(columnCount > 0 && columnWidth > 0)
    {
        var columnStep = columnWidth + columnGutter;
        for(var i = 0; i < columnCount; i++)
        {
            var x = selectionBounds.X + gridleft + (i * columnStep);
            owner.Document.CreateGuides(x + columnWidth, false);
            if(i < columnCount - 1) owner.Document.CreateGuides(x + columnWidth + columnGutter, false);
            
        }    
    }


    ////////////////////////////////////////////////////////////////////////////////////////////
    var paddingRow = gridtop + gridbottom;
    if(rowCount == null && rowHeight != null)
    {
        rowCount = (documentSize.Height - paddingRow) / (rowHeight + rowGutter);
    }
    else if(rowCount != null && rowHeight == null)
    {
        var margin = ((rowCount - 1) * rowGutter);
        rowHeight = (documentSize.Height - paddingRow - margin) / rowCount;
    }
    else if(rowCount == null && rowHeight == null)
    {
        rowCount = 0;
        rowWidth = 0;
    }

    if(rowCount > 0 && rowHeight > 0)
    {
        var rowStep = rowHeight + rowGutter;
        for(var i = 0; i < rowCount; i++)
        {
            var y = selectionBounds.Y + gridtop + (i * rowStep);
            owner.Document.CreateGuides(y + rowHeight, true);
            if(i < rowCount - 1) owner.Document.CreateGuides(y + rowHeight + rowGutter, true);
            
        }    
    }
    ////////////////////////////////////////////////////////////////////////////////////////////




}




