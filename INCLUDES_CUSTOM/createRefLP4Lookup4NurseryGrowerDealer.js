function createRefLP4Lookup4NurseryGrowerDealer(itemCap) {

	var mainLocationNG = getAppSpecific("Does the Main Location deal in Growing plants?",itemCap);

	var mainLocationND = getAppSpecific("Does the Main Location deal in selling plants?",itemCap);

	if (mainLocationNG == "Yes" || mainLocationND == "Yes")
		createRefLP4Lookup(itemCap);

	var additionalLocations = new Array();
	additionalLocations = getContactObjs(itemCap,["Additional Location"]);

	if (additionalLocations) {
		for (var j in additionalLocations) {
			createRefLP4Lookup(itemCap,additionalLocations[j]);
		}
	}
}