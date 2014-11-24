recordID = aa.env.getValue("RECORD_ID");
var docReturnResult = aa.document.getDocumentListByEntity(recordID,"TMP_CAP")

var docList = docReturnResult.getOutput().toArray();

var docListArray = new Array();
for (var i in docList) {
	var currentDoc ={};
	currentDoc.description = new String(docList[i].docDescription) ;
	currentDoc.fileName = new  String(docList[i].fileName) ;
	currentDoc.uploadedDate =new  String(docList[i].fileUpLoadDate) ;
	currentDoc.fileKey = new String(docList[i].fileKey);
	currentDoc.category	= new String(docList[i].docGroup);
	docListArray.push(currentDoc);
	}
aa.env.setValue("DOCUMENTJSON", JSON.stringify(docListArray));
