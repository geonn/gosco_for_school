var args = arguments[0] || {};
var type = args.type;
var id = args.id;
var position = args.position;    
var attachmentModel;
if(type == "homework"){
	attachmentModel = Alloy.createCollection('homeworkAttachment'); 
}else{
	attachmentModel = Alloy.createCollection('eventsAttachment'); 
} 
init(); 

function init(){
	$.win.orientationModes = [ Ti.UI.LANDSCAPE_LEFT, Ti.UI.LANDSCAPE_RIGHT,Ti.UI.PORTRAIT,Ti.UI.UPSIDE_PORTRAIT ];
	if(type == "homework"){
		var items  = attachmentModel.getRecordByHomework(id);
	}else{
		var items  = attachmentModel.getRecordByEvents(id);
	}
	var counter = 0;
	var imagepath, adImage, row = '';
	var my_page = 0; 
	var the_view = [];
	
	for (var i=0; i< items.length; i++) {  
		var attachmentImg = items[i].img_path;
		if(OS_ANDROID){
		//	attachmentImg = items[i].img_thumb;
		} 
		adImage = Ti.UI.createImageView({
			image: "",
			//defaultImage :  "/images/loading_image.png",
			width:"100%",
			top: 50,
		});
		API.loadRemoteImage(adImage,attachmentImg);  
		var scrollView = Ti.UI.createScrollView({
			contentWidth: 'auto',
		  	contentHeight: Ti.UI.SIZE,
		   	maxZoomScale: 30,
		    minZoomScale: 1,
		    zoomScale: 1,
		  	height: Ti.UI.FILL,
		  	scrollType : "vertical",
		  	width: '100%'
		});
		 
		row = $.UI.create('View', { 
			id:"view"+counter
		});
		 
		row.add(adImage); 
		scrollView.add(row);
		the_view.push(scrollView); 
		
		counter++;
	} 

	var scrollableView = Ti.UI.createScrollableView({
		  id: "scrollableView",
		  views:the_view, 
		  backgroundColor : "#000000",
		  showPagingControl:true
	});
	
	$.albumView.add(scrollableView);
	
	scrollableView.scrollToView(position, true); 
	 
	scrollableView.addEventListener( 'scrollend', function(e) {
		if((scrollableView.currentPage+1) === items.length){
			if(scrollableView.currentPage === my_page){
				scrollableView.currentPage=0;
			}
		}
		
		my_page =  scrollableView.currentPage;
	});
	
	var deleteView = Ti.UI.createView({
		height 	: 40,
		bottom	: 0,
		width	: "100%",
		backgroundColor	: "#EEEEEE"
	});
	
	var deleteBtn = Ti.UI.createButton({
		backgroundImage : "/images/remove.png",
		textAlign : "left",
		left	: 15,
		width	:30,
		height  :30
	});
	deleteView.add(deleteBtn);	
	deleteBtn.addEventListener('click',function(){
		my_page = scrollableView.currentPage; 
		var dialog = Ti.UI.createAlertDialog({
			cancel: 0,
			buttonNames: ['Cancel','Confirm'],
			message: 'Are you sure want to delete this attachment?',
			title: 'Delete Confirmation'
		});
		dialog.addEventListener('click', function(e){
			if (e.index === e.source.cancel){
			      //Do nothing
			}
			if (e.index === 1){ 
				
				
				var param = { 
					"img_id" : items[my_page].id, 
					"type"   : type,
					"session" : Ti.App.Properties.getString('session')
				};
				 
				API.callByPost({url:"deleteAttachmentUrl", params: param}, function(responseText){
					var res = JSON.parse(responseText); 
					
					if(res.status == "success"){   
						attachmentModel.removeRecordById(items[my_page].id);
						init();
						
						if(type == "homework"){
							Ti.App.fireEvent('refreshAttachment'); 
						}else{
							Ti.App.fireEvent('refreshEventsAttachment'); 
						} 
						
						$.win.close({
							curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
							opacity: 0,
							duration: 200
						});
					}else{
						$.win.close();
						COMMON.hideLoading();
						Alloy.Globals.Navigator.open("login");
						COMMON.resultPopUp("Session Expired", res.data); 
					}
				});
				
				
			}
		});
		dialog.show(); 
		
	});		 
	$.win.add(deleteView); 
};

$.closeView.addEventListener('click', function(){
	$.win.close({
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		opacity: 0,
		duration: 200
	});
});
