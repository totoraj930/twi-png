var $parts = {
	file: undefined,
	select_btn: undefined,
	save_btn: undefined,
	canvas: undefined,
	img: undefined
}
var file_name = "Image";
$(function(){
	if (!isSupport()) {
		$("<p>お使いのブラウザでは動作しません</p>").addClass("error-text").prependTo("body");
		return;
	}
	$parts.file = $("#file");
	$parts.select_btn = $("#select-btn");
	$parts.save_btn = $("#save-btn");
	$parts.canvas = $("#canvas");
	$parts.img = $("#result-image");
	setEventListener();
});
function setEventListener () {
	$parts.select_btn.on("click", function(){
		selectFile();
	});
	$parts.file.on("change", function(){
		var _file = $parts.file[0].files[0];
		if (isImageFile(_file)) {
			file_name = _file.name.split(".");
			if (file_name.length > 1)
				file_name.pop();
			file_name.join("");
			runConvert(_file);
			$parts.save_btn.removeClass("inactive");
		}
		else{
			alert("画像ファイルではありません");
		}
	});
}
function selectFile () {
	var _event = document.createEvent("MouseEvents");//Eventオブジェクトを追加
	_event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);//イベントを設定
	$parts.file[0].dispatchEvent(_event);//Elementにイベントを発生させる
}
function saveFile(){
	var _a = document.createElement("a");
	_a.href = $parts.canvas[0].toDataURL();
	_a.setAttribute("download", file_name+"_twi.png");
	var _event = document.createEvent("MouseEvents");//Eventオブジェクトを追加
	_event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);//イベントを設定
	_a.dispatchEvent(_event);
}
function isSupport () {
	if (window.File && window.FileReader && window.FileList && window.Blob && !!window.CanvasRenderingContext2D)
		return true;
	else
		return false;
}
function convertImageData (imageData) {
	if (imageData == undefined) return false;
	if (imageData.data[3] > 252)
		imageData.data[3] = 252;
	return imageData;
}
function isImageFile(file){
	if (file.type.match(/image/))
		return true;
	else
		return false;
}
function runConvert(file){
	var _reader = new FileReader();
	var _image = new Image();
	var _src;
	_reader.readAsDataURL(file);//readerでfileをdataURLに

	_reader.onload = function(e){//readerがロードしたら
		_src = _reader.result;//dataURLを取得
		_image.onload = function(){
			var _w = _image.width,
				_h = _image.height,
				_canvas = $parts.canvas[0],
				_ctx = _canvas.getContext("2d");

			if(_w > 1500){
				var _p = 1500/_w;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			if(_h > 1500){
				var _p = 1500/_h;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			_canvas.width = _w;
			_canvas.height = _h;
			_ctx.drawImage(_image, 0, 0, _w, _h);
			_ctx.putImageData(
				convertImageData(_ctx.getImageData(0, 0, _w, _h)), 0, 0);
			var _dataURL = _canvas.toDataURL();
			$parts.save_btn[0].href = _dataURL;
			$parts.img[0].src = _dataURL;
			$parts.img[0].alt = file_name;
			$parts.save_btn[0].setAttribute("download", file_name+"_twi.png");
		}
		_image.src = _src;
	}
}
