 function getRootNode(nodeId, depth)
{
	if (depth > 9)
	{
		return nodeId;
	}
	var depthCount = depth + 1;
	var currentNode = nodeId;
	var directParentsResult = aa.cap.getProjectByChildCapID(currentNode,'R',null);
    if (directParentsResult.getSuccess())
    {
		directParents = directParentsResult.getOutput();
		for(var ff in directParents) {
			
			if (directParents[ff])
			{
				
				var id1 = directParents[ff].getProjectID().getID1();
				var id2 = directParents[ff].getProjectID().getID2();
				var id3 = directParents[ff].getProjectID().getID3();				
				
				while (!isSameNode(currentNode,directParents[ff].getProjectID()))
				{
					currentNode = getRootNode(directParents[ff].getProjectID(), depthCount);					
				}
			}			
		}
    }
	return currentNode;

}