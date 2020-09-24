//Uint8Array转字符串
function Uint8ArrayToString(fileData) {
	var dataString = "";
	for (var i = 0; i < fileData.length; i++) {
		dataString += String.fromCharCode(fileData[i]);
	}

	return dataString

}

//字符串转Uint8Array
function stringToUint8Array(str) {
	var arr = [];
	for (var i = 0, j = str.length; i < j; ++i) {
		arr.push(str.charCodeAt(i));
	}

	var tmpUint8Array = new Uint8Array(arr);
	return tmpUint8Array
}


function toInt32(value) {
	return (value[3] & 0xFF) << 24 | ((value[2] & 0xFF) << 16) | ((value[1] & 0xFF) << 8) | (value[0] & 0xFF)
}

function toUInt16(bytes) {
	return ((bytes[0] & 0xFF) << 8) | (bytes[1] & 0xFF);
	//return (bytes[1] & 0xFF) << 8 | (bytes[0] & 0xFF)
}

//字节读取操作
class BUFF {

	constructor(data) {
		this.position = 0;
		this.data = data;
		this.view = new DataView(data);

	};

	getPosition() {
		return this.position;
	}

	setPosition(newpos, type) {
		if (type == null || type == 0) {
			this.position += newpos;
		}
		if (type == 1) {
			this.position = newpos;
		}
	}
	getBuf(count) {
		return new Uint8Array(this.view.buffer.slice(this.position, this.position + count));
	}

	getStr(count) { //到字符串
		if (count == 0 || count == null) { //查找 0结尾的字符串
			let start = new Uint8Array(this.view.buffer.slice(this.position));
			for (let i = 0; i < start.length; i++) {
				if (start[i] == 0) {
					count = i;
					break;
				}
			}
		}
		let val = String.fromCharCode.apply(null, new Uint8Array(this.view.buffer.slice(this.position, this.position + count)));
		this.position += count;
		return val;
	}
	getFloat64() {
		let val = this.view.getFloat64(this.position, [, true]);
		this.position += 8;
		return val;
	}
	getFloat32() {
		let val = this.view.getFloat32(this.position, [, true]);
		this.position += 4;
		return val;
	}

	getBigInt64() {
		let val = this.view.getBigInt64(this.position, [, true]);
		this.position += 8;
		return val;
	}
	getBigUint64() {
		let val = this.view.getBigUint64(this.position, [, true]);
		this.position += 8;
		return val;
	}
	getInt32() {
		let val = this.view.getInt32(this.position, [, true]);
		this.position += 4;
		return val;
	}
	getUint32() {
		let val = this.view.getUint32(this.position, [, true]);
		this.position += 4;
		return val;
	}
	getInt16() {
		let val = this.view.getInt16(this.position, [, true]);
		this.position += 2;
		return val;
	}
	getUint16() {
		let val = this.view.getUint16(this.position, [, true]);
		this.position += 2;
		return val;
	}

	getInt8() {
		let val = this.view.getInt8(this.position, [, true]);
		this.position += 1;
		return val;
	}
	getUint8() {
		let val = this.view.getUint8(this.position, [, true]);
		this.position += 1;
		return val;
	}
	setInt8(val){
		this.view.setInt8(this.position, val, true);
		this.position += 1;
		return this;
	}
	//其他setxxx类似
}
