var $parts = {
	converter: undefined,
	file: undefined,
	select_btn: undefined,
	save_btn: undefined,
	canvas: undefined,
	img: undefined,
	radio: [undefined, undefined]
}
var FILE_NAME = "Image";
var SAVE_MODE = 0;
var LIMIT = {
	use: false,
	size: 2000
}
var UA = window.navigator.userAgent.toLowerCase();
var DRAG_TIMEOUT;
$(function () {
	if (!isSupport()) {
		$("<p>お使いのブラウザでは動作しません<br>申し訳ありませんが別のブラウザをお試しください<br><a href=\"#h-browser\">動作確認ブラウザ一覧</a></p>").addClass("error-text").prependTo("body");
		return;
	}
	$parts.drop_area = $("#drop_area");
	$parts.drop_msg = $("#drop_msg");
	$parts.file = $("#file");
	$parts.select_btn = $("#select_btn");
	$parts.save_btn = $("#save_btn");
	$parts.canvas = $("#canvas");
	$parts.img = $("#result_image");
	$parts.radio[0] = $("#mode_convert");
	$parts.radio[1] = $("#mode_reinstate");
	setEventListener();
});
// note setEventListener ()
// イベントを登録
function setEventListener () {
	$parts.select_btn.on("click", function () {
		$parts.file.val("");
		selectFile();
	});
	$parts.file.on("change", function () {
		var _file = $parts.file[0].files[0];
		if (isImageFile(_file)) {
			FILE_NAME = _file.name.split(".");
			if (FILE_NAME.length > 1)
				FILE_NAME.pop();
			FILE_NAME.join("");
			runConvert(_file);
		}
	});
	$parts.drop_area.on("dragover", function (event) {
		if (event.originalEvent.dataTransfer.types[0] !== "Files") {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		event.originalEvent.dataTransfer.dropEffect = "copy";
		$parts.drop_msg.show();
		clearTimeout(DRAG_TIMEOUT);
		DRAG_TIMEOUT = setTimeout(function () {
			$parts.drop_msg.hide();
		}, 200);
	});
	$parts.drop_area.on("drop", function (event) {
		if (event.originalEvent.dataTransfer.types[0] !== "Files") {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		clearTimeout(DRAG_TIMEOUT);
		$parts.drop_msg.hide();
		var _file = event.originalEvent.dataTransfer.files[0];
		if (isImageFile(_file)) {
			FILE_NAME = _file.name.split(".");
			if (FILE_NAME.length > 1)
				FILE_NAME.pop();
			FILE_NAME.join("");
			runConvert(_file);
		}
	});

	$parts.drop_area.on("keydown", function (event) {
		if(event.metaKey || event.ctrlKey) {
			if (event.keyCode == 86)
				return;
		}
		event.stopPropagation();
		event.preventDefault();
	});

	$parts.drop_area.on("paste", function (event) {

		event.stopPropagation();
		event.preventDefault();

		// FireFoxの場合はなにもしない
		if (UA.indexOf("firefox") != -1) {
			return;
		}

		// items/filesに格納されているデータからfileを取り出す
		var _file  = null;
		var _cpdata = ( window.clipboardData || event.originalEvent.clipboardData );

		if (_cpdata.types != "Files") {
			alert("画像を貼り付けてください");
			return;
		}

		if(_cpdata.items) {
			var _items = _cpdata.items;
			if(_items != null && _items[0] != null) {
				_file = _items[0].getAsFile();
			}
		} else if (_cpdata.files) {
			var _files = _cpdata.files;
			if (_files != null && _files[0] != null) {
				_file = _files[0];
			}
		}

		if(_file != null) {
			if (isImageFile(_file)) {
				FILE_NAME = getDateString();
				runConvert(_file);
			}
		} else {
			alert("貼り付けに失敗しました");
		}
	});

	$(document).on("paste", function (event) {

		event.stopPropagation();
		event.preventDefault();

		// FireFoxの場合はなにもしない
		if (UA.indexOf("firefox") != -1) {
			return;
		}

		// items/filesに格納されているデータからfileを取り出す
		var _file  = null;
		var _cpdata = ( window.clipboardData || event.originalEvent.clipboardData );

		if (_cpdata.types != "Files") {
			alert("画像を貼り付けてください");
			return;
		}

		if(_cpdata.items) {
			var _items = _cpdata.items;
			if(_items != null && _items[0] != null) {
				_file = _items[0].getAsFile();
			}
		} else if (_cpdata.files) {
			var _files = _cpdata.files;
			if (_files != null && _files[0] != null) {
				_file = _files[0];
			}
		}

		if(_file != null) {
			if (isImageFile(_file)) {
				FILE_NAME = getDateString();
				runConvert(_file);
			}
		} else {
			alert("貼り付けに失敗しました");
		}
	});
}
// note selectFile ()
// ファイル選択ダイアログを表示
function selectFile () {
	var _event = document.createEvent("MouseEvents");//Eventオブジェクトを追加
	_event.initEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);//イベントを設定
	$parts.file[0].dispatchEvent(_event);//Elementにイベントを発生させる
}
// note isSupport ()
// ブラウザがサポートしていればtrue
function isSupport () {
	if (!!window.File && !!window.FileReader && !!window.FileList && !!window.Blob && !!window.CanvasRenderingContext2D)
		return true;
	else
		return false;
}

// note isImageFile (file)
// ファイルが画像ならtrue
function isImageFile(file){
	if (file.type.match(/image/)) {
		if (!file.type.match(/png/)) {
			var msg = "PNG形式以外の画像です。\n処理を続けますか？";
			return(confirm(msg));
		}
		return true;
	} else {
		var msg = "画像ファイルではありません。";
		alert(msg);
		return false;
	}
}
// note getConverterMode ()
// 変換するか戻すかを取得して返す(0: 変換, 1: 戻す)
function getConverterMode () {
	if ($parts.radio[0][0].checked)
		return 0;
	else if ($parts.radio[1][0].checked)
		return 1;
	else
		return 0;
}
// note getResultURL ()
// 変換した画像のURLを返す
function getResultURL () {
	var _dataURL = $parts.canvas[0].toDataURL();
	// 保存モードに合わせて切り替え
	if (SAVE_MODE == 0) {
		var _blob = dataURLtoBlob(_dataURL);
		if (_blob.size > 3 * 1024 * 1024) {
			alert("ファイルサイズが3MBを超えました。\nJPEGに圧縮される恐れがあります。("+Math.round(_blob.size/(1024*1024)*100)/100+"MB)" );
		}
		return getBlobURL(_blob);
	}
	else if (SAVE_MODE == 1) {
		return _dataURL;
	}
}
// note convertImageData (imageData)
// ImageDataを修正して返す
function convertImageData (imageData, mode) {
	if (imageData == undefined || (mode != 0 && mode != 1)) return false;
	if (mode == 0) {
		if (imageData.data[3] > 252)
			imageData.data[3] = 252;
	}
	else if (mode == 1) {
		if (imageData.data[3] == 252)
			imageData.data[3] = 255;
	}
	return imageData;
}

// note dataURLtoBlob (dataURL)
// dataURLをBlobにして返す
// 参考: http://triplog.hatenablog.com/entry/2014/05/17/235900
// 参考: http://stackoverflow.com/questions/12168909/blob-from-dataurl
function dataURLtoBlob (dataURL) {
	var _byteString = atob(dataURL.split(",")[1]),
		_mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0],
		_ab = new ArrayBuffer(_byteString.length),
		_ia = new Uint8Array(_ab);
	for (var i=0; i < _byteString.length; i++) {
		_ia[i] = _byteString.charCodeAt(i);
	}

	return new Blob([_ia], {type: _mimeString});
}
// note getBlobURL (blob)
// BlobのURLを取得して返す
function getBlobURL (blob) {
	var _url = parent.URL || parent.webkitURL;
	if (_url == undefined) return;
	return _url.createObjectURL(blob);
}

// note runConvert (file)
// 変換を開始する
function runConvert(file){
	var _reader = new FileReader();
	var _image = new Image();
	var _src;
	_reader.readAsDataURL(file);//readerでfileをdataURLに

	_reader.onload = function(e){//readerがロードしたら
		_src = _reader.result;//dataURLを取得
		_image.onload = function () {
			var _w = _image.width,
				_h = _image.height,
				_canvas = $parts.canvas[0],
				_ctx = _canvas.getContext("2d");

			if(LIMIT.use && _w > LIMIT.size){
				var _p = LIMIT.size/_w;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			if(LIMIT.use && _h > LIMIT.size){
				var _p = LIMIT.size/_h;
				_w = Math.floor(_w*_p);
				_h = Math.floor(_h*_p);
			}
			_canvas.width = _w;
			_canvas.height = _h;
			_ctx.drawImage(_image, 0, 0, _w, _h);
			_ctx.putImageData(
				convertImageData(_ctx.getImageData(0, 0, _w, _h), getConverterMode()), 0, 0);
			var _ResultURL = getResultURL();
			$parts.save_btn[0].href = _ResultURL;
			$parts.img[0].src = _ResultURL;
			$parts.img[0].alt = FILE_NAME;
			$parts.save_btn[0].setAttribute("download", FILE_NAME+"_twi_"+getConverterMode()+".png");
			$parts.save_btn.removeClass("inactive");
			setTimeout(function () {
				showNotice("変換が完了しました", 2*1000);
			}, 300);

		}
		_image.src = _src;
	}
}

// note showNotice (text, show_time)
// 通知を表示する(string, ms)
function showNotice (text, show_time) {
	var _$temp = $("<div class=\"notice\">"+text+"</div>");
	_$temp.appendTo($("body")).hide().fadeIn(200, function () {
		setTimeout(function () {
			_$temp.fadeOut(200, function () {
				_$temp.remove();
			});
		}, show_time);
	});
}

// note getDateString ()
// 現在の日付、時刻を取得して返す
function getDateString() {
	var _n   = new Date();
	var _s   = _n.getFullYear();
	_s += ("0" + (_n.getMonth() + 1)).slice(-2);
	_s += ("0" + _n.getDate()).slice(-2);
	_s += "_";
	_s += ("0" + _n.getHours()).slice(-2);
	_s += ("0" + _n.getMinutes()).slice(-2);
	_s += ("0" + _n.getSeconds()).slice(-2);
	return _s;
}





























