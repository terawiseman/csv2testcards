/**
* csvの読み込み
* @func ReadCSV
* @parm string fileName 読み込みをするファイルネーム（というかパス）
**/
function ReadCSV(fileName){
    var fileObj = new File(fileName);
    var csv = new Array();
    if(fileObj.open("r")){

        while(!fileObj.eof){
            csv.push(fileObj.readln().split(','));
             //debug//alert(fileObj.readln());
        }
        return csv;
    }else{
        alert("can't open "+fileName);
        return 0;
    }
}


/**
 * スマートオブジェクトを開いて、スマートオブジェクト内で
 * 画像を張り付ける。
 * 参考：http://qiita.com/IDs011da/items/1388bdcf63e058bf8848
 * @func EditSmartobject
 * @param layer 編集したいスマートオブジェクトレイヤー
 * @param func そのスマートレイヤー内でやりたい動作
**/
function EditSmartobject(layer,filePath){

    // 一応レイヤーの種類を判別
    // スマートオブジェクト以外のレイヤーなら、何もしない
    if(LayerKind.SMARTOBJECT == layer.kind){
        //alert("This Layer is SmartObject");
        var idAction = stringIDToTypeID( "placedLayerEditContents" );
        var idDesc = new ActionDescriptor();

        activeDocument.activeLayer = layer;
        executeAction(idAction, idDesc, DialogModes.NO);

        //今のスマートレイヤー内をきれいにする。
        layObj = activeDocument.artLayers.add();

        //今作成したもの以外全レイヤー削除
        i = 0;
        do{
            if(layObj != activeDocument.artLayers[i]){
                activeDocument.artLayers[i].remove();
            }
            i++;
        }while(i <= activeDocument.artLayers.length);

        //コピペをする
        open(new File(filePath));
        activeDocument.selection.selectAll();
        activeDocument.activeLayer.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);

        //貼り付けをして、その後貼り付け先のキャンパスサイズに合わせる
        activeDocument.activeLayer = activeDocument.paste();

        //スマートオブジェクトを保存、閉じる。
        activeDocument.save();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    }else{
        alert("This layer is not SmartObject");
    }
}


/**
 * 現在のドキュメントをpsd形式で与えられたpath名で保存
 * @param doc 保存対象のドキュメント
 * @param filePath ファイルパス
**/
function SavePsd(doc,filePath){

    //別名保存
    //参考：http://www.openspc2.org/book/PhotoshopCS6/easy/save/008/index.html

    var anothernameObj  = new File(filePath);
    var psdOpt = new PhotoshopSaveOptions();
    psdOpt.alphaChannels = true;
    psdOpt.annotations = true;
    psdOpt.embedColorProfile = false;
    psdOpt.layers = true;
    psdOpt.spotColors = false;
    doc.saveAs(anothernameObj, psdOpt, true, Extension.LOWERCASE);
}

/**
* テストカードのpsdとpngデータを作成する。
* 読み込ませるテンプレートのpsdとカードデータのあるcsvを同じ名前にして、
* こいつに読み込ませてね！
* @function csv2png4testcard
* @param string foldername いじるフォルダのある場所のパス
* @param string filename テンプレートのpsdとカードデータのcsvの名前
**/
function csv2png4testcard(foldername,filename){
    //生成結果の画像を入れるフォルダを作るよ！
    folderObj = new Folder(foldername+"/"+filename);
    folderObj.create();

    //png用
    folderObj = new Folder(foldername+"/"+filename+"/png");
    folderObj.create();
    //生成結果の画像を入れるフォルダを作るよ！
    folderObj = new Folder(foldername+"/"+filename+"/psd");
    folderObj.create();


    //csvの読み込み
    var textdata = ReadCSV(foldername+"/"+filename+".csv");

    if(0 == textdata)return 0;
    //テンプレートpsdの読み込み
    if(!open(new File(foldername+"/"+filename+".psd")))return 0;

    var csvHeader = textdata[0];
    var csvLayerKind = textdata[1];
    //debug//alert(csvHeader+" "+csvHeader[0]);
    //csvの3行目以降をループで呼び出す
    for(var i=2;i<textdata.length;i++){
        //csvの2行目のファイル指定にしたがって、ファイルを読み込む
        for(var j=0;j<csvHeader.length;j++){
            try{
                if(0 == csvLayerKind[j]){
                    //csvLayerKind 0 is nonLayer
                }else if(1 == csvLayerKind[j]){
                    //csvLayerKind 1 is textLayer
                    activeDocument.artLayers[csvHeader[j]].textItem.contents = textdata[i][j];
                }else if(2 == csvLayerKind[j]){
                    var temp = activeDocument;
                    //csvLayerKind 2 is smartLayer
                    EditSmartobject(activeDocument.artLayers[csvHeader[j]],foldername+"/image/"+textdata[i][j]);
                    activeDocument = temp;
                }
            }catch(e){
                alert(e);
            }
        }
         //debug//alert(textdata[i]);

        //output png
        var fileObj = new File(foldername+"/"+filename+"/png/"+textdata[i][0]+".png");
        var pngOpt = new PNGSaveOptions();
        pngOpt.interlaced = false;
        activeDocument.saveAs(fileObj,pngOpt,true,Extension.LOWERCASE);
        SavePsd(activeDocument,foldername+"/"+filename+"/psd/"+textdata[i][0]+".psd");
    }

    //close psd
    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
}

//pick up csv files
var filePath = File.openDialog("csvを選択してください。");
var fileName = String(filePath).split("/").pop();
var folderName = String(filePath).replace("/"+fileName,"");
//create cards each csv files
csv2png4testcard(folderName,fileName.split(".")[0]);

